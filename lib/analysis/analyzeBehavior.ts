/**
 * BIRO-ANALYSIS: BEHAVIORAL ANALYSIS ENGINE
 * Calculates all 50+ metrics from raw event/timing data
 */

import type {
  Question, EventLog, BehavioralAnalysis,
  DarrQuestion, PanicWindow, BlunderRecord, TimeSink,
  ChapterStat, HoverEvent, ClickEvent
} from '@/lib/supabase/client'

// ══════════════════════════════════════════
// A. PERFORMANCE CORE
// ══════════════════════════════════════════

export function calcRawScore(
  questions: Question[],
  marking: { correct: number; incorrect: number; unattempted: number }
): { raw: number; positive: number; negative: number } {
  let positive = 0, negative = 0
  for (const q of questions) {
    if (q.is_correct) positive += marking.correct
    else if (q.is_attempted && !q.is_correct) negative += Math.abs(marking.incorrect)
  }
  return { raw: positive - negative, positive, negative }
}

export function calcPercentileProjection(netScore: number, examCategory: string): number {
  // JEE Mains 2024 approximate percentile mapping
  const JEE_MAINS_MAP: [number, number][] = [
    [300, 99.99], [280, 99.9], [260, 99.5], [240, 99], [220, 98],
    [200, 96], [180, 93], [160, 88], [140, 80], [120, 70],
    [100, 55], [80, 40], [60, 25], [40, 12], [20, 5], [0, 1],
  ]
  const NEET_MAP: [number, number][] = [
    [720, 99.99], [680, 99.5], [650, 99], [620, 98], [590, 96],
    [560, 93], [530, 88], [500, 80], [450, 65], [400, 45],
    [350, 28], [300, 15], [250, 7], [200, 3],
  ]
  const map = examCategory === 'NEET' ? NEET_MAP : JEE_MAINS_MAP
  for (let i = 0; i < map.length - 1; i++) {
    const [s1, p1] = map[i]
    const [s2, p2] = map[i + 1]
    if (netScore >= s2) {
      const ratio = (netScore - s2) / (s1 - s2)
      return Math.min(99.99, Math.round((p2 + ratio * (p1 - p2)) * 100) / 100)
    }
  }
  return 1
}

export function calcSubjectAccuracy(questions: Question[]): Record<string, number> {
  const map: Record<string, { correct: number; attempted: number }> = {}
  for (const q of questions) {
    if (!map[q.subject]) map[q.subject] = { correct: 0, attempted: 0 }
    if (q.is_attempted) {
      map[q.subject].attempted++
      if (q.is_correct) map[q.subject].correct++
    }
  }
  const result: Record<string, number> = {}
  for (const [sub, val] of Object.entries(map)) {
    result[sub] = val.attempted > 0 ? Math.round((val.correct / val.attempted) * 100) : 0
  }
  return result
}

export function calcChapterAccuracy(questions: Question[]): Record<string, ChapterStat> {
  const map: Record<string, { correct: number; attempted: number }> = {}
  for (const q of questions) {
    if (!q.chapter) continue
    const key = `${q.subject}::${q.chapter}`
    if (!map[key]) map[key] = { correct: 0, attempted: 0 }
    if (q.is_attempted) {
      map[key].attempted++
      if (q.is_correct) map[key].correct++
    }
  }
  const result: Record<string, ChapterStat> = {}
  for (const [key, val] of Object.entries(map)) {
    result[key] = {
      attempted: val.attempted,
      correct: val.correct,
      accuracy: val.attempted > 0 ? Math.round((val.correct / val.attempted) * 100) : 0,
    }
  }
  return result
}

export function calcDifficultyHitRate(questions: Question[]): Record<string, number> {
  const map: Record<string, { correct: number; attempted: number }> = {}
  for (const q of questions) {
    if (!q.difficulty) continue
    if (!map[q.difficulty]) map[q.difficulty] = { correct: 0, attempted: 0 }
    if (q.is_attempted) {
      map[q.difficulty].attempted++
      if (q.is_correct) map[q.difficulty].correct++
    }
  }
  const result: Record<string, number> = {}
  for (const [diff, val] of Object.entries(map)) {
    result[diff] = val.attempted > 0 ? Math.round((val.correct / val.attempted) * 100) : 0
  }
  return result
}

