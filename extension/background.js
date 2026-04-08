/**
 * BIRO-ANALYSIS CHROME EXTENSION
 * Background Service Worker (Manifest V3)
 * Persistent sync gateway for dashboard integration
 */

let activeSession = null
const DASHBOARD_URL = 'http://localhost:3000' // Should be dynamic in production

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
    await syncEvents(true) // Final flush
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

  console.log(`[BiroSync] Attempting to push ${eventBuffer.length} events...`)

  try {
    const response = await fetch(`${DASHBOARD_URL}/api/sync`, {
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
      // Clear synced events from buffer
      await chrome.storage.local.set({ eventBuffer: [] })
      console.log(`[BiroSync] Successfully synced ${result.ingested} events ✓`)
      return { ok: true, synced: result.ingested }
    } else {
      console.error('[BiroSync] Sync Failed:', result.error)
      return { ok: false, error: result.error }
    }
  } catch (err) {
    console.error('[BiroSync] Network Error:', err)
    return { ok: false, error: 'OFFLINE_OR_GATEWAY_DOWN' }
  }
}

// ─── Alarms ──────────────────────────────────────────────────
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'biroSync') syncEvents()
})

console.log('[Biro-Analysis] Persistence worker initialized ✓')
