<script setup lang="ts">
import { onBeforeUnmount, onMounted } from 'vue'
import StartupRecovery from './components/StartupRecovery.vue'
import './home-live-flow-vibrancy.css'
import './desktop-topbar-connected-buttons.css'
import './discover-quick-panel.css'
import './network-main-bar-context.css'
import HelloWorld from './components/HelloWorld.vue'

let impactButtonObserver: MutationObserver | undefined
let discoverPanelOpen = false

const IMPACT_EVERYWHERE_AREAS = [
  'People & relationships', 'Communities', 'Education & learning', 'Health & wellbeing',
  'Mental health', 'Environment & nature', 'Climate action', 'Water & oceans',
  'Energy', 'Biodiversity & animals', 'Food & agriculture', 'Waste & circular economy',
  'Science & research', 'Technology & digital life', 'Arts & creativity', 'Culture & heritage',
  'Sports & movement', 'Local action', 'Public spaces', 'Housing & neighbourhoods',
  'Transport & mobility', 'Economy & work', 'Poverty & basic needs', 'Human rights',
  'Equality & inclusion', 'Accessibility', 'Children & young people', 'Older adults',
  'Volunteering', 'Ideas & initiatives', 'Civic life & governance', 'Peace & safety',
  'Disaster resilience', 'Media & information', 'Global cooperation',
] as const

const IMPACT_EVERYWHERE_SESSION_KEY = 'nfas-impact-everywhere-areas'

function getImpactEverywhereSelections(): string[] {
  try {
    const stored = sessionStorage.getItem(IMPACT_EVERYWHERE_SESSION_KEY)
    if (!stored) return []
    const parsed: unknown = JSON.parse(stored)
    if (!Array.isArray(parsed)) return []
    return parsed.filter((item): item is string =>
      typeof item === 'string' && IMPACT_EVERYWHERE_AREAS.includes(item as typeof IMPACT_EVERYWHERE_AREAS[number]),
    )
  } catch {
    return []
  }
}

function renderImpactEverywhereSelections() {
  const bar = document.querySelector<HTMLElement>('[data-nfas-impact-everywhere]')
  const list = bar?.querySelector<HTMLElement>('[data-impact-everywhere-selected]')
  if (!bar || !list) return

  const selected = getImpactEverywhereSelections()
  const current = Array.from(list.querySelectorAll<HTMLElement>('.nfas-impact-everywhere-chip')).map((chip) => chip.textContent ?? '')
  const isEmptyState = !!list.querySelector('.nfas-impact-everywhere-empty')
  if (selected.length === 0 && isEmptyState) return
  if (selected.length > 0 && selected.length === current.length && selected.every((area, index) => area === current[index])) return

  list.replaceChildren()
  if (!selected.length) {
    const empty = document.createElement('span')
    empty.className = 'nfas-impact-everywhere-empty'
    empty.textContent = 'Choose what you want to make an impact on'
    list.appendChild(empty)
    return
  }

  selected.forEach((area) => {
    const chip = document.createElement('span')
    chip.className = 'nfas-impact-everywhere-chip'
    chip.textContent = area
    list.appendChild(chip)
  })
}

let impactEverywherePickerPositionHandler: (() => void) | null = null

function closeImpactEverywherePicker() {
  document.querySelector('[data-impact-everywhere-picker]')?.remove()
  document.querySelector('[data-impact-everywhere-toggle]')?.setAttribute('aria-expanded', 'false')
  if (impactEverywherePickerPositionHandler) {
    window.removeEventListener('resize', impactEverywherePickerPositionHandler)
    window.removeEventListener('scroll', impactEverywherePickerPositionHandler, true)
    impactEverywherePickerPositionHandler = null
  }
}

