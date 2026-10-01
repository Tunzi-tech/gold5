<script setup lang="ts">
import { computed, onMounted, onBeforeUnmount, ref } from 'vue'

type Page = {
  id: number
  name: string
  handle: string
  description: string
  followers: string
  avatar: string
  color: string
  followed: boolean
  category: string
}

type Post = {
  id: number
  author: string
  handle: string
  avatar: string
  page?: string
  time: string
  content: string
  zone?: string
  image?: string
  likes: number
  comments: number
  liked: boolean
}

type Goal = {
  id: number
  title: string
  description: string
  progress: number
  public: boolean
}

type Suggestion = {
  id: number
  author: string
  avatar: string
  text: string
  votes: number
  voted: boolean
  answers: number
  status: string
}

type OfficialRole = {
  id: number
  name: string
  description: string
  elected: boolean
}

type OfficialMember = {
  id: number
  personId: number
  name: string
  avatar: string
  roleId: number
  roleName: string
  since: string
}

type ElectionCandidate = {
  id: number
  personId: number
  name: string
  avatar: string
  votes: number
  voted: boolean
}

type Election = {
  id: number
  roleId: number
  roleName: string
  question: string
  status: 'Open' | 'Closed'
  candidates: ElectionCandidate[]
}

type RoleProposal = {
  id: number
  title: string
  description: string
  yesVotes: number
  noVotes: number
  voted: boolean
}

