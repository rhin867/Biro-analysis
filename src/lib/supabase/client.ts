import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
})

export type Database = {
  public: {
    Tables: {
      profiles: { Row: Profile; Insert: Partial<Profile>; Update: Partial<Profile> }
      tests: { Row: Test; Insert: Partial<Test>; Update: Partial<Test> }
      questions: { Row: Question; Insert: Partial<Question>; Update: Partial<Question> }
      event_logs: { Row: EventLog; Insert: Partial<EventLog>; Update: Partial<EventLog> }
      behavioral_analysis: { Row: BehavioralAnalysis; Insert: Partial<BehavioralAnalysis>; Update: Partial<BehavioralAnalysis> }
      mistake_book: { Row: MistakeBook; Insert: Partial<MistakeBook>; Update: Partial<MistakeBook> }
    }
  }
}

export interface Profile {
  id: string
  full_name: string
  email: string
  avatar_url?: string
  exam_target: 'JEE_MAINS' | 'JEE_ADVANCED' | 'NEET' | 'BITSAT' | 'OTHER'
  target_college?: string
  target_rank?: number
  target_score?: number
  current_class?: '11' | '12' | 'DROPPER'
  coaching_institute?: string
  ai_provider?: string
  ai_api_key?: string
  ai_model?: string
  onboarding_complete: boolean
  created_at: string
}

export interface Test {
  id: string
  user_id: string
  name: string
  test_type: 'FULL_LENGTH' | 'SUBJECT' | 'CHAPTER' | 'MOCK' | 'PREVIOUS_YEAR' | 'CUSTOM'
  exam_category: 'JEE_MAINS' | 'JEE_ADVANCED' | 'NEET' | 'BITSAT' | 'OTHER'
  source_platform?: string
  test_date: string
  start_time?: string
  end_time?: string
  duration_minutes: number
  total_questions: number
  total_marks: number
  marking_scheme: { correct: number; incorrect: number; unattempted: number }
  raw_score?: number
  net_marks?: number
  attempted_count: number
  correct_count: number
  incorrect_count: number
  unattempted_count: number
  percentile_estimate?: number
  status: 'PENDING' | 'RECORDING' | 'COMPLETED' | 'ANALYZED' | 'ARCHIVED'
  analysis_complete: boolean
  subjects?: SubjectSplit[]
  created_at: string
  updated_at: string
}

export interface SubjectSplit {
  subject: string
  questions: number
  marks: number
  attempted: number
  correct: number
  incorrect: number
  score: number
}

export interface Question {
  id: string
  test_id: string
  user_id: string
  question_number: number
  subject: 'PHYSICS' | 'CHEMISTRY' | 'MATHEMATICS' | 'BIOLOGY' | 'BOTANY' | 'ZOOLOGY' | 'GENERAL'
  chapter?: string
  topic?: string
  micro_topic?: string
  difficulty?: 'EASY' | 'MEDIUM' | 'HARD'
  question_type: 'MCQ' | 'MSQ' | 'NUMERICAL' | 'ASSERTION_REASON' | 'MATRIX'
  question_text?: string
  option_a?: string; option_b?: string; option_c?: string; option_d?: string
  correct_answer?: string
  user_answer?: string
  is_correct?: boolean
  is_attempted: boolean
  is_marked_review: boolean
  marks_awarded: number
  time_spent_seconds: number
  hover_events: HoverEvent[]
  click_events: ClickEvent[]
  option_changes: number
  initial_answer?: string
  final_answer?: string
  error_type?: 'CONCEPTUAL' | 'CALCULATION' | 'MISREAD' | 'FORMULA_FORGOTTEN' | 'SILLY' | 'BLIND_GUESS' | 'OVERTHOUGHT' | 'NONE'
  learning_point?: string
  is_blunder: boolean
  is_in_mistake_book: boolean
  created_at: string
}

export interface HoverEvent {
  optionHovered: string
  durationMs: number
  timestamp: number
}

export interface ClickEvent {
  x: number; y: number
  target: string
  timestamp: number
  optionClicked?: string
}

export interface EventLog {
  id: string
  test_id: string
  user_id: string
  event_type: string
  question_number?: number
  subject?: string
  payload: Record<string, unknown>
  client_timestamp: string
  session_elapsed_ms?: number
}

export interface BehavioralAnalysis {
  id: string
  test_id: string
  user_id: string
  raw_score?: number
  percentile_projected?: number
  subject_accuracy?: Record<string, number>
  chapter_accuracy?: Record<string, ChapterStat>
  darr_index?: number
  darr_questions?: DarrQuestion[]
  panic_spike_detected?: boolean
  panic_windows?: PanicWindow[]
  tilt_factor?: number
  tilt_trigger_questions?: number[]
  confidence_mismatch_count?: number
  overthinking_count?: number
  blunder_count?: number
  blunders?: BlunderRecord[]
  time_sinks?: TimeSink[]
  marks_lost_calculation?: number
  option_change_rate?: number
  option_change_helped?: number
  option_change_hurt?: number
  review_roi?: number
  avg_time_per_question_sec?: number
  avg_time_per_subject?: Record<string, number>
  time_correct_sec?: number
  time_incorrect_sec?: number
  time_skipped_sec?: number
  fast_incorrect_count?: number
  first_hour_accuracy?: number
  last_hour_accuracy?: number
  fatigue_index?: number
  difficulty_hit_rate?: Record<string, number>
  attempt_rate?: number
  weak_concept_clusters?: string[]
  blind_spot_chapters?: string[]
  subject_switch_map?: Record<string, number>
  positive_marks?: number
  negative_marks?: number
  analysis_version?: string
  score_potential?: number
  ai_action_plan?: ActionPlan
  analyzed_at: string
}

export interface ChapterStat { attempted: number; correct: number; accuracy: number }
export interface DarrQuestion { questionNo: number; hoverDurationMs: number; optionsHovered: string[] }
export interface PanicWindow { startMin: number; endMin: number; clickRate: number; subjectSwitches: number }
export interface BlunderRecord { questionNo: number; subject: string; chapter: string; difficulty: string; reason: string }
export interface TimeSink { questionNo: number; timeSpentSec: number; subject: string; topic: string }
export interface ActionPlan { days: ActionDay[] }
export interface ActionDay { day: number; tasks: string[]; focusChapters: string[]; problems: number }

export interface MistakeBook {
  id: string
  user_id: string
  question_id: string
  test_id: string
  subject: string
  chapter?: string
  topic?: string
  difficulty?: string
  error_type?: string
  learning_point?: string
  question_text?: string
  correct_answer?: string
  user_answer?: string
  tags: string[]
  is_resolved: boolean
  next_review_date: string
  review_count: number
  created_at: string
}
