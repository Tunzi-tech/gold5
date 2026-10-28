<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'

type RecoveryMode = 'warning' | 'recovery'

const mode = ref<RecoveryMode | null>(null)
const diagnostics = ref<string[]>([])
const retryCount = ref(0)
let warningTimer: number | undefined
let recoveryTimer: number | undefined
let readinessTimer: number | undefined
let observer: MutationObserver | undefined

const MAX_RETRIES = 2

function addDiagnostic(message: string) {
  if (!diagnostics.value.includes(message)) diagnostics.value.push(message)
  if (diagnostics.value.length > 5) diagnostics.value.shift()
}

function appLooksReady() {
  // The app's normal desktop/mobile shell is marked by the existing top bar or main layout.
  return Boolean(document.querySelector('header.topbar, .main, .home-commons-content'))
}

function clearStartupTimers() {
  if (warningTimer !== undefined) window.clearTimeout(warningTimer)
  if (recoveryTimer !== undefined) window.clearTimeout(recoveryTimer)
  if (readinessTimer !== undefined) window.clearInterval(readinessTimer)
}

function startWatchdog() {
  clearStartupTimers()
  mode.value = null
  warningTimer = window.setTimeout(() => {
    if (!appLooksReady()) {
      mode.value = 'warning'
      addDiagnostic('The main platform layout has not appeared after 10 seconds.')
    }
  }, 10_000)
  recoveryTimer = window.setTimeout(() => {
    if (!appLooksReady()) {
      mode.value = 'recovery'
      addDiagnostic('Startup is still incomplete after 20 seconds.')
    }
  }, 20_000)
  readinessTimer = window.setInterval(() => {
    if (appLooksReady()) {
      mode.value = null
      clearStartupTimers()
    }
  }, 500)
}

function handleWindowError(event: ErrorEvent) {
  const message = event.message || 'An unexpected JavaScript error occurred.'
  addDiagnostic(message.slice(0, 220))
  // Avoid covering a functioning platform for a recoverable error.
  if (!appLooksReady()) {
    mode.value = 'warning'
    if (!recoveryTimer) recoveryTimer = window.setTimeout(() => { mode.value = 'recovery' }, 20_000)
  }
}

function handleUnhandledRejection(event: PromiseRejectionEvent) {
  const reason = event.reason
  const message = reason instanceof Error ? reason.message : String(reason ?? 'Unhandled promise rejection')
  addDiagnostic(('Unhandled promise rejection: ' + message).slice(0, 220))
  if (!appLooksReady()) mode.value = 'warning'
}

function handleResourceError(event: Event) {
  const target = event.target
  if (!(target instanceof HTMLScriptElement || target instanceof HTMLLinkElement)) return
  if (target instanceof HTMLLinkElement && !/stylesheet/i.test(target.rel)) return
  const resource = target instanceof HTMLScriptElement ? target.src : target.href
  addDiagnostic(('A script or stylesheet failed to load: ' + (resource || 'unknown resource')).slice(0, 220))
  if (!appLooksReady()) mode.value = 'warning'
}

function retryStartup() {
  if (retryCount.value >= MAX_RETRIES) {
    mode.value = 'recovery'
    addDiagnostic('Automatic retry limit reached. Use Reload Platform or troubleshooting.')
    return
  }
  retryCount.value += 1
  startWatchdog()
  window.setTimeout(() => {
    if (!appLooksReady()) mode.value = 'recovery'
  }, 20_000)
}

function reloadPlatform() {
  // One cache-busting query avoids repeatedly reusing a stale HTML entry point.
  const url = new URL(window.location.href)
  url.searchParams.set('enffas-retry', String(Date.now()))
  window.location.replace(url.toString())
}

function dismissWarning() {
  if (mode.value === 'warning') mode.value = null
}

onMounted(() => {
  window.addEventListener('error', handleWindowError, true)
  window.addEventListener('unhandledrejection', handleUnhandledRejection)
  document.addEventListener('error', handleResourceError, true)
  observer = new MutationObserver(() => {
    if (appLooksReady()) {
      mode.value = null
      clearStartupTimers()
    }
  })
  observer.observe(document.documentElement, { childList: true, subtree: true })
  startWatchdog()
})

onBeforeUnmount(() => {
  clearStartupTimers()
  observer?.disconnect()
  window.removeEventListener('error', handleWindowError, true)
  window.removeEventListener('unhandledrejection', handleUnhandledRejection)
  document.removeEventListener('error', handleResourceError, true)
})
</script>

