<script setup lang="ts">
import { onBeforeUnmount, onMounted } from 'vue'
import './home-live-flow-vibrancy.css'
import HelloWorld from './components/HelloWorld.vue'

let impactButtonObserver: MutationObserver | undefined

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

onBeforeUnmount(() => impactButtonObserver?.disconnect())
</script>

<template>
  <HelloWorld />
</template>