function openImpactEverywherePicker() {
  const bar = document.querySelector<HTMLElement>('[data-nfas-impact-everywhere]')
  if (!bar) return
  closeImpactEverywherePicker()

  const selected = new Set(getImpactEverywhereSelections())
  const picker = document.createElement('div')
  picker.className = 'nfas-impact-everywhere-picker'
  picker.setAttribute('data-impact-everywhere-picker', '')
  picker.setAttribute('role', 'group')
  picker.setAttribute('aria-label', 'Choose your impact areas')
  picker.innerHTML = `
    <div class="nfas-impact-everywhere-picker-heading">
      <div>
        <span class="nfas-impact-everywhere-eyebrow">YOUR IMPACT MAP</span>
        <strong>What matters to you?</strong>
        <span>Choose the areas you care about. Your choices stay for this browser session.</span>
      </div>
      <div class="nfas-impact-everywhere-heading-actions">
        <button type="button" data-impact-everywhere-done>Done <span aria-hidden="true">→</span></button>
        <button type="button" class="nfas-impact-everywhere-picker-close" aria-label="Close">×</button>
      </div>
    </div>
    <label class="nfas-impact-everywhere-search">
      <span aria-hidden="true">⌕</span>
      <input type="search" data-impact-everywhere-search placeholder="Search people, causes, places…" aria-label="Search impact areas">
      <kbd>/</kbd>
    </label>
    <div class="nfas-impact-everywhere-tools">
      <span data-impact-everywhere-count>${selected.size} selected</span>
      <div>
        <button type="button" data-impact-everywhere-select-visible>Select visible</button>
        <button type="button" data-impact-everywhere-clear>Clear all</button>
      </div>
    </div>
    <div class="nfas-impact-everywhere-options" data-impact-everywhere-options>
      ${IMPACT_EVERYWHERE_AREAS.map((area) => `
        <label class="nfas-impact-everywhere-option" data-impact-area-option>
          <input type="checkbox" value="${area}" ${selected.has(area) ? 'checked' : ''}>
          <span>${area}</span>
          <span class="nfas-impact-everywhere-check" aria-hidden="true">✓</span>
        </label>
      `).join('')}
    </div>
    <div class="nfas-impact-everywhere-no-results" data-impact-everywhere-no-results hidden>No matching areas. Try another search.</div>
    <div class="nfas-impact-everywhere-picker-footer">
      <span>Pick as many as you like · You can change these anytime</span>
    </div>
  `

  // Render the picker at document level so topbar/main-bar stacking contexts cannot cover it.
  document.body.appendChild(picker)
  const positionPicker = () => {
    const rect = bar!.getBoundingClientRect()
    const mobile = window.matchMedia('(max-width: 760px)').matches
    const viewportPadding = mobile ? 10 : 14
    picker.style.setProperty('position', 'fixed', 'important')
    picker.style.setProperty('z-index', '20000', 'important')
    picker.style.setProperty('right', 'auto', 'important')
    picker.style.setProperty('bottom', 'auto', 'important')
    picker.style.setProperty('width', mobile ? `calc(100vw - ${viewportPadding * 2}px)` : `min(760px, calc(100vw - 28px))`, 'important')
    picker.style.setProperty('left', mobile ? `${viewportPadding}px` : `${Math.max(14, Math.min(window.innerWidth - 14, rect.right) - Math.min(760, window.innerWidth - 28))}px`, 'important')
    picker.style.setProperty('max-height', mobile ? 'min(82vh, 760px)' : 'min(76vh, 720px)', 'important')
    picker.style.setProperty('top', '10px', 'important')
    const pickerHeight = picker.getBoundingClientRect().height
    const gap = 8
    const desiredTop = rect.top - pickerHeight - gap
    const top = desiredTop >= 10 ? desiredTop : 10
    picker.style.setProperty('top', `${top}px`, 'important')
  }
  impactEverywherePickerPositionHandler = positionPicker
  positionPicker()
  window.addEventListener('resize', positionPicker)
  window.addEventListener('scroll', positionPicker, true)

  const count = picker.querySelector<HTMLElement>('[data-impact-everywhere-count]')
  const search = picker.querySelector<HTMLInputElement>('[data-impact-everywhere-search]')
  const options = Array.from(picker.querySelectorAll<HTMLElement>('[data-impact-area-option]'))
  const noResults = picker.querySelector<HTMLElement>('[data-impact-everywhere-no-results]')

  const updateCount = () => {
    const values = Array.from(picker.querySelectorAll<HTMLInputElement>('input[type="checkbox"]:checked')).map((input) => input.value)
    if (count) count.textContent = `${values.length} selected`
    if (noResults) noResults.hidden = options.some((option) => !option.hidden)
  }
  const saveSelection = () => {
    const values = Array.from(picker.querySelectorAll<HTMLInputElement>('input[type="checkbox"]:checked')).map((input) => input.value)
    sessionStorage.setItem(IMPACT_EVERYWHERE_SESSION_KEY, JSON.stringify(values))
    updateCount()
    renderImpactEverywhereSelections()
  }
  const filterOptions = () => {
    const query = (search?.value ?? '').trim().toLocaleLowerCase()
    options.forEach((option) => {
      const label = option.querySelector('span')?.textContent?.toLocaleLowerCase() ?? ''
      option.hidden = !label.includes(query)
    })
    updateCount()
  }

  picker.querySelectorAll<HTMLInputElement>('input[type="checkbox"]').forEach((input) => {
    input.addEventListener('change', saveSelection)
  })
  search?.addEventListener('input', filterOptions)
  picker.querySelector('[data-impact-everywhere-select-visible]')?.addEventListener('click', () => {
    options.forEach((option) => {
      if (!option.hidden) {
        const input = option.querySelector<HTMLInputElement>('input')
        if (input) input.checked = true
      }
    })
    saveSelection()
  })
  picker.querySelector('[data-impact-everywhere-clear]')?.addEventListener('click', () => {
    picker.querySelectorAll<HTMLInputElement>('input[type="checkbox"]').forEach((input) => { input.checked = false })
    saveSelection()
  })
  picker.querySelector('.nfas-impact-everywhere-picker-close')?.addEventListener('click', closeImpactEverywherePicker)
  picker.querySelector('[data-impact-everywhere-done]')?.addEventListener('click', closeImpactEverywherePicker)
  bar.querySelector('[data-impact-everywhere-toggle]')?.setAttribute('aria-expanded', 'true')
  filterOptions()
}
function ensureImpactEverywhereHeader() {
  const topbar = document.querySelector<HTMLElement>('header.topbar')
  if (!topbar || !topbar.parentElement) return

  let bar = topbar.parentElement.querySelector<HTMLElement>(':scope > [data-nfas-impact-everywhere]')
  if (bar) {
    renderImpactEverywhereSelections()
    return
  }

  bar = document.createElement('section')
  bar.className = 'nfas-impact-everywhere-header'
  bar.setAttribute('data-nfas-impact-everywhere', '')
  bar.setAttribute('aria-label', 'Impact Everywhere')
  bar.innerHTML = `
    <span class="nfas-impact-everywhere-orbit" aria-hidden="true"><span></span><span></span><span></span></span>
    <span class="nfas-impact-everywhere-copy">
      <strong>Impact Everywhere</strong>
      <span class="nfas-impact-everywhere-selected" data-impact-everywhere-selected aria-live="polite"></span>
    </span>
    <button type="button" class="nfas-impact-everywhere-toggle" data-impact-everywhere-toggle aria-expanded="false">
      <span>Choose areas</span><span aria-hidden="true">⌄</span>
    </button>
  `
  topbar.insertAdjacentElement('afterend', bar)
  bar.querySelector('[data-impact-everywhere-toggle]')?.addEventListener('click', () => {
    if (bar?.querySelector('[data-impact-everywhere-picker]')) closeImpactEverywherePicker()
    else openImpactEverywherePicker()
  })
  renderImpactEverywhereSelections()
}