type Zone = {
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

/* =====================================================
   UI STATE
   ===================================================== */

const activeView = ref('home')
const selectedZone = ref<Zone | null>(null)
const showCreatePost = ref(false)
const showCreateZone = ref(false)
const showCreateSuggestion = ref(false)
const showCreateRole = ref(false)
const activeZoneTab = ref('overview')
const search = ref('')
const postText = ref('')
const newZoneName = ref('')
const newZoneLocation = ref('')
const newZoneDescription = ref('')
const suggestionText = ref('')
const newRoleName = ref('')
const newRoleDescription = ref('')

/* =====================================================
   HERO ROTATION
   ===================================================== */

const activeHero = ref(0)

const heroes = [
  {
    label: 'YOUR PLACE ┬À YOUR PEOPLE ┬À YOUR ACTION',
    titleBefore: 'What is happening',
    titleAccent: 'around you?',
    description:
      'Follow people and pages. Discover connections. Participate in the places you care about.',
  },
  {
    label: 'YOUR PLACE ┬À YOUR PEOPLE ┬À YOUR ACTION',
    titleBefore: 'Make it',
    titleAccent: 'impact.',
    titleAfter: 'Make it',
    secondAccent: 'your Zone.',
    description:
      'Your Zone is a real place. The streets, places and people around you become the starting point for local organization.',
  },
]

let heroTimer: ReturnType<typeof setInterval> | null = null


/* =====================================================
   PEOPLE / PAGES
   ===================================================== */

const pages = ref<Page[]>([
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
])

const people = ref([
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
])

const posts = ref<Post[]>([
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
])

/* =====================================================
   ZONES
   ===================================================== */

const zones = ref<Zone[]>([
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
])

/* =====================================================
   COMPUTED
   ===================================================== */

const filteredPosts = computed(() => {
  if (!search.value.trim()) return posts.value

  const q = search.value.toLowerCase()

  return posts.value.filter(
    p =>
      p.content.toLowerCase().includes(q) ||
      p.author.toLowerCase().includes(q) ||
      p.zone?.toLowerCase().includes(q)
  )
})

const publicGoals = computed(() => {
  if (!selectedZone.value) return []

  return selectedZone.value.goals.filter(goal => goal.public)
})

/* =====================================================
   NAVIGATION
   ===================================================== */

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

/* =====================================================
   SOCIAL ACTIONS
   ===================================================== */

function toggleFollow(page: Page) {
  page.followed = !page.followed
}

function togglePersonFollow(person: any) {
  person.followed = !person.followed
}

function likePost(post: Post) {
  post.liked = !post.liked
  post.likes += post.liked ? 1 : -1
}

function participate(zone: Zone) {
  zone.joined = !zone.joined

  if (zone.joined) {
    zone.participants++
  } else {
    zone.participants--
  }
}

function voteSuggestion(suggestion: Suggestion) {
  suggestion.voted = !suggestion.voted
  suggestion.votes += suggestion.voted ? 1 : -1
}

/* =====================================================
   CREATION ACTIONS
   ===================================================== */

function createPost() {
  if (!postText.value.trim()) return

  posts.value.unshift({
    id: Date.now(),
    author: 'You',
    handle: '@you',
    avatar: 'YO',
    time: 'now',
    content: postText.value,
    likes: 0,
    comments: 0,
    liked: false
  })

  postText.value = ''
  showCreatePost.value = false
}

function createZone() {
  if (!newZoneName.value.trim()) return

  const zone: Zone = {
    id: Date.now(),
    name: newZoneName.value,
    location: newZoneLocation.value || 'Local zone',
    description:
      newZoneDescription.value ||
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
roleProposals: [],
  }

  zones.value.unshift(zone)

  newZoneName.value = ''
  newZoneLocation.value = ''
  newZoneDescription.value = ''
  showCreateZone.value = false

  openZone(zone)
}

function createSuggestion() {
  if (!selectedZone.value || !suggestionText.value.trim()) return

  selectedZone.value.suggestions.unshift({
    id: Date.now(),
    author: 'You',
    avatar: 'YO',
    text: suggestionText.value,
    votes: 0,
    voted: false,
    answers: 0,
    status: 'Open'
  })

  suggestionText.value = ''
  showCreateSuggestion.value = false
}

/* =====================================================
   ZONE GOVERNANCE
   ===================================================== */

function createOfficialRole() {
  if (!selectedZone.value || !newRoleName.value.trim()) return

  selectedZone.value.officialRoles.push({
    id: Date.now(),
    name: newRoleName.value.trim(),
    description:
      newRoleDescription.value.trim() ||
      'A role created by the Zone to support its community work.',
    elected: true
  })

  newRoleName.value = ''
  newRoleDescription.value = ''
  showCreateRole.value = false
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
onMounted(() => {
  heroTimer = setInterval(() => {
    activeHero.value = (activeHero.value + 1) % heroes.length
  }, 8000)
})

onBeforeUnmount(() => {
  if (heroTimer) {
    clearInterval(heroTimer)
    heroTimer = null
  }
})

</script>

<template>
  <div class="app-shell">

    <!-- SIDEBAR -->
    <aside class="sidebar">

      <div class="brand" @click="navigate('home')">
        <div class="brand-orbit">
          <span></span>
        </div>

        <div>
          <strong>COMMON</strong>
          <small>PEOPLE ÔÇó PLACES ÔÇó ACTION</small>
        </div>
      </div>

      <nav class="main-nav">

        <button
          :class="{ active: activeView === 'home' }"
          @click="navigate('home')"
        >
          <span class="icon">Ôîé</span>
          Home
        </button>

        <button
          :class="{ active: activeView === 'discover' }"
          @click="navigate('discover')"
        >
          <span class="icon">ÔùÄ</span>
          Discover
        </button>

        <button
          :class="{ active: activeView === 'zones' }"
          @click="navigate('zones')"
        >
          <span class="icon">Ôùë</span>
          Zones
        </button>

        

        <button
          :class="{ active: activeView === 'pages' }"
          @click="navigate('pages')"
        >
          <span class="icon">Ôûú</span>
          Pages & commons
        </button>

        <button
          :class="{ active: activeView === 'people' }"
          @click="navigate('people')"
        >
          <span class="icon">ÔÖº</span>
          People 
        </button>

      </nav>

      <div class="sidebar-zone">

        <div class="sidebar-label">
          YOUR ZONES
        </div>

        <div
          v-for="zone in zones.filter(z => z.joined)"
          :key="zone.id"
          class="mini-zone"
          @click="openZone(zone)"
        >
          <span class="mini-dot"></span>
          {{ zone.name }}
        </div>

        <button
          class="create-zone-small"
          @click="showCreateZone = true"
        >
          + Create zone
        </button>

      </div>

      <div class="sidebar-bottom">

        <div class="profile-mini">
          <div class="avatar blue">YO</div>

          <div>
            <strong>You</strong>
            <span>@you</span>
          </div>

          <span class="dots">ÔÇóÔÇóÔÇó</span>
        </div>

      </div>

    </aside>

    <!-- MAIN -->
    <main class="main">

      <!-- TOP BAR -->
      <header class="topbar">

        <div class="mobile-brand">
          COMMON
        </div>

        <div class="search-box">
          <span>Ôîò</span>

          <input
            v-model="search"
            placeholder="Search people, pages, posts or zones..."
          />

          <kbd>Ôîÿ K</kbd>
        </div>

        <div class="top-actions">
          <button class="top-icon">Ôùî</button>
          <button class="top-icon">Ô£ë</button>

          <button
            class="primary-btn"
            @click="showCreatePost = true"
          >
            + 
          </button>
        </div>

      </header>

      <!-- =================================================
           HOME
           ================================================= -->
      <section v-if="activeView === 'home'" class="content">

        <div class="hero-stage">
          <transition name="hero-fade" mode="out-in">
            <div :key="activeHero" class="hero hero-rotating">
              <div class="hero-copy">
                <span class="hero-label">
                  {{ heroes[activeHero].label }}
                </span>

                <h1>
                  {{ heroes[activeHero].titleBefore }}
                  <span
                    :class="activeHero === 0 ? 'hero-accent-blue' : 'hero-accent-gold'"
                  >
                    {{ heroes[activeHero].titleAccent }}
                  </span>
                  <template v-if="heroes[activeHero].titleAfter">
                    <br />
                    {{ heroes[activeHero].titleAfter }}
                    <span class="hero-accent-blue">
                      {{ heroes[activeHero].secondAccent }}
                    </span>
                  </template>
                </h1>

                <p>{{ heroes[activeHero].description }}</p>
              </div>

              <!-- Keep the original animated visual: only the hero copy changes. -->
              <div
                class="hero-orbit"
                :class="{ 'hero-orbit-original': activeHero === 0 }"
                aria-hidden="true"
              >
                <div class="orbit-ring ring-one"></div>
                <div class="orbit-ring ring-two"></div>
                <div class="orbit-core">
                  <span v-if="activeHero === 0">C</span>
                  <span v-else>ZONE</span>
                </div>
                <div class="orbit-node node-a"></div>
                <div class="orbit-node node-b"></div>
                <div class="orbit-node node-c"></div>
              </div>
            </div>
          </transition>

          <div class="hero-progress">
            <button
              v-for="(_, index) in heroes"
              :key="index"
              type="button"
              :aria-label="`Show hero ${index + 1}`"
              :class="{ active: index === activeHero }"
              @click="activeHero = index"
            ></button>
          </div>
        </div>

        <div class="section-heading">

          <div>
            <span class="eyebrow">LIVE NETWORK</span>
            <h2>From people you follow</h2>
          </div>

          <button class="ghost-btn">
            Customize feed ÔåÆ
          </button>

        </div>

        <div class="feed-layout">

          <div class="feed">

            <article
              v-for="post in filteredPosts"
              :key="post.id"
              class="post-card"
            >

              <div class="post-head">

                <div class="avatar blue">
                  {{ post.avatar }}
                </div>

                <div class="post-author">
                  <strong>{{ post.author }}</strong>
                  <span>
                    {{ post.handle }}
                    <i>ÔÇó</i>
                    {{ post.time }}
                  </span>
                </div>

                <button class="more">ÔÇóÔÇóÔÇó</button>

              </div>

              <p class="post-content">
                {{ post.content }}
              </p>

              <div
                v-if="post.zone"
                class="post-zone"
                @click="
                  openZone(
                    zones.find(z => z.name === post.zone) || zones[0]
                  )
                "
              >
                <span>Ôùë</span>
                {{ post.zone }}
              </div>

              <div class="post-actions">

                <button
                  :class="{ liked: post.liked }"
                  @click="likePost(post)"
                >
                  ÔÖí {{ post.likes }}
                </button>

                <button>
                  Ôùî {{ post.comments }}
                </button>

                <button>
                  Ôåù Share
                </button>

                <button class="save">
                  ÔÖó
                </button>

              </div>

            </article>

          </div>

          <!-- RIGHT COLUMN -->
          <aside class="right-column">

            <div class="side-card">

              <div class="card-heading">
                <div>
                  <span class="eyebrow">CONNECTED SOMEHOW</span>
                  <h3>People you may know</h3>
                </div>

                <button>ÔÇóÔÇóÔÇó</button>
              </div>

              <div
                v-for="person in people.slice(0, 3)"
                :key="person.id"
                class="person-row"
              >

                <div class="avatar purple">
                  {{ person.avatar }}
                </div>

                <div class="person-info">
                  <strong>{{ person.name }}</strong>
                  <span>{{ person.reason }}</span>
                </div>

                <button
                  class="follow-btn"
                  :class="{ following: person.followed }"
                  @click="togglePersonFollow(person)"
                >
                  {{ person.followed ? 'Following' : 'Follow' }}
                </button>

              </div>

              <button
                class="view-all"
                @click="navigate('people')"
              >
                Explore people ÔåÆ
              </button>

            </div>

            <div class="side-card zone-preview">

              <div class="card-heading">
                <div>
                  <span class="eyebrow">YOUR ZONE</span>
                  <h3>Tunis North</h3>
                </div>
              </div>

              <div class="zone-stat-grid">
                <div>
                  <strong>284</strong>
                  <span>Members</span>
                </div>

                <div>
                  <strong>96</strong>
                  <span>Participating</span>
                </div>

                <div>
                  <strong>12</strong>
                  <span>Suggestions</span>
                </div>
              </div>

              <button
                class="zone-open"
                @click="openZone(zones[0])"
              >
                Enter zone ÔåÆ
              </button>

            </div>

          </aside>

        </div>

      </section>

      <!-- =================================================
           DISCOVER
           ================================================= -->
      <section v-if="activeView === 'discover'" class="content">

        <div class="page-title">
          <span class="eyebrow"></span>
          <h1>Find your Commons.</h1>
          <p>
            Start with what matters to you, take part in the places around you,
            and discover people and ideas that can move things forward.
          </p>
        </div>

        <div class="discover-grid">

          <div class="discover-card large">
            <span class="discover-number">01</span>
            <h2>Share your interests & ambitions</h2>
            <p>
              Tell us what you care about, what you want to change,
              and what you want to build in your zones.
            </p>

            <button
              class="primary-btn"
              @click="navigate('zones')"
            >
              Share yours
            </button>
          </div>

          <div class="discover-card">
            <span class="discover-number">02</span>
            <h2>Participate where you're needed</h2>
            <p>
              Find places and local goals that need your participation.
            </p>

            <button
              class="ghost-btn"
              @click="navigate('zones')"
            >
              Find places ÔåÆ
            </button>
          </div>

          <div class="discover-card">
            <span class="discover-number">03</span>
            <h2>Be inspired by people & ideas</h2>
            <p>
              See what people are sharing, building and imagining around you.
            </p>

            <button
              class="ghost-btn"
              @click="navigate('people')"
            >
              Explore around ÔåÆ
            </button>
          </div>

        </div>

      </section>

      <!-- =================================================
           PEOPLE
           ================================================= -->
      <section v-if="activeView === 'people'" class="content">

        <div class="page-title">
          <span class="eyebrow">PEOPLE</span>
          <h1>Connections beyond follows.</h1>
          <p>
            Discover people through shared zones, pages, interests,
            conversations and participation.
          </p>
        </div>

        <div class="people-grid">

          <div
            v-for="person in people"
            :key="person.id"
            class="person-card"
          >

            <div class="person-card-top">

              <div class="large-avatar purple">
                {{ person.avatar }}
              </div>

              <span class="connection-score">
                {{ person.mutual }} shared
              </span>

            </div>

            <h3>{{ person.name }}</h3>
            <span class="username">{{ person.username }}</span>

            <div class="connection-reason">
              <span>Ô£ª</span>
              {{ person.reason }}
            </div>

            <button
              class="full-follow"
              :class="{ following: person.followed }"
              @click="togglePersonFollow(person)"
            >
              {{ person.followed ? 'Following' : 'Follow' }}
            </button>

          </div>

        </div>

      </section>

      <!-- =================================================
           PAGES
           ================================================= -->
      <section v-if="activeView === 'pages'" class="content">

        <div class="page-title">
          <span class="eyebrow">PAGES</span>
          <h1>Follow ideas, not only people.</h1>
          <p>
            Pages represent communities, organizations, projects and ideas.
          </p>
        </div>

        <div class="page-grid">

          <div
            v-for="page in pages"
            :key="page.id"
            class="page-card"
          >

            <div
              class="page-cover"
              :style="{ background: page.color }"
            >
              <div class="page-logo">
                {{ page.avatar }}
              </div>
            </div>

            <div class="page-card-body">

              <div class="page-category">
                {{ page.category }}
              </div>

              <h3>{{ page.name }}</h3>

              <span class="username">
                {{ page.handle }}
              </span>

              <p>
                {{ page.description }}
              </p>

              <div class="page-meta">
                <span>{{ page.followers }} followers</span>

                <button
                  class="follow-btn"
                  :class="{ following: page.followed }"
                  @click="toggleFollow(page)"
                >
                  {{ page.followed ? 'Following' : 'Follow' }}
                </button>
              </div>

            </div>

          </div>

        </div>

      </section>

      <!-- =================================================
           ZONES
           ================================================= -->
      <section v-if="activeView === 'zones'" class="content">

        <div class="zones-header">

          <div class="page-title">
            <span class="eyebrow">COMMUNITY ZONES</span>
            <h1>Take care of your zone.</h1>
            <p>
              A zone turns people around a place into a living community.
              Identify goals, propose ideas and participate.
            </p>
          </div>

          

        </div>

        <div class="zone-grid">

          <article
            v-for="zone in zones"
            :key="zone.id"
            class="zone-card"
            @click="openZone(zone)"
          >

            <div
              class="zone-cover"
              :style="{ backgroundImage: `url(${zone.cover})` }"
            >
              <div class="zone-overlay"></div>

              <div class="zone-location">
                Ôùë {{ zone.location }}
              </div>

              <div class="zone-members">
                {{ zone.members }} members
              </div>
            </div>

            <div class="zone-card-body">

              <h2>{{ zone.name }}</h2>

              <p>
                {{ zone.description }}
              </p>

              <div class="zone-progress">

                <div class="progress-label">
                  <span>Community activity</span>
                  <strong>
                    {{
                      Math.round(
                        zone.goals.reduce((a, b) => a + b.progress, 0) /
                        Math.max(zone.goals.length, 1)
                      )
                    }}%
                  </strong>
                </div>

                <div class="progress">
                  <span
                    :style="{
                      width:
                        Math.round(
                          zone.goals.reduce((a, b) => a + b.progress, 0) /
                          Math.max(zone.goals.length, 1)
                        ) + '%'
                    }"
                  ></span>
                </div>

              </div>

              <div class="zone-footer">

                <span>
                  {{ zone.participants }} participating
                </span>

                <button
                  @click.stop="participate(zone)"
                  :class="{ joined: zone.joined }"
                >
                  {{ zone.joined ? 'Participating Ô£ô' : 'Participate' }}
                </button>

              </div>

            </div>

          </article>

        </div>

      </section>

      <!-- =================================================
           ZONE DETAIL
           ================================================= -->
      <section
        v-if="activeView === 'zone' && selectedZone"
        class="content zone-detail"
      >

        <button
          class="back-btn"
          @click="navigate('zones')"
        >
          ÔåÉ Back to zones
        </button>

        <div
          class="zone-hero"
          :style="{ backgroundImage: `url(${selectedZone.cover})` }"
        >

          <div class="zone-hero-overlay"></div>

          <div class="zone-hero-content">

            <div class="eyebrow">COMMUNITY ZONE</div>

            <h1>{{ selectedZone.name }}</h1>

            <p>
              Ôùë {{ selectedZone.location }}
            </p>

            <p class="zone-description">
              {{ selectedZone.description }}
            </p>

            <button
              class="participate-large"
              :class="{ joined: selectedZone.joined }"
              @click="participate(selectedZone)"
            >
              {{
                selectedZone.joined
                  ? 'Ô£ô You participate in this zone'
                  : 'Participate in this zone'
              }}
            </button>

          </div>

          <div class="zone-hero-stats">
            <div>
              <strong>{{ selectedZone.members }}</strong>
              <span>Members</span>
            </div>

            <div>
              <strong>{{ selectedZone.participants }}</strong>
              <span>Participants</span>
            </div>

            <div>
              <strong>{{ selectedZone.suggestions.length }}</strong>
              <span>Suggestions</span>
            </div>
          </div>

        </div>

        <!-- ZONE NAV -->
        <div class="zone-tabs">
          <button
            :class="{ active: activeZoneTab === 'overview' }"
            @click="setZoneTab('overview')"
          >
            Overview
          </button>
          <button
            :class="{ active: activeZoneTab === 'goals' }"
            @click="setZoneTab('goals')"
          >
            Goals
          </button>
          <button
            :class="{ active: activeZoneTab === 'official' }"
            @click="setZoneTab('official')"
          >
            Official Members
          </button>
          <button
            :class="{ active: activeZoneTab === 'suggestions' }"
            @click="setZoneTab('suggestions')"
          >
            Suggestions
          </button>
          <button
            :class="{ active: activeZoneTab === 'members' }"
            @click="setZoneTab('members')"
          >
            Members
          </button>
          <button
            :class="{ active: activeZoneTab === 'posts' }"
            @click="setZoneTab('posts')"
          >
            Posts
          </button>
        </div>

        <div class="zone-columns">

          <div>

            <!-- OVERVIEW -->
            <template v-if="activeZoneTab === 'overview'">

              <!-- GOALS -->
              <div class="zone-section">
                <div class="section-heading">
                  <div>
                    <span class="eyebrow">WHAT WE ARE TRYING TO DO</span>
                    <h2>Zone goals</h2>
                  </div>

                  <button class="ghost-btn">
                    + Add goal
                  </button>
                </div>

                <div class="goals-list">
                  <div
                    v-for="goal in selectedZone.goals"
                    :key="goal.id"
                    class="goal-card"
                  >
                    <div class="goal-top">
                      <div class="goal-symbol">
                        Ô£ª
                      </div>

                      <div>
                        <h3>{{ goal.title }}</h3>
                        <p>{{ goal.description }}</p>
                      </div>

                      <span
                        class="visibility"
                        :class="{ private: !goal.public }"
                      >
                        {{ goal.public ? 'PUBLIC' : 'PRIVATE' }}
                      </span>
                    </div>

                    <div class="goal-progress">
                      <div class="progress-label">
                        <span>Community progress</span>
                        <strong>{{ goal.progress }}%</strong>
                      </div>

                      <div class="progress">
                        <span :style="{ width: goal.progress + '%' }"></span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- SUGGESTIONS -->
              <div class="zone-section">
                <div class="section-heading">
                  <div>
                    <span class="eyebrow">COMMUNITY INPUT</span>
                    <h2>Suggestions</h2>
                  </div>

                  <button
                    class="primary-btn"
                    @click="showCreateSuggestion = true"
                  >
                    + Suggest
                  </button>
                </div>

                <div class="suggestion-list">
                  <div
                    v-for="suggestion in selectedZone.suggestions"
                    :key="suggestion.id"
                    class="suggestion-card"
                  >
                    <div class="suggestion-vote">
                      <button
                        :class="{ voted: suggestion.voted }"
                        @click="voteSuggestion(suggestion)"
                      >
                        Ôû▓
                      </button>

                      <strong>
                        {{ suggestion.votes }}
                      </strong>
                    </div>

                    <div class="suggestion-main">
                      <div class="suggestion-author">
                        <div class="avatar small purple">
                          {{ suggestion.avatar }}
                        </div>

                        <span>
                          <strong>{{ suggestion.author }}</strong>
                          proposed this
                        </span>

                        <span class="suggestion-status">
                          {{ suggestion.status }}
                        </span>
                      </div>

                      <p>
                        {{ suggestion.text }}
                      </p>

                      <div class="suggestion-actions">
                        <button>
                          {{ suggestion.answers }} answers
                        </button>

                        <button>
                          Discuss
                        </button>

                        <button>
                          Share
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- OFFICIAL MEMBERS PREVIEW -->
              <div class="zone-section official-preview">
                <div class="section-heading">
                  <div>
                    <span class="eyebrow">ZONE STRUCTURE</span>
                    <h2>Official Members</h2>
                  </div>

                  <button
                    class="ghost-btn"
                    @click="setZoneTab('official')"
                  >
                    View structure ÔåÆ
                  </button>
                </div>

                <div class="official-preview-grid">
                  <div
                    v-for="member in selectedZone.officialMembers.slice(0, 3)"
                    :key="member.id"
                    class="official-mini"
                  >
                    <div class="avatar blue">
                      {{ member.avatar }}
                    </div>

                    <div>
                      <strong>{{ member.name }}</strong>
                      <span>{{ member.roleName }}</span>
                    </div>
                  </div>

                  <div
                    v-if="selectedZone.officialMembers.length === 0"
                    class="empty-state"
                  >
                    This Zone has not selected any Official Members yet.
                  </div>
                </div>
              </div>

            </template>

            <!-- GOALS TAB -->
            <template v-if="activeZoneTab === 'goals'">
              <div class="zone-section">
                <div class="section-heading">
                  <div>
                    <span class="eyebrow">ZONE DIRECTION</span>
                    <h2>Goals</h2>
                  </div>

                  <button class="ghost-btn">
                    + Add goal
                  </button>
                </div>

                <div class="goals-list">
                  <div
                    v-for="goal in selectedZone.goals"
                    :key="goal.id"
                    class="goal-card"
                  >
                    <div class="goal-top">
                      <div class="goal-symbol">Ô£ª</div>

                      <div>
                        <h3>{{ goal.title }}</h3>
                        <p>{{ goal.description }}</p>
                      </div>

                      <span
                        class="visibility"
                        :class="{ private: !goal.public }"
                      >
                        {{ goal.public ? 'PUBLIC' : 'PRIVATE' }}
                      </span>
                    </div>

                    <div class="goal-progress">
                      <div class="progress-label">
                        <span>Community progress</span>
                        <strong>{{ goal.progress }}%</strong>
                      </div>

                      <div class="progress">
                        <span :style="{ width: goal.progress + '%' }"></span>
                      </div>
                    </div>
                  </div>

                  <div
                    v-if="selectedZone.goals.length === 0"
                    class="empty-state"
                  >
                    No goals have been created in this Zone yet.
                  </div>
                </div>
              </div>
            </template>

            <!-- OFFICIAL MEMBERS TAB -->
            <template v-if="activeZoneTab === 'official'">

              <div class="official-header">
                <div>
                  <span class="eyebrow">ZONE STRUCTURE</span>
                  <h2>Official Members</h2>
                  <p>
                    Meet the members selected to hold responsibilities inside
                    this Zone, and take part in elections and structure decisions.
                  </p>
                </div>

                <button
                  class="primary-btn"
                  @click="showCreateRole = true"
                >
                  + Create role
                </button>
              </div>

              <div class="official-section">
                <div class="official-section-title">
                  <div>
                    <span class="eyebrow">MEMBER VOTE</span>
                    <h3>Open elections</h3>
                  </div>

                  <span class="live-indicator">
                    <i></i>
                    {{ selectedZone.elections.filter(election => election.status === 'Open').length }} open
                  </span>
                </div>

                <div
                  v-if="selectedZone.elections.length"
                  class="election-list"
                >
                  <div
                    v-for="election in selectedZone.elections"
                    :key="election.id"
                    class="election-card"
                  >
                    <div class="election-head">
                      <div>
                        <span class="election-label">ELECTION ┬À {{ election.roleName }}</span>
                        <h3>{{ election.question }}</h3>
                      </div>

                      <span
                        class="election-status"
                        :class="{ closed: election.status === 'Closed' }"
                      >
                        {{ election.status }}
                      </span>
                    </div>

                    <div class="candidate-list">
                      <div
                        v-for="candidate in election.candidates"
                        :key="candidate.id"
                        class="candidate-row"
                        :class="{ selected: candidate.voted }"
                      >
                        <div class="avatar purple">
                          {{ candidate.avatar }}
                        </div>

                        <div class="candidate-info">
                          <strong>{{ candidate.name }}</strong>
                          <span>{{ candidate.votes }} votes</span>
                        </div>

                        <div class="candidate-votes">
                          <div class="vote-bar">
                            <span
                              :style="{
                                width:
                                  Math.max(
                                    candidate.votes /
                                      Math.max(
                                        ...election.candidates.map(item => item.votes),
                                        1
                                      ) * 100,
                                    5
                                  ) + '%'
                              }"
                            ></span>
                          </div>

                          <button
                            class="vote-btn"
                            :class="{ voted: candidate.voted }"
                            :disabled="election.status === 'Closed'"
                            @click="voteElection(election, candidate)"
                          >
                            {{ candidate.voted ? 'Ô£ô Voted' : 'Vote' }}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div
                  v-else
                  class="empty-state"
                >
                  There are no elections open in this Zone right now.
                </div>
              </div>

              <div class="official-section">
                <div class="official-section-title">
                  <div>
                    <span class="eyebrow">SHAPE THE STRUCTURE</span>
                    <h3>Open decisions</h3>
                  </div>

                  <span class="structure-note">
                    Members help decide what the Zone needs.
                  </span>
                </div>

                <div
                  v-if="selectedZone.roleProposals.length"
                  class="proposal-list"
                >
                  <div
                    v-for="proposal in selectedZone.roleProposals"
                    :key="proposal.id"
                    class="proposal-card"
                  >
                    <div class="proposal-copy">
                      <span class="proposal-icon">+</span>
                      <div>
                        <strong>{{ proposal.title }}</strong>
                        <p>{{ proposal.description }}</p>
                      </div>
                    </div>

                    <div class="proposal-vote">
                      <div class="proposal-results">
                        <span>YES {{ proposal.yesVotes }}</span>
                        <span>NO {{ proposal.noVotes }}</span>
                      </div>

                      <div class="proposal-actions">
                        <button
                          class="decision-btn yes"
                          :class="{ chosen: proposal.voted }"
                          :disabled="proposal.voted"
                          @click="voteRoleProposal(proposal, 'yes')"
                        >
                          Yes
                        </button>

                        <button
                          class="decision-btn no"
                          :class="{ chosen: proposal.voted }"
                          :disabled="proposal.voted"
                          @click="voteRoleProposal(proposal, 'no')"
                        >
                          No
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div
                  v-else
                  class="empty-state"
                >
                  No structure decisions are currently open.
                </div>
              </div>

            </template>

            <!-- SUGGESTIONS TAB -->
            <template v-if="activeZoneTab === 'suggestions'">
              <div class="zone-section">
                <div class="section-heading">
                  <div>
                    <span class="eyebrow">COMMUNITY INPUT</span>
                    <h2>Suggestions</h2>
                  </div>

                  <button
                    class="primary-btn"
                    @click="showCreateSuggestion = true"
                  >
                    + Suggest
                  </button>
                </div>

                <div class="suggestion-list">
                  <div
                    v-for="suggestion in selectedZone.suggestions"
                    :key="suggestion.id"
                    class="suggestion-card"
                  >
                    <div class="suggestion-vote">
                      <button
                        :class="{ voted: suggestion.voted }"
                        @click="voteSuggestion(suggestion)"
                      >
                        Ôû▓
                      </button>
                      <strong>{{ suggestion.votes }}</strong>
                    </div>

                    <div class="suggestion-main">
                      <div class="suggestion-author">
                        <div class="avatar small purple">
                          {{ suggestion.avatar }}
                        </div>
                        <span>
                          <strong>{{ suggestion.author }}</strong>
                          proposed this
                        </span>
                        <span class="suggestion-status">
                          {{ suggestion.status }}
                        </span>
                      </div>

                      <p>{{ suggestion.text }}</p>

                      <div class="suggestion-actions">
                        <button>{{ suggestion.answers }} answers</button>
                        <button>Discuss</button>
                        <button>Share</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </template>

            <!-- MEMBERS TAB -->
            <template v-if="activeZoneTab === 'members'">
              <div class="zone-section">
                <div class="section-heading">
                  <div>
                    <span class="eyebrow">THE COMMUNITY</span>
                    <h2>Members</h2>
                  </div>

                  <span class="structure-count">
                    {{ selectedZone.members }} members
                  </span>
                </div>

                <div class="member-overview">
                  <div
                    v-for="person in people"
                    :key="person.id"
                    class="member-card"
                  >
                    <div class="avatar purple">
                      {{ person.avatar }}
                    </div>

                    <div>
                      <strong>{{ person.name }}</strong>
                      <span>{{ person.username }}</span>
                    </div>

                    <span
                      v-if="
                        selectedZone.officialMembers.some(
                          member => member.personId === person.id
                        )
                      "
                      class="member-role-badge"
                    >
                      Official Member
                    </span>
                  </div>
                </div>
              </div>
            </template>

            <!-- POSTS TAB -->
            <template v-if="activeZoneTab === 'posts'">
              <div class="zone-section">
                <div class="section-heading">
                  <div>
                    <span class="eyebrow">ZONE CONVERSATION</span>
                    <h2>Posts</h2>
                  </div>

                  <button
                    class="primary-btn"
                    @click="showCreatePost = true"
                  >
                    + Post
                  </button>
                </div>

                <div class="feed">
                  <article
                    v-for="post in filteredPosts.filter(
