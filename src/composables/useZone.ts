import { computed, type Ref } from 'vue'
import type { Zone } from '../types/zone'

export function useZone(
  zones: Ref<Zone[]>,
  selectedZone: Ref<Zone | null>,
  activeView: Ref<string>,
  activeZoneTab: Ref<string>
) {
  const publicGoals = computed(() => {
    if (!selectedZone.value) return []
    return selectedZone.value.goals.filter(goal => goal.public)
  })

  function navigateToZone(zone: Zone) {
    selectedZone.value = zone
    activeView.value = 'zone'
    activeZoneTab.value = 'overview'
  }

  function setZoneTab(tab: string) {
    activeZoneTab.value = tab
  }

  function participate(zone: Zone) {
    zone.joined = !zone.joined
    zone.participants += zone.joined ? 1 : -1
  }

  function createZone(
    name: string,
    location: string,
    description: string
  ) {
    if (!name.trim()) return null

    const zone: Zone = {
      id: Date.now(),
      name: name.trim(),
      location: location.trim() || 'Local zone',
      description:
        description.trim() ||
        'A new community zone created by its members.',
      members: 1,
      participants: 1,
      cover:
        'https://images.unsplash.com/photo-1444723121867-7a241cacace9?auto=format&fit=crop&w=1400&q=80',
      joined: true,
      goals: [],
      suggestions: [],
      officialRoles: [],
      officialMembers: [],
      elections: [],
      roleProposals: []
    }

    zones.value.unshift(zone)
    navigateToZone(zone)

    return zone
  }

  return {
    publicGoals,
    navigateToZone,
    setZoneTab,
    participate,
    createZone
  }
}
