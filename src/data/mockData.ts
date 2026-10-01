import type { Page, Person, Post } from '../types/social'
import type { Zone } from '../types/zone'

export const pages: Page[] = [
  {
    id: 1,
    name: 'Green Horizon',
    handle: '@greenhorizon',
    description: 'Local environmental action and awareness.',
    followers: '8.4K',
    avatar: 'GH',
    color: '#4ade80',
    followed: true,
    category: 'Environment'
  },
  {
    id: 2,
    name: 'Future Makers',
    handle: '@futuremakers',
    description: 'People building practical solutions for tomorrow.',
    followers: '12.7K',
    avatar: 'FM',
    color: '#8b5cf6',
    followed: true,
    category: 'Innovation'
  },
  {
    id: 3,
    name: 'Tunis Community',
    handle: '@tuniscommunity',
    description: 'Connecting people who care about their city.',
    followers: '5.2K',
    avatar: 'TC',
    color: '#38bdf8',
    followed: false,
    category: 'Community'
  },
  {
    id: 4,
    name: 'Urban Gardeners',
    handle: '@urbangardeners',
    description: 'Growing food and life inside the city.',
    followers: '3.8K',
    avatar: 'UG',
    color: '#f59e0b',
    followed: false,
    category: 'Nature'
  }
]

export const people: Person[] = [
  {
    id: 1,
    name: 'Amine Ben Salem',
    username: '@amine',
    avatar: 'AB',
    reason: 'You both follow Green Horizon',
    mutual: 8,
    followed: false
  },
  {
    id: 2,
    name: 'Sarra Mansour',
    username: '@sarra',
    avatar: 'SM',
    reason: 'Participates in Tunis environmental goals',
    mutual: 4,
    followed: false
  },
  {
    id: 3,
    name: 'Youssef Trabelsi',
    username: '@youssef',
    avatar: 'YT',
    reason: 'Active in your zones',
    mutual: 11,
    followed: false
  },
  {
    id: 4,
    name: 'Meriem Khalfallah',
    username: '@meriem',
    avatar: 'MK',
    reason: 'Connected through shared interests',
    mutual: 6,
    followed: false
  }
]

export const posts: Post[] = [
  {
    id: 1,
    author: 'Green Horizon',
    handle: '@greenhorizon',
    avatar: 'GH',
    page: 'Green Horizon',
    time: '24 min',
    content:
      'What if every neighborhood had one small place dedicated to trees, plants and community care? We are exploring this idea inside our zone.',
    zone: 'Tunis North',
    likes: 48,
    comments: 12,
    liked: false
  },
  {
    id: 2,
    author: 'Amine Ben Salem',
    handle: '@amine',
    avatar: 'AB',
    time: '1 h',
    content:
      'I noticed that many people want to participate in local projects, but they do not know where to start. Maybe the first step is simply identifying what needs attention around us.',
    zone: 'Tunis North',
    likes: 31,
    comments: 8,
    liked: false
  },
  {
    id: 3,
    author: 'Future Makers',
    handle: '@futuremakers',
    avatar: 'FM',
    page: 'Future Makers',
    time: '3 h',
    content:
      'A community does not need everyone to agree on the same solution. It needs a place where different solutions can be proposed, discussed and tested.',
    likes: 72,
    comments: 19,
    liked: false
  }
]

