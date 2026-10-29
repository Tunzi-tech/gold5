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

  // Idle Live Flow uses a single orb glyph; restore the original icon while selected.
  const liveFlow = matched[1] as HTMLElement | undefined
  const liveFlowIcon = liveFlow?.querySelector<SVGSVGElement>('svg')
  if (liveFlow && liveFlowIcon) {
    if (!liveFlowIcon.dataset.nfasOriginalIcon) {
      liveFlowIcon.dataset.nfasOriginalIcon = liveFlowIcon.innerHTML
    }
    const selected = liveFlow.matches('.active, [aria-pressed="true"], [aria-current="page"]')
      || !!liveFlow.querySelector('.active, [aria-pressed="true"], [aria-current="page"]')
    if (selected) {
      if (liveFlowIcon.innerHTML !== liveFlowIcon.dataset.nfasOriginalIcon) {
        liveFlowIcon.innerHTML = liveFlowIcon.dataset.nfasOriginalIcon
      }
      liveFlowIcon.classList.remove('nfas-live-flow-idle-orb')
    } else {
      const viewBox = liveFlowIcon.getAttribute('viewBox') || '0 0 24 24'
      const dimensions = viewBox.split(/[ ,]+/).map(Number)
      const cx = dimensions.length === 4 ? dimensions[0] + dimensions[2] / 2 : 12
      const cy = dimensions.length === 4 ? dimensions[1] + dimensions[3] / 2 : 12
      const radius = Math.min(dimensions[2] || 24, dimensions[3] || 24) * 0.22
      const orb = `<circle cx="${cx}" cy="${cy}" r="${radius}" fill="currentColor" fill-opacity=".16" stroke="currentColor" stroke-width="1.8"/><circle cx="${cx}" cy="${cy}" r="${radius * 0.42}" fill="currentColor"/>`
      if (liveFlowIcon.innerHTML !== orb) liveFlowIcon.innerHTML = orb
      liveFlowIcon.classList.add('nfas-live-flow-idle-orb')
    }
  }
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
      description: 'Explore the people, ideas and actions that can help you make a difference.',
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

function refreshImpactCues() {
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
    attributeFilter: ['aria-label', 'title', 'data-view', 'data-action', 'lang', 'dir', 'class', 'aria-pressed', 'aria-current'],
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
