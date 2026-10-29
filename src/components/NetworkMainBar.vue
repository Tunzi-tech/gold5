<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'

type NetworkScope = 'local' | 'world'
type ChatMessage = { id: number; author: string; text: string; time: string }
type Channel = {
  id: string
  name: string
  description: string
  scope: NetworkScope | 'both'
  mark: string
  members: string
  seed: string
}

const scope = ref<NetworkScope>('local')
const expanded = ref(false)
const activeChannelId = ref<string | null>(null)
const draft = ref('')
const searchTerm = ref('')
const joinedChannelIds = ref<string[]>(['commons'])
const messageThreads = ref<Record<string, ChatMessage[]>>({})
const storageReady = ref(false)

const channels: Channel[] = [
  { id: 'commons', name: 'Commons Lounge', description: 'Introductions, questions and ideas', scope: 'both', mark: '◉', members: '128 exploring', seed: 'Welcome to the Commons Lounge. What are you curious about today?' },
  { id: 'local-question', name: 'Local question', description: 'Ask about a place or possibility near you', scope: 'local', mark: '?', members: 'Open discussion', seed: 'What nearby place could improve through one small shared action?' },
  { id: 'greener-tunis', name: 'Greener Tunis', description: 'Green spaces, gardens and cleaner streets', scope: 'local', mark: '✳', members: '34 exploring', seed: 'Which local green space would you improve first, and how could neighbours help?' },
  { id: 'local-possibilities', name: 'Local Possibilities', description: 'Small actions people can take nearby', scope: 'local', mark: '⌖', members: '21 exploring', seed: 'What is one small action we could take together this week?' },
  { id: 'global-questions', name: 'Global questions', description: 'Questions worth exploring across places', scope: 'world', mark: '◎', members: 'Open discussion', seed: 'What is one approach from your place that could help people somewhere else?' },
  { id: 'ideas-crossing-borders', name: 'Ideas crossing borders', description: 'Approaches shared across different places', scope: 'world', mark: '✧', members: 'Network signal', seed: 'What idea from your community might be useful in another place?' },
  { id: 'open-invitation', name: 'Open invitation', description: 'Find people interested in learning and collaborating', scope: 'world', mark: '∞', members: 'Opportunity', seed: 'What would you like to learn, build or act on together with others?' },
  { id: 'ideas-lab', name: 'Ideas Lab', description: 'Share early ideas and build them together', scope: 'both', mark: '✦', members: '56 exploring ideas', seed: 'Share a rough idea. It does not need to be perfect to start a useful conversation.' },
]

const visibleChannels = computed(() => {
  const query = searchTerm.value.trim().toLowerCase()
  return channels.filter(channel => {
    const inScope = channel.scope === 'both' || channel.scope === scope.value
    const matches = !query || (channel.name + ' ' + channel.description).toLowerCase().includes(query)
    return inScope && matches
  })
})
const activeChannel = computed(() => channels.find(channel => channel.id === activeChannelId.value) ?? null)
const activeMessages = computed(() => activeChannelId.value ? messageThreads.value[activeChannelId.value] ?? [] : [])
const joinedChannels = computed(() => channels.filter(channel => joinedChannelIds.value.includes(channel.id)))

function openConversation(channel: Channel) {
  if (!joinedChannelIds.value.includes(channel.id)) joinedChannelIds.value.push(channel.id)
  activeChannelId.value = channel.id
  expanded.value = true
  if (!messageThreads.value[channel.id]?.length) {
    messageThreads.value[channel.id] = [{ id: Date.now(), author: 'NETWORK GUIDE', text: channel.seed, time: 'Welcome' }]
  }
}

function openFeatured(id: string) {
  const channel = channels.find(item => item.id === id)
  if (channel) openConversation(channel)
}

function sendMessage() {
  const text = draft.value.trim()
  if (!text || !activeChannelId.value) return
  const thread = messageThreads.value[activeChannelId.value] ?? []
  messageThreads.value[activeChannelId.value] = [...thread, {
    id: Date.now(),
    author: 'YOU',
    text,
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  }]
  draft.value = ''
}

function isJoined(id: string) {
  return joinedChannelIds.value.includes(id)
}