post => post.zone === selectedZone?.name                    )"
                    :key="post.id"
                    class="post-card"
                  >
                    <div class="post-head">
                      <div class="avatar blue">{{ post.avatar }}</div>

                      <div class="post-author">
                        <strong>{{ post.author }}</strong>
                        <span>
                          {{ post.handle }}
                          <i>ÔÇó</i>
                          {{ post.time }}
                        </span>
                      </div>
                    </div>

                    <p class="post-content">{{ post.content }}</p>

                    <div class="post-actions">
                      <button
                        :class="{ liked: post.liked }"
                        @click="likePost(post)"
                      >
                        ÔÖí {{ post.likes }}
                      </button>
                      <button>Ôùî {{ post.comments }}</button>
                      <button>Ôåù Share</button>
                    </div>
                  </article>

                  <div
                    v-if="
                      filteredPosts.filter(
post => post.zone === selectedZone?.name                      ).length === 0
                    "
                    class="empty-state"
                  >
                    No posts have been shared in this Zone yet.
                  </div>
                </div>
              </div>
            </template>

          </div>

          <!-- ZONE SIDEBAR -->
          <aside class="zone-side">

            <div v-if="activeZoneTab !== 'official'" class="side-card">

              <span class="eyebrow">
                PARTICIPATION
              </span>

              <h3>
                Your presence matters.
              </h3>

              <p>
                You don't need to solve everything.
                Start by observing, suggesting, answering or voting.
              </p>

              <div class="participation-steps">

                <div class="step active">
                  <span>01</span>
                  <div>
                    <strong>Observe</strong>
                    <small>Understand your zone</small>
                  </div>
                </div>

                <div class="step">
                  <span>02</span>
                  <div>
                    <strong>Suggest</strong>
                    <small>Bring an idea</small>
                  </div>
                </div>

                <div class="step">
                  <span>03</span>
                  <div>
                    <strong>Discuss</strong>
                    <small>Hear different views</small>
                  </div>
                </div>

                <div class="step">
                  <span>04</span>
                  <div>
                    <strong>Participate</strong>
                    <small>Help make it real</small>
                  </div>
                </div>

              </div>

            </div>

            <div v-else class="side-card zone-structure-side">

              <div class="structure-side-head">
                <div>
                  <span class="eyebrow">ZONE STRUCTURE</span>
                  <h3>Official Members</h3>
                </div>
                <span class="structure-live">ACTIVE</span>
              </div>

              <p>
                The people and roles responsible for organizing, coordinating
                and moving this Zone forward.
              </p>

              <div class="structure-side-stats">
                <div>
                  <strong>{{ selectedZone.officialRoles.length }}</strong>
                  <span>Roles</span>
                </div>
                <div>
                  <strong>{{ selectedZone.officialMembers.length }}</strong>
                  <span>Official Members</span>
                </div>
                <div>
                  <strong>{{ selectedZone.elections.filter(election => election.status === 'Open').length }}</strong>
                  <span>Open Elections</span>
                </div>
              </div>

              <div class="structure-side-roles">
                <div
                  v-for="role in selectedZone.officialRoles.slice(0, 4)"
                  :key="role.id"
                  class="structure-side-role"
                >
                  <span class="role-dot">Ôùê</span>
                  <div>
                    <strong>{{ role.name }}</strong>
                    <small>{{ role.elected ? 'Elected role' : 'Assigned role' }}</small>
                  </div>
                </div>

                <div
                  v-if="selectedZone.officialRoles.length === 0"
                  class="structure-side-empty"
                >
                  No official roles have been defined yet.
                </div>
              </div>

              <button
                class="structure-side-action"
                @click="setZoneTab('official')"
              >
                Manage Zone Structure ÔåÆ
              </button>

            </div>

            <div class="side-card">

              <span class="eyebrow">
                PUBLIC GOALS
              </span>

              <div
                v-for="goal in publicGoals"
                :key="goal.id"
                class="tiny-goal"
              >
                <div>
                  <strong>{{ goal.title }}</strong>
                  <span>{{ goal.progress }}%</span>
                </div>

                <div class="progress">
                  <span :style="{ width: goal.progress + '%' }"></span>
                </div>
              </div>

            </div>

          </aside>

        </div>

      </section>

    </main>

    <!-- CREATE POST MODAL -->
    <div
      v-if="showCreatePost"
      class="modal-backdrop"
      @click.self="showCreatePost = false"
    >

      <div class="modal">

        <div class="modal-header">
          <div>
            <span class="eyebrow">CREATE</span>
            <h2>Share something / Create zone</h2>
          </div>

          <button
            class="close"
            @click="showCreatePost = false"
          >
            ├ù
          </button>
        </div>

        <div class="composer-user">
          <div class="avatar blue">YO</div>

          <div>
            <strong>You</strong>
            <span>Public post</span>
          </div>
        </div>

        <textarea
          v-model="postText"
          placeholder="What are you thinking about, observing or discovering?"
          autofocus
        ></textarea>

        <div class="composer-options">
          <button>Ôùë Add zone</button>
          <button>Ôîü Add connection</button>
          <button>Ôûº Add media</button>
        </div>

        <button
          class="publish-btn"
          @click="createPost"
        >
          Publish post
        </button>

      </div>

    </div>

    <!-- CREATE ZONE MODAL -->
    <div
      v-if="showCreateZone"
      class="modal-backdrop"
      @click.self="showCreateZone = false"
    >

      <div class="modal">

        <div class="modal-header">
          <div>
            <span class="eyebrow">NEW COMMUNITY</span>
            <h2>Create a zone</h2>
          </div>

          <button
            class="close"
            @click="showCreateZone = false"
          >
            ├ù
          </button>
        </div>

        <p class="modal-intro">
          A zone is a place where people can organize around
          something they collectively care about.
        </p>

        <label>
          Zone name
          <input
            v-model="newZoneName"
            placeholder="Example: Tunis North"
          />
        </label>

        <label>
          Location
          <input
            v-model="newZoneLocation"
            placeholder="City, neighborhood or area"
          />
        </label>

        <label>
          What is this zone about?
          <textarea
            v-model="newZoneDescription"
            placeholder="Describe what people could care about together..."
          ></textarea>
        </label>

        <button
          class="publish-btn"
          @click="createZone"
        >
          Create zone
        </button>

      </div>

    </div>

    <!-- CREATE OFFICIAL ROLE MODAL -->
    <div
      v-if="showCreateRole"
      class="modal-backdrop"
      @click.self="showCreateRole = false"
    >
      <div class="modal">
        <div class="modal-header">
          <div>
            <span class="eyebrow">ZONE STRUCTURE</span>
            <h2>Create an official role</h2>
          </div>

          <button
            class="close"
            @click="showCreateRole = false"
          >
            ├ù
          </button>
        </div>

        <p class="modal-intro">
          Create a role that makes sense for this Zone. By default,
          new roles are elected by Zone members.
        </p>

        <label>
          Role name
          <input
            v-model="newRoleName"
            placeholder="Example: Vice President"
          />
        </label>

        <label>
          Responsibility
          <textarea
            v-model="newRoleDescription"
            placeholder="What should this Official Member be responsible for?"
          ></textarea>
        </label>

        <button
          class="publish-btn"
          @click="createOfficialRole"
        >
          Create role
        </button>
      </div>
    </div>

    <!-- CREATE SUGGESTION -->
    <div
      v-if="showCreateSuggestion"
      class="modal-backdrop"
      @click.self="showCreateSuggestion = false"
    >

      <div class="modal">

        <div class="modal-header">
          <div>
            <span class="eyebrow">ZONE INPUT</span>
            <h2>Make a suggestion</h2>
          </div>

          <button
            class="close"
            @click="showCreateSuggestion = false"
          >
            ├ù
          </button>
        </div>

        <p class="modal-intro">
          Put forward something the zone could discuss,
          improve or try.
        </p>

        <textarea
          v-model="suggestionText"
          placeholder="What should this zone consider?"
          autofocus
        ></textarea>

        <button
          class="publish-btn"
          @click="createSuggestion"
        >
          Publish suggestion
        </button>

      </div>

    </div>

  </div>
