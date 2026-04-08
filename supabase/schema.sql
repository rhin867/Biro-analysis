-- ==========================================
-- BIRO-ANALYSIS: SUPABASE POSTGRESQL SCHEMA
-- Complete schema for 50+ feature analysis
-- ==========================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==========================================
-- 1. USERS & PROFILES
-- ==========================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  avatar_url TEXT,
  exam_target TEXT NOT NULL DEFAULT 'JEE' CHECK (exam_target IN ('JEE_MAINS','JEE_ADVANCED','NEET','BITSAT','OTHER')),
  target_college TEXT,
  target_rank INTEGER,
  target_score INTEGER,
  current_class TEXT CHECK (current_class IN ('11','12','DROPPER')),
  coaching_institute TEXT,
  city TEXT,
  state TEXT,
  ai_provider TEXT DEFAULT 'openai' CHECK (ai_provider IN ('openai','anthropic','gemini','custom')),
  ai_api_key TEXT, -- stored encrypted
  ai_model TEXT DEFAULT 'gpt-4o-mini',
  onboarding_complete BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- 2. TESTS
-- ==========================================
CREATE TABLE IF NOT EXISTS tests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  test_type TEXT NOT NULL CHECK (test_type IN ('FULL_LENGTH','SUBJECT','CHAPTER','MOCK','PREVIOUS_YEAR','CUSTOM')),
  exam_category TEXT NOT NULL CHECK (exam_category IN ('JEE_MAINS','JEE_ADVANCED','NEET','BITSAT','OTHER')),
  source_platform TEXT, -- e.g., "Allen DLP", "Aakash iTutor", "Motion"
  test_date DATE NOT NULL,
  start_time TIMESTAMPTZ,
  end_time TIMESTAMPTZ,
  duration_minutes INTEGER NOT NULL DEFAULT 180,
  total_questions INTEGER NOT NULL,
  total_marks REAL NOT NULL,
  marking_scheme JSONB NOT NULL DEFAULT '{"correct": 4, "incorrect": -1, "unattempted": 0}',
  raw_score REAL,
  positive_marks REAL,
  negative_marks REAL,
  net_marks REAL,
  attempted_count INTEGER DEFAULT 0,
  correct_count INTEGER DEFAULT 0,
  incorrect_count INTEGER DEFAULT 0,
  unattempted_count INTEGER DEFAULT 0,
  percentile_estimate REAL,
  rank_estimate INTEGER,
  status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING','RECORDING','COMPLETED','ANALYZED','ARCHIVED')),
  pdf_url TEXT, -- question paper PDF
  screenshot_folder TEXT, -- folder path of cached screenshots
  analysis_complete BOOLEAN DEFAULT FALSE,
  subjects JSONB, -- array of subjects with marks split
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================  
-- 3. QUESTIONS (per test)
-- ==========================================
CREATE TABLE IF NOT EXISTS questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  test_id UUID NOT NULL REFERENCES tests(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  question_number INTEGER NOT NULL,
  subject TEXT NOT NULL CHECK (subject IN ('PHYSICS','CHEMISTRY','MATHEMATICS','BIOLOGY','BOTANY','ZOOLOGY','GENERAL')),
  chapter TEXT,
  topic TEXT,
  micro_topic TEXT,
  difficulty TEXT CHECK (difficulty IN ('EASY','MEDIUM','HARD')),
  question_type TEXT DEFAULT 'MCQ' CHECK (question_type IN ('MCQ','MSQ','NUMERICAL','ASSERTION_REASON','MATRIX')),
  question_text TEXT,
  option_a TEXT,
  option_b TEXT,
  option_c TEXT,
  option_d TEXT,
  correct_answer TEXT, -- A/B/C/D or numeric
  user_answer TEXT,    -- what user selected
  is_correct BOOLEAN,
  is_attempted BOOLEAN DEFAULT FALSE,
  is_marked_review BOOLEAN DEFAULT FALSE,
  marks_awarded REAL DEFAULT 0,
  marks_possible REAL DEFAULT 4,
  -- Chronometrics
  time_spent_seconds INTEGER DEFAULT 0,
  first_seen_at TIMESTAMPTZ,
  last_seen_at TIMESTAMPTZ,
  answered_at TIMESTAMPTZ,
  visit_count INTEGER DEFAULT 0,
  -- Behavioral raw data
  hover_events JSONB DEFAULT '[]', -- [{optionHovered, durationMs, timestamp}]
  click_events JSONB DEFAULT '[]', -- [{x, y, target, timestamp, optionClicked}]
  option_changes INTEGER DEFAULT 0, -- number of times answer was changed
  initial_answer TEXT,              -- first answer selected
  final_answer TEXT,                -- last answer (same as user_answer)
  -- OCR extracted data
  ocr_confidence REAL,
  coordinate_data JSONB, -- raw {x1,y1,x2,y2} bounding boxes on PDF
  -- Error analysis
  error_type TEXT CHECK (error_type IN ('CONCEPTUAL','CALCULATION','MISREAD','FORMULA_FORGOTTEN','SILLY','BLIND_GUESS','OVERTHOUGHT','NONE')),
  learning_point TEXT,  -- user's manual note in Interrogation Room
  is_blunder BOOLEAN DEFAULT FALSE,  -- wrong on easy question
  blunder_reason TEXT,
  is_in_mistake_book BOOLEAN DEFAULT FALSE,
  spaced_rep_next_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- 4. RAW EVENT LOG (Dexie → Supabase sync)
-- ==========================================
CREATE TABLE IF NOT EXISTS event_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  test_id UUID NOT NULL REFERENCES tests(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN (
    'QUESTION_ENTER','QUESTION_EXIT','OPTION_HOVER','OPTION_CLICK',
    'ANSWER_SELECT','ANSWER_CHANGE','MARK_REVIEW','UNMARK_REVIEW',
    'SUBMIT_TEST','PAUSE','RESUME','SUBJECT_SWITCH','SCROLL',
    'WINDOW_BLUR','WINDOW_FOCUS','PANIC_CLICK','IDLE_START','IDLE_END'
  )),
  question_number INTEGER,
  subject TEXT,
  payload JSONB NOT NULL DEFAULT '{}',
  client_timestamp TIMESTAMPTZ NOT NULL,
  session_elapsed_ms BIGINT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- 5. BEHAVIORAL ANALYSIS RESULTS
-- ==========================================
CREATE TABLE IF NOT EXISTS behavioral_analysis (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  test_id UUID NOT NULL REFERENCES tests(id) ON DELETE CASCADE UNIQUE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- A. Performance Core
  raw_score REAL,
  percentile_projected REAL,
  subject_accuracy JSONB,   -- {physics: 65, chemistry: 72, maths: 58}
  chapter_accuracy JSONB,   -- {chapter_name: {attempted, correct, accuracy}}
  positive_negative_ratio REAL,
  attempt_rate REAL,
  difficulty_hit_rate JSONB, -- {easy: 85, medium: 60, hard: 30}

  -- B. Chronometrics
  avg_time_per_question_sec REAL,
  avg_time_per_subject JSONB, -- {physics: 120, chemistry: 95, maths: 180}
  time_correct_sec REAL,
  time_incorrect_sec REAL,
  time_skipped_sec REAL,
  time_sinks JSONB,          -- [{questionNo, timeSpent, subject, topic}]
  fast_incorrect_count INTEGER DEFAULT 0,
  ideal_time_comparison JSONB,
  first_hour_accuracy REAL,
  last_hour_accuracy REAL,
  fatigue_index REAL,
  time_to_first_answer_sec REAL,

  -- C. Behavioral "Darr" Analysis
  darr_index REAL,           -- 0-100 hesitation score
  darr_questions JSONB,      -- [{questionNo, hoverDurationMs, optionsHovered}]
  option_change_rate REAL,
  option_change_helped INTEGER DEFAULT 0,
  option_change_hurt INTEGER DEFAULT 0,
  panic_spike_detected BOOLEAN DEFAULT FALSE,
  panic_windows JSONB,       -- [{startMin, endMin, clickRate, subjectSwitches}]
  confidence_mismatch_count INTEGER DEFAULT 0,
  overthinking_count INTEGER DEFAULT 0,
  tilt_factor REAL,          -- accuracy drop after wrong-answer streaks
  tilt_trigger_questions JSONB,
  review_roi REAL,           -- % of "marked for review" that turned correct
  question_journey JSONB,    -- [{qNo, action, timestamp, timeSpent}]

  -- D. Error & Blunder Engine
  blunder_count INTEGER DEFAULT 0,
  blunders JSONB,
  conceptual_errors INTEGER DEFAULT 0,
  calculation_errors INTEGER DEFAULT 0,
  formula_forgotten INTEGER DEFAULT 0,
  misread_count INTEGER DEFAULT 0,
  blind_guess_count INTEGER DEFAULT 0,
  marks_lost_calculation REAL DEFAULT 0,

  -- E. Pattern & Topic Engine
  weak_concept_clusters JSONB,
  repeating_mistakes JSONB,
  blind_spot_chapters JSONB,
  subject_switch_map JSONB,
  syllabus_heatmap JSONB,

  -- F. AI Insights
  target_gap_analysis JSONB,
  score_potential REAL,
  ai_action_plan JSONB,
  topper_comparison JSONB,

  -- Metadata
  analyzed_at TIMESTAMPTZ DEFAULT NOW(),
  analysis_version TEXT DEFAULT '1.0',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- 6. MISTAKE BOOK
-- ==========================================
CREATE TABLE IF NOT EXISTS mistake_book (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  test_id UUID NOT NULL REFERENCES tests(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  chapter TEXT,
  topic TEXT,
  difficulty TEXT,
  error_type TEXT,
  learning_point TEXT,
  question_text TEXT,
  correct_answer TEXT,
  user_answer TEXT,
  tags TEXT[] DEFAULT '{}',
  is_resolved BOOLEAN DEFAULT FALSE,
  resolved_at TIMESTAMPTZ,
  -- Spaced repetition
  review_count INTEGER DEFAULT 0,
  next_review_date DATE DEFAULT CURRENT_DATE + INTERVAL '1 day',
  ease_factor REAL DEFAULT 2.5, -- SM-2 algorithm
  interval_days INTEGER DEFAULT 1,
  -- PDF export flag
  include_in_pdf BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- 7. SPACED REPETITION QUEUE
-- ==========================================
CREATE TABLE IF NOT EXISTS spaced_repetition (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  question_id UUID REFERENCES questions(id) ON DELETE CASCADE,
  formula_text TEXT,
  concept_text TEXT,
  subject TEXT NOT NULL,
  item_type TEXT NOT NULL CHECK (item_type IN ('QUESTION','FORMULA','CONCEPT')),
  due_date DATE NOT NULL DEFAULT CURRENT_DATE,
  repetition_count INTEGER DEFAULT 0,
  ease_factor REAL DEFAULT 2.5,
  interval_days INTEGER DEFAULT 1,
  last_reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- 8. TEST SESSIONS (for multi-device tracking)
-- ==========================================
CREATE TABLE IF NOT EXISTS test_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  test_id UUID NOT NULL REFERENCES tests(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  extension_session_id TEXT UNIQUE, -- ID from Chrome extension
  tracking_level TEXT DEFAULT 'L1' CHECK (tracking_level IN ('L1','L2','L3','L4')),
  tracking_active BOOLEAN DEFAULT FALSE,
  screenshot_count INTEGER DEFAULT 0,
  event_count INTEGER DEFAULT 0,
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  device_info JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- 9. PEER BENCHMARK DATA
-- ==========================================
CREATE TABLE IF NOT EXISTS peer_benchmarks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  exam_category TEXT NOT NULL,
  test_type TEXT NOT NULL,
  subject TEXT,
  chapter TEXT,
  difficulty TEXT,
  avg_accuracy REAL,
  avg_time_sec REAL,
  topper_accuracy REAL,
  topper_time_sec REAL,
  sample_size INTEGER,
  data_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- 10. AI CHAT / ACTION PLANS
-- ==========================================
CREATE TABLE IF NOT EXISTS ai_interactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  test_id UUID REFERENCES tests(id) ON DELETE SET NULL,
  interaction_type TEXT CHECK (interaction_type IN ('ACTION_PLAN','SCORE_SIMULATION','QUESTION_EXPLAIN','CUSTOM_CHAT')),
  prompt TEXT NOT NULL,
  response TEXT,
  model_used TEXT,
  tokens_used INTEGER,
  cost_usd REAL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- INDEXES for performance
-- ==========================================
CREATE INDEX IF NOT EXISTS idx_questions_test_id ON questions(test_id);
CREATE INDEX IF NOT EXISTS idx_questions_user_id ON questions(user_id);
CREATE INDEX IF NOT EXISTS idx_questions_subject ON questions(subject);
CREATE INDEX IF NOT EXISTS idx_questions_chapter ON questions(chapter);
CREATE INDEX IF NOT EXISTS idx_questions_is_correct ON questions(is_correct);
CREATE INDEX IF NOT EXISTS idx_questions_difficulty ON questions(difficulty);
CREATE INDEX IF NOT EXISTS idx_questions_error_type ON questions(error_type);
CREATE INDEX IF NOT EXISTS idx_event_logs_test_id ON event_logs(test_id);
CREATE INDEX IF NOT EXISTS idx_event_logs_event_type ON event_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_event_logs_client_ts ON event_logs(client_timestamp);
CREATE INDEX IF NOT EXISTS idx_tests_user_id ON tests(user_id);
CREATE INDEX IF NOT EXISTS idx_tests_date ON tests(test_date);
CREATE INDEX IF NOT EXISTS idx_mistake_book_user_id ON mistake_book(user_id);
CREATE INDEX IF NOT EXISTS idx_mistake_book_next_review ON mistake_book(next_review_date);
CREATE INDEX IF NOT EXISTS idx_spaced_rep_due_date ON spaced_repetition(due_date);
CREATE INDEX IF NOT EXISTS idx_spaced_rep_user_id ON spaced_repetition(user_id);

-- ==========================================
-- ROW LEVEL SECURITY
-- ==========================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE behavioral_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE mistake_book ENABLE ROW LEVEL SECURITY;
ALTER TABLE spaced_repetition ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_interactions ENABLE ROW LEVEL SECURITY;

-- Policies: users can only access their own data
CREATE POLICY "Users own their profile" ON profiles FOR ALL USING (auth.uid() = id);
CREATE POLICY "Users own their tests" ON tests FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users own their questions" ON questions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users own their events" ON event_logs FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users own their analysis" ON behavioral_analysis FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users own their mistake book" ON mistake_book FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users own their SR queue" ON spaced_repetition FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users own their sessions" ON test_sessions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users own their AI chats" ON ai_interactions FOR ALL USING (auth.uid() = user_id);

-- Peer benchmarks are public read
CREATE POLICY "Benchmarks are public" ON peer_benchmarks FOR SELECT USING (true);

-- ==========================================
-- FUNCTIONS & TRIGGERS
-- ==========================================

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tests_updated_at BEFORE UPDATE ON tests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_mistake_book_updated_at BEFORE UPDATE ON mistake_book
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, full_name, email)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', 'Aspirant'), NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Aggregate test scores from questions
CREATE OR REPLACE FUNCTION calculate_test_summary(p_test_id UUID)
RETURNS VOID AS $$
DECLARE
  v_marking JSONB;
  v_correct REAL;
  v_incorrect REAL;
BEGIN
  SELECT marking_scheme INTO v_marking FROM tests WHERE id = p_test_id;
  v_correct := (v_marking->>'correct')::REAL;
  v_incorrect := (v_marking->>'incorrect')::REAL;

  UPDATE tests SET
    correct_count = (SELECT COUNT(*) FROM questions WHERE test_id = p_test_id AND is_correct = true),
    incorrect_count = (SELECT COUNT(*) FROM questions WHERE test_id = p_test_id AND is_correct = false AND is_attempted = true),
    unattempted_count = (SELECT COUNT(*) FROM questions WHERE test_id = p_test_id AND is_attempted = false),
    attempted_count = (SELECT COUNT(*) FROM questions WHERE test_id = p_test_id AND is_attempted = true),
    positive_marks = (SELECT COUNT(*) FROM questions WHERE test_id = p_test_id AND is_correct = true) * v_correct,
    negative_marks = ABS((SELECT COUNT(*) FROM questions WHERE test_id = p_test_id AND is_correct = false AND is_attempted = true) * v_incorrect),
    net_marks = ((SELECT COUNT(*) FROM questions WHERE test_id = p_test_id AND is_correct = true) * v_correct) + 
                ((SELECT COUNT(*) FROM questions WHERE test_id = p_test_id AND is_correct = false AND is_attempted = true) * v_incorrect),
    updated_at = NOW()
  WHERE id = p_test_id;
END;
$$ LANGUAGE plpgsql;