function syncDesktopLiveFlowLayout() {
  const mainBar = document.querySelector<HTMLElement>('.network-main-bar')
  if (!mainBar || window.matchMedia('(max-width: 760px)').matches) {
    mainBar?.classList.remove('nfas-live-flow-layout')
    return
  }

  const controls = Array.from(document.querySelectorAll<HTMLElement>(
    'header button, header [role="button"], header a, nav button, nav [role="button"], nav a'
  ))
  const liveFlow = controls.find((control) => {
    const label = [
      control.textContent ?? '',
      control.getAttribute('aria-label') ?? '',
      control.getAttribute('title') ?? '',
      control.getAttribute('data-view') ?? '',
    ].join(' ').replace(/\s+/g, ' ').trim()
    return /live\s*flow|flux en direct|التدفق المباشر/i.test(label)
  })

  let selected = false
  let node: HTMLElement | null = liveFlow ?? null
  for (let depth = 0; node && depth < 4; depth += 1, node = node.parentElement) {
    if (
      node.getAttribute('aria-pressed') === 'true' ||
      node.getAttribute('aria-current') === 'page' ||
      node.getAttribute('data-active') === 'true' ||
      /(^|\s)(active|selected|is-active|is-selected)(\s|$)/i.test(node.className)
    ) {
      selected = true
      break
    }
  }
  mainBar.classList.toggle('nfas-live-flow-layout', selected)
  mainBar.classList.toggle('nfas-home-layout', !selected)
}
onMounted(() => {
  syncDesktopLiveFlowLayout()
  document.addEventListener('click', syncDesktopLiveFlowLayout, true)
  const navObserver = new MutationObserver(syncDesktopLiveFlowLayout)
  navObserver.observe(document.body, {
    subtree: true,
    childList: true,
    attributes: true,
    attributeFilter: ['class', 'aria-pressed', 'aria-current', 'data-active', 'data-view'],
  })
  onBeforeUnmount(() => {
    document.removeEventListener('click', syncDesktopLiveFlowLayout, true)
    navObserver.disconnect()
  })
})

onMounted(() => {
  try {
    const saved = window.localStorage.getItem('nfas-network-main-bar-v1')
    if (saved) {
      const parsed = JSON.parse(saved) as { joinedChannelIds?: unknown; messageThreads?: unknown; scope?: unknown }
      if (Array.isArray(parsed.joinedChannelIds)) {
        joinedChannelIds.value = parsed.joinedChannelIds.filter((id): id is string =>
          typeof id === 'string' && channels.some(channel => channel.id === id))
      }
      if (parsed.messageThreads && typeof parsed.messageThreads === 'object' && !Array.isArray(parsed.messageThreads)) {
        const safeThreads: Record<string, ChatMessage[]> = {}
        for (const channel of channels) {
          const candidate = (parsed.messageThreads as Record<string, unknown>)[channel.id]
          if (Array.isArray(candidate)) {
            safeThreads[channel.id] = candidate.filter((message): message is ChatMessage =>
              !!message && typeof message === 'object' &&
              typeof (message as ChatMessage).id === 'number' &&
              typeof (message as ChatMessage).author === 'string' &&
              typeof (message as ChatMessage).text === 'string' &&
              typeof (message as ChatMessage).time === 'string')
          }
        }
        messageThreads.value = safeThreads
      }
      if (parsed.scope === 'local' || parsed.scope === 'world') scope.value = parsed.scope
    }
  } catch {
    // Keep Network Chat usable when browser storage is disabled or invalid.
  }
  storageReady.value = true
})

watch([joinedChannelIds, messageThreads, scope], () => {
  if (!storageReady.value) return
  try {
    window.localStorage.setItem('nfas-network-main-bar-v1', JSON.stringify({
      joinedChannelIds: joinedChannelIds.value,
      messageThreads: messageThreads.value,
      scope: scope.value,
    }))
  } catch {
    // Messages remain available in this tab even when persistence is blocked.
  }
}, { deep: true })
</script>