</template>

<style>
:root {
  font-family:
    Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont,
    "Segoe UI", sans-serif;

  color: #e9eef8;
  background: #070a11;

  font-synthesis: none;
  text-rendering: optimizeLegibility;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  min-width: 320px;
  background:
    radial-gradient(
      circle at 70% -10%,
      rgba(61, 91, 170, 0.14),
      transparent 35%
    ),
    #070a11;
}

button,
input,
textarea {
  font: inherit;
}

button {
  border: 0;
  cursor: pointer;
}

button:focus-visible,
input:focus-visible,
textarea:focus-visible {
  outline: 2px solid #60a5fa;
  outline-offset: 2px;
}

/* APP */

.app-shell {
  display: flex;
  min-height: 100vh;
  background:
    linear-gradient(
      90deg,
      rgba(255,255,255,.015),
      transparent 20%
    );
}

/* SIDEBAR */

.sidebar {
  width: 250px;
  flex-shrink: 0;
  border-right: 1px solid rgba(255,255,255,.07);
  background: rgba(8, 11, 18, .92);
  display: flex;
  flex-direction: column;
  padding: 25px 17px;
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  z-index: 20;
}

.brand {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 3px 9px 30px;
  cursor: pointer;
}

.brand strong {
  display: block;
  font-size: 16px;
  letter-spacing: .16em;
}

.brand small {
  display: block;
  margin-top: 3px;
  color: #697386;
  font-size: 8px;
  letter-spacing: .1em;
}

.brand-orbit {
  width: 34px;
  height: 34px;
  border: 1px solid #51678d;
  border-radius: 50%;
  position: relative;
}

.brand-orbit::before,
.brand-orbit::after {
  content: "";
  position: absolute;
  inset: 6px;
  border: 1px solid rgba(99, 143, 219, .55);
  border-radius: 50%;
}

