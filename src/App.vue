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

function markImpactDiscoveryCue() {
  const headingText = 'find your way to make an impact'
  const candidates = Array.from(document.querySelectorAll('h1, h2, h3, h4, p, span, div'))
    .filter((element) => {
      const text = (element.textContent ?? '').replace(/\s+/g, ' ').trim().toLowerCase()
      return text.startsWith(headingText) && text.length <= 150
    })
    .sort((a, b) => (a.textContent ?? '').length - (b.textContent ?? '').length)

  const heading = candidates[0] as HTMLElement | undefined
  if (!heading) return

  heading.classList.add('nfas-impact-discovery-title')
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
    attributeFilter: ['aria-label', 'title', 'data-view', 'data-action'],
  })
})

onBeforeUnmount(() => impactButtonObserver?.disconnect())
</script>

<template>
  <HelloWorld />
</template>