<template>
  <section class="network-main-bar" aria-label="Network Chat main bar">
    <div class="network-main-bar-top">
      <div class="network-main-brand">
        <span class="network-main-orbit" aria-hidden="true">◎</span>
      </div>

      <div class="network-main-actions">
        <div class="network-main-scope" role="group" aria-label="Choose conversation scope">
          <button type="button" :class="{ active: scope === 'local' }" :aria-pressed="scope === 'local'" @click="scope = 'local'"><span>◎</span> Local</button>
          <button type="button" :class="{ active: scope === 'world' }" :aria-pressed="scope === 'world'" @click="scope = 'world'"><span>◌</span> Global</button>
        </div>
        <button type="button" class="network-main-open-button" :aria-expanded="expanded" @click="expanded = !expanded">
          <span aria-hidden="true">{{ expanded ? '−' : '↗' }}</span>{{ expanded ? 'Close conversations' : 'Explore conversations' }}
        </button>
      </div>
    </div>

    <div class="network-main-feature-row">
      <button v-if="scope === 'local'" type="button" class="network-main-feature local" @click="openFeatured('local-question')">
        <span class="network-main-feature-mark">?</span>
        <span class="network-main-feature-copy"><strong>Local question</strong><small>What could improve around you through one shared action?</small></span>
        <span class="network-main-feature-cta">Discuss →</span>
      </button>
      <button v-else type="button" class="network-main-feature global" @click="openFeatured('global-questions')">
        <span class="network-main-feature-mark">◎</span>
        <span class="network-main-feature-copy"><strong>Global questions</strong><small>Explore questions and experiences that cross borders.</small></span>
        <span class="network-main-feature-cta">Discuss →</span>
      </button>

      <button type="button" class="network-main-feature signal" @click="openFeatured(scope === 'local' ? 'greener-tunis' : 'ideas-crossing-borders')">
        <span class="network-main-feature-mark">{{ scope === 'local' ? '✳' : '✧' }}</span>
        <span class="network-main-feature-copy">
          <strong>{{ scope === 'local' ? 'Greener Tunis' : 'Ideas crossing borders' }}</strong>
          <small>{{ scope === 'local' ? 'Explore greener streets, gardens and local spaces.' : 'Discover approaches people are sharing across different places.' }}</small>
          <em>{{ scope === 'local' ? 'Local initiative · Explore opportunities' : 'Network signal · Discover' }}</em>
        </span>
        <span class="network-main-feature-cta">Open →</span>
      </button>

      <button type="button" class="network-main-feature invitation" @click="openFeatured('open-invitation')">
        <span class="network-main-feature-mark">∞</span>
        <span class="network-main-feature-copy">
          <strong>Open invitation</strong>
          <small>Meet people interested in learning, collaborating and acting together.</small>
          <em>Opportunity · Explore the network</em>
        </span>
        <span class="network-main-feature-cta">Connect →</span>
      </button>
    </div>

    <section v-if="expanded" class="network-main-workspace" aria-label="Browse channels and discuss">
      <div class="network-main-channel-column">
        <div class="network-main-section-head">
          <div><span class="network-main-eyebrow">FIND YOUR PEOPLE</span><strong>Conversations to join</strong></div>
          <span class="network-main-count">{{ visibleChannels.length }} channels</span>
        </div>
        <label class="network-main-search">
          <span aria-hidden="true">⌕</span>
          <input v-model="searchTerm" type="search" placeholder="Search channels or topics…" aria-label="Search channels or topics" />
        </label>
        <div class="network-main-channel-list">
          <button v-for="channel in visibleChannels" :key="channel.id" type="button" class="network-main-channel" :class="{ active: activeChannelId === channel.id }" @click="openConversation(channel)">
            <span class="network-main-channel-mark">{{ channel.mark }}</span>
            <span class="network-main-channel-copy"><strong>{{ channel.name }}</strong><small>{{ channel.description }}</small><em>{{ channel.members }}</em></span>
            <span class="network-main-join-label">{{ activeChannelId === channel.id ? 'Open ✓' : isJoined(channel.id) ? 'Joined' : 'Join +' }}</span>
          </button>
          <p v-if="!visibleChannels.length" class="network-main-empty">No channels match that search. Try another topic or switch Local / Global.</p>
        </div>
        <div class="network-main-joined-summary"><span class="network-main-status-dot"></span>{{ joinedChannels.length }} joined on this device</div>
      </div>

      <div class="network-main-thread-column">
        <template v-if="activeChannel">
          <div class="network-main-thread-head">
            <div><span class="network-main-eyebrow">{{ activeChannel.scope === 'local' ? 'LOCAL CONVERSATION' : activeChannel.scope === 'world' ? 'GLOBAL CONVERSATION' : 'OPEN NETWORK CONVERSATION' }}</span><h3>{{ activeChannel.name }}</h3><p>{{ activeChannel.description }}</p></div>
            <span class="network-main-thread-mark">{{ activeChannel.mark }}</span>
          </div>
          <div class="network-main-messages" aria-live="polite" aria-label="Conversation messages">
            <article v-for="message in activeMessages" :key="message.id" class="network-main-message" :class="{ yours: message.author === 'YOU' }">
              <div class="network-main-message-meta"><strong>{{ message.author === 'YOU' ? 'You' : message.author }}</strong><time>{{ message.time }}</time></div>
              <p>{{ message.text }}</p>
            </article>
          </div>
          <form class="network-main-composer" @submit.prevent="sendMessage">
            <label class="network-main-composer-label" for="network-main-message">Add your perspective</label>
            <div class="network-main-composer-row"><textarea id="network-main-message" v-model="draft" rows="2" maxlength="1200" placeholder="Ask a question, share an experience or build on an idea…" @keydown.ctrl.enter.prevent="sendMessage" @keydown.meta.enter.prevent="sendMessage"></textarea><button type="submit" :disabled="!draft.trim()">Send <span aria-hidden="true">↑</span></button></div>
            <small>Ctrl / ⌘ + Enter to send · Your message is saved on this device.</small>
          </form>
        </template>
        <div v-else class="network-main-thread-empty">
          <span class="network-main-empty-orbit">◎</span>
          <span class="network-main-eyebrow">YOUR NEXT CONVERSATION</span>
          <h3>Choose a channel to begin.</h3>
          <p>Join a topic, open its discussion and add your perspective. Start locally or compare ideas with the wider network.</p>
          <div class="network-main-thread-suggestions">
            <button type="button" @click="openFeatured(scope === 'local' ? 'local-question' : 'global-questions')">{{ scope === 'local' ? 'Open local question' : 'Open global questions' }} <span>→</span></button>
            <button type="button" @click="openFeatured('commons')">Join Commons Lounge <span>→</span></button>
          </div>
        </div>
      </div>
      <p class="network-main-storage-note">Network Chat preview: messages and joined channels are stored in this browser on this device. Shared, real-time conversations require a connected server.</p>
    </section>
  </section>
