import type { Ref } from 'vue'
import type { Person } from '../types/social'
import type { OfficialMember, Zone } from '../types/zone'

export function useMembers(
  people: Ref<Person[]>,
  selectedZone: Ref<Zone | null>
) {
  function togglePersonFollow(person: Person) {
    person.followed = !person.followed
  }

  function isOfficialMember(person: Person) {
    if (!selectedZone.value) return false

    return selectedZone.value.officialMembers.some(
      member => member.personId === person.id
    )
  }

  function getOfficialMember(person: Person): OfficialMember | undefined {
    if (!selectedZone.value) return undefined

    return selectedZone.value.officialMembers.find(
      member => member.personId === person.id
    )
  }

  return {
    people,
    togglePersonFollow,
    isOfficialMember,
    getOfficialMember
  }
}
