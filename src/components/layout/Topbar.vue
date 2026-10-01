<script setup lang="ts">
defineProps<{
  search: string
}>()

const emit = defineEmits<{
  (event: 'update:search', value: string): void
  (event: 'create-post'): void
}>()
</script>

<template>
  <header class="topbar">
    <div class="mobile-brand">
      COMMON
    </div>

    <div class="search-box">
      <span>⌕</span>

      <input
        :value="search"
        placeholder="Search people, pages, posts or zones..."
        @input="emit('update:search', ($event.target as HTMLInputElement).value)"
      />

      <kbd>⌘ K</kbd>
    </div>

    <div class="top-actions">
      <button class="top-icon">◌</button>
      <button class="top-icon">✉</button>

      <button
        class="primary-btn"
        @click="emit('create-post')"
      >
        + Post
      </button>
    </div>
  </header>
</template>
