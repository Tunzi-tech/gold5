<script setup lang="ts">
import { computed, nextTick, onMounted, onBeforeUnmount, ref } from 'vue'

type Page = {
  id: number
  name: string
  handle: string
  description: string
  followers: string
  avatar: string
  color: string
  connected: boolean
  category: string
  isMyNetwork?: boolean
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

type Entity = {
  id: number
  name: string
  type: 'PLACE' | 'BUSINESS' | 'ORGANIZATION' | 'SERVICE' | 'LANDMARK' | 'INITIATIVE'
  description: string
  location: string
  zoneNames: string[]
  relatedPages: string[]
  relatedCalls: string[]
  identified: boolean
  reviews: number
  rating: number
  myReview: string
}


/* =====================================================
   UI STATE
   ===================================================== */

const activeView = ref('home')
const showZonesSubnav = ref(true)
const showCallsSubnav = ref(true)
const sidebarSpace = ref<'zones' | 'networks' | 'connections'>('networks')
const showAccountMenu = ref(false)
const showWhatsGoingOn = ref(false)
const liveEngagement = ref<'people' | 'action' | 'flow' | null>(null)
const selectedZone = ref<Zone | null>(null)
const selectedCall = ref<CommunityCall | null>(null)
const selectedPage = ref<Page | null>(null)
const selectedPerson = ref<any | null>(null)
const selectedEntity = ref<Entity | null>(null)
const showCreateEntity = ref(false)
const entityReviewText = ref('')
const newEntityName = ref('')
const newEntityType = ref<Entity['type']>('PLACE')
const newEntityDescription = ref('')
const newEntityLocation = ref('')
const newEntityZone = ref('')
const showCreatePost = ref(false)
const showCreateZone = ref(false)
const showCreateSuggestion = ref(false)
const showCreateRole = ref(false)
const showCreateChoice = ref(false)
const createType = ref<'page' | 'call'>('page')
const newPageName = ref('')
const newPageHandle = ref('')
const newPageCategory = ref('Community')
const newPageDescription = ref('')
const newCallTitle = ref('')
const newCallMessage = ref('')
const newCallLocation = ref('')
const activeZoneTab = ref('overview')
const search = ref('')
const postText = ref('')

const participatingEvents = ref([
  {
    id: 1,
    title: 'Future Streets',
    type: 'Community Call',
    date: 'Today · 18:30',
    location: 'Ariana',
    status: 'Participating'
  },
  {
    id: 2,
    title: 'Water Between Us',
    type: 'Local Call',
    date: 'Tomorrow · 17:00',
    location: 'Tunis',
    status: 'Participating'
  },
  {
    id: 3,
    title: 'A Place for Everyone',
    type: 'Community Call',
    date: 'Saturday · 15:00',
    location: 'Tunis North',
    status: 'Participating'
  }
])
const administrationUnlocked = ref(false)
const administrationPassword = ref('')
const administrationPasswordError = ref(false)
const selectedAdminElement = ref<string | null>(null)

type AdminElement = {
  id: string
  name: string
  category: string
  description: string
  connections: string[]
  missing: string[]
}

const selectedAdminSystem = ref<string | null>(null)

const systemDesignUnlocked = ref(false)
const systemDesignPassword = ref('')
const systemDesignPasswordError = ref(false)
const selectedDesignSystem = ref<string | null>('calls-system')
const designMode = ref<'systems' | 'elements' | 'relationships' | 'processes' | 'events'>('systems')
const designSearch = ref('')
const newDesignSystemName = ref('')
const newDesignSystemPurpose = ref('')
const draggedDesignNode = ref<{ kind: 'element' | 'relationship' | 'process' | 'event'; id: string } | null>(null)

type DesignCatalogItem = {
  id: string
  name: string
  category: string
  description: string
}

type SystemDesignItem = {
  instanceId: string
  kind: 'element' | 'relationship' | 'process' | 'event'
  catalogId: string
}

const designElements = ref<DesignCatalogItem[]>([

  { id:'official-role', name:'Official Role', category:'GOVERNANCE', description:'A formal Zone role with defined responsibilities.' },
  { id:'official-member', name:'Official Member', category:'GOVERNANCE', description:'A person assigned to a formal Zone role.' },
  { id:'election-candidate', name:'Election Candidate', category:'GOVERNANCE', description:'A candidate record inside an Election.' },
  { id:'answer', name:'Answer', category:'CONTENT', description:'A direct response to a question, suggestion or discussion.' },
  { id:'question', name:'Question', category:'CONTENT', description:'A question used to start discussion, discovery or a Call.' },
  { id:'idea', name:'Idea', category:'ACTION', description:'A proposed thought that can become a Suggestion, Goal or action.' },
  { id:'possibility', name:'Possibility', category:'ACTION', description:'A future direction or outcome that people can explore.' },
  { id:'mission', name:'Mission', category:'ACTION', description:'A defined challenge or journey that people can undertake together.' },
  { id:'raid', name:'Raid / Collaboration', category:'ACTION', description:'A focused collaboration activity around a shared challenge.' },
  { id:'inspiration', name:'Inspiration', category:'DISCOVERY', description:'A new possibility discovered through activity or experience.' },
  { id:'page-category', name:'Page Category', category:'CONTENT', description:'The category used to organize a Page.' },
  { id:'call-category', name:'Call Category', category:'CALL', description:'The category used to organize a Call.' },
  { id:'call-interaction', name:'Call Interaction', category:'CALL', description:'An interaction or contribution inside a Call.' },
  { id:'place-review', name:'Place Review', category:'ENTITY', description:'A review specifically attached to a Place or local Entity.' },
  { id:'location', name:'Location', category:'GEOGRAPHY', description:'A geographic location attached to a Call, Zone, Event or Entity.' },
  { id:'member', name:'Member', category:'MEMBERSHIP', description:'A membership record connecting a person to a community, Zone or group.' },
  { id:'organizer-permission', name:'Organizer Permission', category:'PERMISSION', description:'Permission allowing a person to manage a Call or Event.' },
  { id:'user-account', name:'User Account', category:'IDENTITY', description:'The account and access identity of a person on the platform.' },
  { id:'person', name:'Person', category:'IDENTITY', description:'A human participant in the Commons.' },
  { id:'profile', name:'Profile', category:'IDENTITY', description:'The public or personal representation of a Person.' },
  { id:'role', name:'Role', category:'IDENTITY', description:'A defined responsibility or position a person can hold.' },
  { id:'permission', name:'Permission', category:'IDENTITY', description:'A rule defining what a person, role or system can do.' },
  { id:'follow', name:'Follow', category:'CONNECTION', description:'A directional connection from one person to another person, Page or entity.' },
  { id:'connection', name:'Connection', category:'CONNECTION', description:'A meaningful relationship between platform participants or objects.' },
  { id:'connection-reason', name:'Connection Reason', category:'CONNECTION', description:'The context explaining why two people or entities are connected.' },
  { id:'participation', name:'Participation', category:'PARTICIPATION', description:'A record of a Person taking part in a Call, Zone, Goal, event or action.' },
  { id:'page', name:'Page', category:'CONTENT', description:'A public space representing an organization, initiative, community or shared identity.' },
  { id:'post', name:'Post', category:'CONTENT', description:'Published content that can create discussion, connection or action.' },
  { id:'comment', name:'Comment / Answer', category:'CONTENT', description:'A response, answer or contribution to shared content or a question.' },
  { id:'interaction', name:'Interaction', category:'CONTENT', description:'A generic engagement with content or another platform object.' },
  { id:'reaction', name:'Reaction / Like', category:'CONTENT', description:'A lightweight expression of response to content.' },
  { id:'suggestion', name:'Suggestion', category:'ACTION', description:'A proposed idea, response or possibility that people can discuss and support.' },
  { id:'vote', name:'Vote', category:'ACTION', description:'A person’s choice in a proposal, suggestion, election or decision.' },
  { id:'goal', name:'Goal', category:'ACTION', description:'A concrete objective connected to a Zone, initiative or group of people.' },
  { id:'action', name:'Action', category:'ACTION', description:'A concrete step taken toward a Goal or possibility.' },
  { id:'experience', name:'Experience / Outcome', category:'ACTION', description:'The result or lived experience produced by participation and action.' },
  { id:'initiative', name:'Initiative', category:'ACTION', description:'An organized effort around a shared possibility, need or goal.' },
  { id:'community-call', name:'Community Call', category:'CALL', description:'A shared conversation space around a topic, possibility or need.' },
  { id:'local-call', name:'Local Call', category:'CALL', description:'A Call connected to a specific local place or Zone.' },
  { id:'call-topic', name:'Call Topic', category:'CALL', description:'The subject or question around which a Call is organized.' },
  { id:'call-status', name:'Call Status', category:'CALL', description:'The lifecycle state of a Call, such as planned, open, active or closed.' },
  { id:'organizer', name:'Organizer', category:'CALL', description:'The Person or role responsible for organizing a Call or event.' },
  { id:'schedule', name:'Schedule', category:'CALL', description:'The date and time structure of a Call or event.' },
  { id:'event', name:'Event', category:'EVENT', description:'A scheduled activity that people can discover and participate in.' },
  { id:'my-event', name:'My Event', category:'EVENT', description:'An event saved in a person’s participation layer.' },
  { id:'participation-status', name:'Participation Status', category:'EVENT', description:'The state of a person’s relationship to an event or Call.' },
  { id:'zone', name:'Zone', category:'PLACE', description:'A local or defined space connecting people, places, goals and action.' },
  { id:'zone-member', name:'Zone Membership', category:'PLACE', description:'The relationship between a Person and a Zone.' },
  { id:'place', name:'Place', category:'PLACE', description:'A physical or geographic place represented in the platform.' },
  { id:'entity', name:'Entity', category:'PLACE', description:'A recognized place, business, organization, service, landmark or initiative.' },
  { id:'business', name:'Business', category:'ENTITY', description:'A business identified as part of the local Commons.' },
  { id:'organization', name:'Organization', category:'ENTITY', description:'An organization connected to people, places, initiatives or activity.' },
  { id:'service', name:'Service', category:'ENTITY', description:'A service available to or relevant to a local community.' },
  { id:'landmark', name:'Landmark', category:'ENTITY', description:'A notable physical place or geographic point.' },
  { id:'review', name:'Review', category:'ENTITY', description:'A person’s review or evaluation of an identified Entity.' },
  { id:'country', name:'Country', category:'GEOGRAPHY', description:'A country context for geographic discovery and Zones.' },
  { id:'region', name:'Region / Governorate', category:'GEOGRAPHY', description:'A first-level geographic area containing local communities and Zones.' },
  { id:'zone-activity', name:'Zone Activity', category:'ACTIVITY', description:'An activity record showing what is happening inside a Zone.' },
  { id:'election', name:'Election', category:'GOVERNANCE', description:'A structured choice between candidates or options for a defined role or decision.' },
  { id:'candidate', name:'Candidate', category:'GOVERNANCE', description:'A person proposed for a role or election.' },
  { id:'role-proposal', name:'Role Proposal', category:'GOVERNANCE', description:'A proposal to create or change a role in a Zone or community.' },
  { id:'notification', name:'Notification', category:'SYSTEM', description:'Information delivered to a person because relevant activity occurred.' },
  { id:'notification-preference', name:'Notification Preference', category:'SYSTEM', description:'A person’s rules for receiving or suppressing notifications.' },
  { id:'search', name:'Search', category:'DISCOVERY', description:'A discovery action used to find people, places, content, systems or other objects.' },
  { id:'discovery', name:'Discovery', category:'DISCOVERY', description:'A discovered person, place, idea, initiative, connection or possibility.' },
  { id:'recommendation', name:'Recommendation', category:'DISCOVERY', description:'A suggested object or connection based on context and relationships.' },
  { id:'feed', name:'Feed', category:'DISCOVERY', description:'A contextual stream of relevant activity and content.' },
  { id:'context', name:'Context', category:'SYSTEM', description:'The place, topic, Zone, Page or other setting attached to an object.' },
  { id:'activity', name:'Activity', category:'SYSTEM', description:'A record that something happened in the platform.' },
  { id:'history', name:'History', category:'SYSTEM', description:'Persistent records of previous connections, participation and changes.' },
  { id:'system', name:'System', category:'ARCHITECTURE', description:'A functional group of elements, relationships, processes and triggers.' },
  { id:'process', name:'Process', category:'ARCHITECTURE', description:'A sequence of steps that transforms inputs into a result.' },
  { id:'trigger', name:'Trigger', category:'ARCHITECTURE', description:'An event or condition that starts a process or system response.' },
  { id:'workflow', name:'Workflow', category:'ARCHITECTURE', description:'A defined path through multiple states, actions and decisions.' },
  { id:'audit-log', name:'Audit / Change Record', category:'ADMINISTRATION', description:'A record of important administrative or structural changes.' }
])

const designRelationships = ref<DesignCatalogItem[]>([
  { id:'person-zone', name:'Person → Zone', category:'MEMBERSHIP', description:'A person joins, leaves or participates in a Zone.' },
  { id:'person-call', name:'Person → Call', category:'PARTICIPATION', description:'A person participates in a Community Call or Local Call.' },
  { id:'person-page', name:'Person → Page', category:'CONNECTION', description:'A person follows or connects with a Page.' },
  { id:'person-person', name:'Person → Person', category:'CONNECTION', description:'A connection or follow between two people.' },
  { id:'post-author', name:'Person → Post', category:'OWNERSHIP', description:'A person authors or publishes a Post.' },
  { id:'page-post', name:'Page → Post', category:'PUBLISHING', description:'A Page publishes a Post.' },
  { id:'zone-post', name:'Zone → Post', category:'CONTEXT', description:'A Post is attached to a Zone.' },
  { id:'zone-goal', name:'Zone → Goal', category:'ACTION', description:'A Goal belongs to or serves a Zone.' },
  { id:'goal-suggestion', name:'Goal → Suggestion', category:'ACTION', description:'A Suggestion proposes a way to advance a Goal.' },
  { id:'suggestion-vote', name:'Suggestion → Vote', category:'DECISION', description:'People vote on a Suggestion.' },
  { id:'call-zone', name:'Call → Zone', category:'CONTEXT', description:'A Call is connected to a Zone or local area.' },
  { id:'call-event', name:'Call → Event', category:'SCHEDULE', description:'A Call creates or represents a scheduled Event.' },
  { id:'event-participation', name:'Event → Participation', category:'PARTICIPATION', description:'An Event creates participation records.' },
  { id:'entity-zone', name:'Entity → Zone', category:'PLACE', description:'An Entity is identified within a Zone.' },
  { id:'entity-review', name:'Entity → Review', category:'FEEDBACK', description:'People review an identified Entity.' },
  { id:'role-person', name:'Role → Person', category:'GOVERNANCE', description:'A Person holds a defined Role.' },
  { id:'election-role', name:'Election → Role', category:'GOVERNANCE', description:'An Election selects a person for a Role.' },
  { id:'notification-trigger', name:'Trigger → Notification', category:'SYSTEM', description:'A Trigger creates a Notification for an affected recipient.' },
  { id:'system-element', name:'System → Element', category:'ARCHITECTURE', description:'A System contains or uses an Element.' },
  { id:'system-system', name:'System → System', category:'ARCHITECTURE', description:'One System depends on or feeds another System.' },
  { id:'process-element', name:'Process → Element', category:'ARCHITECTURE', description:'A Process reads, creates or changes an Element.' }
])

const designProcesses = ref<DesignCatalogItem[]>([
  { id:'create-call', name:'Create a Call', category:'CALLS', description:'Create topic, location, schedule, organizer and participation entry points.' },
  { id:'join-call', name:'Join a Call', category:'PARTICIPATION', description:'Person discovers a Call, joins it and becomes a participant.' },
  { id:'create-zone', name:'Create a Zone', category:'ZONES', description:'Define a Zone and its people, goals, places and activity.' },
  { id:'join-zone', name:'Join a Zone', category:'MEMBERSHIP', description:'Person joins a Zone and enters its local activity layer.' },
  { id:'create-post', name:'Publish a Post', category:'CONTENT', description:'Create content, attach context and publish it.' },
  { id:'create-goal', name:'Create a Goal', category:'ACTION', description:'Turn a possibility into a defined objective and progress layer.' },
  { id:'submit-suggestion', name:'Submit a Suggestion', category:'ACTION', description:'Propose an idea and collect answers or votes.' },
  { id:'discover-connection', name:'Discover a Connection', category:'DISCOVERY', description:'Use shared context or activity to surface a relevant connection.' },
  { id:'identify-entity', name:'Identify an Entity', category:'PLACES', description:'Recognize a place, business, organization or service inside a Zone.' },
  { id:'review-entity', name:'Review an Entity', category:'FEEDBACK', description:'Create and store a person’s review of an Entity.' },
  { id:'send-notification', name:'Send Notification', category:'SYSTEM', description:'Resolve trigger, recipient, message and delivery state.' },
  { id:'record-participation', name:'Record Participation', category:'SYSTEM', description:'Persist the relationship between a person and an activity.' },
  { id:'governance-decision', name:'Run a Governance Decision', category:'GOVERNANCE', description:'Create proposal, candidates or options, collect votes and store the result.' },
  { id:'activity-history', name:'Record Activity History', category:'SYSTEM', description:'Capture important actions so they can be revisited later.' }
])

const designEvents = ref<DesignCatalogItem[]>([
  { id:'call-created', name:'Call Created', category:'TRIGGER', description:'A new Call exists and may notify or invite relevant people.' },
  { id:'call-started', name:'Call Started', category:'EVENT', description:'The scheduled Call becomes active.' },
  { id:'call-joined', name:'Person Joined Call', category:'EVENT', description:'A person enters a Call as a participant.' },
  { id:'zone-joined', name:'Person Joined Zone', category:'EVENT', description:'A person joins a Zone.' },
  { id:'post-published', name:'Post Published', category:'EVENT', description:'A new Post becomes visible.' },
  { id:'goal-created', name:'Goal Created', category:'EVENT', description:'A new Goal is created in a Zone or context.' },
  { id:'suggestion-created', name:'Suggestion Created', category:'EVENT', description:'A new Suggestion is submitted.' },
  { id:'suggestion-voted', name:'Suggestion Voted', category:'EVENT', description:'A person votes on a Suggestion.' },
  { id:'entity-identified', name:'Entity Identified', category:'EVENT', description:'A place, business, organization or service is identified.' },
  { id:'event-reminder', name:'Event Reminder Due', category:'TRIGGER', description:'A scheduled reminder condition becomes true.' },
  { id:'notification-created', name:'Notification Created', category:'EVENT', description:'A notification has been generated and can be delivered.' },
  { id:'permission-changed', name:'Permission Changed', category:'TRIGGER', description:'A role or permission changes and dependent systems must respond.' },
  { id:'process-completed', name:'Process Completed', category:'EVENT', description:'A defined process reaches its completion state.' },
  { id:'system-state-changed', name:'System State Changed', category:'TRIGGER', description:'A system changes state and may start another process.' }
])

const filteredDesignCatalog = computed(() => {
  const source = designMode.value === 'elements' ? designElements.value
    : designMode.value === 'relationships' ? designRelationships.value
    : designMode.value === 'processes' ? designProcesses.value
    : designEvents.value
  const q = designSearch.value.trim().toLowerCase()
  if (!q) return source
  return source.filter(item => (item.name + ' ' + item.category + ' ' + item.description).toLowerCase().includes(q))
})

const selectedDesignSystemObject = computed(() =>
  adminSystems.value.find(system => system.id === selectedDesignSystem.value) || null
)

const systemDesignItems = ref<Record<string, SystemDesignItem[]>>({
  'calls-system': [
    { instanceId:'calls-community-call', kind:'element', catalogId:'community-call' },
    { instanceId:'calls-local-call', kind:'element', catalogId:'local-call' },
    { instanceId:'calls-topic', kind:'element', catalogId:'call-topic' },
    { instanceId:'calls-status', kind:'element', catalogId:'call-status' },
    { instanceId:'calls-organizer', kind:'element', catalogId:'organizer' },
    { instanceId:'calls-schedule', kind:'element', catalogId:'schedule' },
    { instanceId:'calls-person-call', kind:'relationship', catalogId:'person-call' },
    { instanceId:'calls-call-zone', kind:'relationship', catalogId:'call-zone' },
    { instanceId:'calls-join', kind:'process', catalogId:'join-call' },
    { instanceId:'calls-created', kind:'event', catalogId:'call-created' },
    { instanceId:'calls-joined', kind:'event', catalogId:'call-joined' }
  ],
  'zones-system': [
    { instanceId:'zones-zone', kind:'element', catalogId:'zone' },
    { instanceId:'zones-member', kind:'element', catalogId:'zone-member' },
    { instanceId:'zones-goal', kind:'element', catalogId:'goal' },
    { instanceId:'zones-suggestion', kind:'element', catalogId:'suggestion' },
    { instanceId:'zones-entity', kind:'element', catalogId:'entity' },
    { instanceId:'zones-activity', kind:'element', catalogId:'zone-activity' },
    { instanceId:'zones-person-zone', kind:'relationship', catalogId:'person-zone' },
    { instanceId:'zones-zone-goal', kind:'relationship', catalogId:'zone-goal' },
    { instanceId:'zones-create', kind:'process', catalogId:'create-zone' },
    { instanceId:'zones-joined', kind:'event', catalogId:'zone-joined' }
  ],
  'people-system': [
    { instanceId:'people-person', kind:'element', catalogId:'person' },
    { instanceId:'people-profile', kind:'element', catalogId:'profile' },
    { instanceId:'people-follow', kind:'element', catalogId:'follow' },
    { instanceId:'people-connection', kind:'element', catalogId:'connection' },
    { instanceId:'people-reason', kind:'element', catalogId:'connection-reason' },
    { instanceId:'people-participation', kind:'element', catalogId:'participation' },
    { instanceId:'people-person-person', kind:'relationship', catalogId:'person-person' },
    { instanceId:'people-discover', kind:'process', catalogId:'discover-connection' }
  ],
  'content-system': [
    { instanceId:'content-post', kind:'element', catalogId:'post' },
    { instanceId:'content-page', kind:'element', catalogId:'page' },
    { instanceId:'content-comment', kind:'element', catalogId:'comment' },
    { instanceId:'content-interaction', kind:'element', catalogId:'interaction' },
    { instanceId:'content-reaction', kind:'element', catalogId:'reaction' },
    { instanceId:'content-post-author', kind:'relationship', catalogId:'post-author' },
    { instanceId:'content-page-post', kind:'relationship', catalogId:'page-post' },
    { instanceId:'content-publish', kind:'process', catalogId:'create-post' },
    { instanceId:'content-published', kind:'event', catalogId:'post-published' }
  ],
  'events-system': [
    { instanceId:'events-event', kind:'element', catalogId:'event' },
    { instanceId:'events-my-event', kind:'element', catalogId:'my-event' },
    { instanceId:'events-status', kind:'element', catalogId:'participation-status' },
    { instanceId:'events-participation', kind:'element', catalogId:'participation' },
    { instanceId:'events-event-participation', kind:'relationship', catalogId:'event-participation' },
    { instanceId:'events-record', kind:'process', catalogId:'record-participation' },
    { instanceId:'events-reminder', kind:'event', catalogId:'event-reminder' }
  ],
  'notifications-system': [
    { instanceId:'notifications-notification', kind:'element', catalogId:'notification' },
    { instanceId:'notifications-preference', kind:'element', catalogId:'notification-preference' },
    { instanceId:'notifications-trigger', kind:'element', catalogId:'trigger' },
    { instanceId:'notifications-trigger-notification', kind:'relationship', catalogId:'notification-trigger' },
    { instanceId:'notifications-send', kind:'process', catalogId:'send-notification' },
    { instanceId:'notifications-created', kind:'event', catalogId:'notification-created' }
  ]
})

function setDesignMode(value: string) {
  if (['systems', 'elements', 'relationships', 'processes', 'events'].includes(value)) {
    designMode.value = value as typeof designMode.value
  }
}

function catalogForKind(kind: SystemDesignItem['kind']) {
  return kind === 'element' ? designElements.value
    : kind === 'relationship' ? designRelationships.value
    : kind === 'process' ? designProcesses.value
    : designEvents.value
}

function addDesignNode(kind: SystemDesignItem['kind'], catalogId: string) {
  if (!selectedDesignSystem.value) return
  if (!systemDesignItems.value[selectedDesignSystem.value]) systemDesignItems.value[selectedDesignSystem.value] = []
  const base = catalogForKind(kind).find(item => item.id === catalogId)
  if (!base) return
  systemDesignItems.value[selectedDesignSystem.value].push({
    instanceId: catalogId + '-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7),
    kind,
    catalogId
  })
}

function removeDesignNode(instanceId: string) {
  const systemId = selectedDesignSystem.value
  if (!systemId) return
  systemDesignItems.value[systemId] = (systemDesignItems.value[systemId] || []).filter(item => item.instanceId !== instanceId)
}

function duplicateDesignNode(instanceId: string) {
  const systemId = selectedDesignSystem.value
  if (!systemId) return
  const items = systemDesignItems.value[systemId] || []
  const source = items.find(item => item.instanceId === instanceId)
  if (!source) return
  addDesignNode(source.kind, source.catalogId)
}

function handleDesignDrop() {
  if (!draggedDesignNode.value) return
  addDesignNode(draggedDesignNode.value.kind, draggedDesignNode.value.id)
  draggedDesignNode.value = null
}

function createDesignSystem() {
  const name = newDesignSystemName.value.trim()
  if (!name) return
  const id = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '-' + Date.now()
  adminSystems.value.push({
    id,
    name,
    purpose: newDesignSystemPurpose.value.trim() || 'A new functional system built from selected platform elements.',
    contains: [],
    connections: [],
    functionalParts: [],
    missing: []
  })
  systemDesignItems.value[id] = []
  selectedDesignSystem.value = id
  newDesignSystemName.value = ''
  newDesignSystemPurpose.value = ''
  designMode.value = 'elements'
}

function createSystemFromCatalog(kind: SystemDesignItem['kind'], catalogId: string) {
  const item = catalogForKind(kind).find(entry => entry.id === catalogId)
  if (!item) return
  newDesignSystemName.value = item.name + ' System'
  newDesignSystemPurpose.value = 'A functional system built around ' + item.name + '.'
  createDesignSystem()
  addDesignNode(kind, catalogId)
}

function designItemName(item: SystemDesignItem) {
  return catalogForKind(item.kind).find(entry => entry.id === item.catalogId)?.name || item.catalogId
}

function designItemDescription(item: SystemDesignItem) {
  return catalogForKind(item.kind).find(entry => entry.id === item.catalogId)?.description || ''
}

function designKindLabel(kind: SystemDesignItem['kind']) {
  return kind === 'element' ? 'ELEMENT' : kind === 'relationship' ? 'RELATIONSHIP' : kind === 'process' ? 'PROCESS' : 'EVENT / TRIGGER'
}

function openSystemDesign() {
  showAccountMenu.value = false
  activeView.value = 'system-design'
  systemDesignUnlocked.value = false
  systemDesignPassword.value = ''
  systemDesignPasswordError.value = false
  designMode.value = 'systems'
  selectedDesignSystem.value = adminSystems.value[0]?.id || null
  selectedZone.value = null
  selectedCall.value = null
  selectedPage.value = null
  selectedPerson.value = null
  selectedEntity.value = null
}

function unlockSystemDesign() {
  if (systemDesignPassword.value === '58337979') {
    systemDesignUnlocked.value = true
    systemDesignPassword.value = ''
    systemDesignPasswordError.value = false
    return
  }
  systemDesignPasswordError.value = true
}

function lockSystemDesign() {
  systemDesignUnlocked.value = false
  systemDesignPassword.value = ''
  systemDesignPasswordError.value = false
}

type AdminSystem = {
  id: string
  name: string
  purpose: string
  contains: string[]
  connections: string[]
  functionalParts: string[]
  missing: string[]
}

const adminSystems = ref<AdminSystem[]>([
  {
    id: 'calls-system',
    name: 'Calls System',
    purpose: 'Turns a topic, need or possibility into a structured space where people can gather and participate.',
    contains: ['Community Call', 'Local Call', 'Call status', 'Participants', 'Organizer', 'Schedule'],
    connections: ['People', 'Zones', 'My Events', 'Notifications', 'Pages', 'Participation'],
    functionalParts: ['Create a Call', 'Define topic and location', 'Invite or discover participants', 'Join / leave', 'Schedule and reminders', 'Participant state', 'Organizer controls'],
    missing: ['Complete reminder flow', 'Organizer permission model', 'Persistent participation history']
  },
  {
    id: 'zones-system',
    name: 'Zones System',
    purpose: 'Connects people, places and local action around a real or defined area.',
    contains: ['Zone', 'Members', 'Goals', 'Suggestions', 'Entities', 'Zone activity'],
    connections: ['People', 'Calls', 'Pages', 'Posts', 'Goals', 'Suggestions'],
    functionalParts: ['Create a Zone', 'Join / leave', 'Identify members', 'Create goals', 'Submit suggestions', 'Participate in action', 'Track Zone activity'],
    missing: ['Complete activity timeline', 'Zone notification rules', 'Permission roles']
  },
  {
    id: 'people-system',
    name: 'People & Connections System',
    purpose: 'Builds the human network through follows, shared context, participation and meaningful connections.',
    contains: ['Person', 'Profile', 'Follow', 'Connection reason', 'Participation'],
    connections: ['Zones', 'Pages', 'Calls', 'Posts', 'Notifications'],
    functionalParts: ['Create profile', 'Follow', 'Discover connections', 'Show why people are connected', 'Participate', 'Keep connection history'],
    missing: ['Connection history', 'Unified participation timeline']
  },
  {
    id: 'content-system',
    name: 'Content System',
    purpose: 'Lets people and Pages publish ideas and connect those ideas to the Commons.',
    contains: ['Post', 'Author', 'Page', 'Zone context', 'Interactions'],
    connections: ['People', 'Pages', 'Zones', 'Goals', 'Suggestions', 'Notifications'],
    functionalParts: ['Create post', 'Publish', 'Attach context', 'Like / interact', 'Open related connections', 'Generate relevant notifications'],
    missing: ['Complete interaction history', 'Mention notifications']
  },
  {
    id: 'events-system',
    name: 'Events & Participation System',
    purpose: 'Collects the activities a person has chosen to participate in and turns them into a personal activity layer.',
    contains: ['My Events', 'Participating event', 'Date / time', 'Location', 'Participation status'],
    connections: ['Community Call', 'Local Call', 'Person', 'Notifications', 'Zones'],
    functionalParts: ['Join an event', 'Store participation', 'Show upcoming activity', 'Open event', 'Send reminders'],
    missing: ['Real participation persistence', 'Calendar integration', 'Reminder notifications']
  },
  {
    id: 'notifications-system',
    name: 'Notifications System',
    purpose: 'Translates activity across the platform into timely information for the people affected by it.',
    contains: ['Notification', 'Trigger', 'Recipient', 'Read state', 'Notification preference'],
    connections: ['Calls', 'Zones', 'People', 'Pages', 'Posts', 'Goals', 'Suggestions', 'Events'],
    functionalParts: ['Detect trigger', 'Resolve recipient', 'Create notification', 'Deliver', 'Read / unread', 'Preference control'],
    missing: ['Backend delivery', 'Persistent read state', 'Notification preference engine']
  }
])

const adminElements = ref<AdminElement[]>([
  { id:'community-call', name:'Community Call', category:'CALL', description:'A shared conversation space where people gather around a topic, possibility or local need.', connections:['People','Zones','My Events','Notifications','Pages','Participation'], missing:['Call reminder notification','Participant history','Organizer notification controls'] },
  { id:'local-call', name:'Local Call', category:'CALL', description:'A Call connected to a specific local place or Zone.', connections:['People','Zones','Community Call','My Events','Notifications'], missing:['Location-based notifications','Local attendance history'] },
  { id:'zone', name:'Zone', category:'PLACE', description:'A local space connecting people, places, goals, suggestions and action.', connections:['People','Places','Goals','Suggestions','Calls','Entities'], missing:['Zone activity notifications','Connection health overview'] },
  { id:'person', name:'Person', category:'NETWORK', description:'A person participating in the Commons through connections, Zones, Pages and Calls.', connections:['Zones','Pages','Calls','Posts','Notifications','Participation'], missing:['Participation timeline','Connection history'] },
  { id:'page', name:'Page', category:'NETWORK', description:'A public space for an organization, initiative, community or other shared identity.', connections:['People','Posts','Calls','Zones','Notifications'], missing:['Page activity notifications','Admin role management'] },
  { id:'post', name:'Post', category:'CONTENT', description:'A piece of shared content that can create connections, ideas and participation.', connections:['Person','Page','Zone','Goals','Suggestions','Notifications'], missing:['Mention notifications','Post activity history'] },
  { id:'goal', name:'Goal', category:'ACTION', description:'A concrete possibility or objective connected to a Zone and its participants.', connections:['Zone','People','Suggestions','Participation','Posts'], missing:['Progress notifications','Goal history'] },
  { id:'suggestion', name:'Suggestion', category:'ACTION', description:'A proposed idea or response that people can discuss, answer and support.', connections:['People','Goals','Zones','Posts','Notifications'], missing:['Vote notification','Answer notification'] },
  { id:'notification', name:'Notification', category:'SYSTEM', description:'The system layer that tells people when something relevant happens around their connections.', connections:['Community Call','Local Call','Zone','Person','Page','Post','Goal','Suggestion'], missing:['Event reminder rules','Notification preferences','Read/unread persistence'] },
  { id:'participation', name:'Participation', category:'SYSTEM', description:'The record of a person taking part in a Call, Zone, Goal or other activity.', connections:['Person','Community Call','Local Call','Zone','Goal','My Events'], missing:['Participation history','Participation notifications','Activity timeline'] }
])


adminElements.value.push(
  ...designElements.value
    .filter(item => !adminElements.value.some(existing => existing.id === item.id))
    .filter(item => !['system','process','trigger','workflow','audit-log'].includes(item.id))
    .map(item => ({
      id: item.id,
      name: item.name,
      category: item.category,
      description: item.description,
      connections: [],
      missing: []
    }))
)

const newZoneName = ref('')
const newZoneLocation = ref('')
const newZoneDescription = ref('')
const suggestionText = ref('')
const newRoleName = ref('')
const newRoleDescription = ref('')
const selectedZoneRegion = ref('')
const selectedZoneArea = ref('')
const selectedSpecificZone = ref('')
const selectedGovernorateRegion = ref('All')
const joinedGovernorates = ref<string[]>([])
const governorateRelations = ref<Record<string, string>>({})
const selectedGovernoratePrompt = ref('What could become possible here?')
const governoratePrompts = [
  {
    label: 'IMAGINE',
    title: 'What could become possible here?',
    text: 'Imagine a new public space, initiative, service or connection that could make this governorate better for the people around it.'
  },
  {
    label: 'NOTICE',
    title: 'What needs attention?',
    text: 'What do people experience every day that deserves more attention, discussion or a practical response?'
  },
  {
    label: 'PROTECT',
    title: 'What should we protect?',
    text: 'What places, nature, culture, relationships or local initiatives are already valuable and worth strengthening?'
  },
  {
    label: 'CONNECT',
    title: 'Who could make it happen?',
    text: 'What people, groups, skills or existing initiatives could connect around this possibility?'
  }
]
const zonePreviewName = ref('')
const zoneNavigationLevel = ref<'regions' | 'governorates' | 'specific-zones'>('governorates')
const selectedAreaImage = ref('')


/* =====================================================
   COUNTRIES / INTERNATIONAL GOVERNORATES
   ===================================================== */

const selectedCountry = ref('Tunisia')
const showCountrySelector = ref(false)

type CountryArea = {
  name: string
  country: string
  description: string
  members: string
  image: string
  region?: string
}

const realCountryImage = (country: string, place: string, lock: number) =>
  'https://loremflickr.com/1400/900/' + encodeURIComponent(place + ',' + country) + '?lock=' + lock

const internationalAreas: CountryArea[] = [
  // Algeria — 69 wilayas (2026 territorial division)
  ...[
    'Adrar','Chlef','Laghouat','Oum El Bouaghi','Batna','Béjaïa','Biskra','Béchar','Blida','Bouira',
    'Tamanrasset','Tébessa','Tlemcen','Tiaret','Tizi Ouzou','Alger','Djelfa','Jijel','Sétif','Saïda',
    'Skikda','Sidi Bel Abbès','Annaba','Guelma','Constantine','Médéa','Mostaganem','M’Sila','Mascara','Ouargla',
    'Oran','El Bayadh','Illizi','Bordj Bou Arréridj','Boumerdès','El Tarf','Tindouf','Tissemsilt','El Oued','Khenchela',
    'Souk Ahras','Tipaza','Mila','Aïn Defla','Naâma','Aïn Témouchent','Ghardaïa','Relizane','Timimoun','Bordj Badji Mokhtar',
    'Ouled Djellal','Béni Abbès','In Salah','In Guezzam','Touggourt','Djanet','El Meghaier','El Meniaâ',
    'Aflou','Barika','El Kantara','Bir El Ater','El Aricha','Ksar Chellala','Aïn Oussara','Messaad','Ksar El Boukhari','Bou Saâda','El Abiodh Sidi Cheikh'
  ].map((name, index) => ({
    name,
    country: 'Algeria',
    description: 'A wilaya of Algeria with local communities, places and initiatives.',
    members: index < 10 ? '1K+' : '300+',
    image: realCountryImage('Algeria', name, 100 + index)
  })),

  // Libya — 22 districts used in the established shabiya division
  ...[
    'Al Butnan','Darnah','Al Jabal al Akhdar','Al Marj','Benghazi','Al Wahat','Al Kufrah','Sirte','Misrata','Al Murgub',
    'Tripoli','Al Jfara','Zawiya','An Nuqat al Khams','Al Jabal al Gharbi','Nalut','Al Jufrah','Wadi al Shatii',
    'Sabha','Wadi al Hayaa','Ghat','Murzuq'
  ].map((name, index) => ({
    name,
    country: 'Libya',
    description: 'A local administrative area of Libya with communities and places connected to the country.',
    members: index < 6 ? '700+' : '250+',
    image: realCountryImage('Libya', name, 200 + index)
  })),

  // Morocco — 12 regions
  ...[
    'Tangier-Tetouan-Al Hoceima','Oriental','Fès-Meknès','Rabat-Salé-Kénitra',
    'Béni Mellal-Khénifra','Casablanca-Settat','Marrakesh-Safi','Drâa-Tafilalet',
    'Souss-Massa','Guelmim-Oued Noun','Laâyoune-Sakia El Hamra','Dakhla-Oued Ed-Dahab'
  ].map((name, index) => ({
    name,
    country: 'Morocco',
    description: 'A region of Morocco containing prefectures, provinces and local communities.',
    members: index < 6 ? '1K+' : '400+',
    image: realCountryImage('Morocco', name, 300 + index)
  })),

  // Egypt — 27 governorates
  ...[
    'Cairo','Alexandria','Port Said','Suez','Damietta','Dakahlia','Sharqia','Qalyubia','Kafr El Sheikh',
    'Gharbia','Monufia','Beheira','Ismailia','Giza','Beni Suef','Faiyum','Minya','Asyut','Sohag','Qena',
    'Luxor','Aswan','Red Sea','New Valley','Matrouh','North Sinai','South Sinai'
  ].map((name, index) => ({
    name,
    country: 'Egypt',
    description: 'A governorate of Egypt with local communities, places and initiatives.',
    members: index < 8 ? '1K+' : '400+',
    image: realCountryImage('Egypt', name, 400 + index)
  })),

  // Middle East
  ...([
    ['Jordan',['Amman','Irbid','Zarqa','Balqa','Mafraq','Jerash','Ajloun','Madaba','Karak','Tafilah','Ma’an','Aqaba']],
    ['Lebanon',['Beirut','Mount Lebanon','North Lebanon','Akkar','Baalbek-Hermel','Beqaa','Nabatieh','South Lebanon']],
    ['Syria',['Aleppo','Al-Hasakah','As-Suwayda','Damascus','Daraa','Deir ez-Zor','Hama','Homs','Idlib','Latakia','Quneitra','Raqqa','Rif Dimashq','Tartus']],
    ['Iraq',['Baghdad','Basra','Nineveh','Erbil','Sulaymaniyah','Duhok','Halabja','Kirkuk','Diyala','Saladin','Al-Anbar','Babylon','Karbala','Najaf','Wasit','Qadisiyyah','Maysan','Dhi Qar','Muthanna']],
    ['Saudi Arabia',['Riyadh','Makkah','Madinah','Eastern Province','Asir','Tabuk','Hail','Northern Borders','Jazan','Najran','Al Bahah','Al Jawf','Qassim']],
    ['United Arab Emirates',['Abu Dhabi','Dubai','Sharjah','Ajman','Umm Al Quwain','Ras Al Khaimah','Fujairah']],
    ['Qatar',['Doha','Al Rayyan','Al Wakrah','Al Khor','Al Shamal','Umm Salal','Al Daayen','Al Shahaniya']],
    ['Bahrain',['Capital','Muharraq','Northern','Southern']],
    ['Kuwait',['Capital','Hawalli','Farwaniya','Mubarak Al-Kabeer','Ahmadi','Jahra']],
    ['Oman',['Muscat','Dhofar','Musandam','Al Buraimi','Ad Dakhiliyah','North Al Batinah','South Al Batinah','North Ash Sharqiyah','South Ash Sharqiyah','Al Wusta','Al Dhahirah']],
    ['Yemen',['Abyan','Aden','Ad Dali','Al Bayda','Al Hudaydah','Al Jawf','Al Mahrah','Al Mahwit','Amran','Dhamar','Hadhramaut','Hajjah','Ibb','Lahij','Marib','Raymah','Saada','Sana’a','Shabwah','Socotra','Taiz','Sana’a City']],
    ['Palestine',['Jenin','Tubas and the Northern Valleys','Tulkarm','Nablus','Qalqilya','Salfit','Ramallah and Al-Bireh','Jericho and Al-Aghwar','Jerusalem','Bethlehem','Hebron','North Gaza','Gaza','Deir al-Balah','Khan Yunis','Rafah']],
    ['Iran',['Tehran','Alborz','Qom','Markazi','Qazvin','Gilan','Ardabil','Zanjan','East Azerbaijan','West Azerbaijan','Kurdistan','Kermanshah','Ilam','Lorestan','Hamedan','Khuzestan','Bushehr','Fars','Hormozgan','Sistan and Baluchestan','Kerman','Yazd','Isfahan','Semnan','Mazandaran','Golestan','North Khorasan','Razavi Khorasan','South Khorasan']]
  ] as Array<[string, string[]]>).flatMap(([country, names], countryIndex) =>
    names.map((name, index) => ({
      name,
      country,
      description: 'A first-level administrative area with local communities, places and initiatives.',
      members: index < 5 ? '1K+' : '300+',
      image: realCountryImage(country, name, 500 + countryIndex * 50 + index)
    }))
  )
]

const countryOptions = [
  { name: 'Tunisia', label: 'Tunisia', note: '24 governorates' },
  { name: 'Algeria', label: 'Algeria', note: '69 wilayas' },
  { name: 'Libya', label: 'Libya', note: '22 districts' },
  { name: 'Morocco', label: 'Morocco', note: '12 regions' },
  { name: 'Egypt', label: 'Egypt', note: '27 governorates' },
  { name: 'Jordan', label: 'Jordan', note: '12 governorates' },
  { name: 'Lebanon', label: 'Lebanon', note: '8 governorates' },
  { name: 'Syria', label: 'Syria', note: '14 governorates' },
  { name: 'Iraq', label: 'Iraq', note: '19 governorates' },
  { name: 'Saudi Arabia', label: 'Saudi Arabia', note: '13 regions' },
  { name: 'United Arab Emirates', label: 'United Arab Emirates', note: '7 emirates' },
  { name: 'Qatar', label: 'Qatar', note: '8 municipalities' },
  { name: 'Bahrain', label: 'Bahrain', note: '4 governorates' },
  { name: 'Kuwait', label: 'Kuwait', note: '6 governorates' },
  { name: 'Oman', label: 'Oman', note: '11 governorates' },
  { name: 'Yemen', label: 'Yemen', note: '22 governorates' },
  { name: 'Palestine', label: 'Palestine', note: '16 governorates' },
  { name: 'Iran', label: 'Iran', note: '31 provinces' }
]

const availableCountryAreas = computed<CountryArea[]>(() =>
  selectedCountry.value === 'Tunisia'
    ? zoneAreas.map(area => ({ ...area, country: 'Tunisia' }))
    : internationalAreas.filter(area => area.country === selectedCountry.value)
)

function selectCountry(countryName: string) {
  selectedCountry.value = countryName
  selectedGovernorateRegion.value = 'All'
  selectedZoneRegion.value = ''
  selectedZoneArea.value = ''
  selectedSpecificZone.value = ''
  zonePreviewName.value = ''
  zoneNavigationLevel.value = 'governorates'
  selectedAreaImage.value = ''
  nextTick(() => window.scrollTo({ top: 0, behavior: 'smooth' }))
}


/* =====================================================
   HERO ROTATION
   ===================================================== */

const activeHero = ref(0)

const heroes = [
  {
    label: 'YOUR PLACE · YOUR PEOPLE · YOUR ACTION',
    titleBefore: 'What is happening',
    titleAccent: 'around you?',
    description:
      'Follow people and pages. Discover connections. Participate in the places you care about.',
  },
  {
    label: 'YOUR PLACE · YOUR PEOPLE · YOUR ACTION',
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
    connected: true,
    category: 'Environment',
    isMyNetwork: false
  },
  {
    id: 2,
    name: 'Future Makers',
    handle: '@futuremakers',
    description: 'People building practical solutions for tomorrow.',
    followers: '12.7K',
    avatar: 'FM',
    color: '#8b5cf6',
    connected: true,
    category: 'Innovation',
    isMyNetwork: false
  },
  {
    id: 3,
    name: 'Tunis Community',
    handle: '@tuniscommunity',
    description: 'Connecting people who care about their city.',
    followers: '5.2K',
    avatar: 'TC',
    color: '#38bdf8',
    connected: false,
    category: 'Community',
    isMyNetwork: false
  },
  {
    id: 4,
    name: 'Urban Gardeners',
    handle: '@urbangardeners',
    description: 'Growing food and life inside the city.',
    followers: '3.8K',
    avatar: 'UG',
    color: '#f59e0b',
    connected: false,
    category: 'Nature',
    isMyNetwork: false
  }
])

const pageSearch = ref('')
const pageCategory = ref('All')
const callSearch = ref('')
const callCategory = ref('All')

const entities = ref<Entity[]>([
  {
    id: 1,
    name: 'Tunis North Community Garden',
    type: 'INITIATIVE',
    description: 'Example local initiative connected to the community garden goal and people working on urban nature.',
    location: 'Tunis North, Tunisia',
    zoneNames: ['Tunis North'],
    relatedPages: ['Green Horizon'],
    relatedCalls: ['Last Hope'],
    identified: false,
    reviews: 12,
    rating: 4.6,
    myReview: ''
  },
  {
    id: 2,
    name: 'Green Horizon Local Hub',
    type: 'ORGANIZATION',
    description: 'Example organization connected to environmental conversations and local action around Tunis North.',
    location: 'Tunis North, Tunisia',
    zoneNames: ['Tunis North'],
    relatedPages: ['Green Horizon'],
    relatedCalls: ['Last Hope'],
    identified: false,
    reviews: 8,
    rating: 4.4,
    myReview: ''
  },
  {
    id: 3,
    name: 'Tunis North Public Garden',
    type: 'PLACE',
    description: 'Example public place that can be identified, discussed and reviewed by people connected to the Zone.',
    location: 'Tunis North, Tunisia',
    zoneNames: ['Tunis North'],
    relatedPages: [],
    relatedCalls: ['Last Hope'],
    identified: false,
    reviews: 19,
    rating: 4.2,
    myReview: ''
  },
  {
    id: 4,
    name: 'La Marsa Coastal Initiative',
    type: 'INITIATIVE',
    description: 'Example initiative related to coastal care, beaches and public spaces in La Marsa.',
    location: 'La Marsa, Tunisia',
    zoneNames: ['La Marsa'],
    relatedPages: ['Urban Gardeners'],
    relatedCalls: ['A Place for Everyone'],
    identified: false,
    reviews: 6,
    rating: 4.5,
    myReview: ''
  },
  {
    id: 5,
    name: 'Sidi Bou Said Cultural House',
    type: 'PLACE',
    description: 'Example local cultural place connected to community life and preservation of local identity.',
    location: 'Sidi Bou Said, Tunisia',
    zoneNames: ['Sidi Bou Said'],
    relatedPages: ['Tunis Community'],
    relatedCalls: [],
    identified: false,
    reviews: 15,
    rating: 4.7,
    myReview: ''
  },
  {
    id: 6,
    name: 'Future Streets Workshop',
    type: 'ORGANIZATION',
    description: 'Example group exploring mobility, shade, walking and more human streets.',
    location: 'Ariana, Tunisia',
    zoneNames: ['Ariana'],
    relatedPages: ['Future Makers'],
    relatedCalls: ['Future Streets'],
    identified: false,
    reviews: 5,
    rating: 4.3,
    myReview: ''
  }
])

const myOfficialZoneRoles = ref([
  { zoneName: 'Tunis North', role: 'Goal Coordinator' },
  { zoneName: 'Tunis North', role: 'Event Organizer' }
])


const callCategories = computed(() => [
  'All',
  ...Array.from(new Set(calls.value.map(call => call.category)))
])

const filteredCalls = computed(() => {
  const query = callSearch.value.trim().toLowerCase()
  return calls.value.filter(call => {
    const matchesCategory = callCategory.value === 'All' || call.category === callCategory.value
    const matchesSearch = !query || [
      call.title,
      call.headline,
      call.description,
      call.location,
      call.launchedBy,
      call.category
    ].some(value => value.toLowerCase().includes(query))
    return matchesCategory && matchesSearch
  })
})

const pageCategories = computed(() => [
  'All',
  ...Array.from(new Set(pages.value.map(page => page.category)))
])

const filteredPages = computed(() => {
  const query = pageSearch.value.trim().toLowerCase()
  return pages.value.filter(page => {
    const matchesCategory = pageCategory.value === 'All' || page.category === pageCategory.value
    const matchesSearch = !query || [page.name, page.handle, page.description, page.category]
      .some(value => value.toLowerCase().includes(query))
    return matchesCategory && matchesSearch
  })
})


type LastHopeInteraction = {
  id: number
  author: string
  avatar: string
  type: string
  text: string
  time: string
  likes: number
}

const lastHope = {
  title: 'Last Hope',
  launchedBy: 'Green Horizon',
  handle: '@greenhorizon',
  avatar: 'GH',
  category: 'COMMUNITY CALL',
  status: 'OPEN',
  time: 'Launched 2 h ago',
  headline: 'Can we find one place in Tunis North where people can grow, meet and care for something together?',
  description: 'Last Hope is an open call launched by Green Horizon. Enter the space to understand the question, see what people are proposing, add your perspective and follow what happens next.',
  participants: 86,
  ideas: 24,
  interactions: 137,
  location: 'Tunis North',
  interactionsList: [
    { id: 1, author: 'Sarra Mansour', avatar: 'SM', type: 'IDEA', text: 'Start with a small unused public corner and let the first project prove what is possible.', time: '18 min', likes: 14 },
    { id: 2, author: 'Amine Ben Salem', avatar: 'AB', type: 'QUESTION', text: 'Could the space also include a place for children and older people to meet?', time: '32 min', likes: 9 },
    { id: 3, author: 'Youssef Trabelsi', avatar: 'YT', type: 'CONNECTION', text: 'I know a local group already working on community gardens. They could be part of this.', time: '51 min', likes: 21 }
  ] as LastHopeInteraction[]
}


type CommunityCall = {
  id: number
  title: string
  launchedBy: string
  handle: string
  avatar: string
  category: string
  status: 'OPEN' | 'CLOSED'
  time: string
  headline: string
  description: string
  participants: number
  ideas: number
  interactions: number
  location: string
  followed: boolean
  interactionsList: LastHopeInteraction[]
}

const calls = ref<CommunityCall[]>([
  {
    id: 1,
    title: lastHope.title,
    launchedBy: lastHope.launchedBy,
    handle: lastHope.handle,
    avatar: lastHope.avatar,
    category: lastHope.category,
    status: lastHope.status as 'OPEN' | 'CLOSED',
    time: lastHope.time,
    headline: lastHope.headline,
    description: lastHope.description,
    participants: lastHope.participants,
    ideas: lastHope.ideas,
    interactions: lastHope.interactions,
    location: lastHope.location,
    followed: false,
    interactionsList: lastHope.interactionsList
  }  ,
  {
    id: 2,
    title: 'Future Streets',
    launchedBy: 'Future Makers',
    handle: '@futuremakers',
    avatar: 'FM',
    category: 'CITY CALL',
    status: 'OPEN',
    time: 'Launched 5 h ago',
    headline: 'What should a more human street look like in our neighborhood?',
    description: 'An open call for ideas about shade, walking, mobility, meeting places and how streets can better support everyday life.',
    participants: 54,
    ideas: 18,
    interactions: 91,
    location: 'Ariana',
    followed: false,
    interactionsList: []
  },
  {
    id: 3,
    title: 'Water Between Us',
    launchedBy: 'Tunis Community',
    handle: '@tuniscommunity',
    avatar: 'TC',
    category: 'LOCAL CALL',
    status: 'OPEN',
    time: 'Launched yesterday',
    headline: 'How can we take better care of the water around our communities?',
    description: 'A shared space for observations, local knowledge, ideas and possible actions around water and public life.',
    participants: 71,
    ideas: 31,
    interactions: 118,
    location: 'Tunis',
    followed: false,
    interactionsList: []
  },
  {
    id: 4,
    title: 'A Place for Everyone',
    launchedBy: 'Urban Gardeners',
    handle: '@urbangardeners',
    avatar: 'UG',
    category: 'COMMUNITY CALL',
    status: 'OPEN',
    time: 'Launched 2 days ago',
    headline: 'What could an unused corner of the city become?',
    description: 'Explore possibilities for small green spaces, gardens, play areas and places where neighbors can meet.',
    participants: 43,
    ideas: 15,
    interactions: 76,
    location: 'La Marsa',
    followed: false,
    interactionsList: []
  }

])

function followCall(call: CommunityCall) {
  call.followed = !call.followed
}

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

type ZoneDirectoryItem = {
  id: number
  name: string
  area: string
  location: string
}

const commonsFile = (file: string) => 'https://commons.wikimedia.org/wiki/Special:FilePath/' + encodeURIComponent(file) + '?width=1400'

const zoneRegions = [
  { name: 'North', description: 'Northern Tunisia, from Greater Tunis and Cap Bon to the northwest.', members: '4K+', image: commonsFile('Bizerte tunisia.jpg') },
  { name: 'Centre', description: 'The Sahel, central Tunisia and the Sfax region.', members: '4K+', image: commonsFile('Sousse Tunisia.jpg') },
  { name: 'South', description: 'The southern coast, oases, desert and deep south.', members: '2K+', image: commonsFile('Matmata - Tunisia.jpg') },
]

const zoneAreas = [
  { name: 'Tunis', region: 'North', description: 'The capital governorate and its urban communities.', members: '1K+', image: commonsFile("Vue ville Tunis.jpg") },
  { name: 'Ariana', region: 'North', description: 'Communities, neighborhoods and local action across Ariana.', members: '600+', image: commonsFile("Ariana - Tunisia.jpg") },
  { name: 'Ben Arous', region: 'North', description: 'People and local initiatives across the southern metropolitan area.', members: '700+', image: commonsFile("Tunis ville Ben Arous.JPG") },
  { name: 'Manouba', region: 'North', description: 'Local communities and action across western Greater Tunis.', members: '400+', image: commonsFile("La Manouba (21608043004).jpg") },
  { name: 'Nabeul', region: 'North', description: 'Coastal and inland communities across Cap Bon.', members: '800+', image: commonsFile("Nabeul Tunisie.jpg") },
  { name: 'Zaghouan', region: 'North', description: 'People, places and action around the Zaghouan governorate.', members: '200+', image: commonsFile("Zaghouan.jpg") },
  { name: 'Bizerte', region: 'North', description: 'Northern coastal communities and local action.', members: '700+', image: commonsFile("Bizerte tunisia.jpg") },
  { name: 'Béja', region: 'North', description: 'Communities and initiatives across northwestern Tunisia.', members: '300+', image: commonsFile("Beja Tunisia.jpg") },
  { name: 'Jendouba', region: 'North', description: 'Local communities across the northwest and mountain areas.', members: '300+', image: commonsFile("Jendouba ville2.jpg") },
  { name: 'Le Kef', region: 'North', description: 'People and local action across the Kef governorate.', members: '250+', image: commonsFile("El Kef.jpg") },
  { name: 'Siliana', region: 'North', description: 'Rural and urban communities across central northwest Tunisia.', members: '220+', image: commonsFile("Barrage Siliana Tunisie 01.jpg") },
  { name: 'Sousse', region: 'Centre', description: 'A major coastal network connecting local communities and action.', members: '900+', image: commonsFile("Sousse Tunisia.jpg") },
  { name: 'Monastir', region: 'Centre', description: 'Coastal communities, neighborhoods and local initiatives.', members: '600+', image: commonsFile("Monastir, Tunisie (2).jpg") },
  { name: 'Mahdia', region: 'Centre', description: 'Communities and action across the Mahdia coastline and interior.', members: '400+', image: commonsFile("Mahdia.jpg") },
  { name: 'Kairouan', region: 'Centre', description: 'Communities and initiatives across central Tunisia.', members: '500+', image: commonsFile("Kairouane.jpg") },
  { name: 'Kasserine', region: 'Centre', description: 'People, places and action across western central Tunisia.', members: '350+', image: commonsFile("Sufetula, Sbeitla, Tunisia.jpg") },
  { name: 'Sidi Bouzid', region: 'Centre', description: 'Local communities and initiatives across the center of Tunisia.', members: '350+', image: commonsFile("Sidi Bouzid la ville à lorigine de la révolution en Tunisie (5444831901).jpg") },
  { name: 'Sfax', region: 'Centre', description: 'A large regional network connecting people and local action.', members: '1K+', image: commonsFile("Sfax Tunisia (13872235624).jpg") },
  { name: 'Gabès', region: 'South', description: 'Coastal, oasis and urban communities across Gabès.', members: '450+', image: commonsFile("Gabes 1992 02.jpg") },
  { name: 'Medenine', region: 'South', description: 'Communities across the southeast and Djerba area.', members: '500+', image: commonsFile("Plage dans le Gouvernorat de Médnine, Tunisie.jpg") },
  { name: 'Tataouine', region: 'South', description: 'People and local initiatives across southern Tunisia.', members: '250+', image: commonsFile("Ghomrassen.jpg") },
  { name: 'Gafsa', region: 'South', description: 'Communities and local action across the southwest.', members: '350+', image: commonsFile("Gafsa.jpg") },
  { name: 'Tozeur', region: 'South', description: 'Oasis communities and local action in southwest Tunisia.', members: '220+', image: commonsFile("Tunisia, Tozeur (13668155914).jpg") },
  { name: 'Kébili', region: 'South', description: 'Communities and initiatives across the southern oases.', members: '220+', image: commonsFile("Kebili 1.jpg") },
]

const specificZones: ZoneDirectoryItem[] = [
  { id: 1, name: 'Tunis', area: 'Tunis', location: 'Tunis, Tunisia' },
  { id: 2, name: 'Le Bardo', area: 'Tunis', location: 'Le Bardo, Tunisia' },
  { id: 3, name: 'La Goulette', area: 'Tunis', location: 'La Goulette, Tunisia' },
  { id: 4, name: 'Carthage', area: 'Tunis', location: 'Carthage, Tunisia' },
  { id: 5, name: 'Sidi Bou Said', area: 'Tunis', location: 'Sidi Bou Said, Tunisia' },
  { id: 6, name: 'La Marsa', area: 'Tunis', location: 'La Marsa, Tunisia' },
  { id: 7, name: 'Sidi Hassine', area: 'Tunis', location: 'Sidi Hassine, Tunisia' },
  { id: 8, name: 'Ariana', area: 'Ariana', location: 'Ariana, Tunisia' },
  { id: 9, name: 'La Soukra', area: 'Ariana', location: 'La Soukra, Tunisia' },
  { id: 10, name: 'Raoued', area: 'Ariana', location: 'Raoued, Tunisia' },
  { id: 11, name: 'Ariana Ville', area: 'Ariana', location: 'Ariana Ville, Tunisia' },
  { id: 12, name: 'Ettadhamen', area: 'Ariana', location: 'Ettadhamen, Tunisia' },
  { id: 13, name: 'Mnihla', area: 'Ariana', location: 'Mnihla, Tunisia' },
  { id: 14, name: 'Ben Arous', area: 'Ben Arous', location: 'Ben Arous, Tunisia' },
  { id: 15, name: 'Hammam Lif', area: 'Ben Arous', location: 'Hammam Lif, Tunisia' },
  { id: 16, name: 'Megrine', area: 'Ben Arous', location: 'Megrine, Tunisia' },
  { id: 17, name: 'Radès', area: 'Ben Arous', location: 'Radès, Tunisia' },
  { id: 18, name: 'Mourouj', area: 'Ben Arous', location: 'El Mourouj, Tunisia' },
  { id: 19, name: 'Boumhel', area: 'Ben Arous', location: 'Boumhel, Tunisia' },
  { id: 20, name: 'Mornag', area: 'Ben Arous', location: 'Mornag, Tunisia' },
  { id: 21, name: 'Manouba', area: 'Manouba', location: 'Manouba, Tunisia' },
  { id: 22, name: 'Denden', area: 'Manouba', location: 'Denden, Tunisia' },
  { id: 23, name: 'Douar Hicher', area: 'Manouba', location: 'Douar Hicher, Tunisia' },
  { id: 24, name: 'Mornaguia', area: 'Manouba', location: 'Mornaguia, Tunisia' },
  { id: 25, name: 'Oued Ellil', area: 'Manouba', location: 'Oued Ellil, Tunisia' },
  { id: 26, name: 'Tebourba', area: 'Manouba', location: 'Tebourba, Tunisia' },
  { id: 27, name: 'Nabeul', area: 'Nabeul', location: 'Nabeul, Tunisia' },
  { id: 28, name: 'Hammamet', area: 'Nabeul', location: 'Hammamet, Tunisia' },
  { id: 29, name: 'Korba', area: 'Nabeul', location: 'Korba, Tunisia' },
  { id: 30, name: 'Kelibia', area: 'Nabeul', location: 'Kelibia, Tunisia' },
  { id: 31, name: 'Menzel Temime', area: 'Nabeul', location: 'Menzel Temime, Tunisia' },
  { id: 32, name: 'Grombalia', area: 'Nabeul', location: 'Grombalia, Tunisia' },
  { id: 33, name: 'Dar Chaabane El Fehri', area: 'Nabeul', location: 'Dar Chaabane El Fehri, Tunisia' },
  { id: 34, name: 'Beni Khiar', area: 'Nabeul', location: 'Beni Khiar, Tunisia' },
  { id: 35, name: 'Bou Argoub', area: 'Nabeul', location: 'Bou Argoub, Tunisia' },
  { id: 36, name: 'Zaghouan', area: 'Zaghouan', location: 'Zaghouan, Tunisia' },
  { id: 37, name: 'El Fahs', area: 'Zaghouan', location: 'El Fahs, Tunisia' },
  { id: 38, name: 'Bir Mcherga', area: 'Zaghouan', location: 'Bir Mcherga, Tunisia' },
  { id: 39, name: 'Bizerte', area: 'Bizerte', location: 'Bizerte, Tunisia' },
  { id: 40, name: 'Menzel Bourguiba', area: 'Bizerte', location: 'Menzel Bourguiba, Tunisia' },
  { id: 41, name: 'Menzel Jemil', area: 'Bizerte', location: 'Menzel Jemil, Tunisia' },
  { id: 42, name: 'Mateur', area: 'Bizerte', location: 'Mateur, Tunisia' },
  { id: 43, name: 'El Alia', area: 'Bizerte', location: 'El Alia, Tunisia' },
  { id: 44, name: 'Ras Jebel', area: 'Bizerte', location: 'Ras Jebel, Tunisia' },
  { id: 45, name: 'Nefza', area: 'Béja', location: 'Nefza, Tunisia' },
  { id: 46, name: 'Béja', area: 'Béja', location: 'Béja, Tunisia' },
  { id: 47, name: 'Testour', area: 'Béja', location: 'Testour, Tunisia' },
  { id: 48, name: 'Medjez el Bab', area: 'Béja', location: 'Medjez el Bab, Tunisia' },
  { id: 49, name: 'Jendouba', area: 'Jendouba', location: 'Jendouba, Tunisia' },
  { id: 50, name: 'Tabarka', area: 'Jendouba', location: 'Tabarka, Tunisia' },
  { id: 51, name: 'Aïn Draham', area: 'Jendouba', location: 'Aïn Draham, Tunisia' },
  { id: 52, name: 'Ghardimaou', area: 'Jendouba', location: 'Ghardimaou, Tunisia' },
  { id: 53, name: 'Bou Salem', area: 'Jendouba', location: 'Bou Salem, Tunisia' },
  { id: 54, name: 'Le Kef', area: 'Le Kef', location: 'Le Kef, Tunisia' },
  { id: 55, name: 'Dahmani', area: 'Le Kef', location: 'Dahmani, Tunisia' },
  { id: 56, name: 'Tajerouine', area: 'Le Kef', location: 'Tajerouine, Tunisia' },
  { id: 57, name: 'Sakiet Sidi Youssef', area: 'Le Kef', location: 'Sakiet Sidi Youssef, Tunisia' },
  { id: 58, name: 'Siliana', area: 'Siliana', location: 'Siliana, Tunisia' },
  { id: 59, name: 'Makthar', area: 'Siliana', location: 'Makthar, Tunisia' },
  { id: 60, name: 'Gaâfour', area: 'Siliana', location: 'Gaâfour, Tunisia' },
  { id: 61, name: 'Sousse', area: 'Sousse', location: 'Sousse, Tunisia' },
  { id: 62, name: 'Hammam Sousse', area: 'Sousse', location: 'Hammam Sousse, Tunisia' },
  { id: 63, name: 'Akouda', area: 'Sousse', location: 'Akouda, Tunisia' },
  { id: 64, name: 'Msaken', area: 'Sousse', location: 'Msaken, Tunisia' },
  { id: 65, name: 'Kalaa Kebira', area: 'Sousse', location: 'Kalaa Kebira, Tunisia' },
  { id: 66, name: 'Sousse Jaouhara', area: 'Sousse', location: 'Sousse, Tunisia' },
  { id: 67, name: 'Monastir', area: 'Monastir', location: 'Monastir, Tunisia' },
  { id: 68, name: 'Moknine', area: 'Monastir', location: 'Moknine, Tunisia' },
  { id: 69, name: 'Ksar Hellal', area: 'Monastir', location: 'Ksar Hellal, Tunisia' },
  { id: 70, name: 'Jemmal', area: 'Monastir', location: 'Jemmal, Tunisia' },
  { id: 71, name: 'Mahdia', area: 'Mahdia', location: 'Mahdia, Tunisia' },
  { id: 72, name: 'Ksour Essef', area: 'Mahdia', location: 'Ksour Essef, Tunisia' },
  { id: 73, name: 'El Jem', area: 'Mahdia', location: 'El Jem, Tunisia' },
  { id: 74, name: 'Rejiche', area: 'Mahdia', location: 'Rejiche, Tunisia' },
  { id: 75, name: 'Chebba', area: 'Mahdia', location: 'Chebba, Tunisia' },
  { id: 76, name: 'Sfax', area: 'Sfax', location: 'Sfax, Tunisia' },
  { id: 77, name: 'Sakiet Eddaier', area: 'Sfax', location: 'Sakiet Eddaier, Tunisia' },
  { id: 78, name: 'Sakiet Ezzit', area: 'Sfax', location: 'Sakiet Ezzit, Tunisia' },
  { id: 79, name: 'Mahrès', area: 'Sfax', location: 'Mahrès, Tunisia' },
  { id: 80, name: 'El Hencha', area: 'Sfax', location: 'El Hencha, Tunisia' },
  { id: 81, name: 'Agareb', area: 'Sfax', location: 'Agareb, Tunisia' },
  { id: 82, name: 'Tina', area: 'Sfax', location: 'Tina, Tunisia' },
  { id: 83, name: 'Kairouan', area: 'Kairouan', location: 'Kairouan, Tunisia' },
  { id: 84, name: 'Sbikha', area: 'Kairouan', location: 'Sbikha, Tunisia' },
  { id: 85, name: 'Bou Hajla', area: 'Kairouan', location: 'Bou Hajla, Tunisia' },
  { id: 86, name: 'Chebika', area: 'Kairouan', location: 'Chebika, Tunisia' },
  { id: 87, name: 'Kasserine', area: 'Kasserine', location: 'Kasserine, Tunisia' },
  { id: 88, name: 'Thala', area: 'Kasserine', location: 'Thala, Tunisia' },
  { id: 89, name: 'Sbeitla', area: 'Kasserine', location: 'Sbeitla, Tunisia' },
  { id: 90, name: 'Foussana', area: 'Kasserine', location: 'Foussana, Tunisia' },
  { id: 91, name: 'Fériana', area: 'Kasserine', location: 'Fériana, Tunisia' },
  { id: 92, name: 'Sbiba', area: 'Kasserine', location: 'Sbiba, Tunisia' },
  { id: 93, name: 'Sidi Bouzid', area: 'Sidi Bouzid', location: 'Sidi Bouzid, Tunisia' },
  { id: 94, name: 'Regueb', area: 'Sidi Bouzid', location: 'Regueb, Tunisia' },
  { id: 95, name: 'Meknassy', area: 'Sidi Bouzid', location: 'Meknassy, Tunisia' },
  { id: 96, name: 'Jilma', area: 'Sidi Bouzid', location: 'Jilma, Tunisia' },
  { id: 97, name: 'Gabès', area: 'Gabès', location: 'Gabès, Tunisia' },
  { id: 98, name: 'Mareth', area: 'Gabès', location: 'Mareth, Tunisia' },
  { id: 99, name: 'Métouia', area: 'Gabès', location: 'Métouia, Tunisia' },
  { id: 100, name: 'El Hamma', area: 'Gabès', location: 'El Hamma, Tunisia' },
  { id: 101, name: 'Ghannouch', area: 'Gabès', location: 'Ghannouch, Tunisia' },
  { id: 102, name: 'Medenine', area: 'Medenine', location: 'Medenine, Tunisia' },
  { id: 103, name: 'Djerba Midoun', area: 'Medenine', location: 'Djerba Midoun, Tunisia' },
  { id: 104, name: 'Houmt Souk', area: 'Medenine', location: 'Houmt Souk, Tunisia' },
  { id: 105, name: 'Zarzis', area: 'Medenine', location: 'Zarzis, Tunisia' },
  { id: 106, name: 'Ben Gardane', area: 'Medenine', location: 'Ben Gardane, Tunisia' },
  { id: 107, name: 'Tataouine', area: 'Tataouine', location: 'Tataouine, Tunisia' },
  { id: 108, name: 'Ghomrassen', area: 'Tataouine', location: 'Ghomrassen, Tunisia' },
  { id: 109, name: 'Dehiba', area: 'Tataouine', location: 'Dehiba, Tunisia' },
  { id: 110, name: 'Gafsa', area: 'Gafsa', location: 'Gafsa, Tunisia' },
  { id: 111, name: 'Métlaoui', area: 'Gafsa', location: 'Métlaoui, Tunisia' },
  { id: 112, name: 'Redeyef', area: 'Gafsa', location: 'Redeyef, Tunisia' },
  { id: 113, name: 'Oum Larayes', area: 'Gafsa', location: 'Oum Larayes, Tunisia' },
  { id: 114, name: 'Tozeur', area: 'Tozeur', location: 'Tozeur, Tunisia' },
  { id: 115, name: 'Nefta', area: 'Tozeur', location: 'Nefta, Tunisia' },
  { id: 116, name: 'Degueche', area: 'Tozeur', location: 'Degueche, Tunisia' },
  { id: 117, name: 'Kébili', area: 'Kébili', location: 'Kébili, Tunisia' },
  { id: 118, name: 'Douz', area: 'Kébili', location: 'Douz, Tunisia' },
  { id: 119, name: 'Souk Lahad', area: 'Kébili', location: 'Souk Lahad, Tunisia' },
]

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
    name: 'La Marsa',
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

const visibleZones = computed(() => {
  if (selectedZoneArea.value === 'All areas') return zones.value

  return zones.value.filter(zone => {
    const directoryZone = specificZones.find(item =>
      item.name.toLowerCase() === zone.name.toLowerCase()
    )

    return directoryZone?.area === selectedZoneArea.value
  })
})

const visibleSpecificZones = computed(() => {
  if (selectedZoneArea.value === 'All areas') return specificZones
  return specificZones.filter(zone => zone.area === selectedZoneArea.value)
})


const zonePreviewPosts = computed<Post[]>(() => {
  if (!zonePreviewName.value) return []

  const q = zonePreviewName.value.toLowerCase()

  const existing = posts.value.filter(post =>
    post.zone?.toLowerCase() === q ||
    post.content.toLowerCase().includes(q)
  )

  if (existing.length) return existing

  const zone = specificZones.find(item => item.name === zonePreviewName.value)
  if (!zone) return []

  const seed = zone.id % 6

  const themes = [
    {
      author: 'Sarra Mansour',
      avatar: 'SM',
      content: `People around ${zone.name} are starting to talk about what could be improved locally. What is the first thing you would change?`
    },
    {
      author: 'Amine Ben Salem',
      avatar: 'AB',
      content: `I think ${zone.name} could become a stronger local community if people shared small ideas, local needs and practical ways to participate.`
    },
    {
      author: 'Meriem Khalfallah',
      avatar: 'MK',
      content: `Is anyone already working on a project or initiative around ${zone.name}? I would like to discover the people who are already active here.`
    },
    {
      author: 'Youssef Trabelsi',
      avatar: 'YT',
      content: `A local question for ${zone.name}: what place, service or public space deserves more attention from the community?`
    },
    {
      author: 'Nour Ben Ali',
      avatar: 'NB',
      content: `What is something positive happening in ${zone.name} that more people should know about?`
    },
    {
      author: 'Green Horizon',
      avatar: 'GH',
      content: `We are collecting local ideas from ${zone.name}: nature, public spaces, mobility and community projects. Add your perspective.`
    }
  ]

  return Array.from({ length: 3 }, (_, index) => {
    const item = themes[(seed + index) % themes.length]

    return {
      id: 900000 + zone.id * 10 + index,
      author: item.author,
      handle: '@localvoice',
      avatar: item.avatar,
      time: index === 0 ? '18 min' : index === 1 ? '1 h' : '3 h',
      content: item.content,
      zone: zone.name,
      likes: 12 + zone.id + index * 7,
      comments: 3 + index * 2,
      liked: false
    }
  })
})

const zonePreviewData = computed(() =>
  specificZones.find(zone => zone.name === zonePreviewName.value) || null
)

const zonePreviewQuestions = computed(() => {
  if (!zonePreviewName.value) return []

  const zone = specificZones.find(item => item.name === zonePreviewName.value)
  if (!zone) return []

  const examples = [
    {
      topic: 'PUBLIC SPACES',
      question: `Does ${zone.name} have a public space that could be improved or used differently?`,
      helper: 'Local contributor',
      helperAvatar: 'LC',
      answer: `I know a few places around ${zone.name}. I can share what I have seen and help identify people already interested.`
    },
    {
      topic: 'SERVICES',
      question: `Is there a local service in ${zone.name} that people find difficult to access?`,
      helper: 'Community helper',
      helperAvatar: 'CH',
      answer: `I have been collecting local information. We can compare experiences and see whether an existing service or initiative can help.`
    },
    {
      topic: 'NATURE',
      question: `Where could people create or protect more green space in ${zone.name}?`,
      helper: 'Nature volunteer',
      helperAvatar: 'NV',
      answer: `There are several possibilities worth exploring. I can help connect the question to people working on urban nature.`
    },
    {
      topic: 'MOBILITY',
      question: `What could make moving around ${zone.name} easier for residents?`,
      helper: 'Mobility contributor',
      helperAvatar: 'MC',
      answer: `I can share observations from the area and help map the places where mobility is difficult.`
    }
  ]

  const offset = zone.id % examples.length
  return Array.from({ length: 4 }, (_, index) => examples[(offset + index) % examples.length]).map((item, index) => ({
    id: zone.id * 100 + index,
    ...item
  }))
})

const zonePreviewInitiatives = computed(() => {
  if (!zonePreviewName.value) return []

  const zone = specificZones.find(item => item.name === zonePreviewName.value)
  if (!zone) return []

  const examples = [
    {
      topic: 'PUBLIC SPACE',
      title: `Looking for an existing public-space initiative in ${zone.name}`,
      description: 'Someone wants to join people already improving a square, street, park or shared place.',
      status: 'LOOKING'
    },
    {
      topic: 'NATURE',
      title: `Looking for a local nature or gardening initiative`,
      description: `Someone in ${zone.name} wants to help with trees, gardens, planting or protection of local nature.`,
      status: 'LOOKING'
    },
    {
      topic: 'MOBILITY',
      title: `Looking for people working on mobility in ${zone.name}`,
      description: 'Someone wants to discover an existing project around walking, cycling, transport or safer streets.',
      status: 'LOOKING'
    }
  ]

  const offset = zone.id % examples.length
  return Array.from({ length: 3 }, (_, index) => examples[(offset + index) % examples.length]).map((item, index) => ({
    id: zone.id * 200 + index,
    ...item
  }))
})


const joinedZones = computed(() => zones.value.filter(zone => zone.joined))

const followedCalls = computed(() => calls.value.filter(call => call.followed))

const myNetworks = computed(() => pages.value.filter(page => page.isMyNetwork === true))

type SidebarConnection = {
  id: string
  label: string
  type: string
  avatar: string
  description: string
  action: () => void
}

const myConnections = computed<SidebarConnection[]>(() => {
  const connections: SidebarConnection[] = []

  pages.value
    .filter(page => page.connected && !page.isMyNetwork)
    .forEach(page => {
      connections.push({
        id: 'page-' + page.id,
        label: page.name,
        type: 'NETWORK',
        avatar: page.avatar,
        description: 'A network you follow or are connected to.',
        action: () => openPage(page)
      })
    })

  followedCalls.value.forEach(call => {
    connections.push({
      id: 'call-' + call.id,
      label: call.title,
      type: 'CALL',
      avatar: call.avatar,
      description: 'A Call you are following.',
      action: () => openCall(call)
    })
  })

  people.value
    .filter(person => person.followed)
    .forEach(person => {
      connections.push({
        id: 'person-' + person.id,
        label: person.name,
        type: 'PERSON',
        avatar: person.avatar,
        description: 'A person you follow.',
        action: () => openPerson(person)
      })
    })

  entities.value
    .filter(entity => entity.identified)
    .forEach(entity => {
      connections.push({
        id: 'entity-' + entity.id,
        label: entity.name,
        type: 'ENTITY',
        avatar: entity.name.slice(0, 2).toUpperCase(),
        description: 'An entity you identified.',
        action: () => openEntity(entity)
      })
    })

  return connections
})

const officialZoneRoles = computed(() => {
  return myOfficialZoneRoles.value.filter(item =>
    zones.value.some(zone => zone.name === item.zoneName)
  )
})

const entityContextZones = computed(() => {
  const names = new Set<string>()
  joinedZones.value.forEach(zone => names.add(zone.name))
  officialZoneRoles.value.forEach(item => names.add(item.zoneName))

  followedCalls.value.forEach(call => {
    entities.value.forEach(entity => {
      if (entity.relatedCalls.includes(call.title)) {
        entity.zoneNames.forEach(zoneName => names.add(zoneName))
      }
    })
  })

  return Array.from(names)
})

const detectedEntities = computed(() => {
  const context = new Set(entityContextZones.value)

  return entities.value
    .map(entity => {
      const matchedZones = entity.zoneNames.filter(zoneName => context.has(zoneName))
      const relatedFollowedCalls = entity.relatedCalls.filter(title =>
        followedCalls.value.some(call => call.title === title)
      )
      const connectedPages = entity.relatedPages.filter(pageName =>
        pages.value.some(page => page.name === pageName && page.connected)
      )

      let reason = 'Related to your network'
      if (matchedZones.length && relatedFollowedCalls.length) {
        reason = 'In your Zone + connected to a Call you follow'
      } else if (matchedZones.length) {
        reason = 'In a Zone you joined'
      } else if (relatedFollowedCalls.length) {
        reason = 'Connected to a Call you follow'
      } else if (connectedPages.length) {
        reason = 'Connected to a Page you follow'
      }

      return {
        ...entity,
        matchedZones,
        relatedFollowedCalls,
        connectedPages,
        reason
      }
    })
    .filter(entity =>
      entity.matchedZones.length ||
      entity.relatedFollowedCalls.length ||
      entity.connectedPages.length
    )
})

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

function openAdministrationSystems() {
  showAccountMenu.value = false
  activeView.value = 'administration-systems'
  selectedAdminSystem.value = null
  selectedZone.value = null
  selectedCall.value = null
  selectedPage.value = null
  selectedPerson.value = null
  selectedEntity.value = null
}

function openAdministration() {
  showAccountMenu.value = false
  activeView.value = 'administration'
  selectedAdminElement.value = null
  administrationPassword.value = ''
  administrationPasswordError.value = false
  selectedZone.value = null
  selectedCall.value = null
  selectedPage.value = null
  selectedPerson.value = null
  selectedEntity.value = null
}

function unlockAdministration() {
  if (administrationPassword.value === '58337979') {
    administrationUnlocked.value = true
    administrationPasswordError.value = false
    administrationPassword.value = ''
    selectedAdminElement.value = null
    return
  }
  administrationPasswordError.value = true
}

function lockAdministration() {
  administrationUnlocked.value = false
  selectedAdminElement.value = null
  administrationPassword.value = ''
  administrationPasswordError.value = false
}

function openAccountMenu() {
  showAccountMenu.value = !showAccountMenu.value
}

function disconnect() {
  showAccountMenu.value = false
  activeView.value = 'disconnected'
  selectedZone.value = null
  selectedCall.value = null
  selectedPage.value = null
  selectedPerson.value = null
  selectedEntity.value = null
}

function navigate(view: string) {
  activeView.value = view
  selectedZone.value = null
  selectedCall.value = null
  selectedPage.value = null
  selectedPerson.value = null
  selectedEntity.value = null
  activeZoneTab.value = 'overview'
  liveEngagement.value = null

  // Impact always opens with its Zones submenu visible.
  if (view === 'zones' || view === 'around-zones') {
    showZonesSubnav.value = true
  }
}

function openLiveEngagement(kind: 'people' | 'action' | 'flow') {
  showWhatsGoingOn.value = false
  liveEngagement.value = kind
  activeView.value = 'live-' + kind
  selectedZone.value = null
  selectedCall.value = null
  selectedPage.value = null
  selectedPerson.value = null
  selectedEntity.value = null
  activeZoneTab.value = 'overview'
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function openCallSpace(call: CommunityCall) {
  selectedCall.value = call
  activeView.value = 'call'
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function openPage(page: Page) {
  selectedPage.value = page
  activeView.value = 'page'
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function openPageByName(name: string) {
  const page = pages.value.find(item => item.name.toLowerCase() === name.toLowerCase())
  if (page) openPage(page)
}

function openPerson(person: any) {
  selectedPerson.value = person
  activeView.value = 'person'
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function getPostInspirations(post: Post) {
  const inspirations = [
    {
      label: 'POSSIBILITY',
      title: post.zone ? 'What could this become in this place?' : 'What could this idea become?',
      text: post.zone ? 'A small local action, a new meeting place, or something people can build together.' : 'A conversation, a project, a Call, or a new question worth exploring.'
    },
    {
      label: 'CONNECTION',
      title: 'Who could take this further?',
      text: 'People, Pages, existing initiatives or local knowledge that could connect with this thought.'
    }
  ]

  if (post.id === 2) {
    inspirations[0] = {
      label: 'ACTION',
      title: 'What could this become?',
      text: 'A simple way for people to identify what needs attention around them and turn it into a shared possibility.'
    }
  }

  if (post.id === 3) {
    inspirations[0] = {
      label: 'POSSIBILITY',
      title: 'What could this become?',
      text: 'A space where different solutions can meet, be explored and eventually become practical action.'
    }
  }

  return inspirations
}

function openZone(zone: Zone) {
  selectedZone.value = zone
  activeView.value = 'zone'
  activeZoneTab.value = 'overview'
}


function selectGovernorateRegion(regionName: string) {
  selectedGovernorateRegion.value = regionName
}

function setGovernorateRelation(name: string, relation: 'home' | 'family' | 'other') {
  governorateRelations.value = {
    ...governorateRelations.value,
    [name]: governorateRelations.value[name] === relation ? '' : relation
  }
}

function governorateRelationLabel(name: string) {
  const relation = governorateRelations.value[name]
  if (relation === 'home') return 'Where I live'
  if (relation === 'family') return 'Family lives here'
  if (relation === 'other') return 'I have a connection'
  return ''
}

function isGovernorateJoined(name: string) {
  return joinedGovernorates.value.includes(name)
}

function toggleGovernorateJoin(name: string) {
  const index = joinedGovernorates.value.indexOf(name)
  if (index >= 0) {
    joinedGovernorates.value.splice(index, 1)
  } else {
    joinedGovernorates.value.push(name)
  }
}


function selectGovernorate(governorateName: string) {
  const governorate = availableCountryAreas.value.find(area => area.name === governorateName)

  selectedZoneRegion.value = governorate?.region || ''
  selectedZoneArea.value = governorateName
  selectedSpecificZone.value = ''
  zonePreviewName.value = ''
  zoneNavigationLevel.value = 'specific-zones'
  selectedAreaImage.value = governorate?.image || ''

  nextTick(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  })
}

function backToGovernorates() {
  selectedZoneArea.value = ''
  selectedSpecificZone.value = ''
  zonePreviewName.value = ''
  zoneNavigationLevel.value = 'governorates'
  selectedAreaImage.value = selectedZoneRegion.value
    ? zoneRegions.find(region => region.name === selectedZoneRegion.value)?.image || ''
    : ''
}

async function openSpecificZone(zoneName: string) {
  selectedSpecificZone.value = zoneName
  zonePreviewName.value = zoneName

  // The selected zone behaves like a new page: render it first, then
  // move the user to the top so the zone header is immediately visible.
  await nextTick()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function closeZonePreview() {
  zonePreviewName.value = ''
  selectedSpecificZone.value = ''
}

function enterPreviewedZone() {
  const zoneName = zonePreviewName.value
  if (!zoneName) return

  let zone = zones.value.find(item => item.name.toLowerCase() === zoneName.toLowerCase())

  if (!zone) {
    const directoryZone = specificZones.find(item => item.name === zoneName)

    zone = {
      id: 1000 + (directoryZone?.id || Date.now()),
      name: zoneName,
      location: directoryZone?.location || zoneName + ', Tunisia',
      description: 'A local community space for people connected to this place.',
      members: 0,
      participants: 0,
      cover: selectedAreaImage.value,
      joined: false,
      goals: [],
      suggestions: [],
      officialRoles: [],
      officialMembers: [],
      elections: [],
      roleProposals: []
    }

    zones.value.push(zone)
  }

  zonePreviewName.value = ''
  selectedSpecificZone.value = ''
  openZone(zone)
  window.scrollTo({ top: 0, behavior: 'smooth' })
}


function setZoneTab(tab: string) {
  activeZoneTab.value = tab
}

/* =====================================================
   SOCIAL ACTIONS
   ===================================================== */

function toggleFollow(page: Page) {
  page.connected = !page.connected
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

function openCreateChoice(type: 'page' | 'call' = 'page') {
  createType.value = type
  showCreateChoice.value = true
}

function closeCreateChoice() {
  showCreateChoice.value = false
}

function createPage() {
  if (!newPageName.value.trim()) return

  const page: Page = {
    id: Date.now(),
    name: newPageName.value.trim(),
    handle: newPageHandle.value.trim() || '@' + newPageName.value.trim().toLowerCase().replace(/[^a-z0-9]+/g, ''),
    description: newPageDescription.value.trim() || 'A new Page created to bring people, ideas and action together.',
    followers: '0',
    avatar: newPageName.value.trim().slice(0, 2).toUpperCase(),
    color: '#5b8def',
    connected: true,
    category: newPageCategory.value,
    isMyNetwork: true
  }

  pages.value.unshift(page)
  pageSearch.value = ''
  pageCategory.value = 'All'

  newPageName.value = ''
  newPageHandle.value = ''
  newPageCategory.value = 'Community'
  newPageDescription.value = ''
  showCreateChoice.value = false
}

function createCall() {
  if (!newCallTitle.value.trim() || !newCallMessage.value.trim()) return

  const call: CommunityCall = {
    id: Date.now(),
    title: newCallTitle.value.trim(),
    launchedBy: 'You',
    handle: '@you',
    avatar: 'YO',
    category: 'COMMUNITY CALL',
    status: 'OPEN',
    time: 'Launched just now',
    headline: newCallMessage.value.trim(),
    description: 'An open call created to gather questions, ideas, connections and possible actions around one shared possibility.',
    participants: 1,
    ideas: 0,
    interactions: 0,
    location: newCallLocation.value.trim() || 'Open community space',
    followed: true,
    interactionsList: []
  }

  calls.value.unshift(call)

  newCallTitle.value = ''
  newCallMessage.value = ''
  newCallLocation.value = ''
  showCreateChoice.value = false
}


function openEntity(entity: Entity) {
  selectedEntity.value = entity
  activeView.value = 'entity'
  entityReviewText.value = entity.myReview
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function identifyEntity(entity: Entity) {
  entity.identified = !entity.identified
}

function createEntity() {
  if (newEntityType.value === 'PLACE' && !newEntityZone.value && selectedZone.value) {
    newEntityZone.value = selectedZone.value.name
  }
  if (!newEntityName.value.trim()) return

  const entity: Entity = {
    id: Date.now(),
    name: newEntityName.value.trim(),
    type: newEntityType.value,
    description: newEntityDescription.value.trim() || 'A new entity identified by the community.',
    location: newEntityLocation.value.trim() || 'Local area',
    zoneNames: newEntityZone.value ? [newEntityZone.value] : [],
    relatedPages: [],
    relatedCalls: [],
    identified: true,
    reviews: 0,
    rating: 0,
    myReview: ''
  }

  entities.value.unshift(entity)
  selectedEntity.value = entity

  newEntityName.value = ''
  newEntityType.value = 'PLACE'
  newEntityDescription.value = ''
  newEntityLocation.value = ''
  newEntityZone.value = ''
  showCreateEntity.value = false
  activeView.value = 'entity'
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function submitEntityReview() {
  if (!selectedEntity.value || !entityReviewText.value.trim()) return

  const wasEmpty = !selectedEntity.value.myReview
  selectedEntity.value.myReview = entityReviewText.value.trim()
  if (wasEmpty) selectedEntity.value.reviews++
  entityReviewText.value = selectedEntity.value.myReview
}

function attachEntityToZone(entity: Entity, zoneName: string) {
  if (!zoneName || entity.zoneNames.includes(zoneName)) return
  entity.zoneNames.push(zoneName)
}

function handleEntityZoneChange(entity: Entity | null, event: Event) {
  if (!entity) return
  const target = event.target as HTMLSelectElement | null
  attachEntityToZone(entity, target?.value || '')
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
  roleProposals: []

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
          <strong>COMMONS</strong>
          <small>PEOPLE • ACTIONS • VOICES</small>
        </div>
      </div>

      <nav class="main-nav">

        <button
          :class="{ active: activeView === 'home' }"
          @click="navigate('home')"
        >
          <span class="icon">⌂</span>
          Home
        </button>

        <button
          :class="{ active: activeView === 'discover' }"
          @click="navigate('discover')"
        >
          <span class="icon">◎</span>
          Live Network
        </button>

        <div class="sidebar-section-label">Impact</div>

<div class="impact-section-line"></div>

        <div class="sidebar-subnav zones-subnav">
          <div class="sidebar-zones-header">
            <button
              class="sidebar-zones-main"
              :class="{ active: ['zones', 'around-zones'].includes(activeView) }"
              type="button"
              @click="navigate('zones')"
            >
              <span class="icon">◉</span>
              <span class="subnav-section-label">Impact</span>
            </button>

            <button
              class="sidebar-zones-toggle"
              type="button"
              @click="showZonesSubnav = !showZonesSubnav"
              :aria-expanded="showZonesSubnav"
              aria-label="Toggle Zones submenu"
            >
              <span class="subnav-chevron">{{ showZonesSubnav ? '⌃' : '⌄' }}</span>
            </button>
          </div>

          <template v-if="showZonesSubnav">
            <div class="impact-subnav-line"><button
              :class="{ active: activeView === 'around-zones' }"
              @click="navigate('around-zones')"
            >
              <span class="subnav-dot"></span>
              Zones Around
            </button></div>
            <div class="impact-subnav-line"><button
              :class="{ active: activeView === 'my-zones' }"
              @click="navigate('my-zones')"
            >
              <span class="subnav-dot"></span>
              Your Zones
            </button></div>
          </template>
        </div>

        

        <div class="sidebar-section-label">Flow</div>

        <div class="sidebar-flow-header">
          <button
            class="sidebar-flow-main"
            :class="{ active: ['pages', 'initiatives', 'entities'].includes(activeView) }"
            type="button"
            @click="navigate('pages')"
          >
            <span class="icon">▣</span>
            <span class="subnav-section-label">More Commons</span>
          </button>

          <button
            class="sidebar-flow-toggle"
            type="button"
            @click="showCallsSubnav = !showCallsSubnav"
            :aria-expanded="showCallsSubnav"
            aria-label="Toggle Flow submenu"
          >
            <span class="subnav-chevron">{{ showCallsSubnav ? '⌃' : '⌄' }}</span>
          </button>
        </div>

        <div class="sidebar-subnav">

          <template v-if="showCallsSubnav">
            <button
              :class="{ active: activeView === 'initiatives' }"
              @click="navigate('initiatives')"
            >
              <span class="subnav-dot"></span>
              Initiatives
            </button>
            <button
              :class="{ active: activeView === 'entities' || activeView === 'entity' }"
              @click="navigate('entities')"
            >
              <span class="subnav-dot"></span>
              Entities
            </button>
            <button
              :class="{ active: activeView === 'pages' }"
              @click="navigate('pages')"
            >
              <span class="subnav-dot"></span>
              Pages
            </button>
          </template>
        </div>

      </nav>

      <div class="sidebar-zone">

        <div class="sidebar-label-switcher">
          <button
            class="sidebar-label-arrow"
            type="button"
            :aria-label="sidebarSpace === 'zones' ? 'Go to my connections' : sidebarSpace === 'networks' ? 'Go to my zones' : 'Go to my networks'"
            @click="sidebarSpace = sidebarSpace === 'zones' ? 'connections' : sidebarSpace === 'networks' ? 'zones' : 'networks'"
          >‹</button>

          <button
            class="sidebar-space-title"
            type="button"
            @click="sidebarSpace = sidebarSpace === 'zones' ? 'connections' : sidebarSpace === 'networks' ? 'zones' : 'networks'"
          >
            <span class="sidebar-label">
              {{ sidebarSpace === 'zones' ? 'MY ZONES' : sidebarSpace === 'networks' ? 'MY NETWORKS' : 'MY CONNECTIONS' }}
            </span>
            <small>
              {{ sidebarSpace === 'zones'
                ? 'Places you belong to'
                : sidebarSpace === 'networks'
                  ? 'Spaces you create'
                  : 'Everything connected to you' }}
            </small>
          </button>

          <button
            class="sidebar-label-arrow"
            type="button"
            :aria-label="sidebarSpace === 'zones' ? 'Go to my networks' : sidebarSpace === 'networks' ? 'Go to my connections' : 'Go to my zones'"
            @click="sidebarSpace = sidebarSpace === 'zones' ? 'networks' : sidebarSpace === 'networks' ? 'connections' : 'zones'"
          >›</button>
        </div>

        <template v-if="sidebarSpace === 'zones'">
          <div v-for="zone in zones.filter(z => z.joined)" :key="zone.id" class="mini-zone" @click="openZone(zone)">
            <span class="mini-dot"></span>
            {{ zone.name }}
          </div>

          <button class="create-zone-small" @click="showCreateZone = true">
            + Create zone
          </button>

          <div class="sidebar-space-hint">
            <strong>Keep exploring your places.</strong>
            <span>Next: build or discover the networks working around them.</span>
          </div>
        </template>

        <template v-else-if="sidebarSpace === 'networks'">
          <button v-for="page in myNetworks" :key="page.id" class="mini-zone mini-network" type="button" @click="openPage(page)">
            <span class="mini-dot network-dot"></span>
            {{ page.name }}
          </button>

          <div v-if="myNetworks.length === 0" class="sidebar-empty-small">
            You haven't created a network yet.
          </div>

          <button class="create-zone-small create-network-small" type="button" @click="openCreateChoice('page')">
            + Create a network
          </button>

          <div class="sidebar-space-hint">
            <strong>My Networks are yours to build.</strong>
            <span>Create an organisation, community or initiative and grow its connections.</span>
          </div>
        </template>

        <template v-else>
          <button
            v-for="connection in myConnections"
            :key="connection.id"
            class="mini-zone mini-network sidebar-connection"
            type="button"
            @click="connection.action()"
          >
            <span class="mini-dot connection-dot"></span>
            <span class="sidebar-connection-copy">
              <strong>{{ connection.label }}</strong>
              <small>{{ connection.type }}</small>
            </span>
          </button>

          <div v-if="myConnections.length === 0" class="sidebar-empty-small">
            Your connections will appear here as you follow, join and identify things.
          </div>

          <div class="sidebar-space-hint">
            <strong>See what your activity connects you to.</strong>
            <span>People, networks, Calls and places can gather here as your Commons grows.</span>
          </div>
        </template>

        <button
          class="sidebar-people-button"
          :class="{ active: ['people', 'administration'].includes(activeView) }"
          @click="navigate('people')"
        >
          <span class="icon">♧</span>
          People
        </button>

      </div>

      <div class="sidebar-bottom">

        <div class="profile-mini">
          <button
            class="create-sidebar-button"
            type="button"
            title="Create a Page or Call"
            aria-label="Create a Page or Call"
            @click="openCreateChoice()"
          >
            <span class="create-sidebar-icon">+</span>
            <span class="create-sidebar-label">Create</span>
          </button>

          <button
            class="profile-mini-main"
            type="button"
            @click="openPerson({ id: 0, name: 'You', username: '@you', avatar: 'YO', reason: 'Your profile', mutual: 0, followed: false })"
          >
            <span class="avatar blue">YO</span>
            <span>
              <strong>You</strong>
              <small>@you</small>
            </span>
          </button>

          <div class="profile-menu-wrap">
            <button
              class="dots profile-dots"
              type="button"
              aria-label="More account options"
              :aria-expanded="showAccountMenu"
              @click.stop="openAccountMenu"
            >•••</button>

            <div v-if="showAccountMenu" class="profile-menu" @click.stop>
              <button
                type="button"
                :class="{ active: activeView === 'administration' }"
                @click="openAdministration"
              >
                <span class="profile-menu-dot"></span>
                Administration
                <span class="admin-lock-mark">⌑</span>
              </button>
              <button
                type="button"
                :class="{ active: activeView === 'system-design' }"
                @click="openSystemDesign"
              >
                <span class="profile-menu-dot"></span>
                System Design
                <span class="admin-lock-mark">⌑</span>
              </button>
              <button
                type="button"
                :class="{ active: activeView === 'administration-systems' }"
                @click="openAdministrationSystems"
              >
                <span class="profile-menu-dot"></span>
                Systems
              </button>
              <div class="profile-menu-divider"></div>
              <button type="button" class="profile-menu-disconnect" @click="disconnect">
                <span class="profile-menu-dot"></span>
                Disconnect
              </button>
            </div>
          </div>
        </div>

      </div>

    </aside>

    
 <!-- MOBILE NAVIGATION -->
    <div class="mobile-navigation">

      <div v-if="['zones', 'around-zones'].includes(activeView)" class="mobile-context-nav">
        <button :class="{ active: activeView === 'zones' }" @click="navigate('zones')">My Zones</button>
        <button :class="{ active: activeView === 'around-zones' }" @click="navigate('around-zones')">Zones Around</button>
      </div>

      <div v-if="['pages', 'initiatives', 'entities', 'entity'].includes(activeView)" class="mobile-context-nav">
        <button :class="{ active: activeView === 'initiatives' }" @click="navigate('initiatives')">Initiatives</button>
        <button :class="{ active: ['entities', 'entity'].includes(activeView) }" @click="navigate('entities')">Entities</button>
      </div>

      <nav class="mobile-nav">
        <button :class="{ active: activeView === 'home' }" @click="navigate('home')">
          <span class="mobile-nav-icon">⌂</span>
          <span>Home</span>
        </button>
        <button :class="{ active: activeView === 'discover' }" @click="navigate('discover')">
          <span class="mobile-nav-icon">◎</span>
          <span>Commons</span>
        </button>
        <button :class="{ active: ['zones', 'around-zones'].includes(activeView) }" @click="navigate('zones')">
          <span class="mobile-nav-icon">◉</span>
          <span>Zones</span>
        </button>
        <button :class="{ active: ['pages', 'initiatives', 'entities', 'entity'].includes(activeView) }" @click="navigate('pages')">
          <span class="mobile-nav-icon">▣</span>
          <span>Calls &amp; Commons</span>
        </button>
        <button :class="{ active: activeView === 'people' }" @click="navigate('people')">
          <span class="mobile-nav-icon">♧</span>
          <span>People</span>
        </button>
      </nav>

    </div>


    <!-- MAIN -->
    <main class="main">

      <!-- TOP BAR -->
      <header class="topbar">

        <div class="mobile-brand">
          COMMON
        </div>

        <div class="search-box">
          <span>⌕</span>

          <input
            v-model="search"
            placeholder="Search people, pages, posts or zones..."
          />

          <kbd>⌘ K</kbd>
        </div>

        <div class="top-actions">
          <button class="top-icon" title="Notifications" aria-label="Notifications">◌</button>
          <button class="top-icon" title="Messages" aria-label="Messages">✉</button>
          <button
            class="top-icon events-icon"
            :class="{ active: activeView === 'my-events' }"
            title="My events"
            aria-label="My events"
            @click="navigate('my-events')"
          >
            ◷
          </button>

          <button
            class="primary-btn"
            @click="showCreatePost = true"
          >
            + 
          </button>
        </div>

      </header>

      <!-- =================================================
           MY EVENTS
           ================================================= -->
      <section v-if="activeView === 'my-events'" class="content my-events-content">
        <div class="section-heading">
          <span class="section-kicker">YOUR PARTICIPATION</span>
          <h1>My Events</h1>
          <p>Events and community calls you are participating in, all in one place.</p>
        </div>

        <div class="events-grid">
          <article v-for="event in participatingEvents" :key="event.id" class="event-card">
            <div class="event-card-top">
              <span class="event-type">{{ event.type }}</span>
              <span class="event-status">{{ event.status }}</span>
            </div>
            <h2>{{ event.title }}</h2>
            <div class="event-meta">
              <span>◷ {{ event.date }}</span>
              <span>⌖ {{ event.location }}</span>
            </div>
            <button class="event-open-btn" type="button">View event</button>
          </article>
        </div>
      </section>

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
            Customize feed →
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

                <button
                  class="avatar-button"
                  type="button"
                  @click="post.page ? openPageByName(post.page) : openPerson(people.find(person => person.name === post.author) || { name: post.author, username: post.handle, avatar: post.avatar, reason: 'From the Live Network', mutual: 0, followed: false })"
                >
                  <span class="avatar blue">{{ post.avatar }}</span>
                </button>

                <button
                  class="post-author post-author-button"
                  type="button"
                  @click="post.page ? openPageByName(post.page) : openPerson(people.find(person => person.name === post.author) || { name: post.author, username: post.handle, avatar: post.avatar, reason: 'From the Live Network', mutual: 0, followed: false })"
                >
                  <strong>{{ post.author }}</strong>
                  <span>
                    {{ post.handle }}
                    <i>•</i>
                    {{ post.time }}
                  </span>
                </button>

                <button class="more">•••</button>

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
                <span>◉</span>
                {{ post.zone }}
              </div>

              <div class="post-inspiration">
                <div class="post-inspiration-heading">
                  <span class="eyebrow">GET INSPIRED</span>
                  <strong>What could this become?</strong>
                </div>
                <div class="post-inspiration-grid">
                  <button
                    v-for="inspiration in getPostInspirations(post)"
                    :key="inspiration.label"
                    type="button"
                    class="post-inspiration-card"
                    @click="openCreateChoice('call')"
                  >
                    <span>{{ inspiration.label }}</span>
                    <strong>{{ inspiration.title }}</strong>
                    <small>{{ inspiration.text }}</small>
                  </button>
                </div>
              </div>

              <div class="post-actions">

                <button
                  :class="{ liked: post.liked }"
                  @click="likePost(post)"
                >
                  ♡ {{ post.likes }}
                </button>

                <button>
                  ◌ {{ post.comments }}
                </button>

                <button>
                  ↗ Share
                </button>

                <button class="save">
                  ♢
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

                <button>•••</button>
              </div>

              <div
                v-for="person in people.slice(0, 3)"
                :key="person.id"
                class="person-row"
              >

                <button
                  class="person-click-target"
                  type="button"
                  @click="openPerson(person)"
                >
                  <div class="avatar purple">{{ person.avatar }}</div>
                  <div class="person-info">
                    <strong>{{ person.name }}</strong>
                    <span>{{ person.reason }}</span>
                  </div>
                </button>

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
                Explore people →
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
                Enter zone →
              </button>

            </div>

          </aside>

        </div>

      </section>

      <!-- =================================================
           DISCOVER
           ================================================= -->
      <section v-if="activeView === 'discover'" class="content live-network-content">

        <div class="page-title live-network-title">
          <span class="eyebrow">LIVE NETWORK</span>
          <h1>What's happening across the network.</h1>
          <p>
            A live view of people joining, creating, participating, connecting and moving ideas
            into action across places and communities.
          </p>
        </div>

        <div class="live-network-filters">
          <button type="button" class="live-network-filter active">GLOBAL</button>
          <button type="button" class="live-network-filter">LOCAL</button>
          <span class="live-network-filter-separator"></span>
          <button type="button" class="live-network-filter">NORTH TUNISIA</button>
          <button type="button" class="live-network-filter">CENTRAL TUNISIA</button>
          <button type="button" class="live-network-filter">SOUTH TUNISIA</button>
          <button type="button" class="live-network-filter">TUNIS</button>
          <button type="button" class="live-network-filter">LA MARSA</button>
          <button type="button" class="live-network-filter">TUNIS NORTH</button>
        </div>

        <div class="live-network-layout">
          <div class="live-network-feed">

            <article class="live-network-event">
              <div class="live-network-event-icon">◉</div>
              <div class="live-network-event-body">
                <span class="live-network-event-type">ZONE</span>
                <p><strong>Amine Ben Salem</strong> joined <strong>Tunis North</strong>.</p>
                <small>2 min ago · 3 people joined this Zone today</small>
              </div>
            </article>

            <article class="live-network-event">
              <div class="live-network-event-icon">✦</div>
              <div class="live-network-event-body">
                <span class="live-network-event-type">INITIATIVE</span>
                <p><strong>Green Horizon</strong> started a new initiative for more green public spaces.</p>
                <small>5 min ago · Tunis North</small>
              </div>
            </article>

            <article class="live-network-event">
              <div class="live-network-event-icon">↗</div>
              <div class="live-network-event-body">
                <span class="live-network-event-type">PARTICIPATION</span>
                <p><strong>Sarra Mansour</strong> participated in the <strong>Cleaner Streets</strong> goal.</p>
                <small>8 min ago · 12 participants</small>
              </div>
            </article>

            <article class="live-network-event">
              <div class="live-network-event-icon">◎</div>
              <div class="live-network-event-body">
                <span class="live-network-event-type">CONNECTION</span>
                <p><strong>Youssef Trabelsi</strong> connected with people working on mobility.</p>
                <small>11 min ago · Sidi Bou Said</small>
              </div>
            </article>

            <article class="live-network-event">
              <div class="live-network-event-icon">＋</div>
              <div class="live-network-event-body">
                <span class="live-network-event-type">NEW ZONE</span>
                <p><strong>La Marsa Coast</strong> was created as a new local Zone.</p>
                <small>18 min ago · 14 people are exploring it</small>
              </div>
            </article>

            <article class="live-network-event">
              <div class="live-network-event-icon">♥</div>
              <div class="live-network-event-body">
                <span class="live-network-event-type">SUPPORT</span>
                <p><strong>Meriem Khalfallah</strong> supported an idea about community gardens.</p>
                <small>21 min ago · 7 supports</small>
              </div>
            </article>

            <article class="live-network-event">
              <div class="live-network-event-icon">☷</div>
              <div class="live-network-event-body">
                <span class="live-network-event-type">IDEA</span>
                <p><strong>Community Garden</strong> received a new suggestion from a Zone member.</p>
                <small>24 min ago · 4 people responded</small>
              </div>
            </article>

            <article class="live-network-event">
              <div class="live-network-event-icon">↔</div>
              <div class="live-network-event-body">
                <span class="live-network-event-type">FOLLOW</span>
                <p><strong>Tunis Community</strong> gained a new follower.</p>
                <small>27 min ago · 5 new connections today</small>
              </div>
            </article>

            <article class="live-network-event">
              <div class="live-network-event-icon">●</div>
              <div class="live-network-event-body">
                <span class="live-network-event-type">ENTITY</span>
                <p><strong>Central Park</strong> was identified by a member as a place connected to Tunis North.</p>
                <small>31 min ago · 2 related initiatives</small>
              </div>
            </article>

            <article class="live-network-event">
              <div class="live-network-event-icon">▣</div>
              <div class="live-network-event-body">
                <span class="live-network-event-type">PAGE</span>
                <p><strong>Future Makers</strong> published a new update for its community.</p>
                <small>36 min ago · 18 people viewed it</small>
              </div>
            </article>

            <article class="live-network-event">
              <div class="live-network-event-icon">✓</div>
              <div class="live-network-event-body">
                <span class="live-network-event-type">GOAL</span>
                <p><strong>More green public spaces</strong> moved from 60% to 62% participation.</p>
                <small>42 min ago · 6 new participants</small>
              </div>
            </article>

            <article class="live-network-event">
              <div class="live-network-event-icon">◌</div>
              <div class="live-network-event-body">
                <span class="live-network-event-type">DISCOVERY</span>
                <p><strong>Amine</strong> discovered a connection between a local business and a community initiative.</p>
                <small>48 min ago · Tunis North</small>
              </div>
            </article>

            <article class="live-network-event">
              <div class="live-network-event-icon">✎</div>
              <div class="live-network-event-body">
                <span class="live-network-event-type">POST</span>
                <p><strong>Sarra</strong> shared a new perspective about safer streets.</p>
                <small>54 min ago · 9 reactions</small>
              </div>
            </article>

            <article class="live-network-event">
              <div class="live-network-event-icon">⚑</div>
              <div class="live-network-event-body">
                <span class="live-network-event-type">CALL</span>
                <p><strong>Urban Mobility</strong> opened a Call for people interested in walking and cycling.</p>
                <small>1 hr ago · 8 people joined</small>
              </div>
            </article>

            <article class="live-network-event">
              <div class="live-network-event-icon">↳</div>
              <div class="live-network-event-body">
                <span class="live-network-event-type">JOIN</span>
                <p><strong>Youssef</strong> joined the Urban Mobility Call and became a participant.</p>
                <small>1 hr ago · La Marsa</small>
              </div>
            </article>

            <article class="live-network-event">
              <div class="live-network-event-icon">★</div>
              <div class="live-network-event-body">
                <span class="live-network-event-type">ACHIEVEMENT</span>
                <p><strong>Green Horizon</strong> documented an act that helped improve a shared public space.</p>
                <small>1 hr ago · 3 people recognized the act</small>
              </div>
            </article>

            <article class="live-network-event">
              <div class="live-network-event-icon">⌁</div>
              <div class="live-network-event-body">
                <span class="live-network-event-type">NETWORK</span>
                <p><strong>12 people</strong> are now connected through a shared interest in community gardens.</p>
                <small>1 hr ago · 3 Zones connected</small>
              </div>
            </article>

            <article class="live-network-event">
              <div class="live-network-event-icon">?</div>
              <div class="live-network-event-body">
                <span class="live-network-event-type">QUESTION</span>
                <p><strong>Meriem</strong> asked a question about how to make local participation easier.</p>
                <small>2 hrs ago · 6 responses</small>
              </div>
            </article>

          </div>

          <aside class="live-network-side">
            <div class="live-network-summary">
              <span class="eyebrow">RIGHT NOW</span>
              <strong>Everything is connected.</strong>
              <p>People, Zones, Pages, Initiatives, Goals, Ideas, Entities and Calls are moving through the network.</p>
              <div class="live-network-stats">
                <div>
                  <strong>28</strong>
                  <span>active explorers</span>
                  <span class="live-network-stat-detail stat-voices">28 voices</span>
                </div>
                <div>
                  <strong>16</strong>
                  <span>connected orbits</span>
                  <span class="live-network-stat-detail stat-explore">16 new things to be explored</span>
                </div>
                <div>
                  <strong>12</strong>
                  <span>new connections</span>
                  <span class="live-network-stat-detail stat-opportunities">12 opportunities for someone</span>
                </div>
                <div>
                  <strong>5</strong>
                  <span>active Calls</span>
                  <span class="live-network-stat-detail stat-needs">Someone right there needs us</span>
                </div>
              </div>
            </div>

            <div class="live-network-summary">
              <span class="eyebrow">FOLLOW THE FLOW</span>
              <p>Join a Zone, follow a Page, support an idea, answer a question, identify a place, participate in a goal or start something new.</p>
            </div>
          </aside>
        </div>

      </section>

      <!-- =================================================
           PEOPLE
           ================================================= -->
      
      <section v-if="activeView === 'person' && selectedPerson" class="content profile-page">
        <button class="ghost-btn back-inline" @click="navigate('people')">← Back to people</button>
        <div class="profile-hero-card">
          <div class="large-avatar purple">{{ selectedPerson.avatar }}</div>
          <div class="profile-hero-copy">
            <span class="eyebrow">PROFILE</span>
            <h1>{{ selectedPerson.name }}</h1>
            <p>{{ selectedPerson.username }} · {{ selectedPerson.reason }}</p>
            <div class="profile-actions">
              <button class="primary-btn" @click="togglePersonFollow(selectedPerson)">
                {{ selectedPerson.followed ? 'Following' : 'Follow' }}
              </button>
              <button class="ghost-btn" @click="navigate('home')">Back to Live Network</button>
            </div>
          </div>
        </div>
        <div class="profile-section-card">
          <span class="eyebrow">CONNECTED THROUGH</span>
          <h2>How this profile connects to the Commons</h2>
          <p>{{ selectedPerson.reason }}. Explore their conversations, Pages, Calls and Zones from anywhere in the network.</p>
        </div>
      </section>

<!-- LIVE ENGAGEMENT: PEOPLE ARE TALKING -->
      <section v-if="activeView === 'live-people'" class="content live-engagement-content">
        <div class="live-engagement-back"><button type="button" class="ghost-btn" @click="navigate('around-zones')">← Back to Zones Around</button></div>
        <div class="live-engagement-hero">
          <div>
            <span class="eyebrow">PEOPLE ARE TALKING · LIVE</span>
            <h1>Join a conversation<br /><span>already happening.</span></h1>
            <p>Start with a real question, see who is here, and add your voice. This is where local curiosity becomes connection.</p>
          </div>
          <div class="live-engagement-signal"><span class="live-signal-dot"></span><strong>18 people here</strong><small>6 new messages</small></div>
        </div>
        <div class="live-engagement-grid">
          <article class="live-conversation-card">
            <div class="live-card-top"><span class="eyebrow">TUNIS NORTH · CONVERSATION</span><span class="live-card-status">ACTIVE NOW</span></div>
            <h2>How can we create more green spaces around Tunis North?</h2>
            <p>People are sharing places that need attention, ideas for community gardens and ways to involve nearby residents.</p>
            <div class="conversation-preview">
              <div class="conversation-message"><span class="conversation-avatar">AS</span><div><strong>Amine</strong><p>There is an unused corner near the school that could become a small garden.</p><small>2 min ago</small></div></div>
              <div class="conversation-message"><span class="conversation-avatar purple">LM</span><div><strong>Leila</strong><p>I know three people nearby who would help organize the first meeting.</p><small>just now</small></div></div>
            </div>
            <div class="live-card-actions"><button type="button" class="primary-btn" @click="navigate('people')">JOIN CONVERSATION</button><button type="button" class="ghost-btn" @click="navigate('zones')">OPEN TUNIS NORTH</button></div>
          </article>
          <aside class="live-context-card">
            <span class="eyebrow">CONNECTED CONTEXT</span>
            <div class="live-context-row"><span>ZONE</span><strong>Tunis North</strong></div>
            <div class="live-context-row"><span>INTEREST</span><strong>Urban nature</strong></div>
            <div class="live-context-row"><span>IDEA</span><strong>Community gardens</strong></div>
            <div class="live-context-row"><span>PEOPLE</span><strong>18 participating</strong></div>
          </aside>
        </div>
      </section>

      <!-- LIVE ENGAGEMENT: A NEW ACTION IS FORMING -->
      <section v-if="activeView === 'live-action'" class="content live-engagement-content">
        <div class="live-engagement-back"><button type="button" class="ghost-btn" @click="navigate('around-zones')">← Back to Zones Around</button></div>
        <div class="live-engagement-hero">
          <div>
            <span class="eyebrow">A NEW ACTION IS FORMING</span>
            <h1>Explore something<br /><span>becoming possible.</span></h1>
            <p>This is not a finished initiative yet. People are gathering around an idea and discovering what could happen next.</p>
          </div>
          <div class="live-engagement-signal action-signal"><strong>7 interested</strong><small>3 ideas · looking for participants</small></div>
        </div>
        <article class="forming-action-card">
          <div class="forming-action-main">
            <span class="eyebrow">EMERGING ACTION · TUNIS NORTH</span>
            <h2>Create a community garden</h2>
            <p>Explore the possibility of turning an underused local space into a shared garden where residents can grow, learn and meet.</p>
            <div class="action-path"><span>IDEA</span><i>→</i><span>PEOPLE</span><i>→</i><span>ZONE</span><i>→</i><span>ACTION</span></div>
            <div class="live-card-actions"><button type="button" class="primary-btn" @click="navigate('initiatives')">EXPLORE INITIATIVES</button><button type="button" class="ghost-btn" @click="navigate('people')">FIND PEOPLE</button></div>
          </div>
          <div class="forming-action-side"><div><strong>7</strong><span>people interested</span></div><div><strong>3</strong><span>ideas proposed</span></div><div><strong>1</strong><span>Zone connected</span></div><button type="button" class="follow-btn" @click="navigate('initiatives')">PARTICIPATE →</button></div>
        </article>
      </section>

      <!-- LIVE ENGAGEMENT: THE NETWORK IS MOVING -->
      <section v-if="activeView === 'live-flow'" class="content live-engagement-content">
        <div class="live-engagement-back"><button type="button" class="ghost-btn" @click="navigate('around-zones')">← Back to Zones Around</button></div>
        <div class="live-engagement-hero">
          <div>
            <span class="eyebrow">THE NETWORK IS MOVING</span>
            <h1>See how people, ideas<br /><span>and Zones connect.</span></h1>
            <p>Follow movement across the Commons: a question becomes an idea, an idea attracts people, and participation changes a Zone.</p>
          </div>
          <div class="live-engagement-signal flow-signal"><strong>4 new connections</strong><small>2 ideas · 1 action gaining participants</small></div>
        </div>
        <div class="network-flow-stage">
          <div class="flow-column"><span class="flow-label">PEOPLE</span><div class="flow-node">Amine</div><div class="flow-node">Leila</div><div class="flow-node">Nour</div></div>
          <div class="flow-arrow">→</div>
          <div class="flow-column"><span class="flow-label">INTEREST</span><div class="flow-node">Urban nature</div><div class="flow-node">Clean streets</div></div>
          <div class="flow-arrow">→</div>
          <div class="flow-column"><span class="flow-label">IDEA</span><div class="flow-node highlighted">Community garden</div><div class="flow-node">Local clean-up</div></div>
          <div class="flow-arrow">→</div>
          <div class="flow-column"><span class="flow-label">ZONE</span><div class="flow-node highlighted">Tunis North</div></div>
          <div class="flow-arrow">→</div>
          <div class="flow-column"><span class="flow-label">ACTION</span><div class="flow-node highlighted">Garden forming</div><div class="flow-node">People joining</div></div>
        </div>
        <div class="flow-footer"><div><span>PARTICIPATION</span><strong>12 people connected to these actions</strong></div><div><span>WHAT HAPPENS NEXT</span><strong>Experience → Inspiration → new possibility</strong></div></div>
      </section>

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
              <span>✦</span>
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



      <section v-if="activeView === 'disconnected'" class="content disconnected-content">
        <div class="game-over-card">
          <div class="game-over-smiley" aria-hidden="true">🙂</div>
          <span class="eyebrow">SESSION ENDED</span>
          <h1>GAME OVER</h1>
          <p>You have disconnected from COMMON.</p>
          <button class="primary-btn" type="button" @click="navigate('home')">Return to COMMON</button>
        </div>
      </section>

      <section v-if="activeView === 'system-design'" class="content administration-content">

        <div v-if="!systemDesignUnlocked" class="administration-lock-card">
          <div class="admin-lock-orbit" aria-hidden="true">⌑</div>
          <span class="eyebrow">RESTRICTED ARCHITECTURE</span>
          <h1>System Design</h1>
          <p>Build and evolve the platform architecture by combining reusable elements, relationships, processes and events.</p>

          <form class="admin-password-form" @submit.prevent="unlockSystemDesign">
            <label for="system-design-password">System Design password</label>
            <input
              id="system-design-password"
              v-model="systemDesignPassword"
              type="password"
              autocomplete="off"
              placeholder="Enter password"
            />
            <span v-if="systemDesignPasswordError" class="admin-password-error">Incorrect password.</span>
            <button class="primary-btn" type="submit">Unlock System Design</button>
          </form>
        </div>

        <template v-else>
          <div class="administration-header system-design-header">
            <div>
              <span class="eyebrow">PLATFORM ARCHITECTURE</span>
              <h1>System Design</h1>
              <p>Start with an existing system, inspect its building blocks, then reuse or duplicate elements to create new systems.</p>
            </div>
            <button class="ghost-btn" type="button" @click="lockSystemDesign">Lock</button>
          </div>

          <div class="design-create-system">
            <div>
              <span class="eyebrow">CREATE SYSTEM</span>
              <strong>Build a new functional system</strong>
            </div>
            <input v-model="newDesignSystemName" placeholder="System name" />
            <input v-model="newDesignSystemPurpose" placeholder="Purpose (optional)" />
            <button class="primary-btn" type="button" @click="createDesignSystem">Create System</button>
          </div>

          <div class="design-tabs">
            <button
              v-for="tab in [
                { id: 'systems', label: 'Systems' },
                { id: 'elements', label: 'Elements' },
                { id: 'relationships', label: 'Relationships' },
                { id: 'processes', label: 'Processes' },
                { id: 'events', label: 'Events & Triggers' }
              ]"
              :key="tab.id"
              type="button"
              :class="{ active: designMode === tab.id }"
              @click="setDesignMode(tab.id)"
            >
              {{ tab.label }}
            </button>
          </div>

          <div v-if="designMode === 'systems'" class="design-system-browser">
            <div class="design-library-panel">
              <div class="design-library-head">
                <div>
                  <span class="eyebrow">EXISTING SYSTEMS</span>
                  <h2>Choose a system</h2>
                </div>
              </div>

              <button
                v-for="system in adminSystems"
                :key="system.id"
                type="button"
                class="design-system-card"
                :class="{ active: selectedDesignSystem === system.id }"
                @click="selectedDesignSystem = system.id"
              >
                <span class="design-node-icon">◇</span>
                <span>
                  <strong>{{ system.name }}</strong>
                  <small>{{ (systemDesignItems[system.id] || []).length }} design nodes</small>
                </span>
                <b>→</b>
              </button>
            </div>

            <div class="design-system-summary">
              <template v-if="selectedDesignSystem">
                <span class="eyebrow">SELECTED SYSTEM</span>
                <template v-for="system in adminSystems" :key="system.id">
                  <div v-if="system.id === selectedDesignSystem">
                    <h2>{{ system.name }}</h2>
                    <p>{{ system.purpose }}</p>
                    <div class="design-summary-stats">
                      <span>{{ (systemDesignItems[system.id] || []).length }} nodes</span>
                      <span>{{ system.contains.length }} defined elements</span>
                      <span>{{ system.connections.length }} connections</span>
                    </div>
                    <button class="primary-btn" type="button" @click="designMode = 'elements'">Open Designer →</button>
                  </div>
                </template>
              </template>
            </div>
          </div>

          <div v-else class="system-designer">
            <div class="design-library-panel">
              <div class="design-library-head">
                <div>
                  <span class="eyebrow">{{ designKindLabel(designMode === 'events' ? 'event' : designMode === 'relationships' ? 'relationship' : designMode === 'processes' ? 'process' : 'element') }}</span>
                  <h2>Architecture Library</h2>
                </div>
              </div>

              <input v-model="designSearch" class="design-search" placeholder="Search architecture..." />

              <div class="design-library-list">
                <div
                  v-for="item in catalogForKind(
                    designMode === 'events'
                      ? 'event'
                      : designMode === 'relationships'
                        ? 'relationship'
                        : designMode === 'processes'
                          ? 'process'
                          : 'element'
                  ).filter(item => !designSearch || (item.name + ' ' + item.description + ' ' + item.category).toLowerCase().includes(designSearch.toLowerCase()))"
                  :key="item.id"
                  class="design-library-item"
                  draggable="true"
                  @dragstart="draggedDesignNode = {
                    kind: designMode === 'events'
                      ? 'event'
                      : designMode === 'relationships'
                        ? 'relationship'
                        : designMode === 'processes'
                          ? 'process'
                          : 'element',
                    id: item.id
                  }"
                >
                  <div class="design-library-copy">
                    <span class="design-category">{{ item.category }}</span>
                    <strong>{{ item.name }}</strong>
                    <small>{{ item.description }}</small>
                  </div>
                  <div class="design-library-actions">
                    <button type="button" title="Add to selected system" @click="addDesignNode(
                      designMode === 'events' ? 'event' : designMode === 'relationships' ? 'relationship' : designMode === 'processes' ? 'process' : 'element',
                      item.id
                    )">+</button>
                    <button type="button" title="Create a new system from this" @click="createSystemFromCatalog(
                      designMode === 'events' ? 'event' : designMode === 'relationships' ? 'relationship' : designMode === 'processes' ? 'process' : 'element',
                      item.id
                    )">◇</button>
                  </div>
                </div>
              </div>
            </div>

            <div class="design-canvas-panel">
              <div class="design-canvas-head">
                <div>
                  <span class="eyebrow">SYSTEM CANVAS</span>
                  <h2>{{ adminSystems.find(system => system.id === selectedDesignSystem)?.name || 'Select a system' }}</h2>
                </div>
                <button class="ghost-btn small" type="button" @click="designMode = 'systems'">Systems</button>
              </div>

              <div
                class="design-dropzone"
                :class="{ empty: !(selectedDesignSystem && (systemDesignItems[selectedDesignSystem] || []).length) }"
                @dragover.prevent
                @drop.prevent="handleDesignDrop"
              >
                <div v-if="!selectedDesignSystem" class="design-canvas-empty">
                  <strong>Select a system</strong>
                  <span>Choose a system before adding architecture nodes.</span>
                </div>

                <div v-else-if="!(systemDesignItems[selectedDesignSystem] || []).length" class="design-canvas-empty">
                  <strong>Empty system canvas</strong>
                  <span>Drag an item here or use + in the library to add it.</span>
                </div>

                <div v-else class="design-node-grid">
                  <article
                    v-for="item in systemDesignItems[selectedDesignSystem]"
                    :key="item.instanceId"
                    class="design-node-card"
                  >
                    <div class="design-node-top">
                      <span>{{ designKindLabel(item.kind) }}</span>
                      <div>
                        <button type="button" title="Duplicate" @click="duplicateDesignNode(item.instanceId)">⧉</button>
                        <button type="button" title="Remove" @click="removeDesignNode(item.instanceId)">×</button>
                      </div>
                    </div>
                    <strong>{{ designItemName(item) }}</strong>
                    <small>{{ designItemDescription(item) }}</small>
                    <button class="design-node-system-btn" type="button" @click="createSystemFromCatalog(item.kind, item.catalogId)">
                      Create system from this
                    </button>
                  </article>
                </div>
              </div>

              <div class="design-architecture-note">
                <span>REUSABLE ARCHITECTURE</span>
                <p>An element can exist in multiple systems. Duplicate it when a system needs another instance without removing the original from the library.</p>
              </div>
            </div>
          </div>
        </template>
      </section>

      <section v-if="activeView === 'administration-systems'" class="content administration-content">

        <template v-if="administrationUnlocked">
        <div class="administration-header">
          <div>
            <span class="eyebrow">SYSTEM ARCHITECTURE</span>
            <h1>Systems</h1>
            <p>See what each functional system contains, how its parts connect, and what makes the system actually work.</p>
          </div>
          <button class="ghost-btn" type="button" @click="openAdministration">Elements</button>
        </div>

        <div class="admin-overview">
          <div class="admin-overview-card"><span>SYSTEMS</span><strong>{{ adminSystems.length }}</strong><small>Functional platform systems</small></div>
          <div class="admin-overview-card"><span>PARTS</span><strong>{{ adminSystems.reduce((total, system) => total + system.functionalParts.length, 0) }}</strong><small>Functional building blocks</small></div>
          <div class="admin-overview-card"><span>MISSING</span><strong>{{ adminSystems.reduce((total, system) => total + system.missing.length, 0) }}</strong><small>Pieces still to build</small></div>
        </div>

        <div class="admin-workspace">
          <div class="admin-elements-panel">
            <div class="admin-panel-heading">
              <span class="eyebrow">FUNCTIONAL SYSTEMS</span>
              <h2>Systems</h2>
            </div>

            <button
              v-for="system in adminSystems"
              :key="system.id"
              type="button"
              class="admin-element-folder"
              :class="{ active: selectedAdminSystem === system.id }"
              @click="selectedAdminSystem = system.id"
            >
              <span class="admin-folder-icon">◇</span>
              <span class="admin-folder-copy">
                <strong>{{ system.name }}</strong>
                <small>{{ system.contains.length }} elements · {{ system.connections.length }} connections</small>
              </span>
              <span class="admin-folder-arrow">→</span>
            </button>
          </div>

          <div class="admin-detail-panel">
            <template v-if="selectedAdminSystem">
              <template v-for="system in adminSystems" :key="system.id">
                <div v-if="system.id === selectedAdminSystem" class="admin-element-detail">
                  <span class="eyebrow">FUNCTIONAL SYSTEM</span>
                  <div class="admin-detail-title">
                    <div>
                      <h2>{{ system.name }}</h2>
                      <p>{{ system.purpose }}</p>
                    </div>
                    <span class="admin-status">DEFINED</span>
                  </div>

                  <div class="admin-system-grid">
                    <div class="admin-system-block">
                      <span class="eyebrow">WHAT IT CONTAINS</span>
                      <div class="admin-chip-list">
                        <span v-for="item in system.contains" :key="item" class="admin-chip connected">{{ item }}</span>
                      </div>
                    </div>

                    <div class="admin-system-block">
                      <span class="eyebrow">CONNECTIONS</span>
                      <div class="admin-chip-list">
                        <span v-for="connection in system.connections" :key="connection" class="admin-chip connected">↔ {{ connection }}</span>
                      </div>
                    </div>
                  </div>

                  <div class="admin-detail-section">
                    <span class="eyebrow">WHAT MAKES IT FUNCTIONAL</span>
                    <div class="admin-function-list">
                      <div v-for="(part, index) in system.functionalParts" :key="part" class="admin-function-item">
                        <span>{{ String(index + 1).padStart(2, '0') }}</span>
                        <strong>{{ part }}</strong>
                      </div>
                    </div>
                  </div>

                  <div class="admin-detail-section">
                    <span class="eyebrow">MISSING / TO BUILD</span>
                    <div class="admin-missing-list">
                      <div v-for="item in system.missing" :key="item" class="admin-missing-item">
                        <span>!</span>
                        <strong>{{ item }}</strong>
                      </div>
                    </div>
                  </div>
                </div>
              </template>
            </template>

            <div v-else class="admin-detail-empty">
              <div class="admin-empty-orbit">SYSTEM</div>
              <span class="eyebrow">SELECT A SYSTEM</span>
              <h2>Open a system to inspect how it works.</h2>
              <p>Start with Calls, Zones, People, Content, Events or Notifications and trace the pieces that make the system functional.</p>
            </div>
          </div>
        </div>
        </template>

        <div v-else class="administration-lock-card">
          <div class="admin-lock-orbit" aria-hidden="true">⌑</div>
          <span class="eyebrow">RESTRICTED AREA</span>
          <h1>Administration Systems</h1>
          <p>Systems contains the functional architecture of COMMON. Enter the Administration password to inspect how systems are built and what is still missing.</p>
          <form class="admin-password-form" @submit.prevent="unlockAdministration">
            <label for="systems-admin-password">Administration password</label>
            <input id="systems-admin-password" v-model="administrationPassword" type="password" autocomplete="current-password" placeholder="Enter password" />
            <span v-if="administrationPasswordError" class="admin-password-error">Incorrect password.</span>
            <button class="primary-btn" type="submit">Unlock Systems</button>
          </form>
        </div>
      </section>

      <section v-if="activeView === 'administration'" class="content administration-content">

        <div v-if="!administrationUnlocked" class="administration-lock-card">
          <div class="admin-lock-orbit" aria-hidden="true">⌑</div>
          <span class="eyebrow">RESTRICTED AREA</span>
          <h1>Administration</h1>
          <p>This space contains the internal structure of the Commons: elements, connections and what is still missing.</p>

          <form class="admin-password-form" @submit.prevent="unlockAdministration">
            <label for="admin-password">Administration password</label>
            <input id="admin-password" v-model="administrationPassword" type="password" inputmode="numeric" autocomplete="off" placeholder="Enter password" />
            <span v-if="administrationPasswordError" class="admin-password-error">Incorrect password.</span>
            <button class="primary-btn" type="submit">Enter Administration</button>
          </form>
        </div>

        <template v-else>
          <div class="administration-header">
            <div>
              <span class="eyebrow">SYSTEM ARCHITECTURE</span>
              <h1>Administration</h1>
              <p>Inspect every platform element, follow its connections and identify what still needs to be built.</p>
            </div>
            <button class="ghost-btn" type="button" @click="lockAdministration">Lock</button>
          </div>

          <div class="admin-overview">
            <div class="admin-overview-card"><span>ELEMENTS</span><strong>{{ adminElements.length }}</strong><small>Platform building blocks</small></div>
            <div class="admin-overview-card"><span>CONNECTIONS</span><strong>{{ adminElements.reduce((total, element) => total + element.connections.length, 0) }}</strong><small>Known relationships</small></div>
            <div class="admin-overview-card"><span>MISSING</span><strong>{{ adminElements.reduce((total, element) => total + element.missing.length, 0) }}</strong><small>Things to build or connect</small></div>
          </div>

          <div class="admin-workspace">
            <div class="admin-elements-panel">
              <div class="admin-panel-heading"><span class="eyebrow">PLATFORM ELEMENTS</span><h2>Folders</h2></div>
              <button v-for="element in adminElements" :key="element.id" type="button" class="admin-element-folder" :class="{ active: selectedAdminElement === element.id }" @click="selectedAdminElement = element.id">
                <span class="admin-folder-icon">□</span>
                <span class="admin-folder-copy"><strong>{{ element.name }}</strong><small>{{ element.category }} · {{ element.connections.length }} connections</small></span>
                <span class="admin-folder-arrow">→</span>
              </button>
            </div>

            <div class="admin-detail-panel">
              <template v-if="selectedAdminElement">
                <template v-for="element in adminElements" :key="element.id">
                  <div v-if="element.id === selectedAdminElement" class="admin-element-detail">
                    <span class="eyebrow">{{ element.category }}</span>
                    <div class="admin-detail-title">
                      <div><h2>{{ element.name }}</h2><p>{{ element.description }}</p></div>
                      <span class="admin-status">IN SYSTEM</span>
                    </div>

                    <div class="admin-detail-section">
                      <span class="eyebrow">CONNECTIONS</span>
                      <div class="admin-chip-list">
                        <span v-for="connection in element.connections" :key="connection" class="admin-chip connected">✓ {{ connection }}</span>
                      </div>
                    </div>

                    <div class="admin-detail-section">
                      <span class="eyebrow">MISSING / TO BUILD</span>
                      <div class="admin-missing-list">
                        <div v-for="item in element.missing" :key="item" class="admin-missing-item"><span>!</span><strong>{{ item }}</strong></div>
                      </div>
                    </div>

                    <div class="admin-detail-note">
                      <strong>Architecture idea</strong>
                      <span>Use this element as the starting point to trace what it triggers, what depends on it and which connections still need implementation.</span>
                    </div>
                  </div>
                </template>
              </template>

              <div v-else class="admin-detail-empty">
                <div class="admin-empty-orbit">COMMONS</div>
                <span class="eyebrow">SELECT AN ELEMENT</span>
                <h2>Open a folder to inspect it.</h2>
                <p>Start from an element such as Community Call or Notification, then follow its connections and missing pieces.</p>
              </div>
            </div>
          </div>
        </template>
      </section>

      <section v-if="activeView === 'around-zones'" class="content contextual-rail-content">
        <aside class="people-context-space" aria-label="People around you">
          <div class="people-context-header">
            <span class="eyebrow">AROUND YOU</span>
            <strong>People</strong>
            <small>Live conversations nearby</small>
          </div>

          <div class="people-context-chat">
            <article class="people-context-message">
              <div class="people-context-avatar">A</div>
              <div>
                <strong>Amine</strong>
                <p>Looking for people interested in greener streets.</p>
                <small>Tunis North · now</small>
              </div>
            </article>

            <article class="people-context-message">
              <div class="people-context-avatar">S</div>
              <div>
                <strong>Sarra</strong>
                <p>Anyone working on safer walking routes?</p>
                <small>La Marsa · 2m</small>
              </div>
            </article>

            <article class="people-context-message">
              <div class="people-context-avatar">Y</div>
              <div>
                <strong>Youssef</strong>
                <p>Just joined a local mobility discussion.</p>
                <small>Tunis · 5m</small>
              </div>
            </article>
          </div>

          <button type="button" class="people-context-open" @click="navigate('people')">
            SEE PEOPLE AROUND
            <span>→</span>
          </button>
        </aside>

        <aside class="impact-space-rail contextual-space-rail" aria-label="Zones Around context">
          <span class="impact-space-rail-label">ZONES AROUND</span>
          <div class="context-rail-metric"><strong>{{ zones.filter(zone => !zone.joined).length }}</strong><span>nearby zones</span></div>
          <div class="context-rail-metric"><strong>{{ zones.filter(zone => !zone.joined).reduce((total, zone) => total + zone.members, 0) }}</strong><span>people nearby</span></div>
          <div class="context-rail-metric"><strong>{{ zones.filter(zone => !zone.joined).reduce((total, zone) => total + zone.goals.length, 0) }}</strong><span>active goals</span></div>
          <span class="impact-space-rail-line"></span>
          <span class="context-rail-flow-label">WHAT'S HAPPENING</span>
          <div class="context-rail-flow"><span>•</span><p>New people are joining local Zones.</p></div>
          <div class="context-rail-flow"><span>•</span><p>Goals are looking for participation.</p></div>
          <div class="context-rail-flow"><span>•</span><p>Places and entities are being discovered.</p></div>
        </aside>

        <div class="commons-hero compact-section-hero">
          <div class="commons-hero-copy">
            <div class="zones-around-live-header">
              <span class="zones-around-network-icon" aria-hidden="true">
                <span class="network-core"></span>
                <span class="network-zone zone-a"></span>
                <span class="network-zone zone-b"></span>
                <span class="network-zone zone-c"></span>
                <span class="network-link link-a"></span>
                <span class="network-link link-b"></span>
                <span class="network-link link-c"></span>
              </span>
              <span class="eyebrow">ZONES AROUND</span>
              <span class="zones-around-live-dot">LIVE</span>
              <button
                type="button"
                class="zones-around-whats-going-on"
                :class="{ active: showWhatsGoingOn }"
                @click="showWhatsGoingOn = !showWhatsGoingOn"
              >
                WHAT'S GOING ON?
                <span>{{ showWhatsGoingOn ? '⌃' : '↗' }}</span>
              </button>
            </div>

            <div v-if="showWhatsGoingOn" class="zones-around-live-panel">
              <div class="zones-around-live-panel-title">
                <span>RIGHT NOW</span>
                <small>things you can join</small>
              </div>
              <button type="button" class="zones-around-live-item" @click="openLiveEngagement('people')">
                <span class="live-item-dot"></span>
                <span><strong>People are talking</strong><small>Local conversations are starting around you.</small></span>
                <b>JOIN →</b>
              </button>
              <button type="button" class="zones-around-live-item" @click="openLiveEngagement('action')">
                <span class="live-item-dot"></span>
                <span><strong>A new action is forming</strong><small>People are looking for others to participate.</small></span>
                <b>EXPLORE →</b>
              </button>
              <button type="button" class="zones-around-live-item" @click="openLiveEngagement('flow')">
                <span class="live-item-dot"></span>
                <span><strong>The network is moving</strong><small>See what people are joining, creating and connecting.</small></span>
                <b>SEE FLOW →</b>
              </button>
            </div>

            <h1>Discover Zones<br /><span>around your network.</span></h1>
            <p>
              Explore Zones beyond the ones you have joined and discover the people,
              places and activity connected to them.
            </p>
            <div class="commons-hero-actions">
              <button class="ghost-btn" @click="navigate('zones')">← My Zones</button>
            </div>
          </div>
        </div>

        <div class="zone-around-grid">
          <article v-for="zone in zones.filter(zone => !zone.joined)" :key="zone.id" class="zone-around-card">
            <div class="zone-around-top">
              <span class="eyebrow">ZONE</span>
              <span>{{ zone.members }} members</span>
            </div>
            <h3>{{ zone.name }}</h3>
            <p>{{ zone.description }}</p>
            <div class="zone-around-meta">
              <span>◉ {{ zone.participants }} participants</span>
              <button class="follow-btn" @click="participate(zone)">Join Zone</button>
            </div>
          </article>
        </div>
      </section>

      <!-- =================================================
           PAGES & COMMONS
           ================================================= -->

      <section v-if="activeView === 'initiatives'" class="content pages-commons-page">
        <div class="commons-hero compact-section-hero">
          <div class="commons-hero-copy">
            <span class="eyebrow">INITIATIVES</span>
            <h1>Existing action<br /><span>around your Zones.</span></h1>
            <p>
              Discover initiatives already happening around the Zones, Calls and communities
              connected to you.
            </p>
            <div class="commons-hero-actions">
              <button class="ghost-btn" @click="navigate('pages')">← Calls & Commons</button>
            </div>
          </div>
        </div>

        <div class="initiative-grid">
          <article v-for="initiative in zonePreviewInitiatives" :key="initiative.id" class="entity-card">
            <div class="entity-card-top">
              <span class="entity-type">{{ initiative.topic }}</span>
              <span class="entity-detection">{{ initiative.status }}</span>
            </div>
            <h3>{{ initiative.title }}</h3>
            <p>{{ initiative.description }}</p>
            <div class="entity-card-footer">
              <span>LOCAL INITIATIVE</span>
              <button class="follow-btn" @click="navigate('pages')">Explore</button>
            </div>
          </article>
        </div>

        <div v-if="zonePreviewInitiatives.length === 0" class="empty-state page-empty">
          Join a Zone to discover initiatives connected to your local context.
        </div>
      </section>

      <section v-if="activeView === 'entities'" class="content pages-commons-page">
        <div class="commons-hero compact-section-hero">
          <div class="commons-hero-copy">
            <span class="eyebrow">ENTITIES</span>
            <h1>Identify what exists<br /><span>around your network.</span></h1>
            <p>
              Organizations, businesses, services, landmarks and initiatives
              connected to your Zones, Calls and Pages.
            </p>
            <div class="commons-hero-actions">
              <button class="primary-btn" @click="showCreateEntity = true">+ Create Entity</button>
              <button class="ghost-btn" @click="navigate('pages')">← Calls & Commons</button>
            </div>
          </div>
        </div>

        <div class="entity-grid">
          <article v-for="entity in detectedEntities.filter(entity => entity.type !== 'PLACE')" :key="entity.id" class="entity-card">
            <div class="entity-card-top">
              <span class="entity-type">{{ entity.type }}</span>
              <span class="entity-detection">✦ {{ entity.reason }}</span>
            </div>
            <button class="entity-main" type="button" @click="openEntity(entity)">
              <span class="entity-mark">{{ entity.name.slice(0, 2).toUpperCase() }}</span>
              <span>
                <strong>{{ entity.name }}</strong>
                <small>{{ entity.location }}</small>
              </span>
            </button>
            <p>{{ entity.description }}</p>
            <div class="entity-zone-list">
              <span v-for="zoneName in entity.zoneNames" :key="zoneName" class="entity-zone-chip">◉ {{ zoneName }}</span>
            </div>
            <div class="entity-card-footer">
              <span>★ {{ entity.rating ? entity.rating.toFixed(1) : '—' }} · {{ entity.reviews }} reviews</span>
              <button class="follow-btn" :class="{ following: entity.identified }" @click="identifyEntity(entity)">
                {{ entity.identified ? 'Identified' : 'Identify' }}
              </button>
            </div>
          </article>
        </div>

        <div v-if="detectedEntities.length === 0" class="empty-state page-empty">
          No connected entities yet. Join a Zone or follow a Call to start discovering them.
        </div>
      </section>

      <section v-if="activeView === 'entity' && selectedEntity" class="content profile-page entity-profile-page">
        <button class="ghost-btn back-inline" @click="navigate('pages')">← Back to Pages & Commons</button>

        <div class="entity-profile-hero">
          <div class="entity-profile-mark">{{ selectedEntity.name.slice(0, 2).toUpperCase() }}</div>
          <div class="profile-hero-copy">
            <span class="eyebrow">{{ selectedEntity.type }} · IDENTIFIED ENTITY</span>
            <h1>{{ selectedEntity.name }}</h1>
            <p>{{ selectedEntity.location }}</p>
            <p>{{ selectedEntity.description }}</p>
            <div class="profile-actions">
              <button class="primary-btn" @click="identifyEntity(selectedEntity)">
                {{ selectedEntity.identified ? 'Identified' : 'Identify this entity' }}
              </button>
              <button class="ghost-btn" @click="navigate('pages')">Back to discovery</button>
            </div>
          </div>
        </div>

        <div class="entity-profile-grid">
          <div class="profile-section-card">
            <span class="eyebrow">CONNECTED ZONES</span>
            <h2>Where this entity belongs</h2>
            <div class="entity-zone-list large">
              <span v-for="zoneName in selectedEntity.zoneNames" :key="zoneName" class="entity-zone-chip">◉ {{ zoneName }}</span>
              <span v-if="!selectedEntity.zoneNames.length" class="entity-muted">No Zone connected yet.</span>
            </div>

            <div class="entity-add-zone">
              <label>Add another Zone</label>
              <select @change="handleEntityZoneChange(selectedEntity, $event)">
                <option value="">Choose a Zone...</option>
                <option v-for="zone in zones" :key="zone.id" :value="zone.name">{{ zone.name }}</option>
              </select>
            </div>
          </div>

          <div class="profile-section-card">
            <span class="eyebrow">COMMUNITY IDENTIFICATION</span>
            <h2>What people know about it</h2>
            <p>
              {{ selectedEntity.reviews }} reviews
              <span v-if="selectedEntity.rating"> · {{ selectedEntity.rating.toFixed(1) }}/5 average</span>
            </p>
            <div class="entity-review-box">
              <textarea v-model="entityReviewText" rows="4" placeholder="Share what you know, experienced or verified about this entity..."></textarea>
              <button class="primary-btn" @click="submitEntityReview">Publish review</button>
            </div>
            <div v-if="selectedEntity.myReview" class="entity-my-review">
              <span class="eyebrow">YOUR REVIEW</span>
              <p>{{ selectedEntity.myReview }}</p>
            </div>
          </div>
        </div>
      </section>

      <section v-if="activeView === 'page' && selectedPage" class="content profile-page">
        <button class="ghost-btn back-inline" @click="navigate('pages')">← Back to Pages & Commons</button>
        <div class="page-profile-hero">
          <div class="page-profile-logo" :style="{ background: selectedPage.color }">{{ selectedPage.avatar }}</div>
          <div class="profile-hero-copy">
            <span class="eyebrow">{{ selectedPage.category.toUpperCase() }}</span>
            <h1>{{ selectedPage.name }}</h1>
            <p>{{ selectedPage.handle }} · {{ selectedPage.followers }} connected around this Page</p>
            <p>{{ selectedPage.description }}</p>
            <div class="profile-actions">
              <button class="primary-btn" @click="toggleFollow(selectedPage)">
                {{ selectedPage.connected ? 'Connected' : 'Connect' }}
              </button>
              <button class="ghost-btn" @click="openCreateChoice('call')">Launch a Call</button>
            </div>
          </div>
        </div>
        <div class="page-profile-space">
          <div>
            <span class="eyebrow">FROM THIS PAGE</span>
            <h2>Ideas, Calls and conversations</h2>
            <p>Everything this Page brings into the Commons can become a new connection, question, action or possibility.</p>
          </div>
          <div class="page-profile-actions">
            <button class="ghost-btn" @click="navigate('home')">See Live Network</button>
            <button class="primary-btn" @click="pageSearch = selectedPage.name; navigate('pages')">Explore related Pages</button>
          </div>
        </div>
      </section>


      <section v-if="activeView === 'call' && selectedCall" class="content call-space-page">
        <button class="ghost-btn back-inline" @click="navigate('pages')">← Back to Calls</button>
        <div class="call-space-hero">
          <div class="call-space-orbit"><span>CALL</span></div>
          <div>
            <span class="eyebrow">{{ selectedCall.category }} · {{ selectedCall.status }}</span>
            <h1>{{ selectedCall.title }}</h1>
            <p class="call-space-headline">{{ selectedCall.headline }}</p>
            <p>{{ selectedCall.description }}</p>
            <div class="call-space-meta">
              <span>◉ {{ selectedCall.location }}</span>
              <span>Launched by <strong>{{ selectedCall.launchedBy }}</strong></span>
              <span>{{ selectedCall.time }}</span>
            </div>
            <div class="call-space-actions">
              <button class="primary-btn" @click="followCall(selectedCall)">
                {{ selectedCall.followed ? 'Following this Call' : 'Follow this Call' }}
              </button>
              <button class="ghost-btn" @click="openPageByName(selectedCall.launchedBy)">Visit launcher</button>
            </div>
          </div>
        </div>
        <div class="call-space-grid">
          <div class="call-space-main">
            <div class="commons-section-heading">
              <div><span class="eyebrow">THE SPACE</span><h2>Everything around this Call</h2><p>Questions, ideas, connections and actions can grow from the original possibility.</p></div>
            </div>
            <div class="last-hope-interactions" v-if="selectedCall.interactionsList.length">
              <article v-for="interaction in selectedCall.interactionsList" :key="interaction.id" class="last-hope-interaction">
                <div class="avatar">{{ interaction.avatar }}</div>
                <div>
                  <div class="last-hope-interaction-meta"><strong>{{ interaction.author }}</strong><span>{{ interaction.type }} · {{ interaction.time }}</span></div>
                  <p>{{ interaction.text }}</p>
                  <span class="last-hope-like">♡ {{ interaction.likes }}</span>
                </div>
              </article>
            </div>
            <div v-else class="call-space-empty">
              <span class="eyebrow">START THE SPACE</span>
              <h3>You can be one of the first people to shape this Call.</h3>
              <p>Follow it, bring a question, share an idea or connect someone who could help.</p>
            </div>
          </div>
          <aside class="call-space-side">
            <div><strong>{{ selectedCall.participants }}</strong><span>People</span></div>
            <div><strong>{{ selectedCall.ideas }}</strong><span>Ideas</span></div>
            <div><strong>{{ selectedCall.interactions }}</strong><span>Interactions</span></div>
            <button class="ghost-btn" @click="openPageByName(selectedCall.launchedBy)">View launcher Page →</button>
          </aside>
        </div>
      </section>

      <section v-if="activeView === 'pages'" class="content pages-commons-page">

        <div class="commons-hero">
          <div class="commons-hero-copy">
            <span class="eyebrow">CALLS · COMMONS</span>
            <h1>People create the pages.<br /><span>People create the commons.</span></h1>
            <p>
              Connect to communities, organizations and projects — then see the ideas,
              questions and actions they bring into the shared space around you.
            </p>

            <div class="commons-hero-actions">
              <button class="primary-btn" @click="openCreateChoice()">+ Create</button>
              <button class="ghost-btn" @click="showCreateEntity = true">+ Create Entity</button>
              <button class="ghost-btn" @click="showCreatePost = true">Share to the Commons</button>
              <button class="ghost-btn" @click="pageSearch = ''">Explore all pages →</button>
            </div>
          </div>

          <div class="commons-orbit-visual" aria-hidden="true">
            <div class="commons-orbit-ring ring-a"></div>
            <div class="commons-orbit-ring ring-b"></div>
            <div class="commons-orbit-core">
              <span>COMMONS</span>
              <b>PEOPLE · IDEAS · ACTION</b>
            </div>
            <i class="commons-orbit-dot dot-a"></i>
            <i class="commons-orbit-dot dot-b"></i>
            <i class="commons-orbit-dot dot-c"></i>
          </div>
        </div>

        <div class="commons-stat-strip">
          <div><strong>{{ pages.length }}</strong><span>Calls</span></div>
          <div><strong>{{ pages.filter(page => page.connected).length }}</strong><span>Connected</span></div>
          <div><strong>{{ posts.filter(post => post.page).length }}</strong><span>Page conversations</span></div>
          <div><strong>LOCAL</strong><span>Ideas connected to places</span></div>
        </div>

        <div class="entity-network-section">
          <div class="commons-section-heading">
            <div>
              <span class="eyebrow">ENTITIES AROUND YOUR NETWORK</span>
              <h2>Identify what exists around your Zones.</h2>
              <p>
                COMMON detects entities through the Zones you joined, Calls you follow,
                Pages you follow and the Zones where you hold an official role.
                An entity can be connected to more Zones later.
              </p>
            </div>
            <button class="primary-btn" @click="showCreateEntity = true">+ Create Entity</button>
          </div>

          <div class="entity-context-grid">
            <div class="entity-context-card">
              <span class="eyebrow">YOUR ZONES</span>
              <strong>{{ joinedZones.length }}</strong>
              <small>{{ joinedZones.map(zone => zone.name).join(' · ') || 'No joined Zones yet' }}</small>
            </div>
            <div class="entity-context-card">
              <span class="eyebrow">CALLS YOU FOLLOW</span>
              <strong>{{ followedCalls.length }}</strong>
              <small>{{ followedCalls.map(call => call.title).join(' · ') || 'No followed Calls yet' }}</small>
            </div>
            <div class="entity-context-card">
              <span class="eyebrow">OFFICIAL IN</span>
              <strong>{{ officialZoneRoles.length }}</strong>
              <small>{{ officialZoneRoles.map(item => item.zoneName + ' · ' + item.role).join(' · ') || 'No official roles yet' }}</small>
            </div>
          </div>

          <div class="entity-grid">
            <article v-for="entity in detectedEntities.filter(entity => entity.type !== 'PLACE')" :key="entity.id" class="entity-card">
              <div class="entity-card-top">
                <span class="entity-type">{{ entity.type }}</span>
                <span class="entity-detection">✦ {{ entity.reason }}</span>
              </div>
              <button class="entity-main" type="button" @click="openEntity(entity)">
                <span class="entity-mark">{{ entity.name.slice(0, 2).toUpperCase() }}</span>
                <span>
                  <strong>{{ entity.name }}</strong>
                  <small>{{ entity.location }}</small>
                </span>
              </button>
              <p>{{ entity.description }}</p>
              <div class="entity-zone-list">
                <span v-for="zoneName in entity.zoneNames" :key="zoneName" class="entity-zone-chip">◉ {{ zoneName }}</span>
              </div>
              <div class="entity-card-footer">
                <span>★ {{ entity.rating ? entity.rating.toFixed(1) : '—' }} · {{ entity.reviews }} reviews</span>
                <button class="follow-btn" :class="{ following: entity.identified }" @click="identifyEntity(entity)">
                  {{ entity.identified ? 'Identified' : 'Identify' }}
                </button>
              </div>
            </article>

            <div v-if="detectedEntities.length === 0" class="empty-state page-empty">
              Join a Zone, follow a Call or connect to a Page to start discovering related entities.
            </div>
          </div>
        </div>

        <div class="commons-section-heading">
          <div>
            <span class="eyebrow">LAST HOPE · OPEN SPACE</span>
            <h2>Enter the call, not just the page.</h2>
            <p>A Last Hope is launched by a page or community. Open its space to see the full message, people, ideas, questions and interactions around it.</p>
          </div>
          <span class="commons-status">{{ calls[0].status }}</span>
        </div>

        <div class="last-hope-card">
          <div class="last-hope-cover">
            <div class="last-hope-orbit large"></div>
            <div class="last-hope-mark">LH</div>
            <span class="last-hope-location">◉ {{ calls[0].location }}</span>
          </div>

          <div class="last-hope-main">
            <div class="last-hope-topline">
              <span class="last-hope-type">{{ calls[0].category }}</span>
              <span>{{ calls[0].time }}</span>
            </div>
            <div class="last-hope-author">
              <div class="avatar" :style="{ background: '#4ade80' }">{{ calls[0].avatar }}</div>
              <div><strong>{{ calls[0].launchedBy }}</strong><span>{{ calls[0].handle }} · launched this Last Hope</span></div>
            </div>
            <h3>{{ calls[0].title }}</h3>
            <h4>{{ calls[0].headline }}</h4>
            <p>{{ calls[0].description }}</p>

            <div class="last-hope-stats">
              <span><strong>{{ calls[0].participants }}</strong> participants</span>
              <span><strong>{{ calls[0].ideas }}</strong> ideas</span>
              <span><strong>{{ calls[0].interactions }}</strong> interactions</span>
            </div>

            <div class="last-hope-actions">
              <button class="primary-btn">ENTER LAST HOPE →</button>
              <button class="ghost-btn" @click="followCall(calls[0])">
                {{ calls[0].followed ? 'Following call' : 'Follow call' }}
              </button>
            </div>
          </div>

          <div class="last-hope-space">
            <div class="last-hope-space-heading">
              <div><span class="eyebrow">INSIDE THE SPACE</span><h4>Everything around the call</h4></div>
              <span>{{ calls[0].interactionsList.length }} recent</span>
            </div>
            <div class="last-hope-interactions">
              <article v-for="interaction in calls[0].interactionsList" :key="interaction.id" class="last-hope-interaction">
                <div class="avatar">{{ interaction.avatar }}</div>
                <div>
                  <div class="last-hope-interaction-meta"><strong>{{ interaction.author }}</strong><span>{{ interaction.type }} · {{ interaction.time }}</span></div>
                  <p>{{ interaction.text }}</p>
                  <span class="last-hope-like">♡ {{ interaction.likes }}</span>
                </div>
              </article>
            </div>
          </div>
        </div>

        <div class="commons-section-heading call-discovery-heading">
          <div>
            <span class="eyebrow">DISCOVER CALLS</span>
            <h2>Find a Call that interests you.</h2>
            <p>Explore open questions, possibilities and needs launched by Pages and communities.</p>
          </div>
          <span class="zone-selection-note">{{ calls.length }} OPEN CALLS</span>
        </div>

        <div class="call-search-tools">
          <div class="page-search-field call-search-field">
            <span>⌕</span>
            <input v-model="callSearch" placeholder="Search calls, questions, places..." />
            <button v-if="callSearch" type="button" @click="callSearch = ''">×</button>
          </div>
          <div class="page-category-list">
            <button
              v-for="category in callCategories"
              :key="category"
              type="button"
              :class="{ active: callCategory === category }"
              @click="callCategory = category"
            >
              {{ category }}
            </button>
          </div>
        </div>

        <div class="call-discovery-grid">
          <article v-for="call in filteredCalls" :key="call.id" class="call-discovery-card">
            <div class="call-discovery-cover">
              <span>{{ call.category }}</span>
              <strong>{{ call.title }}</strong>
              <small>◉ {{ call.location }}</small>
            </div>
            <div class="call-discovery-body">
              <button
                class="call-discovery-author call-launcher-button"
                type="button"
                @click="openPageByName(call.launchedBy)"
              >
                <div class="avatar">{{ call.avatar }}</div>
                <div>
                  <strong>{{ call.launchedBy }}</strong>
                  <span>{{ call.handle }} · {{ call.time }}</span>
                </div>
              </button>
              <h3>{{ call.headline }}</h3>
              <p>{{ call.description }}</p>
              <div class="call-discovery-stats">
                <span><strong>{{ call.participants }}</strong> people</span>
                <span><strong>{{ call.ideas }}</strong> ideas</span>
                <span><strong>{{ call.interactions }}</strong> interactions</span>
              </div>
              <div class="call-discovery-actions">
                <button class="primary-btn" @click="openCallSpace(call)">ENTER SPACE →</button>
                <button class="ghost-btn" @click="followCall(call)">
                  {{ call.followed ? 'Following' : 'Follow' }}
                </button>
              </div>
            </div>
          </article>
        </div>

        <div v-if="filteredCalls.length === 0" class="empty-state page-empty">
          No Calls match your search.
        </div>

        <div class="commons-section-heading pages-heading">
          <div>
            <span class="eyebrow">DIRECTORY</span>
            <h2>Find a page to connect with.</h2>
          </div>
          <span class="zone-selection-note">{{ filteredPages.length }} PAGES</span>
        </div>

        <div class="page-discovery-tools">
          <div class="page-search-field">
            <span>⌕</span>
            <input v-model="pageSearch" placeholder="Search pages, communities, projects..." />
            <button v-if="pageSearch" type="button" @click="pageSearch = ''">×</button>
          </div>
          <div class="page-category-list">
            <button
              v-for="category in pageCategories"
              :key="category"
              type="button"
              :class="{ active: pageCategory === category }"
              @click="pageCategory = category"
            >
              {{ category }}
            </button>
          </div>
        </div>

        <div class="page-grid enhanced-page-grid">
          <article v-for="page in filteredPages" :key="page.id" class="page-card enhanced-page-card">
            <div class="page-cover" :style="{ background: 'linear-gradient(135deg, ' + page.color + '55, #0c1220 72%)' }">
              <div class="page-cover-glow"></div>
              <div class="page-logo">{{ page.avatar }}</div>
              <span class="page-cover-category">{{ page.category }}</span>
            </div>

            <div class="page-card-body">
              <div class="page-card-topline">
                <span class="page-handle">{{ page.handle }}</span>
                <span class="page-followers">{{ page.followers }}</span>
              </div>
              <h3>{{ page.name }}</h3>
              <p>{{ page.description }}</p>

              <div class="page-card-footer">
                <span class="page-common-label">COMMON · {{ page.category.toUpperCase() }}</span>
                <button class="follow-btn" :class="{ following: page.connected }" @click="toggleFollow(page)">
                  {{ page.connected ? 'Connected' : 'Connect' }}
                </button>
              </div>
            </div>
          </article>

          <div v-if="filteredPages.length === 0" class="empty-state page-empty">
            No pages match your search.
          </div>
        </div>

        <div class="commons-section-heading commons-feed-heading">
          <div>
            <span class="eyebrow">FROM THE COMMONS</span>
            <h2>What pages are bringing into the conversation.</h2>
            <p>Ideas become more useful when people can see them, respond to them and connect them to places.</p>
          </div>
          <button class="ghost-btn" @click="navigate('home')">Open live feed →</button>
        </div>

        <div class="commons-activity-grid">
          <article v-for="post in posts.filter(post => post.page).slice(0, 3)" :key="'commons-' + post.id" class="commons-activity-card">
            <div class="commons-activity-head">
              <div class="avatar" :style="{ background: pages.find(page => page.name === post.page)?.color || '#334155' }">{{ post.avatar }}</div>
              <div>
                <strong>{{ post.author }}</strong>
                <span>{{ post.handle }} · {{ post.time }}</span>
              </div>
            </div>
            <p>{{ post.content }}</p>
            <div class="commons-activity-foot">
              <span>♡ {{ post.likes }}</span>
              <span>◌ {{ post.comments }}</span>
              <span v-if="post.zone">◉ {{ post.zone }}</span>
            </div>
          </article>
        </div>

      </section>

      <!-- =================================================
           ZONES
           ================================================= -->
      <section v-if="activeView === 'places'" class="content places-page">
        <div class="commons-hero compact-section-hero">
          <div class="commons-hero-copy">
            <span class="eyebrow">PLACES · INSIDE ZONES</span>
            <h1>Places inside<br /><span>the Zones around you.</span></h1>
            <p>
              Explore places connected to the Zones you joined and discover what exists
              inside each local space.
            </p>
            <div class="commons-hero-actions">
              <button class="ghost-btn" @click="navigate('zones')">← Back to Zones</button>
            </div>
          </div>
        </div>

        <div class="places-zone-grid">
          <article v-for="zone in joinedZones" :key="zone.id" class="places-zone-card">
            <div class="places-zone-header">
              <div>
                <span class="eyebrow">ZONE</span>
                <h3>{{ zone.name }}</h3>
              </div>
              <span class="places-zone-count">
                {{ entities.filter(entity => entity.zoneNames.includes(zone.name) && entity.type === 'PLACE').length }}
                places
              </span>
            </div>
            <p>{{ zone.description }}</p>

            <div class="places-list">
              <button
                v-for="place in entities.filter(entity => entity.zoneNames.includes(zone.name) && entity.type === 'PLACE')"
                :key="place.id"
                class="place-row"
                type="button"
                @click="openEntity(place)"
              >
                <span class="place-mark">{{ place.name.slice(0, 2).toUpperCase() }}</span>
                <span class="place-info">
                  <strong>{{ place.name }}</strong>
                  <small>{{ place.location }}</small>
                </span>
                <span class="place-arrow">→</span>
              </button>

              <div
                v-if="entities.filter(entity => entity.zoneNames.includes(zone.name) && entity.type === 'PLACE').length === 0"
                class="empty-state"
              >
                No places identified in this Zone yet.
              </div>
            </div>
          </article>
        </div>

        <div v-if="joinedZones.length === 0" class="empty-state page-empty">
          Join a Zone to start discovering Places inside it.
        </div>
      </section>

      <section v-if="activeView === 'zones'" class="content impact-content">

        <aside class="impact-guide" aria-label="Guide to making an impact">
          <span class="impact-guide-kicker">GUIDE</span>
          <strong>MAKE AN IMPACT</strong>
          <span class="impact-guide-subtitle">in your Zone or around it</span>

          <div class="impact-guide-copy">
            <p>Some people choose to start where they are.</p>
            <p>Others start with what they care about.</p>
            <p>Others discover something happening around them.</p>
          </div>

          <div class="impact-guide-path" aria-hidden="true">
            <span>YOU</span><i>→</i><span>ZONE</span><i>→</i><span>AROUND</span><i>→</i><span>ACTION</span>
          </div>

          <p class="impact-guide-note">You don't have to know the whole network before you act. You can start from where you are.</p>
        </aside>

        <aside class="impact-space-rail" aria-label="Impact context">
          <span class="impact-space-rail-label">IMPACT</span>
          <button
            type="button"
            class="impact-space-rail-item"
            :class="{ active: activeView === 'zones' || activeView === 'zone' }"
            title="Zones"
            aria-label="Zones"
            @click="navigate('zones')"
          >◉</button>
          <button
            type="button"
            class="impact-space-rail-item"
            :class="{ active: activeView === 'people' }"
            title="People"
            aria-label="People"
            @click="navigate('people')"
          >♧</button>
          <button
            type="button"
            class="impact-space-rail-item"
            :class="{ active: activeView === 'initiatives' }"
            title="Actions"
            aria-label="Actions"
            @click="navigate('initiatives')"
          >↗</button>
          <span class="impact-space-rail-line"></span>
        </aside>

        <section class="zone-navigation-space">
          <div v-if="zoneNavigationLevel === 'governorates' && !zonePreviewName" class="zone-area-selection">
            <div class="zone-selection-heading">
              <div>
                <span class="eyebrow">GOVERNORATES</span>
                <h2>Choose your governorate.</h2>
                <p>
                  Choose a country first, then explore its governorates, wilayas, regions or equivalent first-level areas.
                </p>
              </div>
              <span class="zone-selection-note">
                {{ availableCountryAreas.length }} AREAS · {{ selectedCountry.toUpperCase() }}
              </span>
            </div>

            <button
              type="button"
              class="country-selector-toggle"
              @click="showCountrySelector = !showCountrySelector"
            >
              <span>
                <small>COUNTRY</small>
                <strong>{{ selectedCountry }}</strong>
              </span>
              <b>{{ showCountrySelector ? 'HIDE COUNTRIES ↑' : 'CHANGE COUNTRY ↓' }}</b>
            </button>

            <div v-if="showCountrySelector" class="country-selector" aria-label="Choose a country">
              <button
                v-for="country in countryOptions"
                :key="country.name"
                type="button"
                class="country-option"
                :class="{ active: selectedCountry === country.name }"
                @click="selectCountry(country.name)"
              >
                <span class="country-option-flag">{{ country.name.slice(0, 2).toUpperCase() }}</span>
                <span class="country-option-copy">
                  <strong>{{ country.label }}</strong>
                  <small>{{ country.note }}</small>
                </span>
              </button>
            </div>

            <div v-if="selectedCountry === 'Tunisia'" class="governorate-region-selector country-region-selector" aria-label="Choose a Tunisia region">
              <button
                v-for="region in [{ name: 'All', description: 'Show all 24 governorates' }, ...zoneRegions]"
                :key="region.name"
                type="button"
                class="governorate-region-option"
                :class="{ active: selectedGovernorateRegion === region.name }"
                @click="selectGovernorateRegion(region.name)"
              >
                <span class="governorate-region-orbit">
                  <span class="governorate-region-orbit-core"></span>
                </span>
                <span class="governorate-region-option-copy">
                  <strong>{{ region.name === 'All' ? 'ALL TUNISIA' : region.name.toUpperCase() + ' TUNISIA' }}</strong>
                  <small>{{ region.description }}</small>
                </span>
              </button>
            </div>

            <div class="zone-area-grid">
              <article
                v-for="area in availableCountryAreas.filter(area => selectedCountry !== 'Tunisia' || selectedGovernorateRegion === 'All' || area.region === selectedGovernorateRegion)"
                :key="selectedCountry + '-' + area.name"
                class="zone-area-card zone-area-card-joinable"
              >
                <button type="button" class="zone-area-open" @click="selectGovernorate(area.name)">
                  <span class="zone-area-image" :style="{ backgroundImage: 'url(' + area.image + ')' }"></span>
                  <span class="zone-area-card-content">
                    <strong>{{ area.name }}</strong>
                    <span>{{ area.description }}</span>
                    <small>{{ area.members }} members · {{ selectedCountry }}</small>
                  </span>
                  <b>OPEN →</b>
                </button>
              </article>
            </div>
          </div>
          <div v-else class="selected-area-space">
            <div class="zone-navigation-bar">
              <button v-if="zoneNavigationLevel === 'specific-zones' && !zonePreviewName" class="zone-back-btn" @click="backToGovernorates">← All governorates</button>
              <button v-else-if="zonePreviewName" class="zone-back-btn" @click="closeZonePreview">← {{ selectedZoneArea }}</button>
              <span class="zone-selection-note zone-region-label">
                {{ selectedZoneRegion ? selectedZoneRegion + ' · ' + selectedCountry.toUpperCase() : selectedCountry.toUpperCase() }}
              </span>
            </div>
            <section v-if="!zonePreviewName" class="governorate-detail-panel">
              <div class="governorate-detail-cover" :style="{ backgroundImage: 'url(' + selectedAreaImage + ')' }">
                <div class="governorate-detail-cover-overlay"></div>
                <div class="governorate-detail-heading">
                  <span class="eyebrow">GOVERNORATE</span>
                  <h1>{{ selectedZoneArea }}</h1>
                  <p>{{ zoneAreas.find(area => area.name === selectedZoneArea)?.description }}</p>
                </div>
              </div>
              <div class="governorate-detail-content">
                <div class="governorate-detail-actions">
                  <div>
                    <span class="eyebrow">YOUR CONNECTION</span>
                    <h3>How are you connected to {{ selectedZoneArea }}?</h3>
                    <p>Select one point to describe your relationship with this governorate.</p>
                  </div>
                  <button type="button" class="zone-join-btn governorate-detail-join" :class="{ joined: isGovernorateJoined(selectedZoneArea) }" @click="toggleGovernorateJoin(selectedZoneArea)">
                    {{ isGovernorateJoined(selectedZoneArea) ? '✓ Joined' : '+ Join Governorate' }}
                  </button>
                </div>
                <div class="governorate-detail-relations">
                  <button type="button" class="governorate-relation-option" :class="{ active: governorateRelations[selectedZoneArea] === 'home' }" @click="setGovernorateRelation(selectedZoneArea, 'home')">
                    <span class="governorate-relation-point">●</span><span><strong>Where I live</strong><small>This is where I live</small></span>
                  </button>
                  <button type="button" class="governorate-relation-option" :class="{ active: governorateRelations[selectedZoneArea] === 'family' }" @click="setGovernorateRelation(selectedZoneArea, 'family')">
                    <span class="governorate-relation-point">●</span><span><strong>Family lives here</strong><small>A family member lives here</small></span>
                  </button>
                  <button type="button" class="governorate-relation-option" :class="{ active: governorateRelations[selectedZoneArea] === 'other' }" @click="setGovernorateRelation(selectedZoneArea, 'other')">
                    <span class="governorate-relation-point">●</span><span><strong>Another connection</strong><small>I have another connection here</small></span>
                  </button>
                </div>
                <div v-if="governorateRelationLabel(selectedZoneArea)" class="governorate-selected-relation">
                  Selected: {{ governorateRelationLabel(selectedZoneArea) }}
                </div>
              </div>
            </section>

                        <div v-if="zonePreviewName" class="selected-area-hero zone-preview-hero">
              <div class="selected-area-hero-overlay"></div>
              <div class="zone-conversation-space">
                <div class="zone-conversation-heading">
                  <div>
                    <span class="eyebrow">WHAT PEOPLE ARE SAYING</span>
                    <h2>{{ zonePreviewName }}</h2>
                    <p>{{ zonePreviewData?.location || zonePreviewName + ', Tunisia' }}</p>
                  </div>
                  <button class="enter-zone-btn" @click="enterPreviewedZone">Enter {{ zonePreviewName }} →</button>
                </div>

                <div class="zone-conversation-section">
                  <div class="zone-conversation-section-head">
                    <div>
                      <span class="eyebrow">LOCAL VOICES</span>
                      <h3>What people are saying</h3>
                    </div>
                    <span class="zone-conversation-count">{{ zonePreviewPosts.length }} EXAMPLES</span>
                  </div>

                  <div class="zone-preview-posts">
                    <article v-for="post in zonePreviewPosts" :key="post.id" class="zone-preview-post">
                      <div class="avatar">{{ post.avatar }}</div>
                      <div class="zone-preview-post-copy">
                        <div class="zone-preview-post-meta">
                          <strong>{{ post.author }}</strong>
                          <span>{{ post.time }}</span>
                        </div>
                        <p>{{ post.content }}</p>
                        <div class="zone-preview-post-actions">
                          <span>♡ {{ post.likes }}</span>
                          <span>◌ {{ post.comments }} comments</span>
                        </div>
                      </div>
                    </article>
                  </div>
                </div>

                <div class="zone-conversation-split">
                  <div class="zone-conversation-section zone-question-section">
                  <div class="zone-conversation-section-head">
                    <div>
                      <span class="eyebrow">QUESTIONS & HELP</span>
                      <h3>People have questions about this place</h3>
                    </div>
                    <span class="zone-conversation-count">PUBLIC SPACES · SERVICES · NATURE · MOBILITY</span>
                  </div>

                  <div class="zone-question-grid">
                    <article v-for="question in zonePreviewQuestions" :key="question.id" class="zone-question-card">
                      <div class="zone-question-top">
                        <span class="zone-topic">{{ question.topic }}</span>
                        <span>QUESTION</span>
                      </div>
                      <h4>{{ question.question }}</h4>
                      <div class="zone-help">
                        <div class="avatar zone-help-avatar">{{ question.helperAvatar }}</div>
                        <div>
                          <strong>{{ question.helper }}</strong>
                          <p>{{ question.answer }}</p>
                        </div>
                      </div>
                    </article>
                  </div>
                </div>

                  <aside class="zone-conversation-section zone-initiative-section">
                  <div class="zone-conversation-section-head">
                    <div>
                      <span class="eyebrow">LOOKING FOR INITIATIVES</span>
                      <h3>People looking for something already happening</h3>
                    </div>
                    <span class="zone-conversation-count">PROFILES HIDDEN</span>
                  </div>

                  <div class="zone-initiative-list">
                    <article v-for="initiative in zonePreviewInitiatives" :key="initiative.id" class="zone-initiative-card">
                      <div class="zone-initiative-private-avatar" aria-hidden="true">?</div>
                      <div class="zone-initiative-copy">
                        <span class="zone-topic">{{ initiative.topic }}</span>
                        <h4>{{ initiative.title }}</h4>
                        <p>{{ initiative.description }}</p>
                        <span class="zone-initiative-note">Person requesting this is anonymous. Profile and photo are hidden.</span>
                      </div>
                      <span class="zone-initiative-status">{{ initiative.status }}</span>
                    </article>
                  </div>
                  </aside>
                </div>

                <div class="zone-conversation-footer">
                  <button class="zone-back-btn" @click="closeZonePreview">← Back to {{ selectedZoneArea }}</button>
                  <span>These are example conversations to give every zone a starting point.</span>
                </div>
              </div>
            </div>
            <div v-else-if="selectedZoneArea" class="selected-area-hero" :style="{ backgroundImage: 'url(' + selectedAreaImage + ')' }"><div class="selected-area-hero-overlay"></div><div class="selected-area-hero-content"><span class="eyebrow">CURRENT GOVERNORATE · {{ selectedZoneRegion }} TUNISIA</span><h2>{{ selectedZoneArea }}</h2><p>Choose a specific zone inside this governorate.</p></div></div>
            <section v-if="!zonePreviewName && zoneNavigationLevel === 'governorates'" class="specific-zone-directory">
              <div class="zone-selection-heading compact"><div><span class="eyebrow">GOVERNORATES</span><h2>Governorates in {{ selectedZoneRegion }}.</h2><p>Each governorate stays inside its geographic region.</p></div><span class="zone-selection-note">{{ zoneAreas.filter(area => area.region === selectedZoneRegion).length }} GOVERNORATES</span></div>
              <div class="zone-area-grid">
                <article v-for="area in zoneAreas.filter(area => area.region === selectedZoneRegion)" :key="area.name" class="zone-area-card zone-area-card-joinable">
                  <button type="button" class="zone-area-open" @click="selectGovernorate(area.name)">
                    <span class="zone-area-image" :style="{ backgroundImage: 'url(' + area.image + ')' }"></span><span class="zone-area-card-content"><strong>{{ area.name }}</strong><span>{{ area.description }}</span><small>{{ area.members }} members</small></span><b>OPEN →</b>
                  </button>
                  <button type="button" class="zone-join-btn" :class="{ joined: isGovernorateJoined(area.name) }" @click="toggleGovernorateJoin(area.name)">
                    {{ isGovernorateJoined(area.name) ? '✓ Joined' : '+ Join Governorate' }}
                  </button>
                </article>
              </div>
            </section>
            <section v-else-if="!zonePreviewName" class="specific-zone-directory">
              <div class="specific-zone-layout">
                <div class="specific-zone-browser">
                  <button type="button" class="create-action-card" @click="showCreateSuggestion = true">
                    <span class="create-action-icon">+</span>
                    <span>
                      <strong>CREATE AN ACTION</strong>
                      <small>Turn an idea for {{ selectedZoneArea }} into something people can respond to.</small>
                    </span>
                    <b>START →</b>
                  </button>

                  <div class="zone-selection-heading compact">
                    <div>
                      <span class="eyebrow">SPECIFIC ZONES</span>
                      <h2>Choose a place inside {{ selectedZoneArea }}.</h2>
                      <p>Select a municipality, neighborhood or local community to go deeper.</p>
                    </div>
                    <span class="zone-selection-note">{{ visibleSpecificZones.length }} ZONES</span>
                  </div>
                  <div class="specific-zone-list">
                    <article v-for="zone in visibleSpecificZones" :key="zone.id" class="specific-zone-item-wrap">
                      <button type="button" class="specific-zone-item" :class="{ active: selectedSpecificZone === zone.name }" @click="openSpecificZone(zone.name)">
                        <span class="specific-zone-pin">◉</span>
                        <span><strong>{{ zone.name }}</strong><small>{{ zone.location }}</small></span>
                        <span class="specific-zone-area">OPEN →</span>
                      </button>
                    </article>
                  </div>
                </div>

                <aside class="governorate-engagement">
                  <div class="governorate-engagement-top">
                    <span class="eyebrow">LOCAL POSSIBILITY</span>
                    <span class="zone-selection-note">{{ selectedZoneArea.toUpperCase() }}</span>
                  </div>
                  <h2>What could {{ selectedZoneArea }} become?</h2>
                  <p class="governorate-engagement-intro">Don't just choose a place. Start thinking about what could happen there.</p>

                  <div class="governorate-prompt-list">
                    <button
                      v-for="prompt in governoratePrompts"
                      :key="prompt.label"
                      type="button"
                      class="governorate-prompt"
                      :class="{ active: selectedGovernoratePrompt === prompt.title }"
                      @click="selectedGovernoratePrompt = prompt.title"
                    >
                      <span>{{ prompt.label }}</span>
                      <strong>{{ prompt.title }}</strong>
                    </button>
                  </div>

                  <div class="governorate-prompt-response">
                    <span class="eyebrow">START WITH A THOUGHT</span>
                    <p>{{ governoratePrompts.find(prompt => prompt.title === selectedGovernoratePrompt)?.text }}</p>
                    <button type="button" class="governorate-engage-btn" @click="selectedGovernoratePrompt = 'What could become possible here?'">
                      ADD YOUR PERSPECTIVE →
                    </button>
                  </div>
                </aside>
              </div>
            </section>
          </div>
        </section>

        <div v-if="zoneNavigationLevel !== 'governorates'" class="zones-footer-intro">
          <h2>Take care of the zone.</h2>
          <p>A zone turns people around a place into a living community. Identify goals, propose ideas and participate.</p>
        </div>

        <div v-if="false && visibleZones.length" class="zone-grid">

          <article
            v-for="zone in visibleZones"
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
                ◉ {{ zone.location }}
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
                  {{ zone.joined ? 'Participating ✓' : 'Participate' }}
                </button>

              </div>

            </div>

          </article>

        </div>

      </section>

      
      <section v-if="activeView === 'my-zones'" class="content my-zones-content contextual-rail-content">
        <aside class="impact-space-rail contextual-space-rail" aria-label="Your Zones context">
          <span class="impact-space-rail-label">YOUR ZONES</span>
          <div class="context-rail-metric"><strong>{{ joinedZones.length }}</strong><span>zones you belong to</span></div>
          <div class="context-rail-metric"><strong>{{ joinedZones.reduce((total, zone) => total + zone.participants, 0) }}</strong><span>participating</span></div>
          <div class="context-rail-metric"><strong>{{ joinedZones.reduce((total, zone) => total + zone.goals.length, 0) }}</strong><span>active goals</span></div>
          <div class="context-rail-metric"><strong>{{ joinedZones.reduce((total, zone) => total + zone.suggestions.length, 0) }}</strong><span>ideas & suggestions</span></div>
          <span class="impact-space-rail-line"></span>
          <span class="context-rail-flow-label">YOUR ACTIVITY</span>
          <div class="context-rail-flow"><span>•</span><p>Your participation changes the Zone.</p></div>
          <div class="context-rail-flow"><span>•</span><p>People are working on shared goals.</p></div>
          <div class="context-rail-flow"><span>•</span><p>New actions can start from your Zones.</p></div>
        </aside>

        <div class="my-zones-header">
          <div><span class="eyebrow">YOUR SPACE</span><h1>My Zones</h1><p>Places you have chosen to belong to, participate in and help shape.</p></div>
          <button type="button" class="ghost-btn my-zones-discover-btn" @click="navigate('around-zones')">DISCOVER ZONES <span>→</span></button>
        </div>
        <div v-if="joinedZones.length" class="my-zones-overview">
          <div class="my-zones-overview-main"><span class="eyebrow">YOUR ZONES</span><strong>{{ joinedZones.length }}</strong><span>{{ joinedZones.length === 1 ? 'place you belong to' : 'places you belong to' }}</span></div>
          <div class="my-zones-overview-note"><span class="my-zones-orbit">◉</span><div><strong>Your local layer</strong><p>Each Zone connects people, goals, ideas, places and actions around a real space.</p></div></div>
        </div>
        <div v-if="joinedZones.length" class="my-zones-list">
          <article v-for="zone in joinedZones" :key="zone.id" class="my-zone-card">
            <div class="my-zone-card-visual" :style="{ backgroundImage: 'url(' + zone.cover + ')' }"><div class="my-zone-card-visual-overlay"></div><div class="my-zone-card-location">◉ {{ zone.location }}</div><div class="my-zone-card-status">JOINED</div></div>
            <div class="my-zone-card-body">
              <div class="my-zone-card-title-row"><div><span class="eyebrow">ZONE</span><h2>{{ zone.name }}</h2></div><button type="button" class="my-zone-open-btn" @click="openZone(zone)">OPEN <span>→</span></button></div>
              <p class="my-zone-description">{{ zone.description }}</p>
              <div class="my-zone-signals"><div><strong>{{ zone.members }}</strong><span>members</span></div><div><strong>{{ zone.participants }}</strong><span>participating</span></div><div><strong>{{ zone.goals.length }}</strong><span>goals</span></div><div><strong>{{ zone.suggestions.length }}</strong><span>ideas</span></div></div>
              <div class="my-zone-card-footer"><span>People · Goals · Ideas · Places</span><span class="my-zone-arrow">↗</span></div>
            </div>
          </article>
        </div>
        <div v-else class="my-zones-empty"><div class="my-zones-empty-orbit">◉</div><span class="eyebrow">YOUR ZONES</span><h2>You haven't joined a Zone yet.</h2><p>Explore the Zones around you and choose the places where you want to participate.</p><button type="button" class="primary-btn" @click="navigate('around-zones')">EXPLORE ZONES AROUND →</button></div>
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
          ← Back to zones
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
              ◉ {{ selectedZone.location }}
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
                  ? '✓ You joined this zone'
                  : '+ Join this zone'
              }}
            </button>

          </div>
        <div class="zone-places-panel">
          <div class="zone-places-heading">
            <div>
              <span class="eyebrow">INSIDE THIS ZONE</span>
              <h2>Places</h2>
              <p>Identify and explore places that belong to {{ selectedZone.name }}.</p>
            </div>
            <button class="primary-btn" type="button" @click="showCreateEntity = true">
              + Identify Place
            </button>
          </div>

          <div class="zone-places-grid">
            <article
              v-for="place in entities.filter(entity => entity.type === 'PLACE' && entity.zoneNames.includes(selectedZone!.name))"
              :key="place.id"
              class="zone-inside-card"
            >
              <button class="zone-place-row" type="button" @click="openEntity(place)">
                <span class="place-mark">{{ place.name.slice(0, 2).toUpperCase() }}</span>
                <span class="place-info">
                  <strong>{{ place.name }}</strong>
                  <small>{{ place.location }}</small>
                </span>
                <span class="place-arrow">→</span>
              </button>
            </article>
          </div>

          <div
            v-if="entities.filter(entity => entity.type === 'PLACE' && entity.zoneNames.includes(selectedZone!.name)).length === 0"
            class="empty-state"
          >
            No places identified in this Zone yet.
            <button class="identify-place-btn" type="button" @click="showCreateEntity = true">
              + Identify the first place
            </button>
          </div>
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
                        ✦
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
                        ▲
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
                    View structure →
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
                      <div class="goal-symbol">✦</div>

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
                        <span class="election-label">ELECTION · {{ election.roleName }}</span>
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
                            {{ candidate.voted ? '✓ Voted' : 'Vote' }}
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
                        ▲
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
                          <i>•</i>
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
                        ♡ {{ post.likes }}
                      </button>
                      <button>◌ {{ post.comments }}</button>
                      <button>↗ Share</button>
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
                  <span class="role-dot">◈</span>
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
                Manage Zone Structure →
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

    <!-- CREATE ENTITY -->
    <div v-if="showCreateEntity" class="modal-backdrop" @click.self="showCreateEntity = false">
      <div class="modal entity-create-modal">
        <div class="modal-header">
          <div>
            <span class="eyebrow">CREATE ENTITY</span>
            <h2>Add something that exists.</h2>
          </div>
          <button class="close" @click="showCreateEntity = false">×</button>
        </div>

        <div class="create-form">
          <div class="create-form-heading">
            <strong>Entities can be places, businesses, organizations, services, landmarks or initiatives.</strong>
            <p>Start with one Zone. You can connect the entity to more Zones later.</p>
          </div>

          <label>
            Entity name
            <input v-model="newEntityName" placeholder="e.g. Community Garden" />
          </label>

          <label>
            Type
            <select v-model="newEntityType">
              <option value="PLACE">Place</option>
              <option value="BUSINESS">Business</option>
              <option value="ORGANIZATION">Organization</option>
              <option value="SERVICE">Service</option>
              <option value="LANDMARK">Landmark</option>
              <option value="INITIATIVE">Initiative</option>
            </select>
          </label>

          <label>
            Location
            <input v-model="newEntityLocation" placeholder="e.g. Tunis North, Tunisia" />
          </label>

          <label>
            Zone
            <select v-model="newEntityZone">
              <option value="">Choose a Zone...</option>
              <option v-for="zone in zones" :key="zone.id" :value="zone.name">{{ zone.name }}</option>
            </select>
          </label>

          <label>
            Description
            <textarea v-model="newEntityDescription" rows="4" placeholder="What is this entity?"></textarea>
          </label>

          <div class="profile-actions">
            <button class="ghost-btn" @click="showCreateEntity = false">Cancel</button>
            <button class="primary-btn" @click="createEntity">Create Entity</button>
          </div>
        </div>
      </div>
    </div>

    <!-- CREATE PAGE / CALL -->
    <div
      v-if="showCreateChoice"
      class="modal-backdrop"
      @click.self="closeCreateChoice"
    >
      <div class="modal create-choice-modal">
        <div class="modal-header">
          <div>
            <span class="eyebrow">CREATE</span>
            <h2>What do you want to create?</h2>
          </div>
          <button class="close" @click="closeCreateChoice">×</button>
        </div>

        <div class="create-type-switch">
          <button
            type="button"
            :class="{ active: createType === 'page' }"
            @click="createType = 'page'"
          >
            <span>PAGE</span>
            <strong>Create a Page</strong>
            <small>Build an ongoing identity, community, initiative or project.</small>
            <b>CONNECT</b>
          </button>

          <button
            type="button"
            :class="{ active: createType === 'call' }"
            @click="createType = 'call'"
          >
            <span>CALL</span>
            <strong>Launch a Call</strong>
            <small>Open a space around a question, possibility, need or challenge.</small>
            <b>FOLLOW</b>
          </button>
        </div>

        <div v-if="createType === 'page'" class="create-form">
          <div class="create-form-heading">
            <span class="eyebrow">NEW PAGE</span>
            <p>Your Page becomes an ongoing identity that people can connect to.</p>
          </div>

          <label>
            Page name
            <input v-model="newPageName" placeholder="Example: Green Horizon" />
          </label>

          <label>
            Handle
            <input v-model="newPageHandle" placeholder="@greenhorizon" />
          </label>

          <label>
            Category
            <input v-model="newPageCategory" placeholder="Community, Environment, Innovation..." />
          </label>

          <label>
            Description
            <textarea v-model="newPageDescription" placeholder="What does this Page bring into the Commons?"></textarea>
          </label>

          <button class="publish-btn" @click="createPage">
            Create Page · Connect
          </button>
        </div>

        <div v-else class="create-form">
          <div class="create-form-heading">
            <span class="eyebrow">NEW CALL</span>
            <p>A Call is a specific possibility or question with its own living space.</p>
          </div>

          <label>
            Call name
            <input v-model="newCallTitle" placeholder="Example: Last Hope" />
          </label>

          <label>
            What is the Call about?
            <textarea v-model="newCallMessage" placeholder="Ask the question, describe the possibility or explain what needs attention..."></textarea>
          </label>

          <label>
            Place <span class="optional-label">OPTIONAL</span>
            <input v-model="newCallLocation" placeholder="Tunis North, La Marsa, online..." />
          </label>

          <button class="publish-btn" @click="createCall">
            Launch Call · Follow
          </button>
        </div>
      </div>
    </div>

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
            ×
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
          <button>◉ Add zone</button>
          <button>⌁ Add connection</button>
          <button>▧ Add media</button>
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
            ×
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
            ×
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
            ×
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
  background: #080b12;
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

.main-nav > button:nth-of-type(1),
.main-nav > button:nth-of-type(2) {
  color: #f59e0b;
}

.main-nav > button:nth-of-type(1) .icon,
.main-nav > button:nth-of-type(2) .icon {
  color: #f59e0b;
}

.main-nav > button:nth-of-type(1):hover,
.main-nav > button:nth-of-type(2):hover {
  color: #fbbf24;
  background: rgba(245, 158, 11, .08);
}

.main-nav > button:nth-of-type(1).active,
.main-nav > button:nth-of-type(2).active {
  color: #fff7e6;
  background: linear-gradient(
    90deg,
    rgba(245, 158, 11, .18),
    rgba(245, 158, 11, .045)
  );
}

.main-nav > button:nth-of-type(1).active .icon,
.main-nav > button:nth-of-type(2).active .icon {
  color: #fbbf24;
}

/* Keep unselected navigation text softly brighter, while preserving the orange Home/Discover accent. */
.main-nav button:not(.active) {
  color: #aeb7c6;
}

.main-nav button:not(.active) .icon {
  color: #8f9bad;
}

.main-nav .sidebar-zones-header button:not(.active) {
  color: #aeb7c6;
}

.main-nav .sidebar-zones-header button:not(.active) .icon,
.main-nav .sidebar-zones-toggle .subnav-chevron {
  color: #f59e0b;
}

.sidebar-section-label {
  color: #d28a18;
}

/* Requested text treatment for the Zone / Flow submenu labels. */
.sidebar-zones-main .subnav-section-label,
.main-nav .sidebar-subnav button:not(.sidebar-subnav-toggle) {
  color: #000000;
}

.main-nav .sidebar-subnav button:not(.sidebar-subnav-toggle) .subnav-dot {
  background: #000000;
}

.sidebar-zones-main .icon {
  color: #000000;
}

.sidebar-zones-main.active .subnav-section-label,
.main-nav .sidebar-subnav button.active:not(.sidebar-subnav-toggle) {
  color: #000000;
}

.sidebar-zones-main.active .icon {
  color: #000000;
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

.sidebar-label-switcher {
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:5px;
  margin:0 0 10px;
}

.sidebar-label-arrow {
  width:18px;
  height:18px;
  display:grid;
  place-items:center;
  padding:0;
  border:1px solid rgba(255,255,255,.05);
  border-radius:6px;
  background:rgba(255,255,255,.015);
  color:#718096;
  font-size:13px;
  line-height:1;
  cursor:pointer;
}

.sidebar-label-arrow:hover:not(:disabled) {
  border-color:rgba(103,164,255,.2);
  background:rgba(74,120,194,.07);
  color:#a8c6eb;
}

.sidebar-label-arrow:disabled {
  opacity:.28;
  cursor:default;
}

.mini-network {
  border:0;
  width:100%;
  text-align:left;
  color:inherit;
}

.network-dot {
  background:#8b7bd8;
}

.sidebar-empty-small {
  padding:5px 2px;
  color:#56657a;
  font-size:8px;
  line-height:1.5;
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


.sidebar-people-button {
  position: relative;
  width: 100%;
  display: flex;
  align-items: center;
  gap: 13px;
  margin-top: 8px;
  padding: 10px 5px;
  border: 0;
  border-radius: 9px;
  color: #858fa1;
  background: transparent;
  text-align: left;
  cursor: pointer;
  transition: .2s;
}

.sidebar-people-button::before {
  content: "";
  position: absolute;
  left: 8px;
  right: 8px;
  top: -1px;
  height: 1px;
  background: rgba(255,255,255,.06);
}

.sidebar-people-button:hover {
  color: #e9eef8;
  background: rgba(255,255,255,.035);
}

.sidebar-people-button.active {
  color: #f4f7fc;
  background: linear-gradient(
    90deg,
    rgba(72, 103, 163, .2),
    rgba(72, 103, 163, .05)
  );
}

.sidebar-people-button .icon {
  flex: 0 0 20px;
}

.create-zone-small {
  background: transparent;
  color: #6fa4e9;
  padding: 10px 5px;
  font-size: 12px;
}

.sidebar {
  height: 100vh;
  height: 100dvh;
  overflow-y: auto;
  overflow-x: hidden;
  box-sizing: border-box;
  scrollbar-width: thin;
  display: flex;
  flex-direction: column;
}

.create-sidebar-button {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 76px;
  height: 38px;
  padding: 0 11px;
  border: 1px solid rgba(103,164,255,.18);
  border-radius: 11px;
  background: linear-gradient(145deg, rgba(70,110,170,.16), rgba(40,52,78,.12));
  color: #bcd5f6;
  cursor: pointer;
  transition: .18s ease;
}

.create-sidebar-button:hover {
  border-color: rgba(103,164,255,.4);
  background: linear-gradient(145deg, rgba(70,110,170,.25), rgba(40,52,78,.2));
  transform: translateY(-1px);
}

.create-sidebar-icon {
  width: 20px;
  height: 20px;
  display: grid;
  place-items: center;
  border-radius: 6px;
  background: rgba(128,173,240,.13);
  color: #8bb8f2;
  font-size: 17px;
  line-height: 1;
}

.create-sidebar-label {
  font-size: 9px;
  font-weight: 800;
  letter-spacing: .08em;
  text-transform: uppercase;
}

.profile-mini-main {
  display: flex;
  align-items: center;
  gap: 9px;
  flex: 1;
  min-width: 0;
  padding: 0;
  border: 0;
  background: transparent;
  color: inherit;
  text-align: left;
  cursor: pointer;
}

.profile-mini-main strong,
.profile-mini-main small {
  display: block;
}

.profile-mini-main small {
  margin-top: 2px;
  color: #68758a;
  font-size: 8px;
}

.profile-dots {
  border: 0;
  background: transparent;
  color: #657389;
  cursor: pointer;
  padding: 6px;
}

.profile-dots:hover {
  color: #b8c7dc;
}

.sidebar-bottom {
  margin-top: auto;
  position: sticky;
  bottom: 0;
  flex-shrink: 0;
  background: rgba(8,11,18,.98);
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
  padding-left: 180px;
  box-sizing: border-box;
}

.topbar {
  height: 70px;
  border-bottom: 1px solid rgba(255,255,255,.07);
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-left: -180px;
  padding: 0 38px 0 218px;
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

.my-events-content {
  max-width: 1180px;
}

.section-heading {
  margin-bottom: 30px;
}

.section-kicker {
  display: block;
  margin-bottom: 10px;
  color: #60738f;
  font-size: 9px;
  font-weight: 800;
  letter-spacing: .18em;
}

.section-heading h1 {
  margin: 0;
  font-size: 34px;
  letter-spacing: -.04em;
}

.section-heading p {
  margin: 10px 0 0;
  color: #7f8da2;
  font-size: 13px;
}

.events-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
}

.event-card {
  padding: 22px;
  border: 1px solid rgba(255,255,255,.07);
  border-radius: 16px;
  background: linear-gradient(145deg, rgba(14,21,33,.96), rgba(9,14,23,.96));
  box-shadow: 0 14px 35px rgba(0,0,0,.12);
}

.event-card-top,
.event-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.event-type,
.event-status {
  font-size: 9px;
  font-weight: 800;
  letter-spacing: .12em;
  text-transform: uppercase;
}

.event-type { color: #6e9bd8; }
.event-status { color: #76b894; }

.event-card h2 {
  margin: 20px 0 18px;
  font-size: 20px;
  letter-spacing: -.025em;
}

.event-meta {
  justify-content: flex-start;
  flex-direction: column;
  align-items: flex-start;
  color: #7f8da2;
  font-size: 11px;
}

.event-open-btn {
  margin-top: 22px;
  padding: 8px 12px;
  border: 1px solid rgba(255,255,255,.08);
  border-radius: 7px;
  background: rgba(255,255,255,.035);
  color: #cbd5e5;
  font-size: 10px;
}

.event-open-btn:hover,
.events-icon.active {
  background: rgba(93,137,202,.12);
  color: #8fb8f5;
}

.content {
  width: 100%;
  max-width: none;
  margin: 0;
  padding: 43px 35px 80px;
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

.zones-footer-intro {
  margin-top: 48px;
  padding: 28px 0 10px;
  border-top: 1px solid rgba(255,255,255,.06);
}

.zones-footer-intro h2 {
  margin: 0 0 8px;
  color: #dce5f2;
  font-size: 18px;
  font-weight: 600;
}

.zones-footer-intro p {
  max-width: 680px;
  margin: 0;
  color: #718096;
  font-size: 10px;
  line-height: 1.7;
}

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

/* ZONE AREA SELECTION */

.zone-area-selection,
.specific-zone-directory {
  margin-bottom: 30px;
}

.zone-selection-heading {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 24px;
  margin-bottom: 15px;
}

.zone-selection-heading.compact {
  margin-top: 34px;
}

.zone-selection-heading h2 {
  margin: 7px 0 7px;
  font-size: 21px;
  letter-spacing: -.02em;
}

.zone-selection-heading p {
  max-width: 720px;
  margin: 0;
  color: #788497;
  font-size: 10px;
  line-height: 1.7;
}

.zone-selection-note {
  flex-shrink: 0;
  padding: 6px 9px;
  border: 1px solid rgba(91,139,208,.18);
  border-radius: 5px;
  color: #7196c3;
  font-size: 7px;
  letter-spacing: .12em;
}

.specific-zone-layout {
  display: grid;
  grid-template-columns: minmax(0, 1.45fr) minmax(300px, .75fr);
  gap: 28px;
  align-items: start;
}

.governorate-engagement {
  padding: 22px;
  border: 1px solid rgba(255,255,255,.07);
  border-radius: 14px;
  background:
    radial-gradient(circle at 85% 10%, rgba(114,57,214,.12), transparent 45%),
    rgba(255,255,255,.018);
}

.governorate-engagement-top {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: center;
}

.governorate-engagement h2 {
  margin: 18px 0 8px;
  color: #e4ebf6;
  font-size: 20px;
  font-weight: 600;
}

.governorate-engagement-intro {
  margin: 0 0 18px;
  color: #78859a;
  font-size: 9px;
  line-height: 1.65;
}

.governorate-prompt-list {
  display: grid;
  gap: 7px;
}

.governorate-prompt {
  display: grid;
  grid-template-columns: 66px 1fr;
  gap: 10px;
  align-items: center;
  padding: 10px 11px;
  border: 1px solid rgba(255,255,255,.055);
  border-radius: 9px;
  background: rgba(255,255,255,.018);
  color: #b9c5d7;
  text-align: left;
  cursor: pointer;
  transition: .2s ease;
}

.governorate-prompt:hover,
.governorate-prompt.active {
  border-color: rgba(112,153,213,.3);
  background: rgba(74,115,181,.08);
}

.governorate-prompt span {
  color: #64748a;
  font-size: 7px;
  letter-spacing: .12em;
}

.governorate-prompt strong {
  font-size: 9px;
  font-weight: 500;
}

.governorate-prompt-response {
  margin-top: 14px;
  padding-top: 14px;
  border-top: 1px solid rgba(255,255,255,.055);
}

.governorate-prompt-response p {
  margin: 8px 0 14px;
  color: #8e9bad;
  font-size: 8px;
  line-height: 1.65;
}

.governorate-engage-btn {
  border: 0;
  background: transparent;
  color: #91b8ec;
  font-size: 8px;
  letter-spacing: .08em;
  cursor: pointer;
}

.zone-area-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
}

.zone-preview-space {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.zone-preview-header {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 20px;
  padding: 24px;
  border: 1px solid rgba(255,255,255,.07);
  border-radius: 13px;
  background:
    radial-gradient(circle at 100% 0, rgba(72,112,177,.12), transparent 42%),
    rgba(255,255,255,.018);
}

.zone-preview-header h2 {
  margin: 7px 0 5px;
  font-size: 30px;
}

.zone-preview-header p {
  margin: 0;
  color: #718096;
  font-size: 9px;
}

.enter-zone-btn {
  flex-shrink: 0;
  padding: 10px 14px;
  border: 1px solid rgba(100,151,224,.3);
  border-radius: 7px;
  background: rgba(72,112,177,.1);
  color: #9fc4f2;
  font-size: 9px;
  font-weight: 700;
  cursor: pointer;
}

.enter-zone-btn:hover {
  border-color: rgba(100,151,224,.5);
  background: rgba(72,112,177,.16);
}

.zone-preview-posts {
  display: grid;
  gap: 9px;
}

.zone-preview-post {
  display: flex;
  gap: 11px;
  padding: 15px;
  border: 1px solid rgba(255,255,255,.06);
  border-radius: 10px;
  background: rgba(255,255,255,.014);
}

.zone-preview-post-copy {
  min-width: 0;
  flex: 1;
}

.zone-preview-post-meta {
  display: flex;
  align-items: center;
  gap: 8px;
}

.zone-preview-post-meta strong {
  font-size: 10px;
}

.zone-preview-post-meta span {
  color: #5f6c80;
  font-size: 8px;
}

.zone-preview-post-copy p {
  margin: 7px 0 8px;
  color: #a6b1c2;
  font-size: 10px;
  line-height: 1.65;
}

.zone-preview-post-actions {
  display: flex;
  gap: 12px;
  color: #637188;
  font-size: 8px;
}

.zone-preview-empty {
  padding: 28px;
  border: 1px dashed rgba(255,255,255,.08);
  border-radius: 10px;
  text-align: center;
}

.zone-preview-empty strong,
.zone-preview-empty span {
  display: block;
}

.zone-preview-empty strong {
  color: #a5b2c5;
  font-size: 11px;
}

.zone-preview-empty span {
  margin-top: 6px;
  color: #687589;
  font-size: 9px;
}

.zone-navigation-space {
  margin-bottom: 24px;
}

.zone-area-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.zone-area-card {
  min-height: 190px;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: flex-end;
  padding: 0;
  border: 1px solid rgba(255,255,255,.065);
  border-radius: 12px;
  background: #0d131e;
  color: #dce4f0;
  text-align: left;
  cursor: pointer;
  transition: border-color .2s ease, transform .2s ease;
}

.zone-area-card:hover {
  transform: translateY(-2px);
  border-color: rgba(100,151,224,.35);
}

.zone-area-image {
  position: absolute;
  inset: 0;
  display: block;
  background-position: center;
  background-size: cover;
  opacity: .55;
  transition: transform .35s ease, opacity .25s ease;
}

.zone-area-card:hover .zone-area-image {
  transform: scale(1.04);
  opacity: .68;
}

.zone-area-card::after {
  content: '';
  position: absolute;
  inset: 35% 0 0;
  background: linear-gradient(180deg, transparent, rgba(4,7,13,.96));
}

.zone-area-card-content {
  position: relative;
  z-index: 1;
  display: block;
  min-width: 0;
  padding: 22px 18px 18px;
  padding-right: 80px;
}

.zone-area-card-content strong,
.zone-area-card-content span,
.zone-area-card-content small {
  display: block;
}

.zone-area-card-content strong {
  font-size: 17px;
  letter-spacing: -.01em;
}

.zone-area-card-content span {
  margin-top: 6px;
  color: #aab5c6;
  font-size: 9px;
  line-height: 1.55;
}

.zone-area-card-content small {
  margin-top: 9px;
  color: #7188a8;
  font-size: 8px;
}

.zone-area-card b {
  position: absolute;
  z-index: 2;
  right: 16px;
  bottom: 17px;
  color: #8db5e8;
  font-size: 8px;
  letter-spacing: .08em;
  white-space: nowrap;
}

.selected-area-space {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.zone-navigation-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 15px;
}

.zone-back-btn {
  padding: 8px 11px;
  border: 1px solid rgba(255,255,255,.08);
  border-radius: 7px;
  background: rgba(255,255,255,.025);
  color: #a8b6c9;
  font-size: 9px;
  cursor: pointer;
}

.zone-back-btn:hover {
  border-color: rgba(100,151,224,.3);
  color: #dce7f5;
}

.selected-area-hero {
  min-height: 220px;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: flex-end;
  border: 1px solid rgba(255,255,255,.07);
  border-radius: 13px;
  background-position: center;
  background-size: cover;
}

.selected-area-hero-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, rgba(4,7,13,.92), rgba(4,7,13,.48), rgba(4,7,13,.35));
}

.selected-area-hero-content {
  position: relative;
  z-index: 1;
  max-width: 620px;
  padding: 30px;
}

.selected-area-hero-content h2 {
  margin: 7px 0 8px;
  font-size: 32px;
}

.selected-area-hero-content p {
  margin: 0;
  color: #8b98ab;
  font-size: 10px;
  line-height: 1.65;
}

.zone-area-card {
  min-height: 116px;
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: start;
  gap: 11px;
  padding: 15px;
  border: 1px solid rgba(255,255,255,.065);
  border-radius: 10px;
  background:
    radial-gradient(circle at 100% 0, rgba(76,117,184,.07), transparent 45%),
    rgba(255,255,255,.018);
  color: #dce4f0;
  text-align: left;
  cursor: pointer;
  transition: border-color .2s ease, background .2s ease, transform .2s ease;
}

.zone-area-card:hover {
  transform: translateY(-1px);
  border-color: rgba(100,151,224,.25);
}

.zone-area-card.active {
  border-color: rgba(100,151,224,.42);
  background:
    radial-gradient(circle at 100% 0, rgba(76,117,184,.13), transparent 48%),
    rgba(72,112,177,.07);
}

.zone-area-icon {
  width: 30px;
  height: 30px;
  display: grid;
  place-items: center;
  border: 1px solid rgba(96,139,207,.2);
  border-radius: 8px;
  color: #82a8dc;
}

.zone-area-card strong,
.zone-area-card span {
  display: block;
}

.zone-area-card strong {
  font-size: 11px;
}

.zone-area-card div span {
  margin-top: 5px;
  color: #707d91;
  font-size: 8px;
  line-height: 1.5;
}

.zone-area-card b {
  color: #6f91bc;
  font-size: 8px;
  white-space: nowrap;
}

.create-action-card {
  width: 100%;
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  gap: 13px;
  align-items: center;
  margin-bottom: 12px;
  padding: 14px 15px;
  border: 1px solid rgba(115,160,222,.22);
  border-radius: 11px;
  background: linear-gradient(90deg, rgba(73,112,177,.10), rgba(114,57,214,.06));
  color: #dce6f4;
  text-align: left;
  cursor: pointer;
  transition: border-color .2s ease, background .2s ease, transform .2s ease;
}

.create-action-card:hover {
  border-color: rgba(132,176,234,.42);
  background: linear-gradient(90deg, rgba(73,112,177,.15), rgba(114,57,214,.09));
  transform: translateY(-1px);
}

.create-action-icon {
  width: 32px;
  height: 32px;
  display: grid;
  place-items: center;
  border: 1px solid rgba(132,176,234,.28);
  border-radius: 50%;
  color: #9bc2f2;
  font-size: 18px;
  font-weight: 300;
}

.create-action-card strong,
.create-action-card small {
  display: block;
}

.create-action-card strong {
  font-size: 9px;
  letter-spacing: .09em;
}

.create-action-card small {
  margin-top: 4px;
  color: #738197;
  font-size: 7.5px;
  line-height: 1.5;
}

.create-action-card b {
  color: #8fb5e8;
  font-size: 7px;
  letter-spacing: .08em;
}

.specific-zone-list {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 7px;
}

.specific-zone-item {
  min-width: 0;
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  gap: 9px;
  padding: 11px;
  border: 1px solid rgba(255,255,255,.055);
  border-radius: 8px;
  background: rgba(255,255,255,.014);
  color: #cbd5e3;
  text-align: left;
  cursor: pointer;
}

.specific-zone-item:hover,
.specific-zone-item.active {
  border-color: rgba(100,151,224,.3);
  background: rgba(72,112,177,.06);
}

.specific-zone-pin {
  color: #6389b9;
  font-size: 11px;
}

.specific-zone-item strong,
.specific-zone-item small {
  display: block;
}

.specific-zone-item strong {
  font-size: 9px;
}

.specific-zone-item small {
  margin-top: 3px;
  color: #667386;
  font-size: 7px;
}

.specific-zone-area {
  color: #5f7595;
  font-size: 7px;
  white-space: nowrap;
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
  max-height: calc(100dvh - 40px);
  overflow-y: auto;
  box-sizing: border-box;
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

@media (max-width: 700px) {
  .modal-backdrop { padding: 10px; place-items: start center; overflow-y: auto; }
  .modal { max-height: calc(100dvh - 20px); padding: 20px; margin: 0; }
  .create-type-switch { grid-template-columns: 1fr; }
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
    padding-left: 0;
    padding-bottom: 90px;
  }

  .topbar {
    margin-left: 0;
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

  .zone-area-grid {
    grid-template-columns: 1fr 1fr;
  }

  .specific-zone-list {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .zone-selection-heading {
    display: block;
  }

  .zone-selection-note {
    display: inline-block;
    margin-top: 10px;
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

  .zone-area-grid,
  .specific-zone-list {
    grid-template-columns: 1fr;
  }
}

/* =========================================
   MOBILE NAVIGATION
   ========================================= */

.mobile-nav {
  display: none;
}

.zone-preview-hero {
  background:
    radial-gradient(circle at 18% 12%, rgba(114, 57, 214, .20), transparent 34%),
    radial-gradient(circle at 84% 78%, rgba(58, 121, 200, .16), transparent 38%),
    #0a0f18 !important;
  padding: 0;
  min-height: 0;
  overflow: hidden;
}

.zone-conversation-space {
  position: relative;
  z-index: 2;
  padding: 34px;
}

.zone-region-label {
  color: #8da8cb;
  letter-spacing: .12em;
}

.zone-conversation-split {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(230px, 280px);
  gap: 18px;
  align-items: start;
}

.zone-conversation-split .zone-conversation-section {
  margin: 0;
}

.zone-question-section {
  min-width: 0;
}

.zone-initiative-section {
  min-width: 0;
  padding-left: 18px;
  border-left: 1px solid rgba(255,255,255,.065);
}

.zone-initiative-section .zone-conversation-section-head {
  display: block;
}

.zone-initiative-section .zone-conversation-count {
  display: block;
  margin-top: 7px;
}

.zone-initiative-card {
  grid-template-columns: auto minmax(0, 1fr);
  align-items: start;
  padding: 12px;
}

.zone-initiative-status {
  grid-column: 2;
  justify-self: start;
}

.zone-initiative-copy h4 {
  font-size: 10px;
}

.zone-initiative-copy p {
  font-size: 7.5px;
}

.zone-initiative-note {
  font-size: 6.5px;
}

.zone-conversation-heading {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 24px;
  padding-bottom: 28px;
  border-bottom: 1px solid rgba(255,255,255,.08);
}

.zone-conversation-heading h2 {
  margin: 7px 0 5px;
  font-size: clamp(30px, 4vw, 46px);
  letter-spacing: -.035em;
}

.zone-conversation-heading p {
  margin: 0;
  color: #8b98ab;
  font-size: 10px;
}

.zone-conversation-section {
  padding: 28px 0;
  border-bottom: 1px solid rgba(255,255,255,.065);
}

.zone-conversation-section-head {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 16px;
}

.zone-conversation-section-head h3 {
  margin: 6px 0 0;
  font-size: 17px;
  letter-spacing: -.02em;
}

.zone-conversation-count {
  color: #647186;
  font-size: 7px;
  letter-spacing: .11em;
}

.zone-preview-hero .zone-preview-posts {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

.zone-preview-hero .zone-preview-post {
  min-height: 150px;
  margin: 0;
  padding: 14px;
  border: 1px solid rgba(255,255,255,.065);
  border-radius: 10px;
  background: #ffffff;
  color: #172033;
}

.zone-preview-hero .zone-preview-post .avatar {
  flex-shrink: 0;
}

.zone-question-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.zone-question-card {
  padding: 15px;
  border: 1px solid rgba(255,255,255,.065);
  border-radius: 10px;
  background: rgba(255,255,255,.02);
}

.zone-question-top {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  color: #647186;
  font-size: 7px;
  letter-spacing: .09em;
}

.zone-topic {
  color: #83a9d9;
  font-size: 7px;
  font-weight: 800;
  letter-spacing: .1em;
}

.zone-question-card h4,
.zone-initiative-card h4 {
  margin: 10px 0 14px;
  font-size: 11px;
  line-height: 1.55;
}

.zone-help {
  display: flex;
  gap: 9px;
  padding-top: 11px;
  border-top: 1px solid rgba(255,255,255,.05);
}

.zone-help-avatar {
  flex: 0 0 28px;
  width: 28px;
  height: 28px;
}

.zone-help strong {
  display: block;
  font-size: 9px;
}

.zone-help p {
  margin: 4px 0 0;
  color: #7b8799;
  font-size: 8px;
  line-height: 1.55;
}

.zone-initiative-list {
  display: grid;
  gap: 9px;
}

.zone-initiative-card {
  display: grid;
  grid-template-columns: auto minmax(0,1fr) auto;
  align-items: center;
  gap: 13px;
  padding: 14px;
  border: 1px solid rgba(255,255,255,.065);
  border-radius: 10px;
  background: rgba(255,255,255,.02);
}

.zone-initiative-private-avatar {
  width: 38px;
  height: 38px;
  display: grid;
  place-items: center;
  border: 1px solid rgba(255,255,255,.09);
  border-radius: 50%;
  color: #657185;
  background: rgba(255,255,255,.04);
  filter: blur(2.8px);
  user-select: none;
  pointer-events: none;
}

.zone-initiative-copy {
  min-width: 0;
  pointer-events: none;
}

.zone-initiative-copy h4 {
  margin: 6px 0 5px;
}

.zone-initiative-copy p {
  margin: 0;
  color: #788497;
  font-size: 8px;
  line-height: 1.55;
}

.zone-initiative-note {
  display: block;
  margin-top: 7px;
  color: #596577;
  font-size: 7px;
}

.zone-initiative-status {
  padding: 5px 7px;
  border: 1px solid rgba(120,156,205,.16);
  border-radius: 5px;
  color: #7794ba;
  font-size: 7px;
  letter-spacing: .08em;
}

.zone-conversation-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 15px;
  padding-top: 20px;
}

.zone-conversation-footer > span {
  color: #596577;
  font-size: 8px;
}

@media (max-width: 900px) {
  .events-grid { grid-template-columns: 1fr; }

  .specific-zone-layout {
    grid-template-columns: 1fr;
  }


  .zone-preview-hero .zone-preview-posts {
    grid-template-columns: 1fr;
  }

  .zone-conversation-split {
    grid-template-columns: 1fr;
  }

  .zone-initiative-section {
    padding-left: 0;
    border-left: 0;
    border-top: 1px solid rgba(255,255,255,.065);
  }

  .zone-question-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 760px) {
  .zone-conversation-space {
    padding: 24px 20px;
  }

  .zone-conversation-heading,
  .zone-conversation-section-head,
  .zone-conversation-footer {
    display: block;
  }

  .zone-conversation-heading .enter-zone-btn {
    margin-top: 18px;
  }

  .zone-conversation-section-head .zone-conversation-count {
    display: block;
    margin-top: 8px;
  }

  .zone-initiative-card {
    grid-template-columns: auto minmax(0,1fr);
  }

  .zone-initiative-status {
    grid-column: 2;
    justify-self: start;
  }
}

.governorate-region-selector {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
  margin: 22px 0 30px;
}

.governorate-region-option {
  position: relative;
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
  padding: 13px 14px;
  border: 1px solid rgba(255,255,255,.07);
  border-radius: 12px;
  background: rgba(255,255,255,.018);
  color: #dce4f0;
  text-align: left;
  cursor: pointer;
  overflow: hidden;
  transition: border-color .25s ease, background .25s ease, transform .25s ease;
}

.governorate-region-option:hover {
  border-color: rgba(117,151,205,.25);
  background: rgba(255,255,255,.03);
  transform: translateY(-1px);
}

.governorate-region-option.active {
  border-color: rgba(116,160,222,.38);
  background: rgba(74,115,181,.08);
}

.governorate-region-orbit {
  position: relative;
  width: 38px;
  height: 38px;
  flex: 0 0 38px;
  display: grid;
  place-items: center;
  border: 1px solid rgba(120,157,211,.18);
  border-radius: 50%;
}

.governorate-region-orbit::before,
.governorate-region-orbit::after {
  content: '';
  position: absolute;
  inset: 5px;
  border: 1px solid rgba(120,157,211,.14);
  border-radius: 50%;
}

.governorate-region-orbit::after {
  inset: -3px;
  border-style: dashed;
  opacity: .55;
}

.governorate-region-option.active .governorate-region-orbit::after {
  animation: governorateRegionOrbit 4s linear infinite;
  border-color: rgba(126,171,232,.45);
}

.governorate-region-orbit-core {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #8bb7ef;
  box-shadow: 0 0 14px rgba(139,183,239,.35);
}

.governorate-region-option-copy {
  min-width: 0;
}

.governorate-region-option-copy strong,
.governorate-region-option-copy small {
  display: block;
}

.governorate-region-option-copy strong {
  font-size: 9px;
  letter-spacing: .09em;
}

.governorate-region-option-copy small {
  margin-top: 4px;
  color: #6f7c90;
  font-size: 7px;
  line-height: 1.4;
}

@keyframes governorateRegionOrbit {
  to { transform: rotate(360deg); }
}

@media (max-width: 760px) {
  .governorate-region-selector {
    grid-template-columns: 1fr 1fr;
  }
}

.zone-region-directory {
  display: grid;
  gap: 30px;
}

.zone-governorate-region {
  padding-top: 6px;
}

.zone-governorate-region + .zone-governorate-region {
  padding-top: 28px;
  border-top: 1px solid rgba(255,255,255,.07);
}

.zone-governorate-region-head {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 14px;
}

.zone-governorate-region-head h3 {
  margin: 5px 0 4px;
  font-size: 20px;
  letter-spacing: -.025em;
}

.zone-governorate-region-head p {
  margin: 0;
  color: #78869a;
  font-size: 9px;
  line-height: 1.5;
}

.zone-region-count {
  flex-shrink: 0;
  color: #657287;
  font-size: 7px;
  letter-spacing: .12em;
}

@media (max-width: 760px) {
  .zone-governorate-region-head {
    display: block;
  }

  .zone-region-count {
    display: inline-block;
    margin-top: 9px;
  }
}

.zone-preview-hero .zone-preview-split { min-height: 420px; height: 100%; border: 0; border-radius: 0; }
.zone-preview-hero .zone-preview-panel { min-height: 420px; }
.zone-preview-split{display:grid;grid-template-columns:1fr 1fr;min-height:360px;overflow:hidden;border:1px solid rgba(255,255,255,.08);border-radius:14px;background:#0b1019}.zone-preview-panel{position:relative;min-height:360px;overflow:hidden}.zone-preview-panel+.zone-preview-panel{border-left:1px solid rgba(255,255,255,.12)}.zone-preview-panel-image{position:absolute;inset:0;background-position:center;background-size:cover}.zone-preview-panel-overlay{position:absolute;inset:0;background:linear-gradient(180deg,rgba(4,7,12,.08),rgba(4,7,12,.86))}.zone-preview-panel-copy{position:absolute;left:24px;right:24px;bottom:22px;z-index:2}.zone-preview-panel-copy h2{margin:6px 0 5px;font-size:28px;letter-spacing:-.03em}.zone-preview-panel-copy p{margin:0;color:#a0adbf;font-size:10px}.governorate-panel .eyebrow{color:#8eb7e9}.zone-panel .eyebrow{color:#b79aee}@media(max-width:760px){.zone-preview-split{grid-template-columns:1fr}.zone-preview-panel+.zone-preview-panel{border-left:0;border-top:1px solid rgba(255,255,255,.12)}.zone-preview-panel{min-height:260px}}.zone-preview-header { flex-direction: column; align-items: flex-start; }

@media (max-width: 760px) {
  .mobile-navigation {
    position: fixed;
    left: 12px;
    right: 12px;
    bottom: 12px;
    z-index: 100;
    display: grid;
    gap: 6px;
  }

  .mobile-context-nav {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 5px;
    padding: 5px;
    background: rgba(10, 14, 23, .96);
    border: 1px solid rgba(255,255,255,.09);
    border-radius: 14px;
    box-shadow: 0 10px 30px rgba(0,0,0,.32);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
  }

  .mobile-context-nav button {
    min-height: 34px;
    border: 0;
    border-radius: 9px;
    background: transparent;
    color: rgba(233,238,248,.52);
    font-size: 9px;
    font-weight: 700;
    cursor: pointer;
  }

  .mobile-context-nav button.active {
    color: #dfeaff;
    background: rgba(74,120,194,.12);
  }

  .mobile-nav {
    position: relative;
    left: auto;
    right: auto;
    bottom: auto;
    height: 64px;
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    padding: 5px;
    background: rgba(10, 14, 23, .96);
    border: 1px solid rgba(255,255,255,.09);
    border-radius: 18px;
    box-shadow:
      0 14px 40px rgba(0,0,0,.45),
      0 0 0 1px rgba(255,255,255,.02);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
  }

  .mobile-nav button {
    border: 0;
    background: transparent;
    color: rgba(233,238,248,.48);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 3px;
    border-radius: 13px;
    font-size: 9px;
    font-weight: 700;
    cursor: pointer;
    transition: background .2s ease, color .2s ease;
  }

  .mobile-nav button:hover {
    color: rgba(233,238,248,.8);
  }

  .mobile-nav button.active {
    color: #fff;
    background: rgba(255,255,255,.07);
  }

  .mobile-nav-icon {
    font-size: 20px;
    line-height: 1;
  }

  .mobile-nav button.active .mobile-nav-icon {
    color: #7aa7ff;
  }
}

/* OFFICIAL MEMBERS — ZONE STRUCTURE SIDEBAR */
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



/* =====================================================
   PAGES & COMMONS ENHANCEMENT
   ===================================================== */
.pages-commons-page { max-width: 1180px; }
.commons-hero {
  min-height: 330px; display:grid; grid-template-columns:minmax(0,1.25fr) 360px; gap:40px;
  align-items:center; padding:42px 46px; margin-bottom:18px; overflow:hidden; position:relative;
  border:1px solid rgba(111,145,199,.16); border-radius:24px;
  background:radial-gradient(circle at 78% 50%, rgba(83,117,191,.14), transparent 35%), linear-gradient(135deg, rgba(20,29,46,.96), rgba(8,12,21,.98));
}
.commons-hero::after { content:""; position:absolute; inset:auto -10% -70%; height:240px; background:radial-gradient(circle, rgba(114,57,214,.13), transparent 65%); pointer-events:none; }
.commons-hero-copy { position:relative; z-index:2; }
.commons-hero-copy h1 { margin:11px 0 14px; font-size:clamp(32px,4vw,50px); line-height:1.04; letter-spacing:-.045em; font-weight:650; }
.commons-hero-copy h1 span { color:#7caeff; }
.commons-hero-copy p { max-width:650px; margin:0; color:#8d99ac; font-size:14px; line-height:1.8; }
.commons-hero-actions { display:flex; gap:10px; flex-wrap:wrap; margin-top:25px; }
.commons-orbit-visual { width:300px; height:260px; position:relative; display:grid; place-items:center; justify-self:center; }
.commons-orbit-ring { position:absolute; border:1px solid rgba(105,153,226,.24); border-radius:50%; transform:rotate(-18deg); }
.commons-orbit-ring.ring-a { width:220px; height:105px; }
.commons-orbit-ring.ring-b { width:150px; height:230px; transform:rotate(42deg); border-color:rgba(145,111,224,.22); }
.commons-orbit-core { width:112px; height:112px; border-radius:50%; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:7px; border:1px solid rgba(135,177,239,.4); background:radial-gradient(circle at 35% 30%, rgba(103,164,255,.25), rgba(14,22,36,.96) 70%); box-shadow:0 0 45px rgba(72,113,186,.18); text-align:center; }
.commons-orbit-core span { font-size:11px; letter-spacing:.16em; color:#dbe8fa; }
.commons-orbit-core b { font-size:6px; letter-spacing:.12em; color:#66758e; }
.commons-orbit-dot { position:absolute; width:7px; height:7px; border-radius:50%; background:#77b0ff; box-shadow:0 0 14px rgba(119,176,255,.55); }
.commons-orbit-dot.dot-a { top:34px; right:40px; }.commons-orbit-dot.dot-b { bottom:38px; left:34px; }.commons-orbit-dot.dot-c { top:90px; left:12px; }
.commons-stat-strip { display:grid; grid-template-columns:repeat(4,1fr); gap:1px; margin:0 0 42px; border:1px solid rgba(255,255,255,.06); border-radius:14px; overflow:hidden; background:rgba(255,255,255,.04); }
.commons-stat-strip div { padding:18px 20px; background:#0a0f18; }.commons-stat-strip strong { display:block; color:#e8eef8; font-size:19px; }.commons-stat-strip span { display:block; margin-top:5px; color:#68758a; font-size:9px; letter-spacing:.1em; text-transform:uppercase; }
.commons-section-heading { display:flex; justify-content:space-between; gap:20px; align-items:flex-end; margin:0 0 15px; }.commons-section-heading h2 { margin:7px 0 5px; font-size:22px; letter-spacing:-.025em; }.commons-section-heading p { margin:0; color:#748196; font-size:11px; line-height:1.6; max-width:650px; }.commons-status { padding:7px 10px; border:1px solid rgba(74,222,128,.16); border-radius:999px; color:#7fd99c; font-size:8px; letter-spacing:.12em; white-space:nowrap; }
.featured-common { display:grid; grid-template-columns:auto minmax(0,1fr) auto; gap:20px; align-items:center; padding:22px; margin-bottom:42px; border:1px solid rgba(111,145,199,.16); border-radius:16px; background:linear-gradient(110deg, rgba(25,34,51,.9), rgba(10,15,24,.9)); }.featured-common-mark { width:68px; height:68px; display:grid; place-items:center; border-radius:18px; color:#fff; font-weight:800; font-size:20px; box-shadow:0 14px 30px rgba(0,0,0,.25); }.featured-common-meta { display:flex; gap:12px; color:#738096; font-size:9px; text-transform:uppercase; letter-spacing:.1em; }.featured-common-main h3 { margin:8px 0 6px; font-size:19px; }.featured-common-main p { margin:0; color:#7f8ca0; font-size:11px; line-height:1.7; }.featured-common-links { display:flex; gap:15px; margin-top:12px; color:#9eabc0; font-size:9px; }.featured-follow { padding:10px 15px; border:1px solid rgba(103,164,255,.3); border-radius:9px; background:rgba(74,120,194,.1); color:#a9caff; font-size:10px; }.featured-follow.following { color:#c8d4e5; border-color:rgba(255,255,255,.1); background:rgba(255,255,255,.04); }
.pages-heading { margin-top:5px; }.page-discovery-tools { display:flex; gap:12px; align-items:center; margin-bottom:17px; flex-wrap:wrap; }.page-search-field { flex:1 1 300px; min-width:250px; display:flex; align-items:center; gap:8px; padding:10px 12px; border:1px solid rgba(255,255,255,.08); border-radius:10px; background:#0a0f18; color:#65738a; }.page-search-field input { flex:1; min-width:0; border:0; outline:0; background:transparent; color:#dce6f4; font-size:11px; }.page-search-field button { color:#718096; background:none; }.page-category-list { display:flex; gap:6px; overflow:auto; padding-bottom:2px; }.page-category-list button { padding:8px 11px; border:1px solid rgba(255,255,255,.07); border-radius:999px; background:#0b1019; color:#748196; font-size:9px; white-space:nowrap; }.page-category-list button.active { color:#dbe8fa; border-color:rgba(103,164,255,.35); background:rgba(74,120,194,.12); }
.enhanced-page-grid { grid-template-columns:repeat(2,minmax(0,1fr)); gap:14px; }.enhanced-page-card { overflow:hidden; border:1px solid rgba(255,255,255,.07); background:#0b1019; }.enhanced-page-card:hover { transform:translateY(-2px); border-color:rgba(103,164,255,.25); }.enhanced-page-card .page-cover { height:145px; position:relative; overflow:hidden; }.page-cover-glow { position:absolute; width:180px; height:180px; right:-30px; top:-65px; border-radius:50%; background:rgba(255,255,255,.08); filter:blur(22px); }.enhanced-page-card .page-logo { position:absolute; left:20px; bottom:-18px; width:64px; height:64px; display:grid; place-items:center; border:4px solid #0b1019; border-radius:18px; background:#101827; color:#eaf2ff; font-size:17px; font-weight:800; }.page-cover-category { position:absolute; right:13px; top:12px; padding:6px 8px; border-radius:999px; background:rgba(4,8,14,.5); color:#c7d3e5; font-size:8px; letter-spacing:.1em; text-transform:uppercase; backdrop-filter:blur(8px); }.enhanced-page-card .page-card-body { padding:31px 19px 18px; }.page-card-topline { display:flex; justify-content:space-between; color:#66748a; font-size:9px; }.enhanced-page-card h3 { margin:8px 0 6px; font-size:17px; }.enhanced-page-card p { min-height:38px; margin:0; color:#7d899c; font-size:10px; line-height:1.65; }.page-card-footer { display:flex; justify-content:space-between; align-items:center; gap:10px; margin-top:18px; }.page-common-label { color:#59677d; font-size:8px; letter-spacing:.1em; }.page-empty { grid-column:1/-1; }
.commons-feed-heading { margin-top:50px; }.commons-activity-grid { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:12px; }.commons-activity-card { padding:17px; border:1px solid rgba(255,255,255,.07); border-radius:14px; background:rgba(11,16,25,.82); }.commons-activity-head { display:flex; align-items:center; gap:10px; }.commons-activity-head strong,.commons-activity-head span { display:block; }.commons-activity-head strong { font-size:11px; }.commons-activity-head span { margin-top:3px; color:#68758a; font-size:8px; }.commons-activity-card p { min-height:72px; margin:16px 0; color:#a1adbf; font-size:10px; line-height:1.75; }.commons-activity-foot { display:flex; gap:12px; color:#69768a; font-size:9px; padding-top:11px; border-top:1px solid rgba(255,255,255,.05); }
@media (max-width: 900px) { .commons-hero { grid-template-columns:1fr; padding:30px; }.commons-orbit-visual { display:none; }.commons-stat-strip { grid-template-columns:repeat(2,1fr); }.featured-common { grid-template-columns:auto 1fr; }.featured-follow { grid-column:2; justify-self:start; }.commons-activity-grid { grid-template-columns:1fr; } }
@media (max-width: 620px) { .commons-hero-copy h1 { font-size:31px; }.commons-hero { padding:25px 20px; }.enhanced-page-grid { grid-template-columns:1fr; }.commons-stat-strip { grid-template-columns:1fr 1fr; }.featured-common { grid-template-columns:1fr; }.featured-follow { grid-column:auto; }.commons-section-heading { align-items:flex-start; flex-direction:column; } }



/* CREATE PAGE / CALL */
.create-choice-modal { max-width: 720px; max-height: calc(100dvh - 40px); overflow-y: auto; }
.create-type-switch { display:grid; grid-template-columns:1fr 1fr; gap:10px; margin:18px 0 22px; }
.create-type-switch button { text-align:left; padding:17px; border:1px solid rgba(255,255,255,.07); border-radius:14px; background:#0b111b; color:#dbe5f3; }
.create-type-switch button:hover { border-color:rgba(103,164,255,.25); }
.create-type-switch button.active { border-color:rgba(103,164,255,.42); background:linear-gradient(135deg,rgba(57,91,148,.18),rgba(11,17,27,.96)); }
.create-type-switch span,.create-type-switch strong,.create-type-switch small,.create-type-switch b { display:block; }
.create-type-switch span { color:#7faef1; font-size:8px; letter-spacing:.15em; font-weight:800; }
.create-type-switch strong { margin-top:8px; font-size:15px; }
.create-type-switch small { margin-top:7px; min-height:31px; color:#718096; font-size:9px; line-height:1.55; }
.create-type-switch b { margin-top:13px; color:#8c9bb0; font-size:8px; letter-spacing:.12em; }
.create-form { display:grid; gap:13px; }
.create-form-heading { padding:13px 14px; border:1px solid rgba(255,255,255,.06); border-radius:11px; background:rgba(255,255,255,.02); }
.create-form-heading p { margin:6px 0 0; color:#7d899c; font-size:10px; line-height:1.55; }
.optional-label { margin-left:5px; color:#56647a; font-size:7px; letter-spacing:.1em; }
@media(max-width:620px){ .create-type-switch{grid-template-columns:1fr}.create-choice-modal{max-width:none} }

/* CALL DISCOVERY */
.call-discovery-heading { margin-top: 48px; }
.call-search-tools { display:flex; gap:12px; align-items:center; margin-bottom:18px; flex-wrap:wrap; }
.call-search-field { flex:1 1 300px; }
.call-discovery-grid { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:14px; margin-bottom:46px; }
.call-discovery-card { overflow:hidden; border:1px solid rgba(255,255,255,.07); border-radius:15px; background:#0b1019; transition:transform .2s,border-color .2s; }
.call-discovery-card:hover { transform:translateY(-2px); border-color:rgba(103,164,255,.24); }
.call-discovery-cover { min-height:150px; padding:20px; display:flex; flex-direction:column; justify-content:flex-end; gap:8px; background:radial-gradient(circle at 80% 20%,rgba(94,137,217,.2),transparent 45%),linear-gradient(145deg,#152137,#090e17); border-bottom:1px solid rgba(255,255,255,.06); }
.call-discovery-cover span { color:#80adf0; font-size:7px; font-weight:800; letter-spacing:.14em; }
.call-discovery-cover strong { font-size:21px; letter-spacing:-.025em; }
.call-discovery-cover small { color:#738198; font-size:9px; }
.call-discovery-body { padding:17px; }
.call-discovery-author { display:flex; align-items:center; gap:9px; }
.call-discovery-author .avatar { flex:0 0 auto; }
.call-discovery-author strong,.call-discovery-author span { display:block; }
.call-discovery-author strong { font-size:10px; }
.call-discovery-author span { margin-top:3px; color:#68758a; font-size:8px; }
.call-discovery-body h3 { margin:16px 0 7px; font-size:13px; line-height:1.45; color:#dbe4f0; }
.call-discovery-body p { margin:0; color:#748196; font-size:9px; line-height:1.7; min-height:46px; }
.call-discovery-stats { display:flex; gap:12px; margin:15px 0; color:#657389; font-size:8px; }
.call-discovery-stats strong { color:#aebbd0; }
.call-discovery-actions { display:flex; gap:7px; }
.call-discovery-actions .primary-btn,.call-discovery-actions .ghost-btn { flex:1; text-align:center; padding:9px 8px; }
@media(max-width:1100px){ .call-discovery-grid { grid-template-columns:repeat(2,minmax(0,1fr)); } }
@media(max-width:700px){ .call-discovery-grid { grid-template-columns:1fr; } }

/* LAST HOPE — open call space */
.last-hope-card { display:grid; grid-template-columns:245px minmax(0,1fr); overflow:hidden; margin-bottom:42px; border:1px solid rgba(111,145,199,.18); border-radius:18px; background:linear-gradient(135deg,#101827,#090e17); }
.last-hope-cover { min-height:365px; position:relative; display:grid; place-items:center; overflow:hidden; background:radial-gradient(circle at 50% 45%,rgba(88,145,222,.24),transparent 30%),linear-gradient(145deg,#17263d,#0b101a); }
.last-hope-cover::before,.last-hope-cover::after { content:""; position:absolute; border:1px solid rgba(119,176,255,.2); border-radius:50%; transform:rotate(-25deg); }
.last-hope-cover::before { width:260px;height:115px; }.last-hope-cover::after { width:160px;height:290px;transform:rotate(40deg);border-color:rgba(139,92,246,.18); }
.last-hope-orbit { position:absolute; width:90px;height:90px;border-radius:50%;border:1px solid rgba(135,190,255,.35);box-shadow:0 0 45px rgba(70,130,210,.2); }
.last-hope-mark { position:relative; z-index:2; width:82px;height:82px;display:grid;place-items:center;border-radius:50%;background:radial-gradient(circle at 35% 30%,#6c9fe0,#121b2b 68%);border:1px solid rgba(188,216,255,.4);color:#edf5ff;font-size:19px;font-weight:700;letter-spacing:.08em; }
.last-hope-location { position:absolute;bottom:18px;left:18px;z-index:3;color:#aebbd0;font-size:9px;letter-spacing:.08em; }
.last-hope-main { padding:28px 28px 24px; }.last-hope-topline,.last-hope-interaction-meta { display:flex;justify-content:space-between;gap:12px;color:#64738a;font-size:8px;text-transform:uppercase;letter-spacing:.1em; }.last-hope-type { color:#8db9f3; }.last-hope-author { display:flex;gap:10px;align-items:center;margin-top:19px; }.last-hope-author strong,.last-hope-author span { display:block; }.last-hope-author strong { font-size:11px; }.last-hope-author span { margin-top:3px;color:#68768b;font-size:8px; }.last-hope-main h3 { margin:19px 0 7px;font-size:25px;letter-spacing:-.03em; }.last-hope-main h4 { margin:0 0 11px;color:#d5deeb;font-size:15px;line-height:1.45;font-weight:500; }.last-hope-main>p { margin:0;color:#7f8ca0;font-size:10px;line-height:1.75;max-width:670px; }.last-hope-stats { display:flex;gap:20px;margin-top:19px;padding-top:15px;border-top:1px solid rgba(255,255,255,.06); }.last-hope-stats span { color:#69778c;font-size:8px;text-transform:uppercase;letter-spacing:.07em; }.last-hope-stats strong { color:#dce7f6;font-size:15px;margin-right:4px; }.last-hope-actions { display:flex;gap:9px;margin-top:18px; }.last-hope-actions .primary-btn { padding:10px 14px;font-size:9px; }.last-hope-actions .ghost-btn { padding:9px 13px; }
.last-hope-space { grid-column:1/-1; padding:22px 25px 25px;border-top:1px solid rgba(255,255,255,.06);background:rgba(6,10,17,.45); }.last-hope-space-heading { display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:13px; }.last-hope-space-heading h4 { margin:6px 0 0;font-size:14px; }.last-hope-space-heading>span { color:#637187;font-size:8px; }.last-hope-interactions { display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px; }.last-hope-interaction { display:flex;gap:10px;padding:13px;border:1px solid rgba(255,255,255,.06);border-radius:12px;background:#0b111b; }.last-hope-interaction .avatar { flex:none; }.last-hope-interaction p { margin:8px 0;color:#8996a9;font-size:9px;line-height:1.65; }.last-hope-like { color:#65748a;font-size:8px; }
@media (max-width:900px){.last-hope-card{grid-template-columns:1fr}.last-hope-cover{min-height:180px}.last-hope-interactions{grid-template-columns:1fr 1fr}}
@media (max-width:620px){.last-hope-interactions{grid-template-columns:1fr}.last-hope-main{padding:22px 18px}.last-hope-stats{gap:12px;flex-wrap:wrap}}



/* UNIVERSAL DISCOVERY / CLICKABLE NETWORK */
.avatar-button,.post-author-button,.person-click-target,.profile-mini-main,.create-sidebar-button,.profile-dots { border:0; background:none; padding:0; cursor:pointer; }
.post-author-button { text-align:left; color:inherit; }
.post-head .avatar-button { display:grid; place-items:center; flex:0 0 auto; }
.post-inspiration { margin:17px 0 4px; padding:14px; border:1px solid rgba(255,255,255,.06); border-radius:13px; background:rgba(255,255,255,.018); }
.post-inspiration-heading { display:flex; align-items:center; gap:10px; margin-bottom:10px; }
.post-inspiration-heading strong { color:#dbe5f2; font-size:11px; }
.post-inspiration-grid { display:grid; grid-template-columns:1fr 1fr; gap:8px; }
.post-inspiration-card { min-width:0; padding:12px; text-align:left; border:1px solid rgba(255,255,255,.06); border-radius:10px; background:#0b111b; color:#dbe5f2; cursor:pointer; }
.post-inspiration-card:hover { border-color:rgba(103,164,255,.3); background:rgba(74,120,194,.06); }
.post-inspiration-card span,.post-inspiration-card strong,.post-inspiration-card small { display:block; }
.post-inspiration-card span { color:#7eabed; font-size:7px; font-weight:800; letter-spacing:.13em; }
.post-inspiration-card strong { margin-top:6px; font-size:10px; line-height:1.35; }
.post-inspiration-card small { margin-top:6px; color:#718096; font-size:8px; line-height:1.55; }
.person-click-target { display:flex; align-items:center; gap:9px; flex:1; min-width:0; text-align:left; color:inherit; }
.person-click-target .person-info { min-width:0; }
.sidebar-bottom { padding-bottom:2px; }
.profile-mini { display:flex; align-items:center; gap:9px; }
.profile-mini-main { display:flex; align-items:center; gap:9px; min-width:0; flex:1; color:#dce5f2; text-align:left; }
.profile-mini-main strong,.profile-mini-main small { display:block; }
.profile-mini-main small { margin-top:2px; color:#66748a; font-size:8px; }
.create-sidebar-button { width:34px; height:34px; flex:0 0 34px; display:grid; place-items:center; border:1px solid rgba(103,164,255,.3); border-radius:10px; background:rgba(74,120,194,.1); color:#b9d3f8; font-size:20px; line-height:1; }
.create-sidebar-button:hover { border-color:rgba(103,164,255,.55); background:rgba(74,120,194,.18); }
.profile-dots { color:#69778c; padding:7px 3px; }
.profile-page { max-width:980px; }
.back-inline { margin-bottom:15px; }
.profile-hero-card,.page-profile-hero { display:flex; align-items:center; gap:24px; padding:30px; border:1px solid rgba(111,145,199,.16); border-radius:20px; background:linear-gradient(135deg,#111b2b,#090e17); }
.profile-hero-copy h1 { margin:8px 0 7px; font-size:36px; }
.profile-hero-copy p { margin:5px 0; color:#7d899c; font-size:11px; line-height:1.7; }
.profile-actions { display:flex; gap:9px; margin-top:18px; flex-wrap:wrap; }
.profile-section-card,.page-profile-space { margin-top:15px; padding:22px; border:1px solid rgba(255,255,255,.07); border-radius:15px; background:#0b1019; }
.profile-section-card h2,.page-profile-space h2 { margin:8px 0 7px; font-size:18px; }
.profile-section-card p,.page-profile-space p { margin:0; max-width:700px; color:#7d899c; font-size:10px; line-height:1.7; }
.page-profile-logo { width:90px; height:90px; flex:0 0 90px; display:grid; place-items:center; border-radius:22px; color:#fff; font-size:24px; font-weight:800; }
.page-profile-space { display:flex; justify-content:space-between; gap:20px; align-items:center; }
.page-profile-actions { display:flex; gap:8px; flex-wrap:wrap; }
.call-space-page { max-width:1080px; }
.call-space-hero { display:grid; grid-template-columns:190px minmax(0,1fr); gap:30px; align-items:center; padding:32px; border:1px solid rgba(111,145,199,.18); border-radius:20px; background:radial-gradient(circle at 12% 50%,rgba(83,117,191,.18),transparent 28%),linear-gradient(135deg,#111b2b,#090e17); }
.call-space-orbit { width:150px; height:150px; display:grid; place-items:center; margin:auto; border:1px solid rgba(119,176,255,.28); border-radius:50%; box-shadow:0 0 55px rgba(70,130,210,.12); background:radial-gradient(circle,#182b49,#0a111d 65%); color:#a8caff; font-size:10px; letter-spacing:.18em; }
.call-space-hero h1 { margin:8px 0; font-size:38px; letter-spacing:-.04em; }
.call-space-headline { color:#dce7f5 !important; font-size:15px !important; line-height:1.55 !important; }
.call-space-hero p { max-width:720px; margin:7px 0; color:#7d899c; font-size:10px; line-height:1.7; }
.call-space-meta { display:flex; gap:15px; flex-wrap:wrap; margin-top:17px; color:#68768b; font-size:8px; }
.call-space-actions { display:flex; gap:8px; margin-top:18px; flex-wrap:wrap; }
.call-space-grid { display:grid; grid-template-columns:minmax(0,1fr) 210px; gap:15px; margin-top:15px; }
.call-space-main,.call-space-side { padding:21px; border:1px solid rgba(255,255,255,.07); border-radius:15px; background:#0b1019; }
.call-space-side { display:grid; align-content:start; gap:10px; }
.call-space-side div { padding:14px; border:1px solid rgba(255,255,255,.06); border-radius:10px; background:rgba(255,255,255,.018); }
.call-space-side strong,.call-space-side span { display:block; }.call-space-side strong { font-size:21px; }.call-space-side span { margin-top:4px; color:#68758a; font-size:8px; text-transform:uppercase; letter-spacing:.1em; }
.call-space-empty { padding:30px 10px; text-align:center; }.call-space-empty h3 { margin:10px 0 7px; font-size:16px; }.call-space-empty p { margin:0; color:#748196; font-size:10px; line-height:1.7; }
@media(max-width:700px){ .post-inspiration-grid{grid-template-columns:1fr}.profile-hero-card,.page-profile-hero{align-items:flex-start; flex-direction:column}.page-profile-space{align-items:flex-start; flex-direction:column}.call-space-hero{grid-template-columns:1fr;padding:23px}.call-space-orbit{width:110px;height:110px}.call-space-hero h1{font-size:30px}.call-space-grid{grid-template-columns:1fr}.call-space-side{grid-template-columns:repeat(3,1fr)}.call-space-side button{grid-column:1/-1} }

.call-launcher-button { width:100%; border:0; background:none; padding:0; color:inherit; cursor:pointer; text-align:left; }
.call-launcher-button:hover strong { color:#a9caff; }
.enhanced-page-card[role="button"] { cursor:pointer; }
.enhanced-page-card[role="button"]:focus-visible { outline:1px solid rgba(103,164,255,.55); outline-offset:2px; }
.enhanced-page-card .follow-btn { position:relative; z-index:2; }

/* ENTITIES */
.entity-network-section { margin-top: 42px; }
.entity-context-grid { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:10px; margin:0 0 16px; }
.entity-context-card { padding:15px; border:1px solid rgba(255,255,255,.06); border-radius:13px; background:#0b1019; }
.entity-context-card span,.entity-context-card strong,.entity-context-card small { display:block; }
.entity-context-card strong { margin-top:7px; color:#e4edf9; font-size:22px; }
.entity-context-card small { margin-top:5px; color:#69778b; font-size:8px; line-height:1.55; }
.entity-grid { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:13px; }
.entity-card { padding:17px; border:1px solid rgba(255,255,255,.07); border-radius:15px; background:#0b1019; }
.entity-card:hover { border-color:rgba(103,164,255,.22); }
.entity-card-top { display:flex; justify-content:space-between; gap:10px; align-items:center; }
.entity-type { color:#80adf0; font-size:7px; font-weight:800; letter-spacing:.13em; }
.entity-detection { color:#66758a; font-size:7px; text-align:right; }
.entity-main { display:flex; align-items:center; gap:11px; width:100%; margin:16px 0 11px; padding:0; border:0; background:none; color:inherit; text-align:left; cursor:pointer; }
.entity-mark,.entity-profile-mark { display:grid; place-items:center; flex:0 0 46px; width:46px; height:46px; border:1px solid rgba(103,164,255,.22); border-radius:13px; background:linear-gradient(135deg,rgba(74,120,194,.25),rgba(139,92,246,.13)); color:#d8e8ff; font-size:11px; font-weight:800; }
.entity-main strong,.entity-main small { display:block; }
.entity-main strong { font-size:12px; }
.entity-main small { margin-top:4px; color:#68768b; font-size:8px; }
.entity-card p { min-height:48px; margin:0; color:#7e8b9e; font-size:9px; line-height:1.65; }
.entity-zone-list { display:flex; flex-wrap:wrap; gap:6px; margin-top:13px; }
.entity-zone-list.large { margin-top:15px; }
.entity-zone-chip { padding:6px 8px; border:1px solid rgba(103,164,255,.12); border-radius:999px; background:rgba(74,120,194,.06); color:#8ea7c7; font-size:7px; }
.entity-card-footer { display:flex; align-items:center; justify-content:space-between; gap:10px; margin-top:15px; padding-top:12px; border-top:1px solid rgba(255,255,255,.05); color:#68758a; font-size:8px; }
.entity-profile-page { max-width:1080px; }
.entity-profile-hero { display:flex; align-items:center; gap:24px; padding:30px; border:1px solid rgba(111,145,199,.16); border-radius:20px; background:linear-gradient(135deg,#111b2b,#090e17); }
.entity-profile-mark { width:82px; height:82px; flex-basis:82px; border-radius:20px; font-size:19px; }
.entity-profile-grid { display:grid; grid-template-columns:1fr 1fr; gap:15px; }
.entity-add-zone { display:grid; gap:7px; margin-top:20px; padding-top:15px; border-top:1px solid rgba(255,255,255,.05); }
.entity-add-zone label { color:#7d899c; font-size:9px; }
.entity-add-zone select,.create-form input,.create-form select,.create-form textarea,.entity-review-box textarea { width:100%; box-sizing:border-box; padding:10px 11px; border:1px solid rgba(255,255,255,.08); border-radius:10px; outline:0; background:#080d15; color:#dce6f4; font:inherit; font-size:10px; }
.entity-review-box { display:grid; gap:10px; margin-top:16px; }
.entity-review-box textarea { resize:vertical; line-height:1.6; }
.entity-my-review { margin-top:15px; padding-top:14px; border-top:1px solid rgba(255,255,255,.05); }
.entity-my-review p { margin-top:7px; }
.entity-muted { color:#65738a; font-size:9px; }
.entity-create-modal { max-width:650px; max-height:calc(100dvh - 40px); overflow-y:auto; }
@media(max-width:1000px){ .entity-grid{grid-template-columns:repeat(2,minmax(0,1fr));} }
@media(max-width:700px){ .entity-grid,.entity-context-grid,.entity-profile-grid{grid-template-columns:1fr;}.entity-profile-hero{align-items:flex-start;flex-direction:column;} }
/* CALLS & COMMONS SUBNAV */
.sidebar-section-label {
  padding:6px 8px 4px;
  color:#526176;
  font-size:7px;
  font-weight:700;
  letter-spacing:.08em;
  text-transform:uppercase;
}

.sidebar-subnav {
  margin: 2px 0 6px 33px;
  padding-left: 10px;
  border-left: 1px solid rgba(255,255,255,.07);
  display: grid;
  gap: 2px;
}

.sidebar-zones-header {
  display:flex;
  align-items:center;
  width:100%;
}

.sidebar-flow-header {
  display:flex;
  align-items:center;
  gap:4px;
}

.sidebar-flow-main {
  min-width:0;
  flex:1;
  display:flex;
  align-items:center;
  gap:8px;
  padding:7px 9px;
  border:1px solid rgba(135,150,170,.22);
  border-radius:8px;
  background:rgba(88,108,135,.28);
  border-color:rgba(135,165,205,.34);
  color:#c0cad7;
  font-size:7px;
  font-weight:700;
  letter-spacing:.08em;
  text-transform:uppercase;
  text-align:left;
  cursor:pointer;
}

.sidebar-flow-main:hover,
.sidebar-flow-main.active {
  background:rgba(88,108,135,.34);
  border-color:rgba(135,165,205,.40);
}

.sidebar-flow-toggle {
  display:grid;
  place-items:center;
  width:28px;
  height:30px;
  padding:0;
  border:1px solid rgba(135,165,205,.34);
  border-radius:8px;
  background:rgba(88,108,135,.28);
  color:#f59e0b;
  cursor:pointer;
}

.sidebar-flow-toggle:hover {
  background:rgba(88,108,135,.34);
  border-color:rgba(135,165,205,.40);
}

.sidebar-flow-main .icon {
  color:#000000;
}

.sidebar-zones-main {
  min-width:0;
  flex:1;
  display:flex;
  align-items:center;
  gap:8px;
  padding:7px 9px;
  border:1px solid rgba(135,150,170,.22);
  border-radius:8px;
  background:rgba(112,122,136,.21);
  color:#c0cad7;
  font-size:7px;
  font-weight:700;
  letter-spacing:.08em;
  text-transform:uppercase;
  text-align:left;
  cursor:pointer;
  box-shadow:inset 0 1px 0 rgba(255,255,255,.035);
}

.sidebar-zones-main:hover {
  background:rgba(130,142,158,.27);
  border-color:rgba(155,170,190,.30);
  color:#e0e7ef;
}

.sidebar-zones-main.active {
  background:rgba(88,108,135,.28);
  border-color:rgba(135,165,205,.34);
  color:#d0e1f7;
}

/* Keep the current blue background visible even when Impact is not selected. */
.sidebar-zones-main {
  background:rgba(88,108,135,.28);
  border-color:rgba(135,165,205,.34);
}

.sidebar-zones-main:hover {
  background:rgba(88,108,135,.34);
  border-color:rgba(135,165,205,.40);
}

/* Keep Flow's current blue background visible even when it is not selected. */
.main-nav > button.active-flow-placeholder { display:none; }

.main-nav > button:nth-of-type(3) {
  background:rgba(88,108,135,.28);
  border:1px solid rgba(135,165,205,.34);
}

.main-nav > button:nth-of-type(3):hover,
.main-nav > button:nth-of-type(3).active {
  background:rgba(88,108,135,.34);
  border-color:rgba(135,165,205,.40);
}

.sidebar-zones-main .icon {
  color:#8293aa;
  font-size:10px;
  line-height:1;
  opacity:.9;
}

.sidebar-zones-main.active .icon,
.sidebar-zones-main:hover .icon {
  color:#a9c8ef;
  opacity:1;
}

/* Zones circle: neutral instead of the previous blue accent. */
.sidebar-zones-main .icon,
.sidebar-zones-main.active .icon,
.sidebar-zones-main:hover .icon {
  color: #000000;
  opacity: 1;
}

.sidebar-zones-toggle {
  width:30px;
  height:30px;
  display:grid;
  place-items:center;
  flex:0 0 30px;
  margin-left:3px;
  padding:0;
  border:1px solid rgba(120,135,155,.14);
  border-radius:8px;
  background:rgba(85,96,110,.13);
  color:#91a0b4;
  cursor:pointer;
  transition:background .15s ease, color .15s ease, border-color .15s ease;
}

.sidebar-zones-toggle:hover {
  background:rgba(115,130,150,.22);
  border-color:rgba(145,160,180,.24);
  color:#c5d5e8;
}

.sidebar-zones-toggle .subnav-chevron {
  color:inherit;
  font-size:11px;
  font-weight:800;
}

.sidebar-subnav-toggle {
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:8px;
  width:100%;
  padding:6px 8px 5px;
  border:0;
  border-radius:7px;
  background:transparent;
  color:#526176;
  font-size:7px;
  font-weight:700;
  letter-spacing:.08em;
  text-transform:uppercase;
  text-align:left;
  cursor:pointer;
}

.sidebar-subnav-toggle:hover {
  background:rgba(255,255,255,.025);
  color:#8291a7;
}

.subnav-section-label {
  min-width:0;
}

.subnav-chevron {
  color:#65748a;
  font-size:9px;
  line-height:1;
}
.sidebar-subnav button {
  display:flex;
  align-items:center;
  gap:8px;
  width:100%;
  padding:7px 8px;
  border:0;
  border-radius:7px;
  background:transparent;
  color:#68768a;
  font-size:9px;
  text-align:left;
  cursor:pointer;
}
.sidebar-subnav button:hover {
  color:#dce6f4;
  background:rgba(255,255,255,.035);
}
.sidebar-subnav button.active {
  color:#9fc4f8;
  background:rgba(74,120,194,.09);
}
.subnav-dot {
  width:4px;
  height:4px;
  border-radius:50%;
  background:currentColor;
  flex:0 0 4px;
}
.initiative-grid {
  display:grid;
  grid-template-columns:repeat(3,minmax(0,1fr));
  gap:13px;
  margin-top:20px;
}
.compact-section-hero { margin-bottom:18px; }
@media(max-width:900px){.initiative-grid{grid-template-columns:repeat(2,minmax(0,1fr));}}
@media(max-width:650px){.initiative-grid{grid-template-columns:1fr;}.sidebar-subnav{margin-left:25px;}}
.my-zones-grid {
  display:grid;
  grid-template-columns:repeat(2,minmax(0,1fr));
  gap:16px;
  margin-top:20px;
}

.my-zone-card {
  min-width:0;
  overflow:hidden;
  border:1px solid rgba(120,135,155,.14);
  border-radius:14px;
  background:rgba(28,34,43,.72);
  box-shadow:0 12px 30px rgba(0,0,0,.16);
}

.my-zone-open {
  display:block;
  width:100%;
  padding:0;
  border:0;
  background:transparent;
  color:inherit;
  text-align:left;
  cursor:pointer;
}

.my-zone-cover {
  position:relative;
  height:150px;
  background-size:cover;
  background-position:center;
}

.my-zone-cover-overlay {
  position:absolute;
  inset:0;
  background:linear-gradient(180deg,rgba(8,12,18,.08),rgba(8,12,18,.78));
}

.my-zone-location {
  position:absolute;
  left:14px;
  bottom:12px;
  color:#d5dfec;
  font-size:9px;
  letter-spacing:.04em;
}

.my-zone-card-body {
  padding:15px;
}

.my-zone-card-heading {
  display:flex;
  align-items:flex-start;
  justify-content:space-between;
  gap:12px;
}

.my-zone-card-heading h2 {
  margin:4px 0 0;
  font-size:19px;
  color:#edf3fb;
}

.my-zone-status {
  padding:5px 7px;
  border:1px solid rgba(125,155,195,.22);
  border-radius:6px;
  background:rgba(88,108,135,.16);
  color:#9fbee4;
  font-size:7px;
  font-weight:800;
  letter-spacing:.09em;
}

.my-zone-card-body p {
  margin:10px 0 13px;
  color:#8f9bad;
  font-size:11px;
  line-height:1.55;
}

.my-zone-meta {
  display:flex;
  gap:14px;
  color:#77859a;
  font-size:9px;
}

.my-zone-open-label {
  display:block;
  margin-top:15px;
  color:#9fc4f8;
  font-size:8px;
  font-weight:800;
  letter-spacing:.08em;
}

.my-zone-open:hover .my-zone-card-body {
  background:rgba(255,255,255,.018);
}

@media(max-width:700px){
  .my-zones-grid{grid-template-columns:1fr;}
}

/* SPACES / PLACES */
.zones-subnav { margin-bottom: 10px; }
.places-zone-grid {
  display:grid;
  grid-template-columns:repeat(2,minmax(0,1fr));
  gap:16px;
  margin-top:20px;
}
.places-zone-card {
  padding:18px;
  border:1px solid rgba(255,255,255,.07);
  border-radius:14px;
  background:rgba(13,20,32,.72);
}
.places-zone-header {
  display:flex;
  align-items:flex-start;
  justify-content:space-between;
  gap:12px;
  margin-bottom:8px;
}
.places-zone-header h3 {
  margin:4px 0 0;
  color:#edf3fb;
  font-size:17px;
}
.places-zone-card p { color:#8997aa; line-height:1.55; }
.places-zone-count { color:#8fb7ee; font-size:11px; white-space:nowrap; }
.places-list { display:grid; gap:7px; margin-top:15px; }
.place-row {
  width:100%;
  display:flex;
  align-items:center;
  gap:11px;
  padding:10px;
  border:1px solid rgba(255,255,255,.045);
  border-radius:10px;
  background:rgba(255,255,255,.018);
  color:inherit;
  text-align:left;
  cursor:pointer;
}
.place-row:hover { background:rgba(255,255,255,.045); border-color:rgba(112,158,219,.18); }
.place-mark {
  width:31px;
  height:31px;
  display:grid;
  place-items:center;
  border-radius:9px;
  background:rgba(81,123,183,.12);
  color:#a9c9f2;
  font-size:10px;
  font-weight:700;
}
.place-info { min-width:0; display:grid; gap:3px; flex:1; }
.place-info strong { color:#e8eef7; font-size:12px; }
.place-info small { color:#748298; font-size:10px; }
.place-arrow { color:#65748a; }
@media(max-width:750px){ .places-zone-grid { grid-template-columns:1fr; } }
/* ZONES / PLACES INSIDE ZONES */
.zones-subnav { margin-bottom: 10px; }
.zone-places-panel {
  margin-top: 24px;
  padding: 20px;
  border: 1px solid rgba(255,255,255,.07);
  border-radius: 15px;
  background: rgba(13,20,32,.55);
}
.zone-places-heading h2 { margin: 5px 0 4px; color:#edf3fb; }
.zone-places-heading p { margin:0; max-width:700px; color:#8997aa; line-height:1.55; }
.zone-places-grid {
  display:grid;
  grid-template-columns:repeat(2,minmax(0,1fr));
  gap:12px;
  margin-top:18px;
}
.zone-inside-card {
  padding:15px;
  border:1px solid rgba(255,255,255,.055);
  border-radius:12px;
  background:rgba(255,255,255,.018);
}
.zone-inside-card-head {
  display:flex;
  justify-content:space-between;
  gap:10px;
  margin-bottom:10px;
}
.zone-inside-card-head strong { color:#e8eef7; }
.zone-inside-card-head span { color:#748298; font-size:10px; }
.zone-inside-list { display:grid; gap:6px; }
.zone-place-row {
  width:100%;
  display:flex;
  align-items:center;
  gap:10px;
  padding:8px;
  border:1px solid rgba(255,255,255,.04);
  border-radius:9px;
  background:rgba(255,255,255,.015);
  text-align:left;
  color:inherit;
  cursor:pointer;
}
.zone-place-row:hover { background:rgba(255,255,255,.04); }
.identify-place-btn {
  width:100%;
  padding:9px;
  border:1px dashed rgba(112,158,219,.22);
  border-radius:9px;
  background:transparent;
  color:#8fb7ee;
  font-size:10px;
  cursor:pointer;
}
.zone-around-grid {
  display:grid;
  grid-template-columns:repeat(2,minmax(0,1fr));
  gap:14px;
  margin-top:20px;
}
.zone-around-card {
  padding:18px;
  border:1px solid rgba(255,255,255,.07);
  border-radius:14px;
  background:rgba(13,20,32,.72);
}
.zone-around-top,.zone-around-meta {
  display:flex;
  justify-content:space-between;
  align-items:center;
  gap:10px;
}
.zone-around-top > span:last-child { color:#748298; font-size:10px; }
.zone-around-card h3 { margin:8px 0 5px; color:#edf3fb; }
.zone-around-card p { color:#8997aa; line-height:1.5; }
.zone-around-meta { margin-top:15px; }
@media(max-width:750px) {
  .zone-places-grid,.zone-around-grid { grid-template-columns:1fr; }
}
.country-selector-toggle {
  width:100%;
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:16px;
  margin:18px 0 10px;
  padding:14px 16px;
  border:1px solid rgba(255,255,255,.08);
  border-radius:12px;
  background:rgba(255,255,255,.025);
  color:#dce6f4;
  text-align:left;
  cursor:pointer;
}
.country-selector-toggle:hover {
  border-color:rgba(224,112,177,.28);
  background:linear-gradient(90deg,rgba(74,120,194,.055),rgba(224,112,177,.035));
}
.country-selector-toggle small,
.country-selector-toggle strong { display:block; }
.country-selector-toggle small { color:#8a7182; font-size:7px; letter-spacing:.12em; }
.country-selector-toggle strong { margin-top:4px; font-size:13px; }
.country-selector-toggle b { color:#c59bb9; font-size:8px; letter-spacing:.08em; }

/* COUNTRY SELECTOR */
.country-selector {
  display:grid;
  grid-template-columns:repeat(4,minmax(0,1fr));
  gap:9px;
  margin:18px 0 12px;
}
.country-option {
  display:flex;
  align-items:center;
  gap:9px;
  min-width:0;
  padding:11px;
  border:1px solid rgba(255,255,255,.07);
  border-radius:11px;
  background:rgba(255,255,255,.018);
  color:#dce6f4;
  text-align:left;
  cursor:pointer;
}
.country-option:hover,.country-option.active {
  border-color:rgba(224,112,177,.28);
  background:linear-gradient(90deg,rgba(74,120,194,.07),rgba(224,112,177,.045));
}
.country-option-flag {
  width:30px;
  height:30px;
  display:grid;
  place-items:center;
  flex:0 0 30px;
  border-radius:9px;
  background:linear-gradient(135deg,rgba(74,120,194,.25),rgba(139,92,246,.14) 58%,rgba(224,112,177,.16));
  color:#d4b8cb;
  font-size:8px;
  font-weight:800;
}
.country-option-copy strong,.country-option-copy small { display:block; }
.country-option-copy strong { font-size:9px; line-height:1.25; }
.country-option-copy small { margin-top:4px; color:#69778c; font-size:7px; }
.country-region-selector { margin-top:10px; }
@media(max-width:1000px){.country-selector{grid-template-columns:repeat(3,minmax(0,1fr));}}
@media(max-width:700px){.country-selector{grid-template-columns:repeat(2,minmax(0,1fr));}}
@media(max-width:460px){.country-selector{grid-template-columns:1fr;}}

/* JOINABLE GOVERNORATES & ZONES */
.governorate-detail-panel { margin-top:18px; overflow:hidden; border:1px solid rgba(255,255,255,.08); border-radius:18px; background:#0b1019; }
.governorate-detail-cover { position:relative; min-height:190px; background-position:center; background-size:cover; }
.governorate-detail-cover-overlay { position:absolute; inset:0; background:linear-gradient(180deg,rgba(5,9,16,.2),rgba(5,9,16,.9)); }
.governorate-detail-heading { position:relative; z-index:1; min-height:190px; box-sizing:border-box; display:flex; flex-direction:column; justify-content:flex-end; padding:25px; }
.governorate-detail-heading h1 { margin:7px 0 5px; font-size:30px; letter-spacing:-.03em; }
.governorate-detail-heading p { margin:0; max-width:650px; color:#9aa7b9; font-size:10px; line-height:1.6; }
.governorate-detail-content { padding:20px; }
.governorate-detail-actions { display:flex; align-items:flex-end; justify-content:space-between; gap:20px; }
.governorate-detail-actions h3 { margin:6px 0 5px; font-size:16px; }
.governorate-detail-actions p { margin:0; color:#758398; font-size:9px; line-height:1.6; }
.governorate-detail-join { width:auto; min-width:155px; border:1px solid rgba(103,164,255,.18); border-radius:9px; border-top:1px solid rgba(103,164,255,.18); }
.governorate-detail-relations { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:10px; margin-top:18px; }
.governorate-relation-option { display:flex; align-items:center; gap:10px; padding:13px; border:1px solid rgba(255,255,255,.07); border-radius:11px; background:rgba(255,255,255,.018); color:#dce6f4; text-align:left; cursor:pointer; }
.governorate-relation-option:hover,.governorate-relation-option.active { border-color:rgba(103,164,255,.32); background:rgba(74,120,194,.08); }
.governorate-relation-point { width:24px; height:24px; display:grid; place-items:center; border:1px solid rgba(143,183,238,.2); border-radius:50%; color:#61728a; font-size:9px; }
.governorate-relation-option.active .governorate-relation-point { color:#9fc4f8; border-color:rgba(143,183,238,.5); }
.governorate-relation-option strong,.governorate-relation-option small { display:block; }
.governorate-relation-option strong { font-size:10px; }
.governorate-relation-option small { margin-top:4px; color:#69778c; font-size:8px; }
.governorate-selected-relation { margin-top:12px; color:#8fb7ee; font-size:9px; }

.zone-area-card-joinable {
  display:flex;
  flex-direction:column;
  overflow:hidden;
}
.zone-area-open {
  display:grid;
  grid-template-columns:1fr;
  width:100%;
  padding:0;
  border:0;
  background:transparent;
  color:inherit;
  text-align:left;
  cursor:pointer;
}
.zone-area-open .zone-area-image { display:block; }
.zone-join-btn,
.specific-zone-join-btn {
  width:100%;
  border:0;
  border-top:1px solid rgba(255,255,255,.06);
  background:rgba(255,255,255,.018);
  color:#8fb7ee;
  padding:9px 12px;
  font-size:10px;
  font-weight:600;
  cursor:pointer;
}
.zone-join-btn:hover,
.specific-zone-join-btn:hover { background:rgba(82,128,194,.08); }
.zone-join-btn.joined,
.specific-zone-join-btn.joined { color:#8ed4b0; }
.specific-zone-item-wrap {
  display:grid;
  grid-template-columns:1fr auto;
  border:1px solid rgba(255,255,255,.055);
  border-radius:11px;
  overflow:hidden;
}
.specific-zone-item-wrap .specific-zone-item { border:0; border-radius:0; }


/* ACCOUNT MENU + DISCONNECT */
.profile-menu-wrap {
  position: relative;
  margin-left: auto;
}
.profile-menu {
  position: absolute;
  right: 0;
  bottom: calc(100% + 10px);
  width: 190px;
  padding: 6px;
  border: 1px solid rgba(255,255,255,.09);
  border-radius: 12px;
  background: #0b1019;
  box-shadow: 0 18px 45px rgba(0,0,0,.38);
  z-index: 60;
}
.profile-menu button {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 9px 10px;
  border: 0;
  border-radius: 8px;
  background: transparent;
  color: #9aa8bb;
  text-align: left;
  font: inherit;
  font-size: 9px;
  cursor: pointer;
}
.profile-menu button:hover,
.profile-menu button.active {
  background: rgba(74,120,194,.08);
  color: #dce7f5;
}
.profile-menu-dot {
  width: 5px;
  height: 5px;
  flex: 0 0 5px;
  border-radius: 50%;
  background: #7189aa;
}
.profile-menu-divider {
  height: 1px;
  margin: 5px 4px;
  background: rgba(255,255,255,.06);
}
.profile-menu .profile-menu-disconnect {
  color: #d58b8b;
}
.profile-menu .profile-menu-disconnect:hover {
  background: rgba(180,80,80,.08);
  color: #efaaaa;
}
.disconnected-content {
  min-height: calc(100vh - 70px);
  display: grid;
  place-items: center;
}
.game-over-card {
  width: min(560px, calc(100% - 40px));
  box-sizing: border-box;
  padding: 48px 35px;
  border: 1px solid rgba(255,255,255,.07);
  border-radius: 22px;
  background: radial-gradient(circle at 50% 0, rgba(74,120,194,.11), transparent 48%), #0b1019;
  text-align: center;
}
.game-over-smiley {
  width: 92px;
  height: 92px;
  display: grid;
  place-items: center;
  margin: 0 auto 22px;
  border: 1px solid rgba(255,255,255,.09);
  border-radius: 50%;
  background: rgba(255,255,255,.025);
  font-size: 46px;
}
.game-over-card h1 {
  margin: 8px 0 10px;
  font-size: 42px;
  letter-spacing: .08em;
}
.game-over-card p {
  margin: 0 0 25px;
  color: #7d899c;
  font-size: 10px;
  line-height: 1.7;
}

/* SYSTEM DESIGN */
.system-design-header{margin-bottom:18px}
.design-create-system{display:grid;grid-template-columns:1.2fr 1fr 1fr auto;gap:9px;align-items:center;margin-bottom:14px;padding:14px;border:1px solid rgba(255,255,255,.07);border-radius:14px;background:#0b1019}
.design-create-system strong{display:block;margin-top:5px;color:#dfe8f4;font-size:10px}
.design-create-system input,.design-search{width:100%;box-sizing:border-box;padding:10px 11px;border:1px solid rgba(255,255,255,.07);border-radius:9px;background:#080d15;color:#dce6f4;outline:0;font:inherit;font-size:9px}
.design-create-system input:focus,.design-search:focus{border-color:rgba(103,164,255,.3)}
.design-tabs{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:14px}
.design-tabs button{padding:9px 11px;border:1px solid rgba(255,255,255,.06);border-radius:9px;background:#0b1019;color:#718096;font-size:8px;cursor:pointer}
.design-tabs button.active{border-color:rgba(103,164,255,.25);background:rgba(74,120,194,.09);color:#b5d0f3}
.design-system-browser,.system-designer{display:grid;grid-template-columns:330px minmax(0,1fr);gap:14px}
.design-library-panel,.design-system-summary,.design-canvas-panel{min-width:0;padding:16px;border:1px solid rgba(255,255,255,.07);border-radius:15px;background:#0b1019}
.design-system-card{display:flex;align-items:center;gap:10px;width:100%;margin-top:7px;padding:11px;border:1px solid rgba(255,255,255,.045);border-radius:10px;background:rgba(255,255,255,.015);color:inherit;text-align:left;cursor:pointer}
.design-system-card:hover,.design-system-card.active{border-color:rgba(103,164,255,.28);background:rgba(74,120,194,.08)}
.design-system-card span:nth-child(2){min-width:0;flex:1}.design-system-card strong,.design-system-card small{display:block}.design-system-card strong{font-size:10px;color:#e0e9f5}.design-system-card small{margin-top:3px;color:#66758a;font-size:7px}.design-system-card b{color:#718096}
.design-node-icon{width:27px;height:27px;display:grid;place-items:center;border-radius:8px;background:rgba(74,120,194,.12);color:#9fc4f8}
.design-system-summary{display:flex;flex-direction:column;justify-content:center;min-height:350px}.design-system-summary h2{margin:8px 0;font-size:25px}.design-system-summary p{max-width:650px;color:#7d899c;font-size:10px;line-height:1.7}.design-summary-stats{display:flex;flex-wrap:wrap;gap:7px;margin:16px 0 20px}.design-summary-stats span{padding:7px 9px;border:1px solid rgba(255,255,255,.06);border-radius:999px;color:#8ca4c2;font-size:8px}
.design-library-head,.design-canvas-head{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin-bottom:12px}.design-library-head h2,.design-canvas-head h2{margin:6px 0 0;font-size:16px}.design-btn-small,.ghost-btn.small{padding:7px 9px;font-size:8px}
.design-search{margin-bottom:9px}.design-library-list{display:grid;gap:7px;max-height:620px;overflow:auto;padding-right:2px}.design-library-item{display:flex;gap:8px;align-items:center;padding:10px;border:1px solid rgba(255,255,255,.045);border-radius:10px;background:rgba(255,255,255,.015)}.design-library-item:hover{border-color:rgba(103,164,255,.2);background:rgba(74,120,194,.045)}
.design-library-copy{min-width:0;flex:1}.design-library-copy span,.design-library-copy strong,.design-library-copy small{display:block}.design-category{margin-bottom:3px;color:#6f9bd0;font-size:6px;font-weight:800;letter-spacing:.12em}.design-library-copy strong{color:#dce6f4;font-size:9px}.design-library-copy small{margin-top:4px;color:#68768b;font-size:7px;line-height:1.45}
.design-library-actions{display:flex;gap:4px}.design-library-actions button,.design-node-top button{width:25px;height:25px;padding:0;border:1px solid rgba(255,255,255,.07);border-radius:7px;background:#101827;color:#9fc4f8;cursor:pointer}.design-library-actions button:hover,.design-node-top button:hover{background:rgba(74,120,194,.14)}
.design-dropzone{min-height:520px;padding:12px;border:1px dashed rgba(103,164,255,.18);border-radius:12px;background:radial-gradient(circle at 50% 0,rgba(74,120,194,.06),transparent 45%),rgba(255,255,255,.012)}
.design-dropzone.empty{display:grid;place-items:center}.design-canvas-empty{text-align:center;color:#68768b}.design-canvas-empty strong,.design-canvas-empty span{display:block}.design-canvas-empty strong{margin-bottom:7px;color:#a6bad3;font-size:12px}.design-canvas-empty span{font-size:8px}
.design-node-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px}.design-node-card{padding:11px;border:1px solid rgba(255,255,255,.065);border-radius:11px;background:linear-gradient(145deg,rgba(22,34,53,.8),rgba(10,15,24,.9))}.design-node-top{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:9px}.design-node-top>span{color:#7198c8;font-size:6px;font-weight:800;letter-spacing:.12em}.design-node-top div{display:flex;gap:4px}.design-node-card>strong{display:block;color:#e3ebf5;font-size:10px}.design-node-card>small{display:block;min-height:30px;margin-top:5px;color:#718096;font-size:7px;line-height:1.5}.design-node-system-btn{width:100%;margin-top:9px;padding:7px;border:1px solid rgba(103,164,255,.1);border-radius:7px;background:transparent;color:#7fa9dc;font-size:7px;cursor:pointer}.design-node-system-btn:hover{background:rgba(74,120,194,.07)}
.design-architecture-note{margin-top:12px;padding:11px;border:1px solid rgba(255,255,255,.05);border-radius:10px;background:rgba(255,255,255,.012)}.design-architecture-note span{color:#789ac2;font-size:7px;font-weight:800;letter-spacing:.12em}.design-architecture-note p{margin:5px 0 0;color:#69778c;font-size:8px;line-height:1.55}
@media(max-width:950px){.design-create-system{grid-template-columns:1fr 1fr}.design-create-system .primary-btn{grid-column:1/-1}.design-system-browser,.system-designer{grid-template-columns:1fr}.design-library-list{max-height:430px}}
@media(max-width:650px){.design-create-system{grid-template-columns:1fr}.design-create-system .primary-btn{grid-column:auto}.design-node-grid{grid-template-columns:1fr}}

/* ADMINISTRATION */
.administration-content{max-width:1180px}
.administration-lock-card{max-width:620px;margin:55px auto;padding:38px;border:1px solid rgba(103,164,255,.14);border-radius:22px;background:radial-gradient(circle at 50% 0,rgba(74,120,194,.12),transparent 42%),#0b1019;text-align:center}
.admin-lock-orbit,.admin-empty-orbit{display:grid;place-items:center;width:76px;height:76px;margin:0 auto 22px;border:1px solid rgba(126,177,245,.3);border-radius:50%;background:radial-gradient(circle,#182b49,#080e17 68%);color:#a9c9f2;font-size:18px;box-shadow:0 0 45px rgba(70,130,210,.1)}
.administration-lock-card h1{margin:8px 0;font-size:34px}.administration-lock-card p{max-width:480px;margin:0 auto;color:#7d899c;font-size:10px;line-height:1.7}
.admin-password-form{display:grid;gap:8px;max-width:330px;margin:25px auto 0;text-align:left}.admin-password-form label{color:#8a98ac;font-size:9px}.admin-password-form input{width:100%;box-sizing:border-box;padding:11px 12px;border:1px solid rgba(255,255,255,.08);border-radius:10px;outline:0;background:#080d15;color:#e4edf9;font:inherit}.admin-password-form input:focus{border-color:rgba(103,164,255,.4)}.admin-password-form .primary-btn{margin-top:5px}.admin-password-error{color:#e78b8b;font-size:8px}
.administration-header{display:flex;align-items:flex-start;justify-content:space-between;gap:20px;margin-bottom:20px}.administration-header h1{margin:8px 0 6px;font-size:34px}.administration-header p{max-width:680px;margin:0;color:#7d899c;font-size:10px;line-height:1.7}
.admin-overview{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;margin-bottom:15px}.admin-overview-card{padding:16px;border:1px solid rgba(255,255,255,.07);border-radius:14px;background:#0b1019}.admin-overview-card span,.admin-overview-card strong,.admin-overview-card small{display:block}.admin-overview-card span{color:#718096;font-size:7px;font-weight:800;letter-spacing:.13em}.admin-overview-card strong{margin-top:7px;color:#e7eef8;font-size:24px}.admin-overview-card small{margin-top:4px;color:#66758a;font-size:8px}
.admin-workspace{display:grid;grid-template-columns:340px minmax(0,1fr);gap:15px}.admin-elements-panel,.admin-detail-panel{min-width:0;padding:18px;border:1px solid rgba(255,255,255,.07);border-radius:16px;background:#0b1019}.admin-panel-heading{margin-bottom:12px}.admin-panel-heading h2{margin:6px 0 0;font-size:16px}
.admin-element-folder{width:100%;display:flex;align-items:center;gap:10px;margin-top:6px;padding:11px;border:1px solid rgba(255,255,255,.045);border-radius:10px;background:rgba(255,255,255,.015);color:inherit;text-align:left;cursor:pointer}.admin-element-folder:hover,.admin-element-folder.active{border-color:rgba(103,164,255,.28);background:rgba(74,120,194,.08)}.admin-folder-icon{width:28px;height:28px;display:grid;place-items:center;border-radius:8px;background:rgba(74,120,194,.12);color:#9fc4f8;font-size:13px}.admin-folder-copy{min-width:0;flex:1}.admin-folder-copy strong,.admin-folder-copy small{display:block}.admin-folder-copy strong{color:#e0e9f5;font-size:10px}.admin-folder-copy small{margin-top:3px;color:#66758a;font-size:7px}.admin-folder-arrow{color:#61728a;font-size:11px}
.admin-detail-panel{min-height:470px}.admin-detail-title{display:flex;justify-content:space-between;align-items:flex-start;gap:20px;margin-top:10px}.admin-detail-title h2{margin:0 0 6px;font-size:25px}.admin-detail-title p{max-width:650px;margin:0;color:#7d899c;font-size:9px;line-height:1.7}.admin-status{flex:0 0 auto;padding:6px 8px;border:1px solid rgba(110,210,160,.18);border-radius:999px;color:#82cba8;font-size:7px;font-weight:800;letter-spacing:.1em}
.admin-detail-section{margin-top:28px}.admin-chip-list{display:flex;flex-wrap:wrap;gap:7px;margin-top:10px}.admin-chip{padding:7px 9px;border:1px solid rgba(255,255,255,.06);border-radius:999px;font-size:8px}.admin-chip.connected{border-color:rgba(103,164,255,.12);background:rgba(74,120,194,.06);color:#9bbde9}
.admin-missing-list{display:grid;gap:7px;margin-top:10px}.admin-missing-item{display:flex;align-items:center;gap:9px;padding:9px 10px;border:1px solid rgba(230,170,90,.1);border-radius:9px;background:rgba(230,170,90,.025)}.admin-missing-item span{width:18px;height:18px;display:grid;place-items:center;border-radius:50%;background:rgba(230,170,90,.1);color:#d9aa6d;font-size:9px}.admin-missing-item strong{color:#b8a17e;font-size:8px;font-weight:600}
.admin-detail-note{display:grid;gap:5px;margin-top:28px;padding:13px;border:1px solid rgba(255,255,255,.05);border-radius:10px;background:rgba(255,255,255,.015)}.admin-detail-note strong{color:#9bbde9;font-size:8px}.admin-detail-note span{color:#68768b;font-size:8px;line-height:1.6}
.admin-detail-empty{min-height:430px;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center}.admin-empty-orbit{width:90px;height:90px;margin-bottom:20px;font-size:9px;letter-spacing:.15em}.admin-detail-empty h2{margin:8px 0;font-size:19px}.admin-detail-empty p{max-width:420px;margin:0;color:#748196;font-size:9px;line-height:1.7}.admin-lock-mark{margin-left:auto;color:#66758a;font-size:9px}
@media(max-width:900px){.admin-workspace{grid-template-columns:1fr}.admin-detail-panel{min-height:350px}}@media(max-width:650px){.admin-overview{grid-template-columns:1fr}.administration-header{flex-direction:column}.administration-lock-card{margin:25px auto;padding:25px 18px}.administration-lock-card h1{font-size:28px}}

.admin-system-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:25px}.admin-system-block{padding:13px;border:1px solid rgba(255,255,255,.05);border-radius:10px;background:rgba(255,255,255,.015)}.admin-system-block>.eyebrow{display:block;margin-bottom:2px}
.admin-function-list{display:grid;gap:7px;margin-top:10px}.admin-function-item{display:flex;align-items:center;gap:11px;padding:10px 12px;border:1px solid rgba(103,164,255,.08);border-radius:9px;background:rgba(74,120,194,.025)}.admin-function-item span{color:#7198c8;font-size:8px;font-variant-numeric:tabular-nums}.admin-function-item strong{color:#b8c8dc;font-size:8px;font-weight:600}
@media(max-width:900px){.admin-system-grid{grid-template-columns:1fr}}

/* SIDEBAR SPACE SWITCHER */

.sidebar-space-title {
  min-width: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 0 3px;
  border: 0;
  background: transparent;
  color: inherit;
  cursor: pointer;
}

.sidebar-space-title:hover .sidebar-label {
  color: #a6bad3;
}

.sidebar-space-title small {
  max-width: 145px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: #4f5f75;
  font-size: 6px;
  letter-spacing: .04em;
  text-align: center;
}

.sidebar-space-hint {
  display: grid;
  gap: 3px;
  margin: 9px 3px 3px;
  padding: 8px 9px;
  border: 1px solid rgba(103,164,255,.055);
  border-radius: 8px;
  background: rgba(74,120,194,.025);
}

.sidebar-space-hint strong {
  color: #8199b7;
  font-size: 7px;
  font-weight: 700;
}

.sidebar-space-hint span {
  color: #58687d;
  font-size: 7px;
  line-height: 1.45;
}

.create-network-small {
  margin-top: 5px;
}

.sidebar-connection {
  align-items: flex-start;
}

.sidebar-connection-copy {
  min-width: 0;
  display: grid;
  gap: 2px;
}

.sidebar-connection-copy strong {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: #8996a9;
  font-size: 10px;
  font-weight: 500;
}

.sidebar-connection-copy small {
  color: #4f6076;
  font-size: 6px;
  letter-spacing: .08em;
}

.sidebar-connection:hover .sidebar-connection-copy strong {
  color: #e3ebf5;
}

.connection-dot {
  margin-top: 4px;
  background: #7eb8e8;
  box-shadow: 0 0 9px rgba(126,184,232,.35);
}

/* =====================================================
   SIDEBAR ENHANCEMENT
   ===================================================== */

.sidebar {
  padding: 20px 13px 14px;
  background:
    radial-gradient(circle at 0% 0%, rgba(86,132,205,.10), transparent 30%),
    linear-gradient(180deg, #090d15 0%, #070a10 100%);
  border-right-color: rgba(124,157,205,.12);
  box-shadow: 14px 0 40px rgba(0,0,0,.16);
}

.brand {
  position: relative;
  margin: 0 2px 18px;
  padding: 7px 9px 19px;
  border-bottom: 1px solid rgba(255,255,255,.055);
  border-radius: 10px;
  transition: background .2s ease, transform .2s ease;
}

.brand:hover {
  background: rgba(255,255,255,.025);
  transform: translateY(-1px);
}

.brand strong {
  font-size: 15px;
  letter-spacing: .19em;
  color: #f1f5fb;
}

.brand small {
  color: #738198;
  letter-spacing: .11em;
}

.brand-orbit {
  width: 36px;
  height: 36px;
  border-color: rgba(132,164,214,.65);
  background: radial-gradient(circle at 45% 40%, rgba(103,164,255,.10), transparent 58%);
  box-shadow: inset 0 0 18px rgba(80,125,190,.08);
}

.brand-orbit::before {
  border-color: rgba(103,164,255,.38);
}

.brand-orbit::after {
  inset: 9px 5px;
  transform: rotate(-28deg);
  border-color: rgba(139,92,246,.35);
}

.brand-orbit span {
  background: #79b0ff;
  box-shadow: 0 0 14px rgba(103,164,255,.8);
}

.main-nav {
  gap: 3px;
}

.main-nav > button {
  position: relative;
  min-height: 40px;
  box-sizing: border-box;
  padding: 9px 11px;
  border: 1px solid transparent;
  color: #8995a8;
  font-size: 11px;
  font-weight: 500;
}

.main-nav > button:hover {
  border-color: rgba(255,255,255,.045);
  background: rgba(255,255,255,.035);
  color: #edf3fb;
}

.main-nav > button.active {
  border-color: rgba(103,164,255,.12);
  background:
    linear-gradient(90deg, rgba(77,119,184,.18), rgba(77,119,184,.045));
  color: #f5f8fc;
  box-shadow: inset 0 0 22px rgba(73,119,184,.035);
}

.main-nav > button.active::before {
  content: "";
  position: absolute;
  left: -1px;
  top: 8px;
  bottom: 8px;
  width: 2px;
  border-radius: 0 3px 3px 0;
  background: #73adff;
  box-shadow: 0 0 12px rgba(103,164,255,.45);
}

.main-nav > button .icon {
  width: 21px;
  color: #68778f;
  font-size: 17px;
  transition: color .2s ease, transform .2s ease;
}

.main-nav > button:hover .icon,
.main-nav > button.active .icon {
  color: #8ebcff;
}

.main-nav > button:hover .icon {
  transform: translateX(1px);
}

.sidebar-subnav {
  position: relative;
  margin: 2px 0 7px 8px;
  padding: 2px 0 2px 14px;
  border-left: 1px solid rgba(255,255,255,.055);
}

.sidebar-subnav-toggle {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 5px 8px 5px 2px;
  border: 0;
  background: transparent;
  color: #5f6e83;
  cursor: pointer;
  text-align: left;
}

.sidebar-subnav-toggle:hover {
  color: #91a1b8;
}

.subnav-section-label {
  font-size: 7px;
  font-weight: 800;
  letter-spacing: .13em;
  text-transform: uppercase;
}

.subnav-chevron {
  font-size: 10px;
  color: #526178;
}

.sidebar-subnav > button:not(.sidebar-subnav-toggle) {
  position: relative;
  width: 100%;
  display: flex;
  align-items: center;
  gap: 9px;
  min-height: 32px;
  padding: 7px 8px;
  border: 1px solid transparent;
  border-radius: 7px;
  background: transparent;
  color: #758399;
  font-size: 9px;
  text-align: left;
  cursor: pointer;
  transition: .18s ease;
}

.sidebar-subnav > button:not(.sidebar-subnav-toggle):hover {
  color: #dbe5f2;
  background: rgba(255,255,255,.025);
}

.sidebar-subnav > button:not(.sidebar-subnav-toggle).active {
  color: #bcd7f8;
  background: rgba(74,120,194,.07);
  border-color: rgba(103,164,255,.08);
}

.subnav-dot {
  width: 4px;
  height: 4px;
  flex: 0 0 4px;
  border-radius: 50%;
  background: #52627a;
  transition: .18s ease;
}

.sidebar-subnav > button.active .subnav-dot {
  background: #75adff;
  box-shadow: 0 0 8px rgba(103,164,255,.6);
}

.sidebar-zone {
  margin: 20px 2px 0;
  padding: 17px 7px 10px;
  border-top-color: rgba(255,255,255,.055);
}

.sidebar-label-switcher {
  margin-bottom: 8px;
  padding: 0 2px;
}

.sidebar-label {
  color: #718198;
  font-size: 7px;
  letter-spacing: .16em;
}

.sidebar-label-arrow {
  width: 20px;
  height: 20px;
  border-radius: 7px;
}

.mini-zone {
  position: relative;
  margin: 2px 0;
  padding: 8px 8px;
  border-radius: 8px;
  color: #8996a9;
  font-size: 10px;
  transition: .18s ease;
}

.mini-zone:hover {
  color: #e3ebf5;
  background: rgba(255,255,255,.028);
}

.mini-dot {
  width: 6px;
  height: 6px;
  box-shadow: 0 0 9px rgba(86,180,255,.4);
}

.network-dot {
  background: #9b8be8;
  box-shadow: 0 0 9px rgba(139,123,216,.35);
}

.create-zone-small {
  width: 100%;
  margin-top: 4px;
  padding: 8px;
  border: 1px dashed rgba(103,164,255,.12);
  border-radius: 8px;
  color: #729ed2;
  font-size: 9px;
  text-align: left;
}

.create-zone-small:hover {
  border-color: rgba(103,164,255,.24);
  background: rgba(74,120,194,.05);
  color: #a8c9ef;
}

.sidebar-people-button {
  margin-top: 9px;
  padding: 9px 8px;
  border: 1px solid rgba(255,255,255,.045);
  background: rgba(255,255,255,.015);
  color: #8996a9;
}

.sidebar-people-button::before {
  display: none;
}

.sidebar-people-button:hover {
  border-color: rgba(103,164,255,.10);
  background: rgba(255,255,255,.035);
}

.sidebar-people-button.active {
  border-color: rgba(103,164,255,.12);
  background: rgba(74,120,194,.07);
}

.sidebar-bottom {
  margin: 10px 2px 0;
  padding: 11px 5px 0;
  border-top-color: rgba(255,255,255,.065);
  background: linear-gradient(180deg, rgba(8,11,18,.78), #080b12 25%);
}

.profile-mini {
  gap: 7px;
  padding: 5px 2px;
}

.create-sidebar-button {
  width: 38px;
  min-width: 38px;
  height: 38px;
  justify-content: center;
  padding: 0;
  border-color: rgba(103,164,255,.15);
  border-radius: 10px;
  background: rgba(74,120,194,.07);
}

.create-sidebar-label {
  display: none;
}

.create-sidebar-icon {
  width: 22px;
  height: 22px;
  background: transparent;
  font-size: 18px;
}

.profile-mini-main {
  padding: 6px;
  border-radius: 9px;
}

.profile-mini-main:hover {
  background: rgba(255,255,255,.025);
}

.profile-mini-main strong {
  color: #dfe7f2;
  font-size: 10px;
}

.profile-mini-main small {
  color: #65748a;
  font-size: 7px;
}

.profile-dots {
  padding: 8px 5px;
  border-radius: 7px;
}

.profile-dots:hover {
  background: rgba(255,255,255,.035);
}

.profile-menu {
  bottom: calc(100% + 9px);
  width: 205px;
  padding: 7px;
  border-color: rgba(120,153,201,.16);
  background: rgba(10,15,24,.98);
  box-shadow: 0 22px 55px rgba(0,0,0,.48);
  backdrop-filter: blur(18px);
}

.profile-menu button {
  min-height: 34px;
  border: 1px solid transparent;
  font-size: 8px;
}

.profile-menu button:hover,
.profile-menu button.active {
  border-color: rgba(103,164,255,.08);
  background: rgba(74,120,194,.08);
}

@media (max-width: 760px) {
  .sidebar {
    padding: 16px 10px 10px;
  }

  .brand {
    margin-bottom: 12px;
    padding-bottom: 14px;
  }

  .sidebar-zone {
    margin-top: 14px;
  }
}


/* MY ZONES */
.my-zones-content{max-width:1180px}.my-zones-header{display:flex;align-items:flex-end;justify-content:space-between;gap:24px;margin-bottom:22px;padding-bottom:18px;border-bottom:1px solid rgba(255,255,255,.055)}.my-zones-header h1{margin:6px 0 5px;font-size:30px}.my-zones-header p{margin:0;color:#758297;font-size:10px;line-height:1.6}.my-zones-discover-btn{display:flex;align-items:center;gap:10px;white-space:nowrap}.my-zones-overview{display:grid;grid-template-columns:220px minmax(0,1fr);gap:12px;margin-bottom:16px}.my-zones-overview-main,.my-zones-overview-note{border:1px solid rgba(255,255,255,.065);border-radius:14px;background:linear-gradient(145deg,rgba(24,32,45,.82),rgba(10,15,23,.9))}.my-zones-overview-main{display:flex;flex-direction:column;justify-content:center;padding:18px}.my-zones-overview-main strong{margin:3px 0 0;color:#edf3fb;font-size:34px}.my-zones-overview-main>span:last-child{margin-top:6px;color:#718096;font-size:8px}.my-zones-overview-note{display:flex;align-items:center;gap:15px;padding:18px}.my-zones-orbit{width:42px;height:42px;flex:0 0 42px;display:grid;place-items:center;border:1px solid rgba(125,164,214,.28);border-radius:50%;color:#91b9e9;background:radial-gradient(circle,rgba(86,130,190,.16),rgba(8,13,21,.25) 68%)}.my-zones-overview-note strong{color:#c7d5e7;font-size:10px}.my-zones-overview-note p{margin:5px 0 0;color:#6f7d91;font-size:8px;line-height:1.55}.my-zones-list{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}.my-zone-card{overflow:hidden;border:1px solid rgba(255,255,255,.065);border-radius:15px;background:#0b1018;box-shadow:0 16px 35px rgba(0,0,0,.18);transition:.18s ease}.my-zone-card:hover{transform:translateY(-2px);border-color:rgba(103,164,255,.16);box-shadow:0 20px 42px rgba(0,0,0,.25)}.my-zone-card-visual{position:relative;height:155px;background-size:cover;background-position:center}.my-zone-card-visual-overlay{position:absolute;inset:0;background:linear-gradient(180deg,rgba(6,10,16,.05) 15%,rgba(6,10,16,.72) 100%)}.my-zone-card-location{position:absolute;left:15px;bottom:13px;color:#d5e0ee;font-size:8px}.my-zone-card-status{position:absolute;top:12px;right:12px;padding:5px 7px;border:1px solid rgba(145,180,220,.22);border-radius:6px;background:rgba(7,12,19,.68);color:#a9c9ec;font-size:6px;font-weight:800;letter-spacing:.13em}.my-zone-card-body{padding:16px}.my-zone-card-title-row{display:flex;align-items:flex-start;justify-content:space-between;gap:15px}.my-zone-card-title-row h2{margin:5px 0 0;color:#edf3fb;font-size:19px}.my-zone-open-btn{display:flex;align-items:center;gap:7px;padding:7px 9px;border:1px solid rgba(103,164,255,.12);border-radius:8px;background:rgba(74,120,194,.055);color:#9fc4f8;font-size:7px;font-weight:800;cursor:pointer}.my-zone-description{min-height:34px;margin:10px 0 15px;color:#78869a;font-size:9px;line-height:1.55}.my-zone-signals{display:grid;grid-template-columns:repeat(4,1fr);padding:11px 0;border-top:1px solid rgba(255,255,255,.045);border-bottom:1px solid rgba(255,255,255,.045)}.my-zone-signals div{padding:0 9px;border-right:1px solid rgba(255,255,255,.045)}.my-zone-signals div:first-child{padding-left:0}.my-zone-signals div:last-child{border-right:0}.my-zone-signals strong,.my-zone-signals span{display:block}.my-zone-signals strong{color:#cbd8e8;font-size:13px}.my-zone-signals span{margin-top:3px;color:#5f6e82;font-size:6px;text-transform:uppercase}.my-zone-card-footer{display:flex;justify-content:space-between;margin-top:12px;color:#58677b;font-size:7px}.my-zone-arrow{color:#789ecb;font-size:13px}.my-zones-empty{min-height:380px;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:30px;border:1px dashed rgba(103,164,255,.12);border-radius:16px;background:rgba(255,255,255,.01);text-align:center}.my-zones-empty-orbit{width:62px;height:62px;display:grid;place-items:center;margin-bottom:18px;border:1px solid rgba(126,169,218,.28);border-radius:50%;color:#8db6e8;font-size:18px}.my-zones-empty h2{margin:7px 0 6px;color:#dbe5f2;font-size:19px}.my-zones-empty p{max-width:430px;margin:0 0 18px;color:#6e7c90;font-size:9px;line-height:1.65}@media(max-width:800px){.my-zones-overview,.my-zones-list{grid-template-columns:1fr}}@media(max-width:560px){.my-zones-header{align-items:flex-start;flex-direction:column}.my-zone-signals{grid-template-columns:repeat(2,1fr);gap:10px 0}}


/* ZONES AROUND LIVE NETWORK ICON */
.zones-around-live-header{
  display:flex;
  align-items:center;
  gap:9px;
  min-height:28px;
  margin-bottom:4px;
}
.zones-around-network-icon{
  position:relative;
  width:28px;
  height:28px;
  flex:0 0 28px;
  display:block;
  border:1px solid rgba(103,164,255,.18);
  border-radius:50%;
  background:radial-gradient(circle,rgba(74,120,194,.09),rgba(8,13,21,.15) 68%,transparent 70%);
  box-shadow:inset 0 0 12px rgba(74,120,194,.08),0 0 18px rgba(74,120,194,.05);
  animation:zones-network-breathe 3.6s ease-in-out infinite;
}
.zones-around-network-icon::before{
  content:'';
  position:absolute;
  inset:4px;
  border:1px dashed rgba(122,166,224,.16);
  border-radius:50%;
  animation:zones-network-spin 12s linear infinite;
}
.network-core,.network-zone,.network-link{position:absolute;display:block}
.network-core{
  width:5px;height:5px;left:11px;top:11px;border-radius:50%;
  background:#9ec8ff;box-shadow:0 0 10px rgba(126,184,255,.7);
  animation:zones-network-core 2.4s ease-in-out infinite;
}
.network-zone{
  width:4px;height:4px;border-radius:50%;
  background:#a58ce8;box-shadow:0 0 8px rgba(165,140,232,.55);
  animation:zones-network-node 2.8s ease-in-out infinite;
}
.network-zone.zone-a{left:4px;top:8px;animation-delay:-.7s}
.network-zone.zone-b{right:4px;top:5px;animation-delay:-1.5s}
.network-zone.zone-c{right:6px;bottom:5px;animation-delay:-2.1s}
.network-link{
  height:1px;transform-origin:left center;
  background:linear-gradient(90deg,rgba(126,184,255,.38),rgba(165,140,232,.08));
  opacity:.7;
  animation:zones-network-link 2.8s ease-in-out infinite;
}
.network-link.link-a{width:10px;left:14px;top:13px;transform:rotate(-151deg)}
.network-link.link-b{width:11px;left:14px;top:13px;transform:rotate(-38deg);animation-delay:-.8s}
.network-link.link-c{width:10px;left:14px;top:14px;transform:rotate(52deg);animation-delay:-1.5s}
.zones-around-live-dot{
  padding:3px 5px;
  border:1px solid rgba(103,164,255,.12);
  border-radius:5px;
  color:#6f9bd0;
  background:rgba(74,120,194,.035);
  font-size:5px;
  font-weight:800;
  letter-spacing:.14em;
  animation:zones-live-pulse 2.2s ease-in-out infinite;
}
@keyframes zones-network-breathe{0%,100%{transform:scale(1);opacity:.88}50%{transform:scale(1.06);opacity:1}}
@keyframes zones-network-spin{to{transform:rotate(360deg)}}
@keyframes zones-network-core{0%,100%{transform:scale(.9);opacity:.75}50%{transform:scale(1.35);opacity:1}}
@keyframes zones-network-node{0%,100%{transform:scale(.8);opacity:.55}50%{transform:scale(1.45);opacity:1}}
@keyframes zones-network-link{0%,100%{opacity:.3}50%{opacity:.85}}
@keyframes zones-live-pulse{0%,100%{opacity:.55}50%{opacity:1;box-shadow:0 0 9px rgba(103,164,255,.12)}}
@media(max-width:560px){.zones-around-live-header{gap:7px}.zones-around-network-icon{width:24px;height:24px;flex-basis:24px}.network-core{left:9px;top:9px}}

/* WHAT'S GOING ON? ENGAGEMENT PANEL */
.zones-around-whats-going-on{
  margin-left:auto;
  display:flex;
  align-items:center;
  gap:6px;
  padding:5px 7px;
  border:1px solid rgba(103,164,255,.12);
  border-radius:6px;
  background:rgba(74,120,194,.035);
  color:#718eb6;
  font-size:5px;
  font-weight:800;
  letter-spacing:.1em;
  cursor:pointer;
  transition:.2s ease;
}
.zones-around-whats-going-on span{font-size:8px;color:#8baedc}
.zones-around-whats-going-on:hover,
.zones-around-whats-going-on.active{
  border-color:rgba(103,164,255,.24);
  background:rgba(74,120,194,.08);
  color:#a8c8ee;
}
.zones-around-live-panel{
  display:grid;
  gap:5px;
  margin:3px 0 13px;
  padding:8px;
  border:1px solid rgba(103,164,255,.10);
  border-radius:10px;
  background:linear-gradient(145deg,rgba(35,55,82,.18),rgba(8,13,21,.55));
  box-shadow:0 12px 28px rgba(0,0,0,.12);
  animation:zones-live-panel-in .2s ease-out;
}
.zones-around-live-panel-title{
  display:flex;
  align-items:baseline;
  justify-content:space-between;
  padding:2px 3px 5px;
}
.zones-around-live-panel-title span{color:#88a8d2;font-size:5px;font-weight:800;letter-spacing:.13em}
.zones-around-live-panel-title small{color:#4f6077;font-size:5px}
.zones-around-live-item{
  width:100%;
  display:grid;
  grid-template-columns:6px minmax(0,1fr) auto;
  align-items:center;
  gap:7px;
  padding:7px;
  border:1px solid rgba(255,255,255,.045);
  border-radius:7px;
  background:rgba(255,255,255,.018);
  color:inherit;
  text-align:left;
  cursor:pointer;
  transition:.18s ease;
}
.zones-around-live-item:hover{
  border-color:rgba(103,164,255,.15);
  background:rgba(74,120,194,.055);
  transform:translateX(2px);
}
.live-item-dot{
  width:5px;height:5px;border-radius:50%;
  background:#7db7ee;
  box-shadow:0 0 8px rgba(125,183,238,.55);
  animation:zones-item-pulse 1.8s ease-in-out infinite;
}
.zones-around-live-item strong{display:block;color:#aebfd4;font-size:6.5px;font-weight:700}
.zones-around-live-item small{display:block;margin-top:2px;color:#5e6d81;font-size:5.5px;line-height:1.35}
.zones-around-live-item b{color:#789fcf;font-size:5px;letter-spacing:.07em;white-space:nowrap}
@keyframes zones-live-panel-in{from{opacity:0;transform:translateY(-4px)}to{opacity:1;transform:translateY(0)}}
@keyframes zones-item-pulse{0%,100%{opacity:.45}50%{opacity:1}}
@media(max-width:560px){
  .zones-around-whats-going-on{padding:4px 5px;font-size:4.5px}
  .zones-around-live-panel{margin-top:2px}
}

/* PEOPLE CONTEXT SPACE */
.people-context-space{
  position:absolute;
  left:-178px;
  top:34px;
  width:136px;
  display:grid;
  gap:10px;
  z-index:4;
}
.people-context-header{
  display:grid;
  gap:3px;
  padding:0 4px 9px;
  border-bottom:1px solid rgba(255,255,255,.055);
}
.people-context-header strong{
  color:#cbd7e6;
  font-size:10px;
  font-weight:700;
}
.people-context-header small{
  color:#5f6e82;
  font-size:6px;
  line-height:1.4;
}
.people-context-chat{
  display:grid;
  gap:7px;
}
.people-context-message{
  display:grid;
  grid-template-columns:22px minmax(0,1fr);
  gap:7px;
  padding:7px 6px;
  border:1px solid rgba(255,255,255,.045);
  border-radius:8px;
  background:rgba(255,255,255,.018);
}
.people-context-avatar{
  width:22px;
  height:22px;
  display:grid;
  place-items:center;
  border-radius:7px;
  background:rgba(74,120,194,.12);
  border:1px solid rgba(103,164,255,.10);
  color:#8fb7e7;
  font-size:8px;
  font-weight:700;
}
.people-context-message strong{
  display:block;
  color:#9fb3cc;
  font-size:7px;
}
.people-context-message p{
  margin:3px 0 2px;
  color:#6e7d91;
  font-size:6.5px;
  line-height:1.4;
}
.people-context-message small{
  color:#4f5e73;
  font-size:5px;
}
.people-context-open{
  display:flex;
  align-items:center;
  justify-content:space-between;
  padding:8px 7px;
  border:1px solid rgba(103,164,255,.09);
  border-radius:7px;
  background:rgba(74,120,194,.035);
  color:#789fcf;
  font-size:6px;
  font-weight:800;
  letter-spacing:.08em;
  cursor:pointer;
}
.people-context-open:hover{
  background:rgba(74,120,194,.07);
  border-color:rgba(103,164,255,.16);
  color:#a6c8ed;
}
@media(max-width:900px){
  .people-context-space{display:none}
}

/* IMPACT SPACE RAIL */
/* CONTEXTUAL SPACE RAILS */
.contextual-rail-content{position:relative}
.contextual-space-rail{top:43px;left:150px;width:82px;gap:8px;align-items:stretch}
.contextual-space-rail .impact-space-rail-label{align-self:center;margin-bottom:3px}
.context-rail-metric{display:grid;gap:2px;padding:5px 4px;text-align:center;border-bottom:1px solid rgba(255,255,255,.045)}
.context-rail-metric strong{color:#a9c1dd;font-size:11px;font-weight:700}
.context-rail-metric span{color:#5e6e83;font-size:5px;line-height:1.25;letter-spacing:.05em;text-transform:uppercase}
.context-rail-flow-label{margin:2px 2px 0;color:#596a7f;font-size:5px;font-weight:800;letter-spacing:.12em;text-align:center}
.context-rail-flow{display:flex;align-items:flex-start;gap:4px;padding:3px 2px}
.context-rail-flow>span{color:#718db0;font-size:7px;line-height:1.2}
.context-rail-flow p{margin:0;color:#59687c;font-size:5.5px;line-height:1.4}
@media(max-width:900px){.contextual-space-rail{display:none}}
 
.impact-content{position:relative}
.impact-guide{position:absolute;left:-160px;top:39px;width:124px;display:flex;flex-direction:column;gap:5px;padding:2px 10px 12px 0;color:#718198;pointer-events:none}
.impact-guide::before{content:'';position:absolute;right:-3px;top:1px;width:1px;height:calc(100% - 2px);background:linear-gradient(180deg,rgba(103,164,255,.18),rgba(103,164,255,.04),transparent)}
.impact-guide-kicker{color:#65758b;font-size:6px;font-weight:800;letter-spacing:.2em}
.impact-guide>strong{color:#b9c9dc;font-size:9px;letter-spacing:.1em;line-height:1.3}
.impact-guide-subtitle{color:#7f9fc5;font-size:7px;line-height:1.35}
.impact-guide-copy{display:grid;gap:7px;margin-top:8px}
.impact-guide-copy p{margin:0;color:#65758a;font-size:7px;line-height:1.55}
.impact-guide-path{display:flex;align-items:center;gap:3px;flex-wrap:wrap;margin-top:9px;color:#7088a5;font-size:5px;font-weight:800;letter-spacing:.08em}
.impact-guide-path span{padding:3px 4px;border:1px solid rgba(103,164,255,.08);border-radius:4px;background:rgba(74,120,194,.025)}
.impact-guide-path i{font-style:normal;color:#4e627b}
.impact-guide-note{margin:9px 0 0;color:#8a9bb0;font-size:7px;line-height:1.55}
.impact-space-rail{position:absolute;left:-31px;top:43px;width:24px;display:flex;flex-direction:column;align-items:center;gap:10px;z-index:2}
.impact-space-rail-label{writing-mode:vertical-rl;transform:rotate(180deg);color:#596a7f;font-size:6px;font-weight:800;letter-spacing:.18em}
.impact-space-rail-item{width:22px;height:22px;padding:0;display:grid;place-items:center;border:1px solid rgba(255,255,255,.055);border-radius:7px;background:rgba(255,255,255,.018);color:#607188;font-size:10px;cursor:pointer}
.impact-space-rail-item:hover,.impact-space-rail-item.active{border-color:rgba(103,164,255,.16);background:rgba(74,120,194,.07);color:#91b9e9}
.impact-space-rail-line{width:1px;min-height:70px;background:linear-gradient(180deg,rgba(103,164,255,.18),rgba(255,255,255,.02));margin-top:1px}
@media(max-width:900px){.impact-space-rail,.impact-guide{display:none}}

/* Subtle Impact separators */
.impact-section-line {
  height: 1px;
  margin: 4px 13px 7px;
  background: rgba(255,255,255,.08);
}

.impact-subnav-line {
  position: relative;
}

.impact-subnav-line::after {
  content: '';
  display: block;
  height: 1px;
  margin: 5px 13px 2px;
  background: rgba(255,255,255,.06);
}

.live-network-filters{display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin:0 0 14px}
.live-network-filter{padding:7px 10px;border:1px solid rgba(255,255,255,.07);border-radius:7px;background:rgba(255,255,255,.018);color:#8794a7;font-size:7px;font-weight:700;letter-spacing:.08em;cursor:pointer}
.live-network-filter:hover,.live-network-filter.active{background:rgba(88,108,135,.28);border-color:rgba(135,165,205,.34);color:#dce5f1}
.live-network-filter-separator{width:1px;height:18px;margin:0 3px;background:rgba(255,255,255,.09)}
.live-network-layout{display:grid;grid-template-columns:minmax(0,1fr) 280px;gap:18px;align-items:start}
.live-network-feed{display:flex;flex-direction:column;gap:8px}
.live-network-event{display:flex;gap:13px;padding:14px 16px;border:1px solid rgba(255,255,255,.07);border-radius:12px;background:rgba(255,255,255,.025)}
.live-network-event-icon{width:30px;height:30px;flex:0 0 30px;display:grid;place-items:center;border-radius:9px;background:rgba(88,108,135,.28);color:#b9c9df;font-size:13px}
.live-network-event-body{min-width:0}
.live-network-event-type{font-size:7px;letter-spacing:.12em;color:#8fa3bd}
.live-network-event-body p{margin:4px 0 5px;color:#dce5f1;font-size:12px;line-height:1.5}
.live-network-event-body small{color:#718096;font-size:8px}
.live-network-side{display:flex;flex-direction:column;gap:10px;position:sticky;top:16px}
.live-network-summary{padding:17px;border:1px solid rgba(255,255,255,.07);border-radius:13px;background:rgba(255,255,255,.025)}
.live-network-summary strong{display:block;margin:7px 0;color:#edf2f8;font-size:15px}
.live-network-summary p{margin:0;color:#8794a7;font-size:10px;line-height:1.6}
.live-network-stats{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:15px}
.live-network-stats div{padding-top:9px;border-top:1px solid rgba(255,255,255,.07)}
.live-network-stats strong{margin:0;font-size:16px}
.live-network-stats span{display:block;margin-top:3px;color:#718096;font-size:7px}
.live-network-stat-detail{display:block;margin-top:4px;font-size:7px;line-height:1.35;font-weight:600;letter-spacing:.02em}
.live-network-stat-detail.stat-voices{color:#9aaab5}
.live-network-stat-detail.stat-explore{color:#a19faa}
.live-network-stat-detail.stat-opportunities{color:#a99aa4}
.live-network-stat-detail.stat-needs{color:#aaa28f}

@media(max-width:900px){.live-network-layout{grid-template-columns:1fr}.live-network-side{position:static}}

/* LIVE ENGAGEMENT DESTINATIONS */
.live-engagement-content{max-width:1120px}
.live-engagement-back{margin-bottom:18px}
.live-engagement-hero{display:flex;align-items:flex-end;justify-content:space-between;gap:28px;padding:4px 0 22px;border-bottom:1px solid rgba(255,255,255,.06)}
.live-engagement-hero h1{margin:7px 0 8px;color:#edf3fb;font-size:32px;line-height:1.08}
.live-engagement-hero h1 span{color:#7fa9dc}
.live-engagement-hero p{max-width:650px;margin:0;color:#748297;font-size:10px;line-height:1.7}
.live-engagement-signal{min-width:150px;padding:13px 15px;border:1px solid rgba(103,164,255,.13);border-radius:12px;background:rgba(74,120,194,.045);text-align:right}
.live-engagement-signal strong{display:block;color:#b9d2ef;font-size:12px}.live-engagement-signal small{display:block;margin-top:4px;color:#627188;font-size:7px}.live-signal-dot{display:inline-block;width:6px;height:6px;margin-right:5px;border-radius:50%;background:#75b8e8;box-shadow:0 0 9px rgba(117,184,232,.6)}
.live-engagement-grid{display:grid;grid-template-columns:minmax(0,1fr) 250px;gap:14px;margin-top:16px}
.live-conversation-card,.live-context-card,.forming-action-card{border:1px solid rgba(255,255,255,.065);border-radius:14px;background:linear-gradient(145deg,rgba(24,32,45,.7),rgba(10,15,23,.9));box-shadow:0 16px 35px rgba(0,0,0,.16)}
.live-conversation-card{padding:19px}.live-card-top{display:flex;justify-content:space-between;gap:12px}.live-card-status{color:#78aeda;font-size:6px;font-weight:800;letter-spacing:.12em}.live-conversation-card h2,.forming-action-card h2{margin:10px 0 8px;color:#e8f0fa;font-size:19px;line-height:1.3}.live-conversation-card>p,.forming-action-main>p{color:#758398;font-size:9px;line-height:1.6}
.conversation-preview{display:grid;gap:8px;margin:16px 0}.conversation-message{display:grid;grid-template-columns:27px 1fr;gap:8px;padding:9px;border:1px solid rgba(255,255,255,.045);border-radius:9px;background:rgba(255,255,255,.018)}.conversation-avatar{width:27px;height:27px;display:grid;place-items:center;border-radius:8px;background:rgba(74,120,194,.16);color:#9dc3ec;font-size:6px;font-weight:800}.conversation-avatar.purple{background:rgba(130,104,191,.16);color:#baa6e8}.conversation-message strong{color:#a9bdd5;font-size:7px}.conversation-message p{margin:3px 0;color:#6d7b8f;font-size:7px;line-height:1.45}.conversation-message small{color:#4f5d70;font-size:5px}.live-card-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:15px}.live-card-actions .primary-btn,.live-card-actions .ghost-btn{font-size:7px}
.live-context-card{padding:17px;height:max-content}.live-context-row{display:flex;justify-content:space-between;gap:10px;padding:12px 0;border-bottom:1px solid rgba(255,255,255,.045)}.live-context-row:last-child{border-bottom:0}.live-context-row span{color:#56657a;font-size:6px}.live-context-row strong{color:#aabed6;font-size:7px;text-align:right}
.forming-action-card{display:grid;grid-template-columns:minmax(0,1fr) 230px;margin-top:16px;overflow:hidden}.forming-action-main{padding:22px}.action-path{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-top:18px;color:#759bc7;font-size:6px;font-weight:800;letter-spacing:.1em}.action-path span{padding:6px 8px;border:1px solid rgba(103,164,255,.1);border-radius:6px;background:rgba(74,120,194,.035)}.action-path i{color:#4d6079;font-style:normal}.forming-action-side{display:grid;align-content:start;gap:0;padding:19px;border-left:1px solid rgba(255,255,255,.055);background:rgba(255,255,255,.012)}.forming-action-side div{padding:10px 0;border-bottom:1px solid rgba(255,255,255,.045)}.forming-action-side strong{display:block;color:#d2deed;font-size:17px}.forming-action-side span{display:block;margin-top:2px;color:#5d6d82;font-size:6px}.forming-action-side .follow-btn{margin-top:14px}
.network-flow-stage{display:flex;align-items:center;justify-content:center;gap:12px;margin-top:18px;padding:28px 18px;border:1px solid rgba(255,255,255,.06);border-radius:14px;background:radial-gradient(circle at center,rgba(54,83,124,.09),rgba(8,13,21,.65) 62%);overflow:auto}.flow-column{display:grid;gap:7px;min-width:105px}.flow-label{margin-bottom:2px;color:#56677d;font-size:6px;font-weight:800;letter-spacing:.13em;text-align:center}.flow-node{padding:9px 8px;border:1px solid rgba(255,255,255,.055);border-radius:8px;background:rgba(255,255,255,.018);color:#8495aa;font-size:7px;text-align:center;white-space:nowrap;animation:live-flow-node 3.2s ease-in-out infinite}.flow-node.highlighted{border-color:rgba(103,164,255,.16);background:rgba(74,120,194,.07);color:#a9c8ea}.flow-arrow{color:#506782;font-size:16px;animation:live-flow-arrow 2.2s ease-in-out infinite}.flow-footer{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:12px}.flow-footer>div{padding:13px 15px;border:1px solid rgba(255,255,255,.05);border-radius:10px;background:rgba(255,255,255,.015)}.flow-footer span{display:block;color:#56677d;font-size:5px;font-weight:800;letter-spacing:.12em}.flow-footer strong{display:block;margin-top:5px;color:#9badc2;font-size:8px;font-weight:600}.flow-signal{min-width:180px}
@keyframes live-flow-node{0%,100%{transform:translateY(0);opacity:.82}50%{transform:translateY(-2px);opacity:1}}@keyframes live-flow-arrow{0%,100%{opacity:.4;transform:translateX(0)}50%{opacity:1;transform:translateX(3px)}}
@media(max-width:800px){.live-engagement-hero{align-items:flex-start;flex-direction:column}.live-engagement-signal{width:100%;text-align:left}.live-engagement-grid,.forming-action-card{grid-template-columns:1fr}.forming-action-side{border-left:0;border-top:1px solid rgba(255,255,255,.055)}.network-flow-stage{justify-content:flex-start}.flow-footer{grid-template-columns:1fr}}
</style>

