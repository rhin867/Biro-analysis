/**
 * BIRO-ANALYSIS CONTENT SCRIPT
 * 4-Layer Security Bypass Tracking System
 *
 * L1: Observer (Widget overlay) - Direct DOM event recording
 * L2: Ghost (Accessibility API) - Silent DOM text + button click reading
 * L3: Mirror (Virtual display buffer) - Canvas frame capture
 * L4: Reconstructor (Coordinate logic) - Pure click+time logging
 */

;(function () {
  'use strict'

  // ─── Guard: don't inject in extension pages ─────────────
  if (location.protocol === 'chrome-extension:') return

  // ─── State ────────────────────────────────────────────────
  const state = {
    sessionId: null,
    testId: null,
    isRecording: false,
    trackingLevel: null,
    currentQuestion: null,
    questionEnteredAt: null,
    eventBuffer: [],
    hoverTarget: null,
    hoverStartTime: null,
    totalEvents: 0,
    totalQuestions: 0,
    sessionStartTime: null,
  }

  // ─── Layer Detection ──────────────────────────────────────
  function detectTrackingLevel() {
    // L1: Can we add overlays? (Check for CSP restrictions)
    try {
      const testEl = document.createElement('div')
      testEl.style.cssText = 'position:fixed;z-index:2147483647;pointer-events:none;'
      document.body.appendChild(testEl)
      document.body.removeChild(testEl)
      return 'L1'
    } catch { }

    // L2: Can we read the DOM?
    try {
      const buttons = document.querySelectorAll('button, input[type="radio"], [role="option"]')
      if (buttons.length > 0) return 'L2'
    } catch { }

    // L3: Canvas available?
    try {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      if (ctx) return 'L3'
    } catch { }

    // L4: Fallback - pure coordinates
    return 'L4'
  }

  // ─── Event Logger ─────────────────────────────────────────
  function logEvent(type, payload = {}) {
    if (!state.isRecording) return
    const event = {
      type,
      questionNumber: state.currentQuestion,
      payload,
      timestamp: Date.now(),
      sessionElapsedMs: Date.now() - state.sessionStartTime,
    }
    state.eventBuffer.push(event)
    state.totalEvents++

    // Update widget counter
    const el = document.getElementById('biro-event-count')
    if (el) el.textContent = state.totalEvents

    // Batch flush every 20 events
    if (state.eventBuffer.length >= 20) flushBuffer()
  }

  async function flushBuffer() {
    if (state.eventBuffer.length === 0) return
    const batch = [...state.eventBuffer]
    state.eventBuffer = []
    try {
      chrome.runtime.sendMessage({ type: 'LOG_BATCH', payload: { events: batch } })
    } catch { }
  }

  // ─── L1: OBSERVER ────────────────────────────────────────
  function attachL1Observers() {
    // Click tracking
    document.addEventListener('click', handleClick, { capture: true, passive: true })

    // Mouseover tracking (hover between options)
    document.addEventListener('mouseover', handleMouseOver, { capture: true, passive: true })
    document.addEventListener('mouseout', handleMouseOut, { capture: true, passive: true })

    // Keyboard (for numerical inputs)
    document.addEventListener('keydown', handleKeydown, { capture: true, passive: true })

    // Page visibility
    document.addEventListener('visibilitychange', () => {
      logEvent(document.hidden ? 'WINDOW_BLUR' : 'WINDOW_FOCUS', {})
    })

    console.log('[Biro] L1 Observer attached ✓')
  }

  function handleClick(e) {
    const target = e.target
    const payload = {
      x: e.clientX, y: e.clientY,
      tagName: target.tagName,
      text: target.textContent?.slice(0, 100),
      className: target.className?.toString?.()?.slice(0, 80),
      id: target.id?.slice(0, 40),
    }

    // Detect option selection
    const optionText = extractOptionFromClick(target)
    if (optionText) {
      payload.optionSelected = optionText
      logEvent('ANSWER_SELECT', payload)
    } else {
      logEvent('OPTION_CLICK', payload)
    }

    // Detect question navigation
    detectQuestionChange()
  }

  function handleMouseOver(e) {
    const optionText = extractOptionFromClick(e.target)
    if (optionText) {
      state.hoverTarget = optionText
      state.hoverStartTime = Date.now()
    }
  }

  function handleMouseOut(e) {
    if (state.hoverTarget && state.hoverStartTime) {
      const durationMs = Date.now() - state.hoverStartTime
      if (durationMs > 200) { // ignore micro-hovers
        logEvent('OPTION_HOVER', {
          option: state.hoverTarget,
          durationMs,
          x: e.clientX, y: e.clientY,
        })
      }
      state.hoverTarget = null
      state.hoverStartTime = null
    }
  }

  function handleKeydown(e) {
    if (['1', '2', '3', '4', 'a', 'b', 'c', 'd'].includes(e.key.toLowerCase())) {
      logEvent('KEYBOARD_ANSWER', { key: e.key })
    }
  }

  // ─── L2: GHOST (DOM / Accessibility) ─────────────────────
  function attachL2Ghost() {
    // Read visible option text using MutationObserver
    const observer = new MutationObserver((mutations) => {
      for (const m of mutations) {
        if (m.type === 'attributes' && isOptionElement(m.target)) {
          const selected = m.target.getAttribute('aria-selected') === 'true' ||
            m.target.getAttribute('aria-checked') === 'true' ||
            m.target.classList.contains('selected') ||
            m.target.classList.contains('active')
          if (selected) {
            logEvent('ANSWER_SELECT_DOM', {
              text: m.target.textContent?.slice(0, 200),
              ariaLabel: m.target.getAttribute('aria-label'),
            })
          }
        }
      }
    })

    observer.observe(document.body, {
      attributes: true,
      subtree: true,
      attributeFilter: ['aria-selected', 'aria-checked', 'class', 'data-selected'],
    })

    console.log('[Biro] L2 Ghost attached ✓')
  }

  // ─── L3: MIRROR (Canvas frame capture) ───────────────────
  function attachL3Mirror() {
    // Capture periodic DOM snapshots using html2canvas-like approach
    let frameCount = 0
    const captureInterval = setInterval(() => {
      if (!state.isRecording) { clearInterval(captureInterval); return }
      frameCount++
      // Capture visible text as a "semantic screenshot"
      const visibleText = extractVisibleText()
      logEvent('FRAME_CAPTURE', { frameCount, text: visibleText.slice(0, 500) })
    }, 5000) // every 5 seconds

    console.log('[Biro] L3 Mirror attached ✓')
  }

  // ─── L4: RECONSTRUCTOR (Pure coordinates) ─────────────────
  function attachL4Reconstructor() {
    document.addEventListener('click', (e) => {
      if (!state.isRecording) return
      logEvent('COORDINATE_CLICK', {
        x: e.clientX, y: e.clientY,
        vw: window.innerWidth, vh: window.innerHeight,
        time: Date.now() - state.sessionStartTime,
        // Normalized coordinates (0-1) for PDF mapping
        xNorm: e.clientX / window.innerWidth,
        yNorm: e.clientY / window.innerHeight,
      })
    }, { capture: true, passive: true })

    console.log('[Biro] L4 Reconstructor attached ✓')
  }

  // ─── Question Detection ───────────────────────────────────
  function detectQuestionChange() {
    // Strategy 1: URL hash change
    const urlQ = extractQuestionFromURL()
    // Strategy 2: DOM heading/number
    const domQ = extractQuestionFromDOM()
    const detected = urlQ || domQ

    if (detected && detected !== state.currentQuestion) {
      const prevQ = state.currentQuestion
      // Log exit of previous question
      if (prevQ && state.questionEnteredAt) {
        const timeSpentMs = Date.now() - state.questionEnteredAt
        logEvent('QUESTION_EXIT', { questionNumber: prevQ, timeSpentMs })
      }

      state.currentQuestion = detected
      state.questionEnteredAt = Date.now()
      state.totalQuestions = Math.max(state.totalQuestions, detected)
      logEvent('QUESTION_ENTER', { questionNumber: detected })

      // Update widget
      const el = document.getElementById('biro-current-q')
      if (el) el.textContent = `Q${detected} detected`
      const qEl = document.getElementById('biro-q-count')
      if (qEl) qEl.textContent = state.totalQuestions
    }
  }

  function extractQuestionFromURL() {
    const match = location.search.match(/[?&]q(?:uestion)?[_-]?(?:no|num|id|number)?=(\d+)/i) ||
      location.hash.match(/#.*?(\d+)/)
    return match ? parseInt(match[1]) : null
  }

  function extractQuestionFromDOM() {
    // Common patterns across test platforms
    const SELECTORS = [
      '.question-number', '.q-number', '#question-no', '[data-question-number]',
      '.question-count', '.questionNumber', 'h2', '.qno', '[class*="question"][class*="number"]'
    ]
    for (const sel of SELECTORS) {
      const el = document.querySelector(sel)
      if (el) {
        const match = el.textContent?.match(/(\d+)/)
        if (match) return parseInt(match[1])
      }
    }
    return null
  }

  function extractOptionFromClick(el) {
    if (!el) return null
    // Check for radio inputs, checkboxes, option labels
    const isOption =
      el.tagName === 'INPUT' && ['radio', 'checkbox'].includes(el.type) ||
      el.closest('[class*="option"]') ||
      el.closest('[class*="answer"]') ||
      el.closest('[role="radio"]') ||
      el.closest('[role="option"]') ||
      el.closest('.option') ||
      el.closest('.answer-option')

    if (isOption) {
      return el.value || el.textContent?.trim()?.slice(0, 50) || el.getAttribute('data-option')
    }
    return null
  }

  function isOptionElement(el) {
    return el.matches?.('[role="radio"],[role="option"],[class*="option"],[class*="answer"]') || false
  }

  function extractVisibleText() {
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT)
    const texts = []
    let node
    while ((node = walker.nextNode())) {
      const text = node.textContent?.trim()
      if (text && text.length > 5) texts.push(text)
    }
    return texts.join(' ')
  }

  // ─── Subject Switch Detection ─────────────────────────────
  let lastSubject = null
  function detectSubjectSwitch() {
    // Look for subject tabs/buttons
    const SUBJECT_INDICATORS = ['physics', 'chemistry', 'mathematics', 'maths', 'biology', 'botany', 'zoology']
    const clicked = document.getElementById('biro-last-click-text') || ''
    const lower = clicked.toString().toLowerCase()
    const matched = SUBJECT_INDICATORS.find(s => lower.includes(s))
    if (matched && matched !== lastSubject) {
      logEvent('SUBJECT_SWITCH', { from: lastSubject, to: matched.toUpperCase() })
      lastSubject = matched
    }
  }

  // ─── Init ─────────────────────────────────────────────────
  function init() {
    const level = detectTrackingLevel()
    state.trackingLevel = level

    // Listen for start command from popup/background
    chrome.runtime.onMessage.addListener((msg) => {
      if (msg.type === 'BEGIN_RECORDING') {
        state.sessionId = msg.sessionId
        state.testId = msg.testId
        state.isRecording = true
        state.sessionStartTime = Date.now()

        switch (level) {
          case 'L1': attachL1Observers(); break
          case 'L2': attachL1Observers(); attachL2Ghost(); break
          case 'L3': attachL1Observers(); attachL2Ghost(); attachL3Mirror(); break
          case 'L4': attachL4Reconstructor(); break
        }

        // Watch URL/DOM changes
        const urlObserver = new MutationObserver(detectQuestionChange)
        urlObserver.observe(document.documentElement, { childList: true, subtree: false })

        // Also watch on navigation
        window.addEventListener('popstate', detectQuestionChange)
        window.addEventListener('hashchange', detectQuestionChange)

        // Periodic flush
        setInterval(flushBuffer, 10000)

        logEvent('SESSION_START', { level, url: location.href })
        console.log(`[Biro] Recording started — Level: ${level}`)
      }

      if (msg.type === 'STOP_RECORDING') {
        state.isRecording = false
        flushBuffer()
        logEvent('SESSION_STOP', { totalEvents: state.totalEvents })
        console.log('[Biro] Recording stopped')
      }

      if (msg.type === 'GET_CURRENT_STATE') {
        return {
          currentQuestion: state.currentQuestion,
          totalEvents: state.totalEvents,
          isRecording: state.isRecording,
          trackingLevel: level,
        }
      }
    })

    // Auto-detect question on page load
    setTimeout(detectQuestionChange, 2000)
    console.log(`[Biro] Content script ready — Tracking Level: ${level}`)
  }

  // ─── Run ──────────────────────────────────────────────────
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init)
  } else {
    init()
  }
})()