</template>

<style>
.network-main-bar {
  position: relative;
  z-index: 30;
  margin: 0 0 14px;
  padding: 13px 15px 12px;
  border: 1px solid rgba(112, 153, 208, .22);
  border-radius: 16px;
  background:
    radial-gradient(ellipse at 0% 0%, rgba(62, 119, 194, .10), transparent 44%),
    linear-gradient(112deg, rgba(14, 25, 41, .97), rgba(10, 18, 31, .96) 55%, rgba(20, 19, 39, .95));
  box-shadow: 0 9px 25px rgba(0, 0, 0, .13), inset 0 1px 0 rgba(232, 242, 255, .035);
  color: #dce9fb;
}
.network-main-bar * { box-sizing: border-box; }
.network-main-bar-top { display:flex; align-items:center; justify-content:space-between; gap:14px; }
.network-main-brand { display:flex; align-items:center; gap:11px; min-width:0; }
.network-main-orbit { display:grid; place-items:center; width:38px; height:38px; flex:0 0 38px; border:1px solid rgba(110,190,224,.38); border-radius:50%; color:#a8e4f3; background:radial-gradient(circle,rgba(64,143,185,.18),rgba(15,28,47,.55)); box-shadow:inset 0 0 0 4px rgba(106,174,229,.035),0 0 17px rgba(65,144,207,.09); font-size:19px; }
.network-main-heading { display:flex; flex-direction:column; gap:3px; min-width:0; }
.network-main-eyebrow { color:#8eaed5; font-size:8px; font-weight:850; letter-spacing:.15em; line-height:1.35; }
.network-main-heading strong { color:#f0f5ff; font-size:14px; font-weight:720; letter-spacing:-.02em; }
.network-main-heading small { color:#92a7c3; font-size:10px; line-height:1.4; }
.network-main-actions { display:flex; align-items:center; justify-content:flex-end; gap:8px; flex:0 0 auto; }
.network-main-scope { display:flex; gap:3px; padding:3px; border:1px solid rgba(122,155,202,.18); border-radius:11px; background:rgba(4,11,21,.52); }
.network-main-scope button { display:flex; align-items:center; gap:5px; min-height:31px; padding:0 10px; border:1px solid transparent; border-radius:8px; background:transparent; color:#9fb1ca; font:inherit; font-size:10px; font-weight:750; cursor:pointer; transition:background .18s ease,color .18s ease,border-color .18s ease; }
.network-main-scope button span { font-size:13px; }
.network-main-scope button.active { color:#eff7ff; border-color:rgba(119,179,244,.31); background:linear-gradient(120deg,rgba(48,107,171,.35),rgba(99,75,162,.26)); box-shadow:inset 0 1px rgba(255,255,255,.05); }
.network-main-open-button { display:flex; align-items:center; gap:7px; min-height:37px; padding:0 12px; border:1px solid rgba(111,180,232,.34); border-radius:10px; color:#d8efff; background:linear-gradient(115deg,rgba(30,91,130,.36),rgba(50,50,99,.3)); font:inherit; font-size:10px; font-weight:800; white-space:nowrap; cursor:pointer; transition:filter .18s ease,border-color .18s ease; }
.network-main-open-button:hover { filter:brightness(1.15); border-color:rgba(143,211,255,.62); }
.network-main-feature-row { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:8px; margin-top:12px; }
.network-main-feature { display:flex; align-items:center; gap:9px; min-width:0; min-height:66px; padding:9px 10px; text-align:left; border:1px solid rgba(117,151,196,.16); border-radius:11px; background:rgba(16,29,47,.65); color:inherit; cursor:pointer; transition:border-color .18s ease,background .18s ease,transform .18s ease; }
.network-main-feature:hover { border-color:rgba(125,181,234,.42); background:rgba(27,44,68,.78); transform:translateY(-1px); }
.network-main-feature.local { border-color:rgba(96,191,157,.22); background:linear-gradient(110deg,rgba(35,89,82,.2),rgba(15,31,46,.66)); }
.network-main-feature.global { border-color:rgba(118,153,233,.24); background:linear-gradient(110deg,rgba(45,70,123,.22),rgba(22,29,51,.66)); }
.network-main-feature.signal { background:linear-gradient(110deg,rgba(33,68,104,.25),rgba(15,27,43,.68)); }
.network-main-feature.invitation { background:linear-gradient(110deg,rgba(75,54,113,.22),rgba(20,26,44,.68)); }
.network-main-feature-mark { display:grid; place-items:center; width:31px; height:31px; flex:0 0 31px; border:1px solid rgba(123,171,223,.25); border-radius:9px; color:#b7d9ff; background:rgba(64,104,163,.13); font-size:16px; }
.network-main-feature.local .network-main-feature-mark { color:#9de3c5; border-color:rgba(105,210,166,.25); background:rgba(53,134,105,.13); }
.network-main-feature.invitation .network-main-feature-mark { color:#d3baff; border-color:rgba(169,137,231,.28); background:rgba(107,77,159,.14); }
.network-main-feature-copy { display:flex; flex-direction:column; gap:3px; min-width:0; flex:1; }
.network-main-feature-copy strong { color:#e6effd; font-size:10px; font-weight:780; line-height:1.35; }
.network-main-feature-copy small { color:#9cacc3; font-size:9px; line-height:1.45; }
.network-main-feature-copy em { color:#8faed0; font-size:8px; font-style:normal; line-height:1.35; }
.network-main-feature-cta { flex:0 0 auto; color:#9ccdf3; font-size:9px; font-weight:800; white-space:nowrap; }
.network-main-workspace { display:grid; grid-template-columns:minmax(255px,.88fr) minmax(0,1.4fr); gap:12px; margin-top:13px; padding-top:13px; border-top:1px solid rgba(122,153,194,.16); }
.network-main-channel-column,.network-main-thread-column { min-width:0; }
.network-main-section-head { display:flex; align-items:center; justify-content:space-between; gap:8px; margin-bottom:9px; }
.network-main-section-head>div { display:flex; flex-direction:column; gap:3px; }
.network-main-section-head strong { color:#e7f0ff; font-size:12px; }
.network-main-count { color:#8298b5; font-size:9px; }
.network-main-search { display:flex; align-items:center; gap:7px; height:34px; padding:0 10px; border:1px solid rgba(116,152,199,.19); border-radius:9px; background:rgba(3,10,19,.42); color:#8faed2; }
.network-main-search input { width:100%; min-width:0; border:0; outline:0; color:#e1edff; background:transparent; font:inherit; font-size:10px; }
.network-main-search input::placeholder { color:#7085a1; }
.network-main-channel-list { display:grid; gap:5px; max-height:310px; margin-top:8px; overflow:auto; padding-right:2px; }
.network-main-channel { display:flex; align-items:center; gap:8px; min-width:0; width:100%; padding:8px; text-align:left; border:1px solid rgba(113,145,187,.13); border-radius:9px; color:inherit; background:rgba(15,26,42,.54); cursor:pointer; }
.network-main-channel:hover,.network-main-channel.active { border-color:rgba(113,175,232,.4); background:rgba(33,57,86,.52); }
.network-main-channel-mark { display:grid; place-items:center; width:28px; height:28px; flex:0 0 28px; border-radius:8px; background:rgba(81,123,183,.15); color:#a8d4ff; font-size:14px; }
.network-main-channel-copy { display:flex; flex-direction:column; gap:2px; min-width:0; flex:1; }
.network-main-channel-copy strong { color:#e3edfc; font-size:10px; }
.network-main-channel-copy small { color:#91a5bf; font-size:9px; line-height:1.35; }
.network-main-channel-copy em { color:#7693b8; font-size:8px; font-style:normal; }
.network-main-join-label { color:#9ecdf7; font-size:8px; font-weight:800; white-space:nowrap; }
.network-main-empty { margin:8px 0; color:#91a5bf; font-size:10px; line-height:1.5; }
.network-main-joined-summary { display:flex; align-items:center; gap:6px; margin-top:9px; color:#7f96b3; font-size:9px; }
.network-main-status-dot { width:6px; height:6px; border-radius:50%; background:#78d6ad; box-shadow:0 0 8px rgba(120,214,173,.3); }
.network-main-thread-column { display:flex; flex-direction:column; min-height:310px; padding:12px; border:1px solid rgba(117,151,196,.16); border-radius:12px; background:linear-gradient(150deg,rgba(13,24,40,.78),rgba(8,15,27,.76)); }
.network-main-thread-head { display:flex; align-items:flex-start; justify-content:space-between; gap:12px; padding-bottom:10px; border-bottom:1px solid rgba(122,153,194,.13); }
.network-main-thread-head h3,.network-main-thread-empty h3 { margin:4px 0; color:#edf4ff; font-size:15px; letter-spacing:-.025em; }
.network-main-thread-head p,.network-main-thread-empty p { margin:0; color:#94a8c3; font-size:10px; line-height:1.55; }
.network-main-thread-mark { display:grid; place-items:center; width:32px; height:32px; flex:0 0 32px; border:1px solid rgba(119,167,224,.23); border-radius:10px; color:#a9d5ff; background:rgba(69,113,177,.12); }
.network-main-messages { display:flex; flex-direction:column; gap:8px; max-height:220px; min-height:100px; padding:11px 2px; overflow:auto; }
.network-main-message { align-self:flex-start; max-width:92%; padding:8px 10px; border:1px solid rgba(118,148,189,.16); border-radius:10px 10px 10px 3px; background:rgba(24,40,61,.65); }
.network-main-message.yours { align-self:flex-end; border-color:rgba(103,161,232,.24); background:rgba(45,77,121,.27); border-radius:10px 10px 3px 10px; }
.network-main-message-meta { display:flex; align-items:center; gap:8px; color:#91afd4; font-size:8px; }
.network-main-message-meta time { color:#7287a2; }
.network-main-message p { margin:4px 0 0; color:#d5e2f4; font-size:10px; line-height:1.5; white-space:pre-wrap; overflow-wrap:anywhere; }
.network-main-composer { margin-top:auto; padding-top:8px; }
.network-main-composer-label { display:block; margin-bottom:5px; color:#a7bedc; font-size:9px; font-weight:750; }
.network-main-composer-row { display:flex; align-items:stretch; gap:7px; }
.network-main-composer-row textarea { width:100%; min-width:0; resize:vertical; padding:9px; border:1px solid rgba(117,153,201,.2); border-radius:9px; outline:0; color:#e1edff; background:rgba(3,10,19,.5); font:inherit; font-size:10px; line-height:1.45; }
.network-main-composer-row textarea:focus { border-color:rgba(122,188,244,.55); }
.network-main-composer-row button { align-self:stretch; padding:0 13px; border:1px solid rgba(113,186,232,.36); border-radius:9px; color:#e6f5ff; background:linear-gradient(120deg,rgba(35,105,145,.78),rgba(73,66,132,.78)); font:inherit; font-size:10px; font-weight:800; cursor:pointer; }
.network-main-composer-row button:disabled { opacity:.42; cursor:not-allowed; }
.network-main-composer>small { display:block; margin-top:5px; color:#7186a1; font-size:8px; line-height:1.4; }
.network-main-thread-empty { display:flex; flex:1; flex-direction:column; align-items:flex-start; justify-content:center; min-height:260px; padding:18px; }
.network-main-empty-orbit { display:grid; place-items:center; width:44px; height:44px; margin-bottom:14px; border:1px solid rgba(116,180,225,.29); border-radius:50%; color:#a7dcf5; background:rgba(46,96,139,.13); font-size:23px; }
.network-main-thread-suggestions { display:flex; flex-wrap:wrap; gap:7px; margin-top:13px; }
.network-main-thread-suggestions button { padding:8px 10px; border:1px solid rgba(115,157,207,.23); border-radius:8px; color:#b9d8f7; background:rgba(43,75,116,.17); font:inherit; font-size:9px; cursor:pointer; }
.network-main-thread-suggestions button span { margin-left:7px; }
.network-main-storage-note { grid-column:1/-1; margin:0; color:#7186a1; font-size:8px; line-height:1.45; }
@media (max-width:1100px) and (min-width:761px) {
  .network-main-feature-row { grid-template-columns:repeat(2,minmax(0,1fr)); }
  .network-main-feature.invitation { grid-column:1/-1; }
  .network-main-workspace { grid-template-columns:minmax(220px,.85fr) minmax(0,1.15fr); }
}
@media (max-width:760px) {
  .network-main-bar { margin:0 0 12px; padding:11px; border-radius:13px; }
  .network-main-bar-top { align-items:flex-start; flex-direction:column; gap:10px; }
  .network-main-brand { align-items:flex-start; }
  .network-main-orbit { width:32px; height:32px; flex-basis:32px; font-size:16px; }
  .network-main-heading strong { font-size:13px; }
  .network-main-heading small { font-size:9px; }
  .network-main-actions { width:100%; justify-content:space-between; }
  .network-main-scope { flex:1; }
  .network-main-scope button { flex:1; justify-content:center; padding:0 8px; }
  .network-main-open-button { flex:0 0 auto; }
  .network-main-feature-row { grid-template-columns:1fr; gap:6px; margin-top:10px; }
  .network-main-feature { min-height:61px; padding:8px; }
  .network-main-feature-copy strong { font-size:10px; }
  .network-main-feature-copy small { font-size:9px; }
  .network-main-workspace { grid-template-columns:1fr; gap:10px; }
  .network-main-channel-list { max-height:230px; }
  .network-main-thread-column { min-height:300px; }
  .network-main-thread-empty { min-height:200px; }
  .network-main-storage-note { padding-top:2px; }
}
@media (prefers-reduced-motion:reduce) {
  .network-main-bar *, .network-main-bar *::before, .network-main-bar *::after { transition:none !important; }
}

/* Placement: under the desktop top bar, but above the Impact control on mobile. */
@media (min-width: 761px) {
  header.topbar:has(> .network-main-bar) {
    position: relative !important;
    z-index: 10010 !important;
    overflow: visible !important;
    margin-bottom: 154px !important;
  }
  header.topbar > .network-main-bar {
    position: absolute !important;
    top: calc(100% + 1px) !important;
    left: 0 !important;
    right: 0 !important;
    width: auto !important;
    margin: 0 !important;
    border-radius: 0 0 15px 15px !important;
    z-index: 10020 !important;
    max-height: min(72vh, 720px) !important;
    overflow-y: auto !important;
    box-shadow: 0 16px 36px rgba(0,0,0,.28), inset 0 1px 0 rgba(232,242,255,.035) !important;
  }
}
@media (max-width: 760px) {
  header.topbar:has(> .network-main-bar) {
    grid-template-rows: 35px 36px 36px auto 36px !important;
  }
  header.topbar > .network-main-bar {
    position: relative !important;
    grid-column: 1 / -1 !important;
    grid-row: 4 !important;
    align-self: stretch !important;
    justify-self: stretch !important;
    width: 100% !important;
    min-width: 0 !important;
    margin: 0 !important;
    padding: 8px !important;
    max-height: none !important;
    overflow: visible !important;
    border-radius: 11px !important;
  }
  header.topbar > .mobile-home-space-row {
    grid-row: 5 !important;
  }
  header.topbar > .network-main-bar .network-main-bar-top {
    flex-direction: row !important;
    align-items: center !important;
    gap: 6px !important;
  }
  header.topbar > .network-main-bar .network-main-brand {
    flex: 1 1 auto !important;
    gap: 6px !important;
  }
  header.topbar > .network-main-bar .network-main-orbit {
    width: 26px !important;
    height: 26px !important;
    flex-basis: 26px !important;
    font-size: 13px !important;
  }
  header.topbar > .network-main-bar .network-main-eyebrow {
    font-size: 6px !important;
    letter-spacing: .11em !important;
  }
  header.topbar > .network-main-bar .network-main-heading strong {
    font-size: 10px !important;
  }
  header.topbar > .network-main-bar .network-main-heading small {
    display: none !important;
  }
  header.topbar > .network-main-bar .network-main-actions {
    width: auto !important;
    flex: 0 0 auto !important;
    gap: 4px !important;
  }
  header.topbar > .network-main-bar .network-main-scope {
    gap: 1px !important;
    padding: 2px !important;
  }
  header.topbar > .network-main-bar .network-main-scope button {
    min-height: 28px !important;
    padding: 0 5px !important;
    gap: 3px !important;
    font-size: 8px !important;
  }
  header.topbar > .network-main-bar .network-main-open-button {
    min-height: 30px !important;
    padding: 0 7px !important;
    gap: 4px !important;
    font-size: 8px !important;
  }
  header.topbar > .network-main-bar .network-main-feature-row {
    grid-template-columns: repeat(3, minmax(155px, 1fr)) !important;
    gap: 5px !important;
    margin-top: 7px !important;
    overflow-x: auto !important;
    padding-bottom: 2px !important;
  }
  header.topbar > .network-main-bar .network-main-feature {
    min-height: 48px !important;
    padding: 6px !important;
    gap: 6px !important;
  }
  header.topbar > .network-main-bar .network-main-feature-mark {
    width: 24px !important;
    height: 24px !important;
    flex-basis: 24px !important;
    font-size: 12px !important;
  }
  header.topbar > .network-main-bar .network-main-feature-copy strong {
    font-size: 8px !important;
  }
  header.topbar > .network-main-bar .network-main-feature-copy small {
    font-size: 7px !important;
    line-height: 1.3 !important;
  }
  header.topbar > .network-main-bar .network-main-feature-copy em,
  header.topbar > .network-main-bar .network-main-feature-cta {
    display: none !important;
  }
  header.topbar > .network-main-bar:has(.network-main-workspace) {
    max-height: 58vh !important;
    overflow-y: auto !important;
  }
  header.topbar > .network-main-bar .network-main-workspace {
    grid-template-columns: minmax(0, 1fr) !important;
  }
}



/* Desktop Live Flow: bring each feature action up beside its icon. */
@media (min-width: 761px) {
  .network-main-bar.nfas-live-flow-layout .network-main-feature {
    align-items: flex-start;
    padding-top: 8px;
    padding-bottom: 8px;
    gap: 7px;
  }
  .network-main-bar.nfas-live-flow-layout .network-main-feature-mark {
    width: 27px;
    height: 27px;
    flex-basis: 27px;
    font-size: 14px;
  }
  .network-main-bar.nfas-live-flow-layout .network-main-feature-copy {
    align-self: flex-start;
    gap: 3px;
  }
  .network-main-bar.nfas-live-flow-layout .network-main-feature-cta {
    align-self: flex-start;
    margin-left: auto;
    margin-top: 1px;
    padding: 4px 7px;
    border: 1px solid rgba(130, 183, 235, .25);
    border-radius: 7px;
    background: rgba(63, 102, 157, .18);
    font-size: 8px;
    line-height: 1.2;
  }
}


/* Keep the original feature-card colors and icons, but make them compact in desktop Live Flow. */
@media (min-width: 761px) {
  .network-main-bar.nfas-live-flow-layout .network-main-bar-top {
    justify-content: flex-start;
    gap: 12px;
  }
  .network-main-bar.nfas-live-flow-layout .network-main-brand {
    flex: 0 0 auto;
  }
  .network-main-bar.nfas-live-flow-layout .network-main-actions {
    flex: 0 0 auto;
    margin-left: auto;
  }
  .network-main-bar.nfas-live-flow-layout .network-main-feature-row {
    position: absolute;
    top: 10px;
    left: 62px;
    right: 250px;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    gap: 7px;
    min-width: 0;
    margin: 0;
  }
  .network-main-bar.nfas-live-flow-layout .network-main-feature {
    flex: 0 1 auto;
    width: auto;
    max-width: 190px;
    min-width: 0;
    min-height: 34px;
    padding: 5px 8px;
    gap: 6px;
    align-items: center;
  }
  .network-main-bar.nfas-live-flow-layout .network-main-feature-mark {
    width: 23px;
    height: 23px;
    flex: 0 0 23px;
    font-size: 12px;
  }
  .network-main-bar.nfas-live-flow-layout .network-main-feature-copy {
    min-width: 0;
    gap: 1px;
    align-self: center;
  }
  .network-main-bar.nfas-live-flow-layout .network-main-feature-copy strong {
    font-size: 10px;
    line-height: 1.15;
    white-space: nowrap;
  }
  .network-main-bar.nfas-live-flow-layout .network-main-feature-copy small {
    display: none;
  }
  .network-main-bar.nfas-live-flow-layout .network-main-feature-cta {
    flex: 0 0 auto;
    align-self: center;
    margin-left: 2px;
    padding: 3px 6px;
    font-size: 9px;
    line-height: 1.1;
  }
}
</style>
