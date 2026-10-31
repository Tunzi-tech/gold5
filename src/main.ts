import { createApp } from 'vue'
import './style.css'
import './nfas-sidebar-orbit.css'
import './mobile-impact-dark.css'
import App from './App.vue'

type EnffasEarlyDiagnostics = {
  stage: string
  errors: string[]
  mark: (stage: string) => void
}

const earlyDiagnostics = (window as Window & {
  __ENFFAS_EARLY_DIAGNOSTICS__?: EnffasEarlyDiagnostics
}).__ENFFAS_EARLY_DIAGNOSTICS__

earlyDiagnostics?.mark('vue-module-entry')

try {
  const app = createApp(App)
  earlyDiagnostics?.mark('vue-app-created')
  app.mount('#app')
  earlyDiagnostics?.mark('mount-complete')
} catch (error) {
  const message = error instanceof Error ? error.stack || error.message : String(error)
  if (earlyDiagnostics) {
    earlyDiagnostics.mark('mount-failed')
    if (!earlyDiagnostics.errors.includes(message)) earlyDiagnostics.errors.push(message.slice(0, 500))
  }
  throw error
}
