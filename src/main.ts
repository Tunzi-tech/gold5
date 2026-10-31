type EnffasEarlyDiagnostics = {
  stage: string
  mark: (stage: string) => void
}

const diagnostics = (window as Window & {
  __ENFFAS_EARLY_DIAGNOSTICS__?: EnffasEarlyDiagnostics
}).__ENFFAS_EARLY_DIAGNOSTICS__

diagnostics?.mark('module-entry')

const root = document.getElementById('app')
if (root) {
  const panel = document.createElement('main')
  panel.style.cssText = 'min-height:100vh;display:grid;place-items:center;padding:32px;background:#0b1020;color:#eaf0ff;font:16px/1.6 system-ui,sans-serif;text-align:center'
  panel.innerHTML = '<div><h1 style="font-size:28px;margin:0 0 12px">Enffas startup isolation test</h1><p style="max-width:560px;margin:0 auto">The application is temporarily paused while we isolate the startup freeze. This page tests whether the browser can execute the app entry module without loading Vue, application components, or application styles.</p><p style="margin:18px 0 0;color:#9fb4da">Diagnostic checkpoint: module-entry</p></div>'
  root.replaceChildren(panel)
  diagnostics?.mark('isolation-rendered')
}
