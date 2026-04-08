/**
 * BIRO-ANALYSIS Extension Popup Script
 */

const startBtn = document.getElementById('startBtn')
const stopBtn = document.getElementById('stopBtn')
const pauseBtn = document.getElementById('pauseBtn')
const openDashboardBtn = document.getElementById('openDashboardBtn')
const idleView = document.getElementById('idleView')
const recordingView = document.getElementById('recordingView')
const statusDot = document.getElementById('statusDot')
const testNameInput = document.getElementById('testNameInput')
const recordingTestName = document.getElementById('recordingTestName')
const elapsedTime = document.getElementById('elapsedTime')
const eventCount = document.getElementById('eventCount')
const qCount = document.getElementById('qCount')

let timerInterval = null
let sessionStartTime = null
let isPaused = false

// ─── Load state on open ───────────────────────────────────
async function loadState() {
  const { activeSession } = await chrome.storage.local.get('activeSession')
  if (activeSession?.isActive) {
    showRecordingState(activeSession)
  }
}

// ─── Start Recording ──────────────────────────────────────
startBtn.addEventListener('click', async () => {
  const testName = testNameInput.value.trim() || `Test ${new Date().toLocaleTimeString()}`
  const testId = `test_${Date.now()}`

  const response = await chrome.runtime.sendMessage({
    type: 'START_SESSION',
    payload: { testId, testName, userId: 'local' }
  })

  if (response.ok) {
    // Inject widget into active tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
    if (tab?.id) {
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => chrome.runtime.sendMessage({ type: 'BEGIN_RECORDING', sessionId: 'biro', testId: 'test' })
      }).catch(() => {})

      // Send message to content script
      chrome.tabs.sendMessage(tab.id, {
        type: 'BEGIN_RECORDING',
        sessionId: response.sessionId,
        testId
      }).catch(() => {})
    }

    showRecordingState({ startedAt: Date.now(), testName })
  }
})

// ─── Stop Recording ───────────────────────────────────────
stopBtn.addEventListener('click', async () => {
  clearInterval(timerInterval)

  await chrome.runtime.sendMessage({ type: 'STOP_SESSION', payload: {} })

  // Tell content script to stop
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
  if (tab?.id) {
    chrome.tabs.sendMessage(tab.id, { type: 'STOP_RECORDING' }).catch(() => {})
  }

  showIdleState()

  // Open analysis dashboard
  chrome.tabs.create({ url: 'http://localhost:3000/analysis?source=extension' })
})

// ─── Pause ────────────────────────────────────────────────
pauseBtn.addEventListener('click', () => {
  isPaused = !isPaused
  pauseBtn.textContent = isPaused ? '▶ Resume' : '⏸ Pause'
  pauseBtn.style.borderColor = isPaused ? 'rgba(16,185,129,0.4)' : ''
  pauseBtn.style.color = isPaused ? '#34D399' : ''
})

// ─── Open Dashboard ───────────────────────────────────────
openDashboardBtn.addEventListener('click', () => {
  chrome.tabs.create({ url: 'http://localhost:3000' })
})

// ─── UI Helpers ───────────────────────────────────────────
function showRecordingState(session) {
  idleView.style.display = 'none'
  recordingView.style.display = 'block'
  statusDot.className = 'status-dot recording'
  recordingTestName.textContent = session.testName || 'Active Test'
  sessionStartTime = session.startedAt || Date.now()

  // Start timer
  timerInterval = setInterval(updateTimer, 1000)
  updateTimer()

  // Poll stats from background
  setInterval(updateStats, 2000)
}

function showIdleState() {
  idleView.style.display = 'block'
  recordingView.style.display = 'none'
  statusDot.className = 'status-dot idle'
  clearInterval(timerInterval)
}

function updateTimer() {
  const elapsed = Math.floor((Date.now() - sessionStartTime) / 1000)
  const m = Math.floor(elapsed / 60).toString().padStart(2, '0')
  const s = (elapsed % 60).toString().padStart(2, '0')
  if (elapsedTime) elapsedTime.textContent = `${m}:${s}`
}

async function updateStats() {
  const { eventBuffer, activeSession } = await chrome.storage.local.get(['eventBuffer', 'activeSession'])
  if (eventCount) eventCount.textContent = activeSession?.eventCount || eventBuffer?.length || 0
}

// Init
loadState()