function setNetworkMainBarVisibility(visible: boolean) {
  const header = document.querySelector<HTMLElement>('header.topbar')
  if (!header) return
  header.classList.toggle('nfas-main-bar-hidden', !visible)
  const mainBar = header.querySelector<HTMLElement>(':scope > .network-main-bar')
  if (mainBar) {
    mainBar.setAttribute('aria-hidden', visible ? 'false' : 'true')
    mainBar.inert = !visible
  }
}

function isHomeNavigationControl(control: HTMLElement): boolean {
  const label = [
    control.textContent ?? '',
    control.getAttribute('aria-label') ?? '',
    control.getAttribute('title') ?? '',
    control.getAttribute('data-view') ?? '',
    control.getAttribute('data-action') ?? '',
  ].join(' ').replace(/\s+/g, ' ').trim()
  return /^(home|accueil|الرئيسية)(\s|$)/i.test(label)
}

function handleMainBarNavigation(event: MouseEvent) {
  const target = event.target as HTMLElement | null
  const control = target?.closest<HTMLElement>('button, [role="button"], a')
  if (!control) return

  const sidebar = control.closest('.sidebar, [class*="sidebar"], nav[aria-label], [role="navigation"]')
  const inTopbar = !!control.closest('header.topbar')

  if (sidebar) {
    setNetworkMainBarVisibility(isHomeNavigationControl(control))
    return
  }

  if (inTopbar) {
    const label = [
      control.textContent ?? '',
      control.getAttribute('aria-label') ?? '',
      control.getAttribute('title') ?? '',
      control.getAttribute('data-view') ?? '',
    ].join(' ').replace(/\s+/g, ' ').trim()
    if (/^(home|accueil|الرئيسية)(\s|$)/i.test(label)) setNetworkMainBarVisibility(true)
    else if (/^(live flow|learn|discover|flux en direct|apprendre|découvrir|decouvrir|التدفق المباشر|تعلّم|تعلم|اكتشف)(\s|$)/i.test(label)) setNetworkMainBarVisibility(false)
  }
}

