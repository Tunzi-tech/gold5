<script setup lang="ts">
import type { Zone } from '../../types/zone'

defineProps<{
  activeView: string
  zones: Zone[]
}>()

const emit = defineEmits<{
  (event: 'navigate', view: string): void
  (event: 'open-zone', zone: Zone): void
  (event: 'create-zone'): void
}>()
</script>

<template>
  <aside class="sidebar">
    <div class="brand" @click="emit('navigate', 'home')">
      <div class="brand-orbit">
        <span></span>
      </div>

      <div>
        <strong>COMMON</strong>
        <small>PEOPLE • PLACES • ACTION</small>
      </div>
    </div>

    <nav class="main-nav">
      <button :class="{ active: activeView === 'home' }" @click="emit('navigate', 'home')">
        <span class="icon">⌂</span>
        Home
      </button>
      <button :class="{ active: activeView === 'discover' }" @click="emit('navigate', 'discover')">
        <span class="icon">◎</span>
        Discover
      </button>
      <button :class="{ active: activeView === 'zones' }" @click="emit('navigate', 'zones')">
        <span class="icon">◈</span>
        Zones
      </button>
      <button :class="{ active: activeView === 'people' }" @click="emit('navigate', 'people')">
        <span class="icon">♧</span>
        People
      </button>
      <button :class="{ active: activeView === 'pages' }" @click="emit('navigate', 'pages')">
        <span class="icon">▣</span>
        Pages
      </button>
    </nav>

    <div class="sidebar-zone">
      <div class="sidebar-label">YOUR ZONES</div>

      <div
        v-for="zone in zones.filter(z => z.joined)"
        :key="zone.id"
        class="mini-zone"
        @click="emit('open-zone', zone)"
      >
        <span class="mini-dot"></span>
        {{ zone.name }}
      </div>

      <button class="create-zone-small" @click="emit('create-zone')">
        + Create zone
      </button>
    </div>

    <div class="profile-mini">
      <div class="avatar blue">YO</div>
      <div>
        <strong>You</strong>
        <span>@you</span>
      </div>
      <span class="dots">•••</span>
    </div>
  </aside>
</template>
