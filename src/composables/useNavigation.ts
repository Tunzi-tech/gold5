import type { Ref } from 'vue'
import type { Zone } from '../types/zone'

export function useNavigation(
  activeView: Ref<string>,
  selectedZone: Ref<Zone | null>,
  activeZoneTab: Ref<string>
) {
  function navigate(view: string) {
    activeView.value = view
    selectedZone.value = null
    activeZoneTab.value = 'overview'
  }

  function openZone(zone: Zone) {
    selectedZone.value = zone
    activeView.value = 'zone'
    activeZoneTab.value = 'overview'
  }

  function setZoneTab(tab: string) {
    activeZoneTab.value = tab
  }

  return {
    navigate,
    openZone,
    setZoneTab
  }
}
