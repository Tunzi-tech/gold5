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

onMounted(() => {
  markTopbarImpactButton()
  impactButtonObserver = new MutationObserver(markTopbarImpactButton)
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
