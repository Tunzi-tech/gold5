import { createApp, h } from 'vue'

type EnffasEarlyDiagnostics = {
  stage: string
  mark: (stage: string) => void
}

const diagnostics = (window as Window & {
  __ENFFAS_EARLY_DIAGNOSTICS__?: EnffasEarlyDiagnostics
}).__ENFFAS_EARLY_DIAGNOSTICS__

diagnostics?.mark('vue-module-entry')

const TestApp = {
  render: () => h('main', {
    style: 'min-height:100vh;display:grid;place-items:center;padding:32px;background:#0b1020;color:#eaf0ff;font:16px/1.6 system-ui,sans-serif;text-align:center'
  }, [
    h('div', [
      h('h1', { style: 'font-size:28px;margin:0 0 12px' }, 'Enffas Vue isolation test'),
      h('p', { style: 'max-width:560px;margin:0 auto' }, 'Vue is loaded, but the original App.vue and application CSS are still bypassed. This test checks whether Vue itself can mount a minimal component.'),
      h('p', { style: 'margin:18px 0 0;color:#9fb4da' }, 'Diagnostic checkpoint: vue-mount-complete')
    ])
  ])
}

createApp(TestApp).mount('#app')
diagnostics?.mark('vue-mount-complete')