// ══════════════════════════════════════════
// B. CHRONOMETRICS
// ══════════════════════════════════════════

export function calcTimeSinks(questions: Question[], topN = 5): TimeSink[] {
  return [...questions]
    .filter(q => q.time_spent_seconds > 0)
    .sort((a, b) => b.time_spent_seconds - a.time_spent_seconds)
    .slice(0, topN)
    .map(q => ({
      questionNo: q.question_number,
      timeSpentSec: q.time_spent_seconds,
      subject: q.subject,
      topic: q.topic || q.chapter || 'Unknown',
    }))
}

export function calcAvgTimePerSubject(questions: Question[]): Record<string, number> {
  const map: Record<string, { total: number; count: number }> = {}
  for (const q of questions) {
    if (!map[q.subject]) map[q.subject] = { total: 0, count: 0 }
    if (q.time_spent_seconds > 0) {
      map[q.subject].total += q.time_spent_seconds
      map[q.subject].count++
    }
  }
  const result: Record<string, number> = {}
  for (const [sub, val] of Object.entries(map)) {
    result[sub] = val.count > 0 ? Math.round(val.total / val.count) : 0
  }
  return result
}

export function calcTimeByOutcome(questions: Question[]): {
  avgTimeCorrect: number; avgTimeIncorrect: number; avgTimeSkipped: number
} {
  const correct = questions.filter(q => q.is_correct)
  const incorrect = questions.filter(q => q.is_attempted && !q.is_correct)
  const skipped = questions.filter(q => !q.is_attempted)
  const avg = (qs: Question[]) =>
    qs.length > 0 ? Math.round(qs.reduce((s, q) => s + q.time_spent_seconds, 0) / qs.length) : 0
  return { avgTimeCorrect: avg(correct), avgTimeIncorrect: avg(incorrect), avgTimeSkipped: avg(skipped) }
}

/** Fast incorrect = answered in < 20 seconds but wrong → impulsive clicking */
export function detectFastIncorrect(questions: Question[], thresholdSec = 20): Question[] {
  return questions.filter(q => q.is_attempted && !q.is_correct && q.time_spent_seconds <= thresholdSec)
}

/** Fatigue: compare first-third vs last-third accuracy */
export function calcFatigueMapping(questions: Question[]): {
  firstHourAccuracy: number; lastHourAccuracy: number; fatigueIndex: number
} {
  const third = Math.floor(questions.length / 3)
  const first = questions.slice(0, third).filter(q => q.is_attempted)
  const last = questions.slice(-third).filter(q => q.is_attempted)
  const acc = (qs: Question[]) =>
    qs.length > 0 ? Math.round((qs.filter(q => q.is_correct).length / qs.length) * 100) : 0
  const firstAcc = acc(first)
  const lastAcc = acc(last)
  return {
    firstHourAccuracy: firstAcc,
    lastHourAccuracy: lastAcc,
    fatigueIndex: Math.max(0, firstAcc - lastAcc), // drop in accuracy
  }
}

// ══════════════════════════════════════════
// C. BEHAVIORAL & "DARR" ANALYSIS
// ══════════════════════════════════════════

/**
 * DARR INDEX: Hesitation score 0-100
 * Calculated from hover events: if user hovered multiple options for >3000ms total before clicking
 */