const discoverCards = [
  { title: 'Explore what people are doing', detail: 'Discover people, ideas and actions in motion.', icon: '◎', target: 'people' },
  { title: 'Make an impact', detail: 'Find a meaningful way to contribute.', icon: '✳', target: 'impact' },
  { title: "What’s going on around you", detail: 'See what is happening across your world.', icon: '◌', target: 'around' },
] as const

function findDiscoverControl(): HTMLElement | undefined {
  const topbar = document.querySelector('header.topbar')
  if (!topbar) return undefined
  return Array.from(topbar.querySelectorAll<HTMLElement>('button, [role="button"], a'))
    .find((element) => {
      const label = [element.textContent ?? '', element.getAttribute('aria-label') ?? '', element.getAttribute('title') ?? '', element.getAttribute('data-view') ?? '']
        .join(' ').replace(/\s+/g, ' ').trim()
      return /^(discover|découvrir|decouvrir|اكتشف)(\s|$)/i.test(label)
    })
}

function closeDiscoverPanel() {
  discoverPanelOpen = false
  document.querySelector('[data-nfas-discover-panel]')?.remove()
  findDiscoverControl()?.setAttribute('aria-expanded', 'false')
}

function openDiscoverPanel() {
  const header = document.querySelector('header.topbar')
  if (!header) return
  closeDiscoverPanel()
  discoverPanelOpen = true

  const panel = document.createElement('section')
  panel.className = 'nfas-discover-quick-panel'
  panel.id = 'nfas-discover-panel'
  panel.setAttribute('data-nfas-discover-panel', '')
  panel.setAttribute('aria-label', 'Discover')
  panel.innerHTML = `
    <div class="nfas-discover-panel-inner">
      <div class="nfas-discover-panel-intro">
        <span class="nfas-discover-eyebrow">DISCOVER</span>
        <p>Find the people, ideas and activity worth your attention.</p>
      </div>
      <div class="nfas-discover-cards">
        ${discoverCards.map((card, index) => `
          <button class="nfas-discover-card nfas-discover-card-${index + 1}" type="button" data-discover-target="${card.target}">
            <span class="nfas-discover-card-icon" aria-hidden="true">${card.icon}</span>
            <span class="nfas-discover-card-copy"><strong>${card.title}</strong><small>${card.detail}</small></span>
            <span class="nfas-discover-card-arrow" aria-hidden="true">↗</span>
          </button>
        `).join('')}
      </div>
      <button class="nfas-discover-close" type="button" aria-label="Close Discover panel">×</button>
    </div>`
  header.parentElement?.insertBefore(panel, header)

  panel.querySelector('.nfas-discover-close')?.addEventListener('click', closeDiscoverPanel)
  panel.querySelectorAll<HTMLButtonElement>('[data-discover-target]').forEach((button) => {
    button.addEventListener('click', () => {
      const target = button.dataset.discoverTarget
      const text = target === 'impact'
        ? 'find your way to make an impact'
        : target === 'people'
          ? 'explore what people are doing'
          : "what’s going on around you"
      const candidates = Array.from(document.querySelectorAll<HTMLElement>('h1, h2, h3, h4, [data-section-title]'))
      const match = candidates.find((element) => (element.textContent ?? '').replace(/\s+/g, ' ').trim().toLowerCase().includes(text))
      closeDiscoverPanel()
      if (match) match.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'center' })
    })
  })
  findDiscoverControl()?.setAttribute('aria-expanded', 'true')
}

