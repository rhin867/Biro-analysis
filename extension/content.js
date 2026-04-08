/**
 * BIRO-ANALYSIS CONTENT SCRIPT v2.5
 * 4-Layer Behavioral Extraction System
 */

;(function () {
  'use strict'
  if (location.protocol === 'chrome-extension:') return

  const state = {
    isRecording: false,
    currentQuestion: null,
    totalEvents: 0,
    eventBuffer: [],
    sessionStartTime: null,
  }

  // --- Utility: Sync with Widget ---
  function updateWidget() {
    const qEl = document.getElementById('biro-q-count')
    const eEl = document.getElementById('biro-event-count')
    const cEl = document.getElementById('biro-current-q')
    if (qEl) qEl.textContent = state.currentQuestion || '?'
    if (eEl) eEl.textContent = state.totalEvents
    if (cEl) cEl.textContent = state.currentQuestion ? `Q${state.currentQuestion} Active` : 'Sensing Matrix...'
  }

  // --- Logic: Question Detection ---
  function detectQuestion() {
    // Dynamic detection regex for common test platforms
    const match = location.href.match(/[?&]q(?:uestion)?=(\d+)/i) || 
                  document.body.innerText.match(/(?:Question|Q\.?)\s*#?\s*(\d+)/i)
    
    if (match && parseInt(match[1]) !== state.currentQuestion) {
      state.currentQuestion = parseInt(match[1])
      logEvent('QUESTION_DETECTED', { q: state.currentQuestion })
      updateWidget()
    }
  }

  // --- Logic: Event Capture ---
  function logEvent(type, payload = {}) {
    if (!state.isRecording && type !== 'SESSION_START') return
    
    const event = {
      type,
      payload,
      timestamp: Date.now(),
      url: location.href
    }
    
    state.eventBuffer.push(event)
    state.totalEvents++
    updateWidget()

    if (state.eventBuffer.length >= 10) flushBuffer()
  }

  function flushBuffer() {
    if (state.eventBuffer.length === 0) return
    const batch = [...state.eventBuffer]
    state.eventBuffer = []
    chrome.runtime.sendMessage({ type: 'LOG_BATCH', events: batch })
  }

  // --- Layer 1: Observer ---
  function initTracking() {
    document.addEventListener('click', (e) => {
      logEvent('CLICK', { 
        x: e.clientX, y: e.clientY, 
        text: e.target.innerText?.slice(0, 50),
        tag: e.target.tagName
      })
      detectQuestion()
    }, true)

    // Periodic detection
    setInterval(detectQuestion, 2000)
    setInterval(flushBuffer, 10000)
  }

  // --- Messaging ---
  chrome.runtime.onMessage.addListener((msg) => {
    if (msg.type === 'BEGIN_RECORDING') {
      state.isRecording = true
      state.sessionStartTime = Date.now()
      initTracking()
      logEvent('SESSION_START')
      console.log('[Biro] Neural Recording Active ✓')
    }
    if (msg.type === 'STOP_RECORDING') {
      state.isRecording = false
      flushBuffer()
    }
  })

  console.log('[Biro] Content Script Ready.')
})()
