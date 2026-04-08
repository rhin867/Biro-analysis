/**
 * BIRO-ANALYSIS CHROME EXTENSION
 * Background Service Worker (Manifest V3)
 * Optimized for local & production sync detection
 */

let activeSession = null
let currentBaseUrl = 'http://localhost:3000'

// Detect site to determine sync target
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (tab.url?.includes('localhost')) currentBaseUrl = 'http://localhost:3000'
  else if (tab.url?.includes('vercel.app')) currentBaseUrl = 'https://biro-analysis.vercel.app'
})

// ─── Messaging ──────────────────────────────────────────────
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.type) {
    case 'START_SESSION':
      handleStartSession(message.payload, sendResponse)
      return true
    case 'STOP_SESSION':
      handleStopSession(message.payload, sendResponse)
      return true
    case 'LOG_BATCH':
      handleLogBatch(message.payload, sendResponse)
      return true
    case 'SYNC_NOW':
      syncEvents(true).then(res => sendResponse(res))
      return true
    default:
      return false
  }
})

// ─── Handlers ───────────────────────────────────────────────
async function handleStartSession(payload, sendResponse) {
  activeSession = {
    sessionId: `biro_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    testId: payload.testId || 'EXTERNAL_TEST',
    userId: payload.userId || 'guest_user',
    startedAt: Date.now(),
    isActive: true,
  }
  await chrome.storage.local.set({ activeSession, eventBuffer: [] })
  chrome.alarms.create('biroSync', { periodInMinutes: 0.5 }) 
  sendResponse({ ok: true, session: activeSession })
}

async function handleStopSession(payload, sendResponse) {
  if (activeSession) {
    activeSession.isActive = false
    await syncEvents(true)
    await chrome.storage.local.set({ lastSession: activeSession })
    activeSession = null
  }
  chrome.alarms.clear('biroSync')
  sendResponse({ ok: true })
}

async function handleLogBatch(payload, sendResponse) {
  const { eventBuffer = [] } = await chrome.storage.local.get('eventBuffer')
  const newBuffer = [...eventBuffer, ...payload.events].slice(-5000)
  await chrome.storage.local.set({ eventBuffer: newBuffer })
  sendResponse({ ok: true, count: newBuffer.length })
}

// ─── Sync Logic ──────────────────────────────────────────────
async function syncEvents(isFinal = false) {
  const { eventBuffer = [], activeSession: session } = await chrome.storage.local.get(['eventBuffer', 'activeSession'])
  
  if (!session || eventBuffer.length === 0) return { ok: true, synced: 0 }

  console.log(`[BiroSync] Pushing to ${currentBaseUrl}/api/sync...`)

  try {
    const response = await fetch(`${currentBaseUrl}/api/sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        events: eventBuffer,
        sessionId: session.sessionId,
        testId: session.testId,
        userId: session.userId
      })
    })

    const result = await response.json()
    if (result.ok) {
      await chrome.storage.local.set({ eventBuffer: [] })
      return { ok: true, synced: result.ingested }
    }
    return { ok: false, error: result.error }
  } catch (err) {
    return { ok: false, error: 'GATEWAY_UNREACHABLE' }
  }
}

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'biroSync') syncEvents()
})

console.log('[Biro-Analysis] persistence Worker Activated ✓ Target:', currentBaseUrl)