export function calcDarrIndex(questions: Question[]): {
  darrIndex: number; darrQuestions: DarrQuestion[]
} {
  const darrThresholdMs = 3000
  const darrQuestions: DarrQuestion[] = []

  for (const q of questions) {
    if (!q.hover_events || q.hover_events.length === 0) continue

    // Group by option
    const optionHoverTime: Record<string, number> = {}
    for (const h of q.hover_events as HoverEvent[]) {
      optionHoverTime[h.optionHovered] = (optionHoverTime[h.optionHovered] || 0) + h.durationMs
    }

    const optionsHovered = Object.keys(optionHoverTime)
    const totalHoverMs = Object.values(optionHoverTime).reduce((s, v) => s + v, 0)
    const multipleOptionsHovered = optionsHovered.length >= 2

    if (multipleOptionsHovered && totalHoverMs >= darrThresholdMs) {
      darrQuestions.push({
        questionNo: q.question_number,
        hoverDurationMs: totalHoverMs,
        optionsHovered,
      })
    }
  }

  // Score: (darrQuestions / totalAttempted) * 100, capped at 100
  const attempted = questions.filter(q => q.is_attempted).length
  const darrIndex = attempted > 0
    ? Math.min(100, Math.round((darrQuestions.length / attempted) * 100))
    : 0

  return { darrIndex, darrQuestions }
}

/**
 * PANIC SPIKES: Detect rapid guessing / erratic behavior in final 15 minutes
 * Uses event logs with timestamps
 */
export function detectPanicSpikes(
  events: EventLog[],
  testDurationMin: number
): { panicDetected: boolean; panicWindows: PanicWindow[] } {
  const panicWindows: PanicWindow[] = []
  const WINDOW_SIZE_MIN = 5
  const PANIC_CLICK_THRESHOLD = 8 // clicks per 5 min window
  const PANIC_SWITCH_THRESHOLD = 3 // subject switches per window

  if (events.length === 0) return { panicDetected: false, panicWindows: [] }

  const testStart = new Date(events[0].client_timestamp).getTime()

  // Analyze 5-minute windows in final 30 minutes
  const analyzeFrom = Math.max(0, testDurationMin - 30)
  for (let startMin = analyzeFrom; startMin < testDurationMin; startMin += WINDOW_SIZE_MIN) {
    const windowStart = testStart + startMin * 60 * 1000
    const windowEnd = windowStart + WINDOW_SIZE_MIN * 60 * 1000

    const windowEvents = events.filter(e => {
      const t = new Date(e.client_timestamp).getTime()
      return t >= windowStart && t < windowEnd
    })

    const clickCount = windowEvents.filter(e =>
      e.event_type === 'ANSWER_SELECT' || e.event_type === 'ANSWER_CHANGE'
    ).length

    const switchCount = windowEvents.filter(e => e.event_type === 'SUBJECT_SWITCH').length

    if (clickCount >= PANIC_CLICK_THRESHOLD || switchCount >= PANIC_SWITCH_THRESHOLD) {
      panicWindows.push({
        startMin,
        endMin: startMin + WINDOW_SIZE_MIN,
        clickRate: clickCount,
        subjectSwitches: switchCount,
      })
    }
  }

  return { panicDetected: panicWindows.length > 0, panicWindows }
}

/**
 * CONFIDENCE MISMATCH: Fast answer but wrong (answered in <15s but incorrect)
 */
export function detectConfidenceMismatch(questions: Question[], thresholdSec = 15): number {
  return questions.filter(q =>
    q.is_attempted && !q.is_correct && q.time_spent_seconds <= thresholdSec
  ).length
}

/**
 * OVERTHINKING DETECTION: Spent >3x average time on a question but still skipped
 */
export function detectOverthinking(questions: Question[]): Question[] {
  const avgTime = questions.length > 0
    ? questions.reduce((s, q) => s + q.time_spent_seconds, 0) / questions.length
    : 60
  return questions.filter(q => !q.is_attempted && q.time_spent_seconds >= avgTime * 3)
}

/**
 * TILT FACTOR: Accuracy drop immediately after a streak of wrong answers (≥3 consecutive)
 */