<template>
  <Transition name="startup-recovery">
    <aside v-if="mode" class="startup-recovery" :class="{ 'startup-recovery--warning': mode === 'warning' }" role="status" aria-live="polite">
      <button v-if="mode === 'warning'" class="startup-recovery__close" type="button" aria-label="Dismiss startup warning" @click="dismissWarning">×</button>
      <div class="startup-recovery__orb" aria-hidden="true"><span></span></div>
      <p class="startup-recovery__eyebrow">ENFFAS · STARTUP CHECK</p>
      <h2>{{ mode === 'warning' ? 'Taking longer than expected' : 'Enffas could not finish loading' }}</h2>
      <p class="startup-recovery__copy">
        {{ mode === 'warning'
          ? 'We are checking whether the platform has finished opening. You can keep waiting.'
          : 'The platform may be blocked by a browser extension, cached files, or a failed resource. You can retry or reload.' }}
      </p>
      <div v-if="mode === 'recovery'" class="startup-recovery__actions">
        <button type="button" class="startup-recovery__primary" @click="retryStartup">Try again <span>({{ MAX_RETRIES - retryCount }} retries left)</span></button>
        <button type="button" class="startup-recovery__secondary" @click="reloadPlatform">Reload platform</button>
      </div>
      <button v-else type="button" class="startup-recovery__secondary" @click="mode = 'recovery'">Troubleshoot</button>
      <details v-if="mode === 'recovery' && diagnostics.length" class="startup-recovery__details">
        <summary>Technical details</summary>
        <ul><li v-for="(item, index) in diagnostics" :key="index">{{ item }}</li></ul>
      </details>
      <p v-if="mode === 'recovery'" class="startup-recovery__hint">If it still fails, try disabling extensions for this site or clearing this site's cached data. Your account data on a server is not deleted by this page.</p>
    </aside>
  </Transition>
</template>

<style scoped>
.startup-recovery {
  position: fixed;
  z-index: 2147483647;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 28px 22px;
  overflow-y: auto;
  color: #eef3ff;
  text-align: center;
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  background: radial-gradient(ellipse at 50% 28%, rgba(69, 91, 161, .22), transparent 42%), rgba(6, 10, 20, .97);
  backdrop-filter: blur(18px);
}
.startup-recovery--warning {
  inset: auto 16px 16px auto;
  width: min(390px, calc(100vw - 32px));
  border: 1px solid rgba(135, 157, 218, .28);
  border-radius: 18px;
  padding: 22px;
  background: rgba(10, 16, 32, .96);
  box-shadow: 0 18px 55px rgba(0, 0, 0, .36);
}
.startup-recovery__orb {
  width: 44px; height: 44px; border-radius: 50%; display: grid; place-items: center;
  border: 1px solid rgba(133, 171, 255, .55);
  box-shadow: 0 0 28px rgba(91, 121, 230, .2), inset 0 0 16px rgba(91, 121, 230, .13);
}
.startup-recovery__orb span { width: 13px; height: 13px; border-radius: 50%; background: #9db8ff; box-shadow: 0 0 16px rgba(120, 157, 255, .7); }
.startup-recovery__eyebrow { margin: 4px 0 0; color: #9fb6f6; font-size: 11px; letter-spacing: .2em; font-weight: 700; }
.startup-recovery h2 { max-width: 520px; margin: 0; font-size: clamp(21px, 4vw, 30px); line-height: 1.2; font-weight: 650; }
.startup-recovery__copy { max-width: 480px; margin: 0; color: #b9c4db; font-size: 14px; line-height: 1.65; }
.startup-recovery__actions { display: flex; flex-wrap: wrap; justify-content: center; gap: 10px; }
.startup-recovery button { border: 1px solid rgba(159, 182, 246, .32); border-radius: 999px; padding: 11px 17px; color: #edf2ff; font: inherit; font-size: 13px; cursor: pointer; background: rgba(100, 122, 187, .14); }
.startup-recovery button:focus-visible, .startup-recovery summary:focus-visible { outline: 2px solid #a9c2ff; outline-offset: 3px; }
.startup-recovery .startup-recovery__primary { background: linear-gradient(110deg, #356fc8, #6655bd); border-color: rgba(175, 193, 255, .6); }
.startup-recovery__primary span { opacity: .75; font-size: 11px; }
.startup-recovery__secondary { background: rgba(255, 255, 255, .045) !important; }
.startup-recovery__close { position: absolute; right: 12px; top: 12px; width: 32px; height: 32px; padding: 0 !important; font-size: 22px !important; }
.startup-recovery__details { width: min(620px, 100%); margin-top: 8px; text-align: left; color: #aebbd4; font-size: 12px; }
.startup-recovery__details summary { cursor: pointer; }
.startup-recovery__details ul { max-height: 120px; overflow: auto; padding-left: 20px; overflow-wrap: anywhere; }
.startup-recovery__hint { max-width: 500px; color: #8998b7; font-size: 12px; line-height: 1.55; }
.startup-recovery-enter-active, .startup-recovery-leave-active { transition: opacity .18s ease, transform .18s ease; }
.startup-recovery-enter-from, .startup-recovery-leave-to { opacity: 0; transform: translateY(6px); }
@media (prefers-reduced-motion: reduce) { .startup-recovery-enter-active, .startup-recovery-leave-active { transition: none; } }
</style>