function handleDiscoverClick(event: MouseEvent) {
  const control = (event.target as HTMLElement | null)?.closest<HTMLElement>('[data-nfas-discover-toggle]')
  if (!control) return
  event.preventDefault()
  event.stopPropagation()
  if (discoverPanelOpen) closeDiscoverPanel()
  else openDiscoverPanel()
}

function markDiscoverControl() {
  const control = findDiscoverControl()
  if (control && !control.hasAttribute('data-nfas-discover-toggle')) {
    control.setAttribute('data-nfas-discover-toggle', '')
    control.setAttribute('aria-expanded', 'false')
    control.setAttribute('aria-controls', 'nfas-discover-panel')
  }
}

function markTopbarImpactButton() {
  const topbar = document.querySelector('header.topbar')
  if (!topbar) return

  topbar.querySelectorAll('button, [role="button"], a').forEach((element) => {
    const label = [
      element.textContent ?? '',
      element.getAttribute('aria-label') ?? '',
      element.getAttribute('title') ?? '',
      element.getAttribute('data-view') ?? '',
      element.getAttribute('data-action') ?? '',
    ].join(' ').replace(/\s+/g, ' ').trim()

    if (/\bimpact\b/i.test(label)) {
      element.classList.add('nfas-impact-orbit-target')
    }
  })
}

function markDesktopTopbarButtons() {
  const topbar = document.querySelector('header.topbar')
  if (!topbar) return

  const labels = [
    /^(home|accueil|الرئيسية)(\s|$)/i,
    /^(live flow|flux en direct|التدفق المباشر)(\s|$)/i,
    /^(learn|apprendre|تعلّم|تعلم)(\s|$)/i,
    /^(discover|découvrir|decouvrir|اكتشف)(\s|$)/i,
  ]
  const controls = Array.from(topbar.querySelectorAll('button, [role="button"], a'))
    .filter((element) => element.getClientRects().length > 0)
  const matched = labels.map((pattern) => controls.find((element) => {
    const values = [
      element.textContent ?? '',
      element.getAttribute('aria-label') ?? '',
      element.getAttribute('title') ?? '',
      element.getAttribute('data-view') ?? '',
    ].map((value) => value.replace(/\s+/g, ' ').trim())
    return values.some((value) => pattern.test(value))
  }))

  controls.forEach((element) => {
    element.classList.remove('nfas-desktop-connected-topbar-button')
    for (let index = 1; index <= 4; index += 1) {
      element.classList.remove(`nfas-desktop-connected-topbar-button-${index}`)
    }
  })

  matched.forEach((element, index) => {
    if (!element || matched.indexOf(element) !== index) return
    element.classList.add('nfas-desktop-connected-topbar-button', `nfas-desktop-connected-topbar-button-${index + 1}`)
  })
}

