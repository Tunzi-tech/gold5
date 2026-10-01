export type Goal = {
  id: number
  title: string
  description: string
  progress: number
  public: boolean
}

export type Suggestion = {
  id: number
  author: string
  avatar: string
  text: string
  votes: number
  voted: boolean
  answers: number
  status: string
}

export type OfficialRole = {
  id: number
  name: string
  description: string
  elected: boolean
}

export type OfficialMember = {
  id: number
  personId: number
  name: string
  avatar: string
  roleId: number
  roleName: string
  since: string
}

export type ElectionCandidate = {
  id: number
  personId: number
  name: string
  avatar: string
  votes: number
  voted: boolean
}

export type Election = {
  id: number
  roleId: number
  roleName: string
  question: string
  status: 'Open' | 'Closed'
  candidates: ElectionCandidate[]
}

export type RoleProposal = {
  id: number
  title: string
  description: string
  yesVotes: number
  noVotes: number
  voted: boolean
}

export type Zone = {
  id: number
  name: string
  location: string
  description: string
  members: number
  participants: number
  cover: string
  joined: boolean
  goals: Goal[]
  suggestions: Suggestion[]
  officialRoles: OfficialRole[]
  officialMembers: OfficialMember[]
  elections: Election[]
  roleProposals: RoleProposal[]
}