.brand-orbit span {
  width: 7px;
  height: 7px;
  position: absolute;
  top: -3px;
  right: 4px;
  background: #67a4ff;
  border-radius: 50%;
  box-shadow: 0 0 12px rgba(103,164,255,.7);
}

.main-nav {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.main-nav button {
  display: flex;
  align-items: center;
  gap: 13px;
  padding: 11px 13px;
  border-radius: 9px;
  color: #858fa1;
  background: transparent;
  text-align: left;
  transition: .2s;
}

.main-nav button:hover {
  color: #e9eef8;
  background: rgba(255,255,255,.035);
}

.main-nav button.active {
  color: #f4f7fc;
  background: linear-gradient(
    90deg,
    rgba(72, 103, 163, .2),
    rgba(72, 103, 163, .05)
  );
}

.main-nav button.active .icon {
  color: #70a8ff;
}

.icon {
  width: 20px;
  text-align: center;
  font-size: 18px;
  color: #647085;
}

.sidebar-zone {
  border-top: 1px solid rgba(255,255,255,.06);
  margin-top: 27px;
  padding: 23px 8px;
}

.sidebar-label,
.eyebrow {
  font-size: 9px;
  letter-spacing: .17em;
  color: #657085;
  font-weight: 700;
}

.mini-zone {
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 10px 5px;
  color: #9ba5b6;
  font-size: 12px;
  cursor: pointer;
}

.mini-zone:hover {
  color: white;
}

.mini-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #56b4ff;
  box-shadow: 0 0 10px rgba(86,180,255,.45);
}

.create-zone-small {
  background: transparent;
  color: #6fa4e9;
  padding: 10px 5px;
  font-size: 12px;
}

.sidebar-bottom {
  margin-top: auto;
  border-top: 1px solid rgba(255,255,255,.06);
  padding-top: 17px;
}

.profile-mini {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 7px;
}

.profile-mini strong {
  display: block;
  font-size: 12px;
}

.profile-mini span {
  display: block;
  color: #697386;
  font-size: 10px;
  margin-top: 2px;
}

.dots {
  margin-left: auto;
}

/* MAIN */

.main {
  margin-left: 250px;
  width: calc(100% - 250px);
}

.topbar {
  height: 70px;
  border-bottom: 1px solid rgba(255,255,255,.07);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 38px;
  background: rgba(7,10,17,.78);
  backdrop-filter: blur(18px);
  position: sticky;
  top: 0;
  z-index: 15;
}

.search-box {
  width: min(500px, 48vw);
  height: 38px;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 11px;
  background: rgba(255,255,255,.035);
  border: 1px solid rgba(255,255,255,.07);
  border-radius: 8px;
  color: #657085;
}

.search-box input {
  flex: 1;
  border: 0;
  outline: 0;
  background: transparent;
  color: white;
  font-size: 12px;
}

.search-box kbd {
  border: 1px solid rgba(255,255,255,.09);
  border-radius: 4px;
  padding: 3px 6px;
  color: #697386;
  font-size: 9px;
}

.top-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.top-icon {
  width: 34px;
  height: 34px;
  background: transparent;
  color: #8993a5;
  border-radius: 8px;
}

.top-icon:hover {
  background: rgba(255,255,255,.05);
  color: white;
}

.primary-btn {
  padding: 9px 16px;
  border-radius: 7px;
  background: #4d78c7;
  color: white;
  font-size: 11px;
  font-weight: 700;
  box-shadow: 0 8px 25px rgba(77,120,199,.16);
}

.primary-btn:hover {
  background: #5a86d8;
}

.content {
  width: min(1280px, calc(100% - 70px));
  margin: 0 auto;
  padding: 43px 0 80px;
}

/* HERO */

/* =====================================================
   HOME HERO
   ===================================================== */

.hero-stage {
  position: relative;
  min-height: 330px;
  display: flex;
  align-items: center;
}

.hero {
  width: 100%;
  min-height: 290px;
  display: grid;
  grid-template-columns: minmax(0, 1.15fr) minmax(220px, 0.65fr);
  align-items: center;
  gap: 50px;
  padding: 42px 46px;
  border: 1px solid #1d2a3d;
  border-radius: 24px;
  background:
    radial-gradient(circle at 15% 45%, rgba(86,129,188,.10), transparent 28%),
    linear-gradient(135deg, rgba(10,16,26,.98), rgba(8,13,22,.92));
  overflow: hidden;
  box-shadow:
    0 20px 55px rgba(0,0,0,.18),
    inset 0 1px rgba(255,255,255,.025);
}

.hero-copy {
  position: relative;
  z-index: 2;
  max-width: 700px;
}

.hero-label {
  display: inline-block;
  margin-bottom: 22px;
  color: #536985;
  font-size: 8px;
  font-weight: 800;
  letter-spacing: .19em;
}

.hero h1 {
  margin: 0;
  max-width: 760px;
  font-size: clamp(44px, 5vw, 72px);
  line-height: .98;
  letter-spacing: -.065em;
  font-weight: 700;
}

.hero p {
  max-width: 590px;
  margin: 25px 0 0;
  color: #8795a9;
  font-size: 14px;
  line-height: 1.8;
}

.hero-accent-blue {
  color: #6ea7ff;
  text-shadow: 0 0 28px rgba(110,167,255,.14);
}

.hero-accent-gold {
  color: #d6a65e;
  text-shadow: 0 0 28px rgba(214,166,94,.14);
}

.hero-progress {
  position: absolute;
  left: 46px;
  bottom: 20px;
  z-index: 5;
  display: flex;
  gap: 6px;
}

.hero-progress button {
  width: 6px;
  height: 6px;
  padding: 0;
  border: 0;
  border-radius: 50%;
  background: #33445d;
  cursor: pointer;
  transition: width .25s ease, background .25s ease;
}

.hero-progress button.active {
  width: 20px;
  border-radius: 4px;
  background: #6d9fda;
}

.hero-orbit {
  position: relative;
  width: 230px;
  height: 230px;
  justify-self: center;
  display: grid;
  place-items: center;
  animation: hero-orbit-float 6s ease-in-out infinite;
}

.hero-orbit::before {
  content: "";
  position: absolute;
  inset: 20px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(84,139,211,.10), transparent 68%);
  filter: blur(5px);
}

.orbit-ring {
  position: absolute;
  border: 1px solid #304663;
  border-radius: 50%;
}

.ring-one {
  inset: 20px;
  transform: rotate(30deg) scaleY(.48);
  animation: orbit-spin 12s linear infinite;
}

.ring-two {
  inset: 20px;
  transform: rotate(-30deg) scaleY(.65);
  animation: orbit-spin-reverse 15s linear infinite;
}

.orbit-core {
  position: relative;
  z-index: 2;
  width: 86px;
  height: 86px;
  display: grid;
  place-items: center;
  border: 1px solid #577ba6;
  border-radius: 50%;
  background: radial-gradient(circle at 40% 35%, #253e5f, #111b2b);
  color: #dbe8f8;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: .12em;
  box-shadow:
    0 0 35px rgba(85,141,211,.14),
    inset 0 1px rgba(255,255,255,.06);
}

.orbit-node {
  position: absolute;
  width: 9px;
  height: 9px;
  border: 1px solid #7399c4;
  border-radius: 50%;
  background: #18263a;
  box-shadow: 0 0 14px rgba(110,167,255,.18);
}

.node-a { top: 18px; right: 58px; }
.node-b { right: 20px; bottom: 70px; }
.node-c { left: 24px; bottom: 45px; }

.hero-fade-enter-active,
.hero-fade-leave-active {
  transition: opacity .35s ease, transform .35s ease;
}

.hero-fade-enter-from {
  opacity: 0;
  transform: translateY(12px);
}

.hero-fade-leave-to {
  opacity: 0;
  transform: translateY(-12px);
}

@keyframes hero-orbit-float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-7px); }
}

@keyframes orbit-spin {
  from { transform: rotate(30deg) scaleY(.48); }
  to { transform: rotate(390deg) scaleY(.48); }
}

@keyframes orbit-spin-reverse {
  from { transform: rotate(-30deg) scaleY(.65); }
  to { transform: rotate(-390deg) scaleY(.65); }
}

/* ORIGINAL ICON FOR THE "WHAT IS HAPPENING AROUND YOU?" HERO */
.hero-orbit-original {
  width: 250px;
  height: 250px;
  margin-right: 50px;
  display: block;
  animation: none;
}

.hero-orbit-original::before {
  display: none;
}

.hero-orbit-original .orbit-ring {
  border-color: rgba(93,133,197,.2);
  animation: none;
}

.hero-orbit-original .ring-one {
  inset: 12px;
  transform: rotate(30deg) scaleY(.46);
}

.hero-orbit-original .ring-two {
  inset: 12px;
  transform: rotate(-30deg) scaleY(.46);
}

.hero-orbit-original .orbit-core {
  width: 80px;
  height: 80px;
  top: 85px;
  left: 85px;
  border-color: rgba(110,155,225,.45);
  background: radial-gradient(circle, #172741, #0a111e);
  color: #9db9e9;
  font-size: 25px;
  font-weight: 400;
  letter-spacing: normal;
  box-shadow: 0 0 50px rgba(70,118,196,.14);
}

.hero-orbit-original .orbit-node {
  width: 9px;
  height: 9px;
  border: 0;
  background: #72aaff;
  box-shadow: 0 0 14px rgba(114,170,255,.7);
}

.hero-orbit-original .node-a {
  top: 47px;
  left: 51px;
}

.hero-orbit-original .node-b {
  right: 42px;
  bottom: 56px;
  background: #a184f1;
}

.hero-orbit-original .node-c {
  top: 28px;
  right: 42px;
  background: #62c7bc;
}

.section-heading {
  margin: 38px 0 18px;
  display: flex;
  justify-content: space-between;
  align-items: end;
}

.section-heading h2 {
  margin: 6px 0 0;
  font-size: 20px;
  letter-spacing: -.02em;
}

.ghost-btn {
  background: transparent;
  color: #7991b7;
  font-size: 11px;
}

.ghost-btn:hover {
  color: white;
}

/* FEED */

.feed-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 330px;
  gap: 25px;
}

.feed {
  display: flex;
  flex-direction: column;
  gap: 13px;
}

.post-card {
  padding: 21px;
  border: 1px solid rgba(255,255,255,.065);
  background: rgba(255,255,255,.018);
  border-radius: 12px;
}

.post-card:hover {
  border-color: rgba(112,153,213,.16);
}

.post-head {
  display: flex;
  align-items: center;
  gap: 11px;
}

.avatar {
  width: 37px;
  height: 37px;
  border-radius: 9px;
  display: grid;
  place-items: center;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: .04em;
}

.avatar.blue {
  background: #183259;
  color: #82b1ff;
  border: 1px solid #294b7c;
}

.avatar.purple {
  background: #2b2048;
  color: #b7a1ff;
  border: 1px solid #4b3779;
}