function currentImpactLanguage(): 'fr' | 'ar' | 'en' {
  const lang = (document.documentElement.lang || '').toLowerCase()
  if (lang.startsWith('fr')) return 'fr'
  if (lang.startsWith('ar') || document.documentElement.dir === 'rtl') return 'ar'

  const languageControls = Array.from(document.querySelectorAll('button, [role="button"], a, select'))
  const selectedLanguage = languageControls
    .map((element) => [
      element.textContent ?? '',
      element.getAttribute('aria-label') ?? '',
      element.getAttribute('title') ?? '',
      (element as HTMLSelectElement).value ?? '',
    ].join(' ').replace(/\s+/g, ' ').trim().toLowerCase())
    .find((label) => /^(français|francais|french|fr|العربية|arabic|ar)$/.test(label))

  if (selectedLanguage && /^(français|francais|french|fr)$/.test(selectedLanguage)) return 'fr'
  if (selectedLanguage) return 'ar'
  return 'en'
}

function markImpactDiscoveryCue() {
  const translations = {
    en: {
      title: 'Find your way to make an impact',
      description: 'The people, ideas and actions that can help you make a difference.',
      hint: '↗  HOVER TO DISCOVER',
    },
    fr: {
      title: 'Trouvez votre façon d’avoir un impact',
      description: 'Découvrez les personnes, les idées et les actions qui peuvent vous aider à faire la différence.',
      hint: '↗  SURVOLEZ POUR DÉCOUVRIR',
    },
    ar: {
      title: 'اكتشف طريقتك لإحداث تأثير',
      description: 'اكتشف الأشخاص والأفكار والمبادرات التي تساعدك على إحداث فرق.',
      hint: '↗  مرّر لاكتشاف المزيد',
    },
  } as const

  const language = currentImpactLanguage()
  const copy = translations[language]
  const titleVariants = [
    'find your way to make an impact',
    'trouvez votre façon d’avoir un impact',
    'trouvez votre facon d’avoir un impact',
    'اكتشف طريقتك لإحداث تأثير',
  ]
  const candidates = Array.from(document.querySelectorAll('h1, h2, h3, h4, p, span, div'))
    .filter((element) => {
      const text = (element.textContent ?? '').replace(/\s+/g, ' ').trim().toLowerCase()
      return titleVariants.some((title) => text.startsWith(title)) && text.length <= 250
    })
    .sort((a, b) => (a.textContent ?? '').length - (b.textContent ?? '').length)

  const heading = candidates[0] as HTMLElement | undefined
  if (!heading) return

  heading.classList.add('nfas-impact-discovery-title')
  heading.setAttribute('data-nfas-impact-heading', '')
  heading.setAttribute('data-impact-language', language)
  const firstTextNode = Array.from(heading.childNodes).find((node) => node.nodeType === Node.TEXT_NODE && (node.textContent ?? '').trim())
  if (firstTextNode && firstTextNode.textContent?.trim() !== copy.title) {
    firstTextNode.textContent = copy.title
  } else if (!firstTextNode && !heading.querySelector('.nfas-impact-cue-orbs')) {
    heading.insertBefore(document.createTextNode(copy.title), heading.firstChild)
  }

  const section = heading.parentElement
  const description = section
    ? Array.from(section.querySelectorAll('p, [class*="desc"], [class*="subtitle"], [class*="description"]'))
        .find((element) => element !== heading && !(element.textContent ?? '').toLowerCase().includes('hover to discover'))
    : undefined
  if (description && !description.hasAttribute('data-nfas-impact-description')) {
    description.setAttribute('data-nfas-impact-description', '')
  }
  if (description) {
    if (description.textContent?.trim() !== copy.description) description.textContent = copy.description
    if (description.getAttribute('lang') !== language) description.setAttribute('lang', language)
    const direction = language === 'ar' ? 'rtl' : 'auto'
    if (description.getAttribute('dir') !== direction) description.setAttribute('dir', direction)
  }

  if (heading.querySelector('.nfas-impact-cue-orbs')) return
  const orbs = document.createElement('span')
  orbs.className = 'nfas-impact-cue-orbs'
  orbs.setAttribute('aria-hidden', 'true')
  for (let i = 1; i <= 3; i += 1) {
    const orb = document.createElement('span')
    orb.className = `nfas-impact-cue-orb nfas-impact-cue-orb-${i}`
    orbs.appendChild(orb)
  }
  heading.appendChild(orbs)
}

