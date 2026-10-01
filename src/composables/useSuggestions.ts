import type { Ref } from 'vue'
import type { Suggestion, Zone } from '../types/zone'

export function useSuggestions(selectedZone: Ref<Zone | null>) {
  function voteSuggestion(suggestion: Suggestion) {
    suggestion.voted = !suggestion.voted
    suggestion.votes += suggestion.voted ? 1 : -1
  }

  function createSuggestion(text: string) {
    if (!selectedZone.value || !text.trim()) return null

    const suggestion: Suggestion = {
      id: Date.now(),
      author: 'You',
      avatar: 'YO',
      text: text.trim(),
      votes: 0,
      voted: false,
      answers: 0,
      status: 'Open'
    }

    selectedZone.value.suggestions.unshift(suggestion)
    return suggestion
  }

  return {
    voteSuggestion,
    createSuggestion
  }
}