.avatar.small {
  width: 28px;
  height: 28px;
  font-size: 8px;
}

.post-author strong {
  display: block;
  font-size: 12px;
}

.post-author span {
  display: block;
  margin-top: 3px;
  color: #697386;
  font-size: 10px;
}

.post-author i {
  margin: 0 4px;
  font-style: normal;
}

.more {
  margin-left: auto;
  background: transparent;
  color: #606b7d;
}

.post-content {
  margin: 19px 0 14px;
  color: #c1c9d7;
  font-size: 13px;
  line-height: 1.75;
}

.post-zone {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  border: 1px solid rgba(77,135,207,.2);
  background: rgba(77,135,207,.06);
  color: #74a4df;
  border-radius: 20px;
  padding: 5px 9px;
  font-size: 9px;
  cursor: pointer;
}

.post-actions {
  border-top: 1px solid rgba(255,255,255,.055);
  padding-top: 13px;
  margin-top: 16px;
  display: flex;
  gap: 21px;
}

.post-actions button {
  background: transparent;
  color: #687387;
  font-size: 10px;
}

.post-actions button:hover,
.post-actions .liked {
  color: #7ba9e9;
}

.post-actions .save {
  margin-left: auto;
}

/* SIDE */

.right-column {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.side-card {
  padding: 19px;
  border: 1px solid rgba(255,255,255,.065);
  background: rgba(255,255,255,.018);
  border-radius: 12px;
}

.card-heading {
  display: flex;
  justify-content: space-between;
  align-items: start;
  margin-bottom: 17px;
}

.card-heading h3 {
  margin: 6px 0 0;
  font-size: 14px;
}

.card-heading button {
  background: transparent;
  color: #687387;
}

.person-row {
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 11px 0;
  border-top: 1px solid rgba(255,255,255,.045);
}

.person-info {
  flex: 1;
  min-width: 0;
}

.person-info strong {
  display: block;
  font-size: 10px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.person-info span {
  display: block;
  color: #687387;
  font-size: 8px;
  line-height: 1.4;
  margin-top: 3px;
}

.follow-btn {
  padding: 6px 9px;
  border: 1px solid rgba(105,146,204,.28);
  background: rgba(70,105,165,.07);
  color: #78a3df;
  border-radius: 5px;
  font-size: 9px;
  white-space: nowrap;
}

.follow-btn.following {
  color: #788496;
  border-color: rgba(255,255,255,.08);
  background: transparent;
}

.view-all {
  width: 100%;
  border-top: 1px solid rgba(255,255,255,.05);
  padding-top: 14px;
  margin-top: 8px;
  background: transparent;
  color: #6e91c5;
  font-size: 10px;
}

.zone-stat-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  border-top: 1px solid rgba(255,255,255,.06);
  border-bottom: 1px solid rgba(255,255,255,.06);
  margin: 17px 0;
}

.zone-stat-grid div {
  padding: 15px 5px;
  text-align: center;
  border-right: 1px solid rgba(255,255,255,.05);
}

.zone-stat-grid div:last-child {
  border: 0;
}

.zone-stat-grid strong {
  display: block;
  font-size: 17px;
}

.zone-stat-grid span {
  display: block;
  margin-top: 4px;
  color: #667184;
  font-size: 8px;
}

.zone-open {
  width: 100%;
  background: transparent;
  color: #83a6d9;
  font-size: 10px;
}

/* TITLES */

.page-title {
  max-width: 750px;
  margin-bottom: 35px;
}

.page-title h1 {
  margin: 8px 0 12px;
  font-size: 40px;
  letter-spacing: -.04em;
}

.page-title p {
  color: #818c9e;
  font-size: 13px;
  line-height: 1.7;
}

/* DISCOVER */

.discover-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 15px;
}

.discover-card {
  min-height: 270px;
  padding: 31px;
  border: 1px solid rgba(255,255,255,.065);
  border-radius: 13px;
  background:
    radial-gradient(
      circle at 90% 10%,
      rgba(96,126,187,.1),
      transparent 35%
    ),
    rgba(255,255,255,.018);
}

.discover-card.large {
  grid-row: span 2;
  min-height: 555px;
  display: flex;
  flex-direction: column;
  justify-content: end;
}

.discover-number {
  color: #5e769c;
  font-size: 10px;
  letter-spacing: .1em;
}

.discover-card h2 {
  margin: 12px 0;
  max-width: 480px;
  font-size: 25px;
  letter-spacing: -.03em;
}

.discover-card p {
  max-width: 510px;
  color: #7d8798;
  font-size: 12px;
  line-height: 1.8;
}

.discover-card .primary-btn,
.discover-card .ghost-btn {
  align-self: flex-start;
  margin-top: 18px;
}

/* PEOPLE */

.people-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
}

.person-card {
  padding: 22px;
  border: 1px solid rgba(255,255,255,.065);
  border-radius: 12px;
  background: rgba(255,255,255,.018);
}

.person-card-top {
  display: flex;
  justify-content: space-between;
  align-items: start;
}

.large-avatar {
  width: 55px;
  height: 55px;
  border-radius: 14px;
  display: grid;
  place-items: center;
  font-size: 13px;
  font-weight: 800;
}

.connection-score {
  color: #65768f;
  font-size: 9px;
  border: 1px solid rgba(255,255,255,.07);
  padding: 5px 7px;
  border-radius: 5px;
}

.person-card h3 {
  margin: 20px 0 3px;
  font-size: 15px;
}

.username {
  color: #667184;
  font-size: 10px;
}

.connection-reason {
  display: flex;
  gap: 7px;
  margin: 18px 0;
  padding: 10px;
  background: rgba(80,117,176,.05);
  border-radius: 7px;
  color: #7f8da2;
  font-size: 9px;
  line-height: 1.5;
}

.connection-reason span {
  color: #7398ce;
}

.full-follow {
  width: 100%;
  padding: 9px;
  background: rgba(72,107,169,.1);
  border: 1px solid rgba(84,126,196,.2);
  color: #7da7e2;
  border-radius: 6px;
  font-size: 10px;
}

.full-follow.following {
  color: #778295;
  background: transparent;
  border-color: rgba(255,255,255,.08);
}

/* PAGES */

.page-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
}

.page-card {
  overflow: hidden;
  border: 1px solid rgba(255,255,255,.065);
  border-radius: 12px;
  background: rgba(255,255,255,.018);
}

.page-cover {
  height: 110px;
  display: flex;
  align-items: end;
  padding: 16px;
  position: relative;
}

.page-logo {
  width: 48px;
  height: 48px;
  background: rgba(8,11,18,.8);
  border: 1px solid rgba(255,255,255,.25);
  border-radius: 11px;
  display: grid;
  place-items: center;
  font-weight: 800;
  font-size: 11px;
  backdrop-filter: blur(10px);
}

.page-card-body {
  padding: 18px;
}

.page-category {
  color: #7287a7;
  font-size: 8px;
  text-transform: uppercase;
  letter-spacing: .13em;
}

.page-card h3 {
  margin: 7px 0 2px;
  font-size: 16px;
}

.page-card p {
  color: #7b8597;
  font-size: 11px;
  line-height: 1.65;
  min-height: 54px;
}

.page-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 13px;
  border-top: 1px solid rgba(255,255,255,.05);
}

.page-meta > span {
  color: #626e80;
  font-size: 9px;
}

/* ZONES */

.zones-header {
  display: flex;
  justify-content: space-between;
  align-items: start;
}

.zone-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 17px;
}

.zone-card {
  overflow: hidden;
  border: 1px solid rgba(255,255,255,.065);
  border-radius: 13px;
  background: rgba(255,255,255,.018);
  cursor: pointer;
  transition: .2s;
}

.zone-card:hover {
  transform: translateY(-2px);
  border-color: rgba(105,151,218,.25);
}

.zone-cover {
  height: 190px;
  background-position: center;
  background-size: cover;
  position: relative;
}

.zone-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to bottom,
    rgba(3,6,11,.05),
    rgba(3,6,11,.8)
  );
}

.zone-location,
.zone-members {
  position: absolute;
  z-index: 1;
  bottom: 12px;
  font-size: 9px;
}

.zone-location {
  left: 14px;
  color: #d3dceb;
}

.zone-members {
  right: 14px;
  color: #b4c0d2;
}

.zone-card-body {
  padding: 19px;
}

.zone-card h2 {
  margin: 0 0 8px;
  font-size: 18px;
}

.zone-card p {
  min-height: 62px;
  color: #7d8799;
  font-size: 10px;
  line-height: 1.65;
}

.zone-progress {
  margin-top: 17px;
}

.progress-label {
  display: flex;
  justify-content: space-between;
  margin-bottom: 7px;
  color: #667185;
  font-size: 8px;
}

.progress-label strong {
  color: #8ca5c9;
}

.progress {
  height: 4px;
  overflow: hidden;
  border-radius: 10px;
  background: rgba(255,255,255,.07);
}

.progress span {
  display: block;
  height: 100%;
  background: #638fc9;
  border-radius: inherit;
}

.zone-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 17px;
  padding-top: 14px;
  border-top: 1px solid rgba(255,255,255,.05);
}

.zone-footer span {
  color: #687386;
  font-size: 9px;
}

.zone-footer button {
  padding: 7px 10px;
  border-radius: 5px;
  background: rgba(73,111,176,.1);
  border: 1px solid rgba(82,127,200,.2);
  color: #7da7df;
  font-size: 9px;
}

.zone-footer button.joined {
  color: #78879b;
  background: transparent;
}

/* ZONE DETAIL */

.back-btn {
  background: transparent;
  color: #74839b;
  font-size: 10px;
  margin-bottom: 18px;
}

.zone-hero {
  min-height: 360px;
  border-radius: 14px;
  background-size: cover;
  background-position: center;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: end;
  padding: 36px;
}

.zone-hero-overlay {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(
      90deg,
      rgba(4,7,12,.94) 0%,
      rgba(4,7,12,.72) 50%,
      rgba(4,7,12,.2) 100%
    ),
    linear-gradient(
      0deg,
      rgba(4,7,12,.8),
      transparent
    );
}

.zone-hero-content {
  position: relative;
  z-index: 1;
  max-width: 670px;
}

.zone-hero h1 {
  margin: 9px 0 4px;
  font-size: 45px;
  letter-spacing: -.045em;
}

.zone-hero-content > p {
  color: #a6b1c2;
  font-size: 11px;
}

.zone-description {
  max-width: 590px;
  line-height: 1.7;
}

.participate-large {
  margin-top: 14px;
  padding: 11px 16px;
  border-radius: 7px;
  background: #567fc7;
  color: white;
  font-size: 10px;
  font-weight: 700;
}

.participate-large.joined {
  background: rgba(255,255,255,.09);
  border: 1px solid rgba(255,255,255,.12);
}

.zone-hero-stats {
  position: absolute;
  right: 28px;
  bottom: 28px;
  z-index: 2;
  display: flex;
  background: rgba(5,8,13,.72);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255,255,255,.1);
  border-radius: 8px;
}