function markZoneSidebarButtons() {
  const labelGroups = [
    { className: 'nfas-zone-nav-button-around', patterns: [/zone around/i, /around you/i, /what'?s around you/i, /zone autour/i, /autour de vous/i, /حولك/i, /ما حولك/i] },
    { className: 'nfas-zone-nav-button-yours', patterns: [/your zones/i, /mes zones/i, /vos zones/i, /مناطقك/i, /مناطقي/i] },
    // Exact match prevents the generic Zones style from capturing “Zone Impacting” controls.
    { className: 'nfas-zone-nav-button-zones', patterns: [/^zones?(?:\s*\(\d+\))?$/i, /^المناطق$/i] },
  ]
  // Some sidebar controls include icons, counters, or secondary labels, so exact text matching misses them.
  // Match the visible/accessibility labels by phrase and search nested sidebar navigation controls too.
  const controls = Array.from(document.querySelectorAll<HTMLElement>(
    '.sidebar button, .sidebar a, .sidebar [role="button"], [class*="sidebar"] button, [class*="sidebar"] a, [class*="sidebar"] [role="button"], nav button, nav a, nav [role="button"], button, a, [role="button"]',
  ))
  controls.forEach((control) => {
    const labels = [
      control.textContent ?? '',
      control.getAttribute('aria-label') ?? '',
      control.getAttribute('title') ?? '',
      control.getAttribute('data-view') ?? '',
      control.getAttribute('data-action') ?? '',
    ].map((value) => value.replace(/\s+/g, ' ').trim()).filter(Boolean)
    const matchedGroup = labelGroups.find((group) =>
      labels.some((label) => group.patterns.some((pattern) => pattern.test(label))),
    )
    control.classList.remove('nfas-zone-nav-button', 'nfas-zone-nav-button-around', 'nfas-zone-nav-button-yours', 'nfas-zone-nav-button-zones')
    if (!matchedGroup) return
    control.classList.add('nfas-zone-nav-button', matchedGroup.className)
  })
}

function refreshImpactCues() {
  markZoneSidebarButtons()
  ensureImpactEverywhereHeader()
  markDesktopTopbarButtons()
  markTopbarImpactButton()
  markImpactDiscoveryCue()
}

onMounted(() => {
  refreshImpactCues()
  impactButtonObserver = new MutationObserver(refreshImpactCues)
  impactButtonObserver.observe(document.body, {
    childList: true,
    subtree: true,
    characterData: true,
    attributes: true,
    attributeFilter: ['aria-label', 'title', 'data-view', 'data-action', 'lang', 'dir'],
  })
})

onBeforeUnmount(() => {
  impactButtonObserver?.disconnect()
  document.removeEventListener('click', handleDiscoverClick, true)
  document.removeEventListener('click', handleMainBarNavigation, true)
  closeDiscoverPanel()
})
</script>

<template>
  <HelloWorld />
  <StartupRecovery />
</template>