export function calcTiltFactor(questions: Question[]): {
  tiltFactor: number; tiltTriggerQuestions: number[]
} {
  const sorted = [...questions].sort((a, b) => a.question_number - b.question_number)
  let tiltTriggerQuestions: number[] = []
  let totalPostTiltQuestions = 0
  let totalPostTiltCorrect = 0
  let i = 0

  while (i < sorted.length) {
    // Detect wrong streak of 3+
    let streakLen = 0
    const streakStart = i
    while (i < sorted.length && sorted[i].is_attempted && !sorted[i].is_correct) {
      streakLen++
      i++
    }
    if (streakLen >= 3) {
      tiltTriggerQuestions.push(sorted[streakStart].question_number)
      // Analyze next 5 questions
      const postTilt = sorted.slice(i, i + 5)
      totalPostTiltQuestions += postTilt.length
      totalPostTiltCorrect += postTilt.filter(q => q.is_correct).length
    } else {
      i++
    }
  }

  // Overall accuracy vs post-tilt accuracy
  const overallAcc = questions.filter(q => q.is_attempted).length > 0
    ? questions.filter(q => q.is_correct).length / questions.filter(q => q.is_attempted).length
    : 0
  const postTiltAcc = totalPostTiltQuestions > 0
    ? totalPostTiltCorrect / totalPostTiltQuestions
    : overallAcc

  const tiltFactor = Math.max(0, Math.round((overallAcc - postTiltAcc) * 100))

  return { tiltFactor, tiltTriggerQuestions }
}

/**
 * OPTION CHANGE ANALYSIS: Did second-guessing help or hurt?
 */
export function analyzeOptionChanges(questions: Question[]): {
  changeRate: number; helped: number; hurt: number; neutral: number
} {
  const changers = questions.filter(q => q.option_changes > 0 && q.is_attempted)
  let helped = 0, hurt = 0, neutral = 0

  for (const q of changers) {
    const initialWrong = q.initial_answer !== q.correct_answer
    const finalCorrect = q.is_correct
    if (initialWrong && finalCorrect) helped++
    else if (!initialWrong && !finalCorrect) hurt++
    else neutral++
  }

  return {
    changeRate: questions.length > 0 ? Math.round((changers.length / questions.length) * 100) : 0,
    helped, hurt, neutral,
  }
}

/**
 * MARK-FOR-REVIEW ROI: % of marked questions that were answered correctly
 */
export function calcReviewROI(questions: Question[]): number {
  const reviewed = questions.filter(q => q.is_marked_review && q.is_attempted)
  if (reviewed.length === 0) return 0
  return Math.round((reviewed.filter(q => q.is_correct).length / reviewed.length) * 100)
}

// ══════════════════════════════════════════
// D. BLUNDER DETECTION ENGINE
// ══════════════════════════════════════════

/**
 * BLUNDER: Wrong answer on EASY question
 * Compared against peer benchmark (easy questions should have 80%+ accuracy among toppers)
 */
export function detectBlunders(questions: Question[]): BlunderRecord[] {
  return questions
    .filter(q => q.difficulty === 'EASY' && q.is_attempted && !q.is_correct)
    .map(q => ({
      questionNo: q.question_number,
      subject: q.subject,
      chapter: q.chapter || 'Unknown',
      difficulty: 'EASY',
      reason: q.error_type || 'UNKNOWN',
    }))
}

/** Marks lost purely due to calculation errors */
export function calcMarksLostCalculation(
  questions: Question[],
  markPerQuestion: number
): number {
  return questions.filter(q => q.error_type === 'CALCULATION' && !q.is_correct).length * markPerQuestion
}

// ══════════════════════════════════════════
// E. PATTERN ENGINE
// ══════════════════════════════════════════

/** Weak concept clusters: chapters with <40% accuracy */
export function findWeakConcepts(chapterAccuracy: Record<string, ChapterStat>): string[] {
  return Object.entries(chapterAccuracy)
    .filter(([, stat]) => stat.attempted >= 2 && stat.accuracy < 40)
    .sort(([, a], [, b]) => a.accuracy - b.accuracy)
    .map(([chapter]) => chapter)
}