.zone-hero-stats div {
  min-width: 85px;
  text-align: center;
  padding: 12px;
  border-right: 1px solid rgba(255,255,255,.07);
}

.zone-hero-stats div:last-child {
  border: 0;
}

.zone-hero-stats strong {
  display: block;
  font-size: 16px;
}

.zone-hero-stats span {
  display: block;
  color: #687487;
  font-size: 8px;
  margin-top: 3px;
}

.zone-tabs {
  display: flex;
  gap: 3px;
  padding: 13px 0;
  border-bottom: 1px solid rgba(255,255,255,.06);
}

.zone-tabs button {
  background: transparent;
  padding: 8px 12px;
  color: #6f7c90;
  font-size: 10px;
  border-radius: 5px;
}

.zone-tabs button.active,
.zone-tabs button:hover {
  background: rgba(255,255,255,.045);
  color: #d4dce9;
}

.zone-columns {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 320px;
  gap: 24px;
  margin-top: 28px;
}

.zone-section {
  margin-bottom: 38px;
}

.zone-section .section-heading {
  margin: 0 0 15px;
}

.goals-list,
.suggestion-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.goal-card,
.suggestion-card {
  border: 1px solid rgba(255,255,255,.065);
  background: rgba(255,255,255,.018);
  border-radius: 10px;
}

.goal-card {
  padding: 18px;
}

.goal-top {
  display: flex;
  gap: 13px;
  align-items: start;
}

.goal-symbol {
  width: 35px;
  height: 35px;
  display: grid;
  place-items: center;
  border-radius: 8px;
  color: #86a9dc;
  background: rgba(73,112,174,.1);
}

.goal-top h3 {
  margin: 1px 0 4px;
  font-size: 12px;
}

.goal-top p {
  margin: 0;
  color: #717d90;
  font-size: 9px;
  line-height: 1.55;
}

.visibility {
  margin-left: auto;
  padding: 4px 6px;
  border: 1px solid rgba(94,150,219,.2);
  border-radius: 4px;
  color: #709bd5;
  font-size: 7px;
}

.visibility.private {
  border-color: rgba(176,140,90,.2);
  color: #ad936d;
}

.goal-progress {
  margin: 19px 0 0 48px;
}

.suggestion-card {
  display: flex;
  padding: 17px;
  gap: 15px;
}

.suggestion-vote {
  width: 45px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  flex-direction: column;
  gap: 5px;
}

.suggestion-vote button {
  background: transparent;
  color: #697588;
  font-size: 15px;
}

.suggestion-vote button.voted {
  color: #6fa4e5;
}

.suggestion-vote strong {
  font-size: 11px;
  color: #8998ad;
}

.suggestion-main {
  flex: 1;
}

.suggestion-author {
  display: flex;
  align-items: center;
  gap: 7px;
  color: #687386;
  font-size: 8px;
}

.suggestion-author strong {
  color: #aab5c6;
}

.suggestion-status {
  margin-left: auto;
  color: #6e9bcf;
  border: 1px solid rgba(87,138,207,.18);
  padding: 3px 5px;
  border-radius: 4px;
}

.suggestion-main > p {
  color: #b6c0cf;
  font-size: 11px;
  line-height: 1.7;
  margin: 12px 0;
}

.suggestion-actions {
  display: flex;
  gap: 15px;
}

.suggestion-actions button {
  background: transparent;
  color: #687588;
  font-size: 8px;
}

/* ZONE SIDE */

.zone-side {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.zone-side h3 {
  font-size: 16px;
  margin: 10px 0;
}

.zone-side > .side-card > p {
  color: #758196;
  font-size: 10px;
  line-height: 1.7;
}

.participation-steps {
  margin-top: 18px;
}

.step {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 11px 0;
  border-top: 1px solid rgba(255,255,255,.05);
}

.step > span {
  width: 25px;
  color: #52647e;
  font-size: 8px;
}

.step strong {
  display: block;
  font-size: 9px;
}

.step small {
  display: block;
  margin-top: 3px;
  color: #626e80;
  font-size: 8px;
}

.step.active > span {
  color: #73a4df;
}

.tiny-goal {
  padding: 13px 0;
  border-top: 1px solid rgba(255,255,255,.05);
}

.tiny-goal > div:first-child {
  display: flex;
  justify-content: space-between;
  margin-bottom: 7px;
}

.tiny-goal strong {
  font-size: 9px;
  font-weight: 500;
}

.tiny-goal span {
  color: #7894b9;
  font-size: 8px;
}

/* OFFICIAL MEMBERS */

.official-preview {
  margin-top: 4px;
}

.official-preview-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

.official-mini {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 13px;
  border: 1px solid rgba(255,255,255,.065);
  border-radius: 9px;
  background: rgba(255,255,255,.018);
}

.official-mini strong,
.official-mini span {
  display: block;
}

.official-mini strong {
  font-size: 10px;
}

.official-mini span {
  margin-top: 4px;
  color: #718096;
  font-size: 8px;
}

.official-header {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 28px;
}

.official-header h2 {
  margin: 7px 0 8px;
  font-size: 25px;
  letter-spacing: -.025em;
}

.official-header p {
  max-width: 680px;
  margin: 0;
  color: #7e899b;
  font-size: 11px;
  line-height: 1.75;
}

.official-section {
  margin-bottom: 34px;
}

.official-section-title {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 14px;
}

.official-section-title h3 {
  margin: 6px 0 0;
  font-size: 16px;
}

.structure-count,
.structure-note {
  color: #687589;
  font-size: 8px;
}

.roles-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 11px;
}

.role-card {
  padding: 17px;
  border: 1px solid rgba(255,255,255,.065);
  border-radius: 10px;
  background:
    radial-gradient(circle at 100% 0, rgba(78,116,181,.08), transparent 40%),
    rgba(255,255,255,.018);
}

.role-card-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.role-symbol {
  width: 31px;
  height: 31px;
  display: grid;
  place-items: center;
  border: 1px solid rgba(96,139,207,.2);
  border-radius: 8px;
  color: #82a8dc;
  background: rgba(70,108,170,.08);
}

.role-type,
.election-status {
  padding: 4px 6px;
  border: 1px solid rgba(95,145,215,.18);
  border-radius: 4px;
  color: #7399cd;
  font-size: 7px;
  letter-spacing: .08em;
}

.role-type.appointed {
  color: #ad936d;
  border-color: rgba(173,147,109,.2);
}

.role-card h3 {
  margin: 15px 0 5px;
  font-size: 14px;
}

.role-card > p {
  min-height: 42px;
  margin: 0;
  color: #727e91;
  font-size: 9px;
  line-height: 1.65;
}

.role-holder {
  min-height: 48px;
  display: flex;
  align-items: center;
  gap: 9px;
  margin-top: 15px;
  padding-top: 13px;
  border-top: 1px solid rgba(255,255,255,.05);
}

.role-holder strong,
.role-holder span {
  display: block;
}

.role-holder strong {
  font-size: 9px;
}

.role-holder span {
  margin-top: 3px;
  color: #687588;
  font-size: 8px;
  line-height: 1.4;
}

.open-role {
  display: flex;
  align-items: center;
  gap: 9px;
}

.open-role > span {
  width: 28px;
  height: 28px;
  display: grid;
  place-items: center;
  border: 1px dashed rgba(115,153,201,.25);
  border-radius: 50%;
  color: #6d8db7;
  font-size: 12px;
}

.election-list {
  display: flex;
  flex-direction: column;
  gap: 11px;
}

.election-card {
  padding: 18px;
  border: 1px solid rgba(255,255,255,.065);
  border-radius: 10px;
  background: rgba(255,255,255,.018);
}

.election-head {
  display: flex;
  align-items: start;
  justify-content: space-between;
  gap: 15px;
  margin-bottom: 16px;
}

.election-label {
  color: #6684ad;
  font-size: 7px;
  letter-spacing: .13em;
}

.election-head h3 {
  margin: 6px 0 0;
  font-size: 13px;
}

.election-status {
  color: #73a5dc;
  white-space: nowrap;
}

.election-status.closed {
  color: #6d7685;
  border-color: rgba(255,255,255,.07);
}

.candidate-list {
  border-top: 1px solid rgba(255,255,255,.05);
}

.candidate-row {
  display: grid;
  grid-template-columns: auto minmax(120px, 1fr) minmax(220px, 1.4fr);
  align-items: center;
  gap: 11px;
  padding: 11px 0;
  border-bottom: 1px solid rgba(255,255,255,.045);
}

.candidate-row:last-child {
  border-bottom: 0;
}

.candidate-row.selected {
  background: rgba(78,123,190,.045);
}

.candidate-info strong,
.candidate-info span {
  display: block;
}

.candidate-info strong {
  font-size: 10px;
}

.candidate-info span {
  margin-top: 3px;
  color: #697588;
  font-size: 8px;
}

.candidate-votes {
  display: flex;
  align-items: center;
  gap: 10px;
}

.vote-bar {
  flex: 1;
  height: 4px;
  overflow: hidden;
  border-radius: 8px;
  background: rgba(255,255,255,.06);
}

.vote-bar span {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: #648fca;
}

.vote-btn {
  min-width: 61px;
  padding: 7px 9px;
  border: 1px solid rgba(91,139,208,.2);
  border-radius: 5px;
  background: rgba(70,110,175,.07);
  color: #78a4dd;
  font-size: 8px;
}

.vote-btn:hover {
  background: rgba(76,120,193,.13);
}

.vote-btn.voted {
  color: #d5dfed;
  border-color: rgba(111,158,218,.34);
  background: rgba(87,131,199,.14);
}

.vote-btn:disabled {
  cursor: not-allowed;
  opacity: .55;
}

.live-indicator {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #7196c3;
  font-size: 8px;
}

.live-indicator i {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #62b6a7;
  box-shadow: 0 0 8px rgba(98,182,167,.4);
}

.proposal-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.proposal-card {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 20px;
  align-items: center;
  padding: 16px;
  border: 1px solid rgba(255,255,255,.065);
  border-radius: 10px;
  background: rgba(255,255,255,.018);
}

.proposal-copy {
  display: flex;
  align-items: start;
  gap: 11px;
}

.proposal-icon {
  width: 30px;
  height: 30px;
  flex-shrink: 0;
  display: grid;
  place-items: center;
  border: 1px solid rgba(96,139,207,.2);
  border-radius: 8px;
  color: #83a8d8;
}

.proposal-copy strong {
  display: block;
  font-size: 10px;
}

.proposal-copy p {
  margin: 5px 0 0;
  color: #727f92;
  font-size: 8px;
  line-height: 1.55;
}

.proposal-vote {
  min-width: 180px;
}

.proposal-results {
  display: flex;
  justify-content: space-between;
  margin-bottom: 7px;
  color: #687588;
  font-size: 7px;
}

.proposal-actions {
  display: flex;
  gap: 6px;
}