export const zones: Zone[] = [
  {
    id: 1,
    name: 'Tunis North',
    location: 'Tunis, Tunisia',
    description:
      'A local space for people who want to improve the environment, public spaces and everyday life around Tunis North.',
    members: 284,
    participants: 96,
    cover:
      'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=1400&q=80',
    joined: true,
    goals: [
      {
        id: 1,
        title: 'More green public spaces',
        description: 'Identify areas that could become greener and propose realistic actions.',
        progress: 62,
        public: true
      },
      {
        id: 2,
        title: 'Cleaner streets',
        description: 'Internal working goal for active zone members.',
        progress: 37,
        public: false
      },
      {
        id: 3,
        title: 'Community garden',
        description: 'Explore the possibility of creating a shared garden.',
        progress: 21,
        public: true
      }
    ],
    suggestions: [
      {
        id: 1,
        author: 'Sarra',
        avatar: 'SM',
        text: 'Could we identify three streets where trees could realistically be planted this year?',
        votes: 43,
        voted: false,
        answers: 9,
        status: 'Open'
      },
      {
        id: 2,
        author: 'Amine',
        avatar: 'AB',
        text: 'What about creating one monthly community clean-up?',
        votes: 31,
        voted: false,
        answers: 6,
        status: 'Discussing'
      },
      {
        id: 3,
        author: 'Youssef',
        avatar: 'YT',
        text: 'Can local businesses contribute materials for the first garden?',
        votes: 19,
        voted: false,
        answers: 4,
        status: 'Open'
      }
    ],
    officialRoles: [
      {
        id: 1,
        name: 'President',
        description: 'Represents the Zone and helps coordinate its direction.',
        elected: true
      },
      {
        id: 2,
        name: 'Event Organizer',
        description: 'Coordinates public events and activities.',
        elected: true
      },
      {
        id: 3,
        name: 'Goal Coordinator',
        description: 'Helps turn Zone goals into organized action.',
        elected: true
      },
      {
        id: 4,
        name: 'Community Representative',
        description: 'Brings member concerns and perspectives into Zone decisions.',
        elected: true
      }
    ],
    officialMembers: [
      {
        id: 1,
        personId: 1,
        name: 'Amine Ben Salem',
        avatar: 'AB',
        roleId: 1,
        roleName: 'President',
        since: 'May 2026'
      },
      {
        id: 2,
        personId: 2,
        name: 'Sarra Mansour',
        avatar: 'SM',
        roleId: 2,
        roleName: 'Event Organizer',
        since: 'June 2026'
      },
      {
        id: 3,
        personId: 3,
        name: 'Youssef Trabelsi',
        avatar: 'YT',
        roleId: 3,
        roleName: 'Goal Coordinator',
        since: 'June 2026'
      }
    ],
    elections: [
      {
        id: 1,
        roleId: 4,
        roleName: 'Community Representative',
        question: 'Who should represent the Zone members?',
        status: 'Open',
        candidates: [
          {
            id: 1,
            personId: 4,
            name: 'Meriem Khalfallah',
            avatar: 'MK',
            votes: 34,
            voted: false
          },
          {
            id: 2,
            personId: 2,
            name: 'Sarra Mansour',
            avatar: 'SM',
            votes: 28,
            voted: false
          },
          {
            id: 3,
            personId: 3,
            name: 'Youssef Trabelsi',
            avatar: 'YT',
            votes: 19,
            voted: false
          }
        ]
      }
    ],
    roleProposals: [
      {
        id: 1,
        title: 'Create a Vice President role',
        description: 'Add a second elected position to support the President and share coordination.',
        yesVotes: 82,
        noVotes: 17,
        voted: false
      },
      {
        id: 2,
        title: 'Add a Youth Representative role',
        description: 'Create a dedicated elected role for younger members of the Zone.',
        yesVotes: 61,
        noVotes: 12,
        voted: false
      }
    ]
  },
  {
    id: 2,
    name: 'La Marsa Coast',
    location: 'La Marsa, Tunisia',
    description:
      'Residents and people connected to the coast working on marine life, beaches and public spaces.',
    members: 417,
    participants: 143,
    cover:
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1400&q=80',
    joined: false,
    goals: [
      {
        id: 1,
        title: 'Protect the coastline',
        description: 'Find practical ways to reduce waste and protect coastal areas.',
        progress: 44,
        public: true
      },
      {
        id: 2,
        title: 'Beach awareness',
        description: 'Create local educational activities.',
        progress: 70,
        public: true
      }
    ],
    suggestions: [
      {
        id: 1,
        author: 'Meriem',
        avatar: 'MK',
        text: 'Could we create a map of areas that need the most attention?',
        votes: 57,
        voted: false,
        answers: 13,
        status: 'Open'
      }
    ],
    officialRoles: [],
    officialMembers: [],
    elections: [],
    roleProposals: []
  },
  {
    id: 3,
    name: 'Sidi Bou Said',
    location: 'Sidi Bou Said, Tunisia',
    description:
      'A zone focused on protecting local identity, public spaces and community life.',
    members: 198,
    participants: 71,
    cover:
      'https://images.unsplash.com/photo-1539650116574-75c0c6d73f6e?auto=format&fit=crop&w=1400&q=80',
    joined: false,
    goals: [
      {
        id: 1,
        title: 'Preserve public spaces',
        description: 'Discover what the community can do together.',
        progress: 54,
        public: true
      }
    ],
    suggestions: [
      {
        id: 1,
        author: 'Nadia',
        avatar: 'NA',
        text: 'How can we involve young people in preserving the area?',
        votes: 26,
        voted: false,
        answers: 8,
        status: 'Open'
      }
    ],
    officialRoles: [],
    officialMembers: [],
    elections: [],
    roleProposals: []
  }
]
