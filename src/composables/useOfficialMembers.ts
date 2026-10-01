import type { Ref } from 'vue'
import type {
  Election,
  ElectionCandidate,
  RoleProposal,
  Zone
} from '../types/zone'

export function useOfficialMembers(selectedZone: Ref<Zone | null>) {
  function createOfficialRole(name: string, description: string) {
    if (!selectedZone.value || !name.trim()) return null

    const role = {
      id: Date.now(),
      name: name.trim(),
      description:
        description.trim() ||
        'A role created by the Zone to support its community work.',
      elected: true
    }

    selectedZone.value.officialRoles.push(role)
    return role
  }

  function voteElection(election: Election, candidate: ElectionCandidate) {
    if (election.status !== 'Open') return

    const previous = election.candidates.find(item => item.voted)

    if (previous && previous.id !== candidate.id) {
      previous.voted = false
      previous.votes--
    }

    candidate.voted = !candidate.voted
    candidate.votes += candidate.voted ? 1 : -1
  }

  function voteRoleProposal(proposal: RoleProposal, choice: 'yes' | 'no') {
    if (proposal.voted) return

    if (choice === 'yes') {
      proposal.yesVotes++
    } else {
      proposal.noVotes++
    }

    proposal.voted = true
  }

  return {
    createOfficialRole,
    voteElection,
    voteRoleProposal
  }
}