.decision-btn {
  flex: 1;
  padding: 7px 12px;
  border: 1px solid rgba(255,255,255,.08);
  border-radius: 5px;
  background: transparent;
  color: #7d899b;
  font-size: 8px;
}

.decision-btn.yes:hover,
.decision-btn.yes.chosen {
  color: #83b9ad;
  border-color: rgba(88,169,151,.25);
  background: rgba(71,142,126,.07);
}

.decision-btn.no:hover,
.decision-btn.no.chosen {
  color: #b19a7d;
  border-color: rgba(175,145,102,.2);
  background: rgba(159,125,79,.06);
}

.decision-btn:disabled {
  cursor: not-allowed;
  opacity: .7;
}

.member-overview {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 9px;
}

.member-card {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 13px;
  border: 1px solid rgba(255,255,255,.065);
  border-radius: 9px;
  background: rgba(255,255,255,.018);
}

.member-card > div:nth-child(2) {
  flex: 1;
}

.member-card strong,
.member-card span {
  display: block;
}

.member-card strong {
  font-size: 10px;
}

.member-card > div:nth-child(2) span {
  margin-top: 3px;
  color: #697588;
  font-size: 8px;
}

.member-role-badge {
  padding: 4px 6px;
  border: 1px solid rgba(91,139,208,.18);
  border-radius: 4px;
  color: #7699c5;
  font-size: 7px;
}

.empty-state {
  padding: 22px;
  border: 1px dashed rgba(255,255,255,.08);
  border-radius: 9px;
  color: #6f7b8e;
  background: rgba(255,255,255,.012);
  font-size: 9px;
  line-height: 1.6;
}

.large-empty {
  min-height: 140px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
}

.large-empty strong {
  color: #9aa7ba;
  font-size: 11px;
}

.large-empty span {
  margin-top: 5px;
  color: #687588;
  font-size: 8px;
}

/* MODALS */

.modal-backdrop {
  position: fixed;
  z-index: 100;
  inset: 0;
  background: rgba(1,3,7,.78);
  backdrop-filter: blur(9px);
  display: grid;
  place-items: center;
  padding: 20px;
}

.modal {
  width: min(560px, 100%);
  padding: 27px;
  border: 1px solid rgba(255,255,255,.1);
  border-radius: 14px;
  background:
    radial-gradient(
      circle at 90% 0,
      rgba(76,117,184,.1),
      transparent 35%
    ),
    #0c111b;
  box-shadow: 0 30px 100px rgba(0,0,0,.5);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: start;
  margin-bottom: 23px;
}

.modal-header h2 {
  margin: 7px 0 0;
  font-size: 23px;
}

.close {
  background: transparent;
  color: #6e798c;
  font-size: 24px;
}

.modal-intro {
  color: #798599;
  font-size: 11px;
  line-height: 1.7;
}

.composer-user {
  display: flex;
  gap: 10px;
  align-items: center;
  margin-bottom: 16px;
}

.composer-user strong,
.composer-user span {
  display: block;
}

.composer-user strong {
  font-size: 11px;
}

.composer-user span {
  margin-top: 3px;
  color: #697588;
  font-size: 9px;
}

.modal textarea {
  width: 100%;
  min-height: 145px;
  resize: vertical;
  padding: 14px;
  color: #dce4f0;
  background: rgba(0,0,0,.2);
  border: 1px solid rgba(255,255,255,.08);
  border-radius: 8px;
  outline: 0;
  font-size: 12px;
  line-height: 1.7;
}

.modal textarea:focus,
.modal input:focus {
  border-color: rgba(101,151,224,.45);
}

.composer-options {
  display: flex;
  gap: 7px;
  margin: 11px 0 18px;
}

.composer-options button {
  padding: 7px 9px;
  border: 1px solid rgba(255,255,255,.07);
  background: transparent;
  color: #697589;
  border-radius: 5px;
  font-size: 8px;
}

.publish-btn {
  width: 100%;
  padding: 11px;
  border-radius: 7px;
  background: #527fcf;
  color: white;
  font-size: 10px;
  font-weight: 700;
}

.modal label {
  display: block;
  margin-top: 17px;
  color: #8995a8;
  font-size: 9px;
}

.modal input {
  width: 100%;
  margin-top: 7px;
  padding: 11px;
  background: rgba(0,0,0,.2);
  border: 1px solid rgba(255,255,255,.08);
  border-radius: 7px;
  color: white;
  outline: 0;
  font-size: 11px;
}

.modal label textarea {
  margin-top: 7px;
  min-height: 100px;
}

/* MOBILE */

.mobile-brand {
  display: none;
}

@media (max-width: 1100px) {

  .feed-layout,
  .zone-columns {
    grid-template-columns: 1fr;
  }

  .right-column,
  .zone-side {
    display: grid;
    grid-template-columns: 1fr 1fr;
  }

  .zone-grid,
  .page-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .roles-grid,
  .official-preview-grid {
    grid-template-columns: 1fr 1fr;
  }

  .candidate-row {
    grid-template-columns: auto 1fr;
  }

  .candidate-votes {
    grid-column: 2;
  }

  .member-overview {
    grid-template-columns: 1fr;
  }

  .people-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .hero-orbit {
    margin-right: 0;
  }
}

@media (max-width: 760px) {

  .sidebar {
    display: none;
  }

  .main {
    margin-left: 0;
    width: 100%;
  }

  .topbar {
    padding: 0 16px;
  }

  .mobile-brand {
    display: block;
    font-size: 12px;
    font-weight: 800;
    letter-spacing: .15em;
  }

  .search-box {
    width: 35%;
  }

  .search-box kbd {
    display: none;
  }

  .content {
    width: calc(100% - 30px);
    padding-top: 25px;
  }

  .hero {
    padding: 25px;
    min-height: 300px;
  }

  .hero-orbit {
    display: none;
  }

  .hero h1 {
    font-size: 37px;
  }

  .right-column,
  .zone-side,
  .zone-grid,
  .page-grid,
  .people-grid,
  .discover-grid,
  .roles-grid,
  .official-preview-grid {
    grid-template-columns: 1fr;
  }

  .official-header {
    display: block;
  }

  .official-header .primary-btn {
    margin-top: 16px;
  }

  .proposal-card {
    grid-template-columns: 1fr;
  }

  .proposal-vote {
    min-width: 0;
  }

  .candidate-row {
    grid-template-columns: auto 1fr;
  }

  .candidate-votes {
    grid-column: 1 / -1;
  }

  .discover-card.large {
    min-height: 350px;
    grid-row: auto;
  }

  .zones-header {
    display: block;
  }

  .zones-header .primary-btn {
    margin-bottom: 20px;
  }

  .zone-hero {
    min-height: 470px;
    padding: 24px;
    align-items: end;
  }

  .zone-hero h1 {
    font-size: 36px;
  }

  .zone-hero-stats {
    left: 20px;
    right: 20px;
    bottom: 20px;
  }

  .zone-hero-content {
    padding-bottom: 100px;
  }

  .zone-tabs {
    overflow-x: auto;
  }

  .zone-tabs button {
    white-space: nowrap;
  }

  .top-actions .top-icon {
    display: none;
  }

  .top-actions .primary-btn {
    padding: 8px 10px;
  }

  .page-title h1 {
    font-size: 32px;
  }
}


/* OFFICIAL MEMBERS ÔÇö ZONE STRUCTURE SIDEBAR */
.zone-structure-side {
  position: relative;
  overflow: hidden;
}

.zone-structure-side::before {
  content: '';
  position: absolute;
  inset: 0 0 auto 0;
  height: 2px;
  background: linear-gradient(90deg, #3a79c8, #7239d6, #38bdf8);
  opacity: .9;
}

.structure-side-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.structure-side-head h3 {
  margin: 5px 0 0;
}

.structure-live {
  padding: 5px 8px;
  border: 1px solid rgba(74, 222, 128, .22);
  border-radius: 999px;
  color: #86efac;
  background: rgba(74, 222, 128, .07);
  font-size: 9px;
  font-weight: 800;
  letter-spacing: .12em;
}

.structure-side-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 7px;
  margin: 18px 0;
}

.structure-side-stats > div {
  padding: 10px 7px;
  border: 1px solid var(--border);
  border-radius: 10px;
  background: rgba(255, 255, 255, .025);
  text-align: center;
}

.structure-side-stats strong {
  display: block;
  font-size: 17px;
  line-height: 1;
}

.structure-side-stats span {
  display: block;
  margin-top: 6px;
  color: var(--muted);
  font-size: 8px;
  line-height: 1.25;
}

.structure-side-roles {
  display: grid;
  gap: 7px;
  margin-bottom: 15px;
}

.structure-side-role {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 10px;
  border: 1px solid var(--border);
  border-radius: 10px;
  background: rgba(255, 255, 255, .018);
}

.role-dot {
  width: 28px;
  height: 28px;
  display: grid;
  place-items: center;
  flex: 0 0 28px;
  border-radius: 8px;
  background: rgba(58, 121, 200, .12);
  color: #8ec5ff;
}

.structure-side-role strong,
.structure-side-role small {
  display: block;
}

.structure-side-role strong {
  font-size: 11px;
}

.structure-side-role small {
  margin-top: 2px;
  color: var(--muted);
  font-size: 9px;
}

.structure-side-empty {
  padding: 12px;
  border: 1px dashed var(--border);
  border-radius: 10px;
  color: var(--muted);
  font-size: 10px;
  line-height: 1.5;
}

.structure-side-action {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid rgba(114, 57, 214, .3);
  border-radius: 10px;
  background: rgba(114, 57, 214, .09);
  color: #d8c5ff;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: .02em;
  cursor: pointer;
  transition: .2s ease;
}

.structure-side-action:hover {
  border-color: rgba(114, 57, 214, .55);
  background: rgba(114, 57, 214, .15);
}

@media (max-width: 900px) {
  .hero {
    grid-template-columns: minmax(0, 1fr) 190px;
    gap: 20px;
    padding: 34px 30px;
  }

  .hero h1 {
    font-size: clamp(38px, 7vw, 58px);
  }

  .hero-orbit {
    width: 180px;
    height: 180px;
  }

  .orbit-core {
    width: 70px;
    height: 70px;
  }

  .ring-one,
  .ring-two {
    inset: 15px;
  }
}

@media (max-width: 650px) {
  .hero-stage {
    min-height: 430px;
  }

  .hero {
    grid-template-columns: 1fr;
    min-height: 390px;
    padding: 30px 24px 48px;
  }

  .hero-copy {
    max-width: none;
  }

  .hero h1 {
    font-size: clamp(38px, 11vw, 54px);
  }

  .hero p {
    font-size: 13px;
  }

  .hero-orbit {
    position: absolute;
    right: 5px;
    bottom: 4px;
    width: 145px;
    height: 145px;
    opacity: .65;
  }

  .orbit-core {
    width: 58px;
    height: 58px;
    font-size: 8px;
  }

  .hero-progress {
    left: 24px;
    bottom: 18px;
  }
}

</style>