/** Blind spots: chapters that were skipped without even attempting a question */
export function findBlindSpots(questions: Question[]): string[] {
  const chapterMap: Record<string, { attempted: number; total: number }> = {}
  for (const q of questions) {
    const key = q.chapter || 'Unknown'
    if (!chapterMap[key]) chapterMap[key] = { attempted: 0, total: 0 }
    chapterMap[key].total++
    if (q.is_attempted) chapterMap[key].attempted++
  }
  return Object.entries(chapterMap)
    .filter(([, v]) => v.total >= 2 && v.attempted === 0)
    .map(([chapter]) => chapter)
}

/** Build subject switch map from events */
export function buildSubjectSwitchMap(events: EventLog[]): Record<string, number> {
  const switches: Record<string, number> = {}
  for (const e of events) {
    if (e.event_type === 'SUBJECT_SWITCH' && e.subject) {
      switches[e.subject] = (switches[e.subject] || 0) + 1
    }
  }
  return switches
}

// ══════════════════════════════════════════
// F. AI & PREDICTION ENGINE
// ══════════════════════════════════════════

/**
 * SCORE POTENTIAL SIMULATOR:
 * "If you fixed your calculation errors + blunders, your score would be X"
 */
export function calcScorePotential(
  netScore: number,
  calcErrors: number,
  blunders: number,
  markPerQuestion: number,
  negPerQuestion: number
): number {
  // Each error recovery = gain correct mark + recover negative
  const recoverPerQuestion = markPerQuestion + Math.abs(negPerQuestion)
  const potential = netScore + (calcErrors + blunders) * recoverPerQuestion
  return Math.round(potential)
}

/**
 * TARGET GAP ANALYSIS
 */
export function calcTargetGap(currentScore: number, targetScore: number): {
  gap: number; questionsToImprove: number; percentImproved: number
} {
  const gap = targetScore - currentScore
  const questionsToImprove = gap > 0 ? Math.ceil(gap / 4) : 0 // assuming 4 marks per correct
  const percentImproved = currentScore > 0 ? Math.round((gap / currentScore) * 100) : 100
  return { gap, questionsToImprove, percentImproved }
}

/**
 * Generate AI action plan data structure (AI fills content, this generates structure)
 */
export function buildActionPlanPrompt(analysis: Partial<BehavioralAnalysis>, profile: {
  exam_target: string; target_score?: number; target_college?: string
}): string {
  return `You are a JEE/NEET expert coach. Analyze this student's test performance and generate a 3-day recovery action plan.

EXAM: ${profile.exam_target}
TARGET SCORE: ${profile.target_score || 'Not set'}
CURRENT SCORE: ${analysis.raw_score || 0}
PROJECTED PERCENTILE: ${analysis.percentile_projected || 0}

WEAK AREAS:
- Subject Accuracy: ${JSON.stringify(analysis.subject_accuracy)}
- Blunders: ${analysis.blunder_count} on easy questions
- Darr Index (hesitation): ${analysis.darr_index}/100
- Tilt Factor: ${analysis.tilt_factor}%
- Panic Spikes: ${analysis.panic_spike_detected ? 'YES' : 'NO'}
- Confidence Mismatch: ${analysis.confidence_mismatch_count} questions
- Score Potential: ${analysis.score_potential} (if errors fixed)

Generate a JSON response with this structure:
{
  "summary": "2-line coaching observation",
  "days": [
    {
      "day": 1,
      "theme": "Theme title",
      "tasks": ["specific task 1", "task 2", "task 3"],
      "focusChapters": ["chapter1", "chapter2"],
      "problems": 30,
      "mentalTip": "One mindset tip"
    }
  ],
  "topPriorities": ["priority 1", "priority 2", "priority 3"]
}`
}

// ══════════════════════════════════════════
// MASTER ANALYZER
// ══════════════════════════════════════════

