<script setup lang="ts">
import { onBeforeUnmount, onMounted } from 'vue'
import './home-live-flow-vibrancy.css'
import HelloWorld from './components/HelloWorld.vue'

let impactButtonObserver: MutationObserver | undefined

let impactDrawerCleanup: (() => void) | undefined
let impactDrawerOpen = false

function setImpactDrawerOpen(open: boolean) {
  impactDrawerOpen = open
  const drawer = document.querySelector<HTMLElement>('.nfas-impact-mobile-drawer')
  const edge = document.querySelector<HTMLButtonElement>('.nfas-impact-edge-handle')
  const backdrop = document.querySelector<HTMLElement>('.nfas-impact-drawer-backdrop')
  if (!drawer || !edge || !backdrop) return
  drawer.classList.toggle('is-open', open)
  backdrop.classList.toggle('is-visible', open)
  drawer.setAttribute('aria-hidden', String(!open))
  edge.setAttribute('aria-expanded', String(open))
  document.body.classList.toggle('nfas-impact-drawer-open', open)
}

function createImpactDrawer() {
  if (document.querySelector('.nfas-impact-mobile-drawer')) return
  const translations = {
    en: { title: 'Impact space', sub: 'Everything connected to making a difference', close: 'Close', people: 'People', voices: 'Voices', zones: 'Zones', initiatives: 'Initiatives', report: 'Report an issue', local: 'Local calls', world: 'World calls', shared: 'Impact & Awareness', hint: 'Swipe left to open' },
    fr: { title: 'Espace Impact', sub: 'Tout ce qui aide à faire la différence', close: 'Fermer', people: 'Personnes', voices: 'Voix', zones: 'Zones', initiatives: 'Initiatives', report: 'Signaler un problème', local: 'Appels locaux', world: 'Appels mondiaux', shared: 'Impact & sensibilisation', hint: 'Balayez vers la gauche' },
    ar: { title: 'مساحة التأثير', sub: 'كل ما يساعد على إحداث فرق', close: 'إغلاق', people: 'الأشخاص', voices: 'الأصوات', zones: 'المناطق', initiatives: 'المبادرات', report: 'الإبلاغ عن مشكلة', local: 'نداءات محلية', world: 'نداءات عالمية', shared: 'التأثير والوعي', hint: 'اسحب لليسار للفتح' },
  } as const
  const language = currentImpactLanguage()
  const copy = translations[language]
  const direction = language === 'ar' ? 'rtl' : 'ltr'

  const backdrop = document.createElement('div')
  backdrop.className = 'nfas-impact-drawer-backdrop'
  backdrop.setAttribute('aria-hidden', 'true')
  backdrop.addEventListener('click', () => setImpactDrawerOpen(false))

  const drawer = document.createElement('aside')
  drawer.className = 'nfas-impact-mobile-drawer'
  drawer.setAttribute('aria-label', copy.title)
  drawer.setAttribute('aria-hidden', 'true')
  drawer.setAttribute('dir', direction)
  drawer.innerHTML = `
    <div class="nfas-impact-drawer-top">
      <span class="nfas-impact-drawer-orbit" aria-hidden="true"><i></i><i></i><i></i></span>
      <button type="button" class="nfas-impact-drawer-close" aria-label="${copy.close}">×</button>
    </div>
    <h2>${copy.title}</h2>
    <p class="nfas-impact-drawer-subtitle">${copy.sub}</p>
    <div class="nfas-impact-drawer-links">
      <button type="button" data-impact-destination="impact">${copy.shared}<span>↗</span></button>
      <button type="button" data-impact-destination="people">${copy.people}<span>↗</span></button>
      <button type="button" data-impact-destination="voices">${copy.voices}<span>↗</span></button>
      <button type="button" data-impact-destination="zones">${copy.zones}<span>↗</span></button>
      <button type="button" data-impact-destination="initiatives">${copy.initiatives}<span>↗</span></button>
      <button type="button" data-impact-destination="local">${copy.local}<span>↗</span></button>
      <button type="button" data-impact-destination="world">${copy.world}<span>↗</span></button>
    </div>
    <button type="button" class="nfas-impact-drawer-report" data-impact-destination="report">＋ <span>${copy.report}</span></button>
    <div class="nfas-impact-drawer-footer"><span class="nfas-impact-live-dot"></span>${copy.hint}</div>
  `
  document.body.append(backdrop, drawer)

  const edge = document.createElement('button')
  edge.type = 'button'
  edge.className = 'nfas-impact-edge-handle'
  edge.setAttribute('aria-label', copy.title)
  edge.setAttribute('aria-expanded', 'false')
  edge.innerHTML = '<span class="nfas-impact-edge-glyph" aria-hidden="true">◌</span><span class="nfas-impact-edge-label">IMPACT</span><span class="nfas-impact-edge-chevron" aria-hidden="true">‹</span>'
  document.body.appendChild(edge)

  drawer.querySelector('.nfas-impact-drawer-close')?.addEventListener('click', () => setImpactDrawerOpen(false))
  edge.addEventListener('click', () => setImpactDrawerOpen(!impactDrawerOpen))
  drawer.querySelectorAll<HTMLButtonElement>('[data-impact-destination]').forEach((button) => {
    button.addEventListener('click', () => {
      const destination = button.dataset.impactDestination ?? ''
      const patterns: Record<string, RegExp> = {
        impact: /impact|awareness|sensibilisation|التأثير|الوعي/i,
        people: /people|personnes|الأشخاص/i,
        voices: /voices|voix|الأصوات/i,
        zones: /zones|my zones|your zones|المناطق/i,
        initiatives: /initiatives|المبادرات/i,
        local: /local calls|appels locaux|نداءات محلية/i,
        world: /world calls|appels mondiaux|نداءات عالمية/i,
        report: /report an issue|signaler un problème|الإبلاغ عن مشكلة/i,
      }
      const pattern = patterns[destination]
      if (pattern) {
        const target = Array.from(document.querySelectorAll<HTMLElement>('button, [role="button"], a'))
          .find((element) => !drawer.contains(element) && !element.classList.contains('nfas-impact-edge-handle') &&
            pattern.test([element.textContent ?? '', element.getAttribute('aria-label') ?? '', element.getAttribute('title') ?? ''].join(' ')))
        target?.click()
      }
      setImpactDrawerOpen(false)
    })
  })

  let touchStartX = 0
  let touchStartY = 0
  const onTouchStart = (event: TouchEvent) => {
    if (event.touches.length !== 1) return
    touchStartX = event.touches[0].clientX
    touchStartY = event.touches[0].clientY
  }
  const onTouchEnd = (event: TouchEvent) => {
    if (window.innerWidth > 760 || event.changedTouches.length !== 1) return
    const dx = event.changedTouches[0].clientX - touchStartX
    const dy = event.changedTouches[0].clientY - touchStartY
    if (Math.abs(dx) < 75 || Math.abs(dx) < Math.abs(dy) * 1.35) return
    if (dx < 0 && !impactDrawerOpen) setImpactDrawerOpen(true)
    else if (dx > 0 && impactDrawerOpen) setImpactDrawerOpen(false)
  }
  document.addEventListener('touchstart', onTouchStart, { passive: true })
  document.addEventListener('touchend', onTouchEnd, { passive: true })
  impactDrawerCleanup = () => {
    document.removeEventListener('touchstart', onTouchStart)
    document.removeEventListener('touchend', onTouchEnd)
    backdrop.remove()
    drawer.remove()
    edge.remove()
    document.body.classList.remove('nfas-impact-drawer-open')
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


  let trigger = heading.parentElement?.querySelector<HTMLButtonElement>('.nfas-impact-discovery-trigger')
  if (!trigger) {
    trigger = document.createElement('button')
    trigger.type = 'button'
    trigger.className = 'nfas-impact-discovery-trigger'
    trigger.addEventListener('click', () => setImpactDrawerOpen(true))
    heading.insertAdjacentElement('afterend', trigger)
  }
  trigger.textContent = language === 'fr' ? 'Explorer l’impact' : language === 'ar' ? 'استكشف التأثير' : 'Explore impact'
  trigger.setAttribute('aria-label', trigger.textContent)

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
  markTopbarImpactButton()
  markImpactDiscoveryCue()
}

onMounted(() => {
  createImpactDrawer()
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

onBeforeUnmount(() => { impactButtonObserver?.disconnect(); impactDrawerCleanup?.() })
</script>

<template>
  <HelloWorld />
</template>
