/**
 * BIRO-ANALYSIS CHROME EXTENSION
 * Background Service Worker (Manifest V3)
 * Handles: session management, Dexie sync, alarms, notifications
 */

// ─── State ───────────────────────────────────────────────
let activeSession = null

// ─── Message Router ──────────────────────────────────────
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.type) {
    case 'START_SESSION':
      handleStartSession(message.payload, sendResponse)
      return true

    case 'STOP_SESSION':
      handleStopSession(message.payload, sendResponse)
      return true

    case 'GET_SESSION':
      sendResponse({ session: activeSession })
      return true

    case 'LOG_BATCH':
      handleLogBatch(message.payload, sendResponse)
      return true

    case 'OPEN_DASHBOARD':
      chrome.tabs.create({ url: message.payload.url || 'http://localhost:3000' })
      sendResponse({ ok: true })
      return true

    case 'INJECT_WIDGET':
      injectWidget(sender.tab?.id, sendResponse)
      return true

    default:
      sendResponse({ error: 'Unknown message type' })
  }
})

// ─── Session Management ───────────────────────────────────
async function handleStartSession(payload, sendResponse) {
  const sessionId = `biro_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
  activeSession = {
    sessionId,
    testId: payload.testId,
    userId: payload.userId,
    startedAt: Date.now(),
    trackingLevel: 'L1',
    isActive: true,
    eventCount: 0,
    questionTimings: {},
  }

  // Persist in chrome.storage
  await chrome.storage.local.set({ activeSession })

  // Set alarm for periodic sync every 30s
  chrome.alarms.create('syncEvents', { periodInMinutes: 0.5 })

  // Notify popup
  chrome.runtime.sendMessage({ type: 'SESSION_STARTED', session: activeSession }).catch(() => {})

  sendResponse({ ok: true, sessionId })
}

async function handleStopSession(payload, sendResponse) {
  if (activeSession) {
    activeSession.isActive = false
    activeSession.endedAt = Date.now()
    await chrome.storage.local.set({ activeSession, lastSession: activeSession })
  }

  // Clear sync alarm
  chrome.alarms.clear('syncEvents')

  // Send final data to dashboard
  chrome.runtime.sendMessage({
    type: 'SESSION_STOPPED',
    session: activeSession,
    testId: payload?.testId,
  }).catch(() => {})

  sendResponse({ ok: true, session: activeSession })
  activeSession = null
}

// ─── Event Batch Logging ──────────────────────────────────
async function handleLogBatch(payload, sendResponse) {
  if (!activeSession) {
    sendResponse({ ok: false, error: 'No active session' })
    return
  }

  activeSession.eventCount += payload.events?.length || 0

  // Store batch in chrome.storage (ring buffer, max 2000 events)
  const stored = await chrome.storage.local.get('eventBuffer')
  const buffer = stored.eventBuffer || []
  const newBuffer = [...buffer, ...(payload.events || [])].slice(-2000)
  await chrome.storage.local.set({ eventBuffer: newBuffer })

  sendResponse({ ok: true, buffered: newBuffer.length })
}

// ─── Widget Injection ─────────────────────────────────────
async function injectWidget(tabId, sendResponse) {
  if (!tabId) {
    sendResponse({ ok: false, error: 'No tab ID' })
    return
  }
  try {
    await chrome.scripting.executeScript({
      target: { tabId },
      func: injectWidgetDOM,
    })
    sendResponse({ ok: true })
  } catch (err) {
    sendResponse({ ok: false, error: err.message })
  }
}

function injectWidgetDOM() {
  // This runs in the page context
  if (document.getElementById('biro-widget-root')) return

  const widget = document.createElement('div')
  widget.id = 'biro-widget-root'
  widget.innerHTML = `
    <div id="biro-widget" style="
      position: fixed; z-index: 2147483647;
      bottom: 20px; right: 20px;
      width: 220px;
      background: rgba(15, 23, 42, 0.95);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(37, 99, 235, 0.4);
      border-radius: 16px;
      padding: 12px;
      font-family: 'Inter', system-ui, sans-serif;
      user-select: none;
      cursor: move;
      box-shadow: 0 0 40px rgba(37, 99, 235, 0.2);
    ">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px;">
        <div style="width:8px;height:8px;border-radius:50%;background:#10B981;animation:biro-pulse 2s infinite;"></div>
        <span style="font-size:12px;font-weight:700;color:white;">BIRO TRACKING</span>
        <span id="biro-timer" style="margin-left:auto;font-size:11px;color:rgba(255,255,255,0.5);font-variant-numeric:tabular-nums;">00:00</span>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:10px;">
        <div style="background:rgba(37,99,235,0.1);border-radius:8px;padding:6px;text-align:center;">
          <div id="biro-q-count" style="font-size:16px;font-weight:800;color:#60A5FA;">0</div>
          <div style="font-size:9px;color:rgba(255,255,255,0.4);">Questions</div>
        </div>
        <div style="background:rgba(16,185,129,0.1);border-radius:8px;padding:6px;text-align:center;">
          <div id="biro-event-count" style="font-size:16px;font-weight:800;color:#34D399;">0</div>
          <div style="font-size:9px;color:rgba(255,255,255,0.4);">Events</div>
        </div>
      </div>
      <div id="biro-current-q" style="font-size:10px;color:rgba(255,255,255,0.3);text-align:center;margin-bottom:8px;">Detecting question...</div>
      <button id="biro-stop-btn" style="
        width:100%;padding:6px;border-radius:8px;border:1px solid rgba(239,68,68,0.4);
        background:rgba(239,68,68,0.1);color:#F87171;font-size:11px;font-weight:600;
        cursor:pointer;transition:all 0.2s;
      ">⏹ Stop & Analyze</button>
    </div>
    <style>
      @keyframes biro-pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(1.3)} }
    </style>
  `
  document.body.appendChild(widget)

  // Make draggable
  const w = document.getElementById('biro-widget')
  let isDragging = false, offsetX = 0, offsetY = 0
  w.addEventListener('mousedown', e => {
    if (e.target.id === 'biro-stop-btn') return
    isDragging = true
    offsetX = e.clientX - w.getBoundingClientRect().left
    offsetY = e.clientY - w.getBoundingClientRect().top
  })
  document.addEventListener('mousemove', e => {
    if (!isDragging) return
    w.style.left = `${e.clientX - offsetX}px`
    w.style.top = `${e.clientY - offsetY}px`
    w.style.right = 'auto'; w.style.bottom = 'auto'
  })
  document.addEventListener('mouseup', () => { isDragging = false })

  // Timer
  const startTime = Date.now()
  setInterval(() => {
    const elapsed = Math.floor((Date.now() - startTime) / 1000)
    const m = Math.floor(elapsed / 60).toString().padStart(2, '0')
    const s = (elapsed % 60).toString().padStart(2, '0')
    document.getElementById('biro-timer').textContent = `${m}:${s}`
  }, 1000)

  // Stop button
  document.getElementById('biro-stop-btn').addEventListener('click', () => {
    chrome.runtime.sendMessage({ type: 'STOP_SESSION', payload: {} })
    widget.remove()
  })
}

// ─── Alarms ───────────────────────────────────────────────
chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === 'syncEvents') {
    // Sync buffered events to dashboard/Supabase
    const stored = await chrome.storage.local.get('eventBuffer')
    if (stored.eventBuffer?.length > 0) {
      chrome.runtime.sendMessage({
        type: 'SYNC_EVENTS',
        events: stored.eventBuffer,
      }).catch(() => {})
    }
  }
})

// ─── Install handler ──────────────────────────────────────
chrome.runtime.onInstalled.addListener(async (details) => {
  if (details.reason === 'install') {
    await chrome.storage.local.set({ biroInstalled: true, installedAt: Date.now() })
    chrome.tabs.create({ url: 'http://localhost:3000/onboarding' })
  }
})

console.log('[Biro-Analysis] Background service worker loaded ✓')