export function analyzeBehavior(
  questions: Question[],
  events: EventLog[],
  marking: { correct: number; incorrect: number; unattempted: number },
  examCategory: string,
  testDurationMin: number
): Omit<BehavioralAnalysis, 'id' | 'test_id' | 'user_id' | 'analyzed_at' | 'created_at'> {
  // A. Performance
  const { raw, positive, negative } = calcRawScore(questions, marking)
  const percentile = calcPercentileProjection(raw, examCategory)
  const subjectAccuracy = calcSubjectAccuracy(questions)
  const chapterAccuracy = calcChapterAccuracy(questions)
  const difficultyHitRate = calcDifficultyHitRate(questions)
  const attemptRate = Math.round((questions.filter(q => q.is_attempted).length / questions.length) * 100)

  // B. Chronometrics
  const avgTimeAll = questions.length > 0
    ? Math.round(questions.reduce((s, q) => s + q.time_spent_seconds, 0) / questions.length) : 0
  const avgTimePerSubject = calcAvgTimePerSubject(questions)
  const { avgTimeCorrect, avgTimeIncorrect, avgTimeSkipped } = calcTimeByOutcome(questions)
  const timeSinks = calcTimeSinks(questions)
  const fastIncorrect = detectFastIncorrect(questions)
  const { firstHourAccuracy, lastHourAccuracy, fatigueIndex } = calcFatigueMapping(questions)

  // C. Behavioral
  const { darrIndex, darrQuestions } = calcDarrIndex(questions)
  const { panicDetected, panicWindows } = detectPanicSpikes(events, testDurationMin)
  const confidenceMismatch = detectConfidenceMismatch(questions)
  const overthinking = detectOverthinking(questions)
  const { tiltFactor, tiltTriggerQuestions } = calcTiltFactor(questions)
  const { changeRate, helped, hurt } = analyzeOptionChanges(questions)
  const reviewRoi = calcReviewROI(questions)

  // D. Blunders
  const blunders = detectBlunders(questions)
  const marksLostCalc = calcMarksLostCalculation(questions, marking.correct)

  // E. Patterns
  const weakConcepts = findWeakConcepts(chapterAccuracy)
  const blindSpots = findBlindSpots(questions)
  const subjectSwitchMap = buildSubjectSwitchMap(events)

  // F. Prediction
  const scorePotential = calcScorePotential(
    raw, questions.filter(q => q.error_type === 'CALCULATION').length,
    blunders.length, marking.correct, marking.incorrect
  )

  return {
    raw_score: raw,
    percentile_projected: percentile,
    subject_accuracy: subjectAccuracy,
    chapter_accuracy: chapterAccuracy,
    darr_index: darrIndex,
    darr_questions: darrQuestions,
    panic_spike_detected: panicDetected,
    panic_windows: panicWindows,
    tilt_factor: tiltFactor,
    tilt_trigger_questions: tiltTriggerQuestions,
    confidence_mismatch_count: confidenceMismatch,
    overthinking_count: overthinking.length,
    blunder_count: blunders.length,
    blunders,
    marks_lost_calculation: marksLostCalc,
    option_change_rate: changeRate,
    option_change_helped: helped,
    option_change_hurt: hurt,
    review_roi: reviewRoi,
    time_sinks: timeSinks,
    avg_time_per_question_sec: avgTimeAll,
    avg_time_per_subject: avgTimePerSubject,
    time_correct_sec: avgTimeCorrect,
    time_incorrect_sec: avgTimeIncorrect,
    time_skipped_sec: avgTimeSkipped,
    fast_incorrect_count: fastIncorrect.length,
    first_hour_accuracy: firstHourAccuracy,
    last_hour_accuracy: lastHourAccuracy,
    fatigue_index: fatigueIndex,
    difficulty_hit_rate: difficultyHitRate,
    attempt_rate: attemptRate,
    weak_concept_clusters: weakConcepts,
    blind_spot_chapters: blindSpots,
    subject_switch_map: subjectSwitchMap,
    score_potential: scorePotential,
    positive_marks: positive,
    negative_marks: negative,
    analysis_version: '1.0',
  }
}
