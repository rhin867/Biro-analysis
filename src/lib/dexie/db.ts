import Dexie, { Table } from 'dexie'

// ─── Local IndexedDB schema for zero-lag recording ───

export interface LocalEventLog {
  id?: number
  sessionId: string
  testId: string
  eventType: string
  questionNumber?: number
  subject?: string
  payload: Record<string, unknown>
  clientTimestamp: number
  sessionElapsedMs: number
  synced: boolean
}

export interface LocalScreenshot {
  id?: number
  sessionId: string
  testId: string
  questionNumber?: number
  dataUrl: string // base64 PNG
  timestamp: number
  captureMethod: 'L1_WIDGET' | 'L2_DOM' | 'L3_MIRROR' | 'L4_COORD'
  synced: boolean
}

export interface LocalSession {
  id?: number
  sessionId: string
  testId: string
  userId?: string
  trackingLevel: 'L1' | 'L2' | 'L3' | 'L4'
  startedAt: number
  endedAt?: number
  isActive: boolean
  totalEvents: number
  totalScreenshots: number
  deviceInfo: Record<string, string>
}

export interface LocalHoverLog {
  id?: number
  sessionId: string
  testId: string
  questionNumber: number
  optionHovered: string
  startTimestamp: number
  endTimestamp: number
  durationMs: number
  mouseX: number
  mouseY: number
}

export interface LocalClickLog {
  id?: number
  sessionId: string
  testId: string
  questionNumber: number
  x: number
  y: number
  target: string
  optionClicked?: string
  previousAnswer?: string
  newAnswer?: string
  timestamp: number
  sessionElapsedMs: number
}

export interface LocalQuestionTiming {
  id?: number
  sessionId: string
  testId: string
  questionNumber: number
  subject?: string
  enteredAt: number
  exitedAt?: number
  totalTimeMs: number
  visitCount: number
  isBookmarked: boolean
  finalAnswer?: string
}

class BiroDB extends Dexie {
  eventLogs!: Table<LocalEventLog>
  screenshots!: Table<LocalScreenshot>
  sessions!: Table<LocalSession>
  hoverLogs!: Table<LocalHoverLog>
  clickLogs!: Table<LocalClickLog>
  questionTimings!: Table<LocalQuestionTiming>

  constructor() {
    super('BiroAnalysisDB')
    this.version(1).stores({
      eventLogs: '++id, sessionId, testId, eventType, synced, clientTimestamp',
      screenshots: '++id, sessionId, testId, synced, timestamp',
      sessions: '++id, sessionId, testId, isActive',
      hoverLogs: '++id, sessionId, testId, questionNumber',
      clickLogs: '++id, sessionId, testId, questionNumber, timestamp',
      questionTimings: '++id, sessionId, testId, questionNumber',
    })
  }
}

export const db = new BiroDB()

// ─── Helper functions for zero-lag logging ───

export async function logEvent(data: Omit<LocalEventLog, 'id' | 'synced'>) {
  return db.eventLogs.add({ ...data, synced: false })
}

export async function logHover(data: Omit<LocalHoverLog, 'id'>) {
  return db.hoverLogs.add(data)
}

export async function logClick(data: Omit<LocalClickLog, 'id'>) {
  return db.clickLogs.add(data)
}

export async function logScreenshot(data: Omit<LocalScreenshot, 'id' | 'synced'>) {
  return db.screenshots.add({ ...data, synced: false })
}

export async function updateQuestionTiming(
  sessionId: string,
  testId: string,
  questionNumber: number,
  updates: Partial<LocalQuestionTiming>
) {
  const existing = await db.questionTimings
    .where({ sessionId, testId, questionNumber })
    .first()

  if (existing?.id) {
    return db.questionTimings.update(existing.id, updates)
  } else {
    return db.questionTimings.add({
      sessionId, testId, questionNumber,
      enteredAt: Date.now(),
      exitedAt: undefined,
      totalTimeMs: 0,
      visitCount: 1,
      isBookmarked: false,
      subject: undefined,
      finalAnswer: undefined,
      ...updates,
    })
  }
}

export async function getUnsyncedEvents(sessionId: string): Promise<LocalEventLog[]> {
  return db.eventLogs.where({ sessionId, synced: false }).toArray()
}

export async function markEventsSynced(ids: number[]) {
  return db.eventLogs.bulkUpdate(ids.map(id => ({ key: id, changes: { synced: true } })))
}

export async function getSessionSummary(sessionId: string) {
  const [events, screenshots, timings, hovers, clicks] = await Promise.all([
    db.eventLogs.where('sessionId').equals(sessionId).count(),
    db.screenshots.where('sessionId').equals(sessionId).count(),
    db.questionTimings.where('sessionId').equals(sessionId).toArray(),
    db.hoverLogs.where('sessionId').equals(sessionId).count(),
    db.clickLogs.where('sessionId').equals(sessionId).count(),
  ])
  return { events, screenshots, timings, hovers, clicks }
}

export async function clearSession(sessionId: string) {
  await Promise.all([
    db.eventLogs.where('sessionId').equals(sessionId).delete(),
    db.screenshots.where('sessionId').equals(sessionId).delete(),
    db.hoverLogs.where('sessionId').equals(sessionId).delete(),
    db.clickLogs.where('sessionId').equals(sessionId).delete(),
    db.questionTimings.where('sessionId').equals(sessionId).delete(),
  ])
}
