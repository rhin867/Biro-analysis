'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Brain, Target, Flame, ChevronRight, Zap, TrendingUp, BookOpen, Clock } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'

const QUESTIONS = [
  {
    id: '1', q: 'Q14', subject: 'PHYSICS', chapter: 'Rotational Motion', difficulty: 'MEDIUM',
    text: 'A disc of radius R is rotating with angular velocity ω. A particle is placed at its rim. The linear velocity of the particle is:',
    options: ['A. ωR', 'B. 2ωR', 'C. ωR²', 'D. ω/R'],
    selected: 'B', correct: 'A', errorType: null as string | null, learning: '', status: 'pending'
  },
  {
    id: '2', q: 'Q27', subject: 'CHEMISTRY', chapter: 'Organic Chemistry', difficulty: 'HARD',
    text: 'Which of the following is NOT an aromatic compound according to Hückel\'s rule?',
    options: ['A. Benzene', 'B. Naphthalene', 'C. Cyclobutadiene', 'D. Azulene'],
    selected: 'A', correct: 'C', errorType: null as string | null, learning: '', status: 'pending'
  },
]

const ERROR_TYPES = [
  { id: 'CONCEPTUAL', label: '🧠 Conceptual', desc: 'Did not understand the concept' },
  { id: 'CALCULATION', label: '🔢 Calculation', desc: 'Made a math error' },
  { id: 'MISREAD', label: '👁 Misread', desc: 'Misread the question or options' },
  { id: 'FORMULA_FORGOTTEN', label: '📝 Formula', desc: 'Forgot a formula' },
  { id: 'SILLY', label: '😅 Silly', desc: 'Careless mistake' },
  { id: 'OVERTHOUGHT', label: '🌀 Overthought', desc: 'Correct initially, then changed' },
  { id: 'BLIND_GUESS', label: '🎲 Blind Guess', desc: 'Had no idea' },
]

export default function InterrogationPage() {
  const [questions, setQuestions] = useState(QUESTIONS)
  const [current, setCurrent] = useState(0)
  const [selectedError, setSelectedError] = useState<string | null>(null)
  const [learningNote, setLearningNote] = useState('')
  const [saved, setSaved] = useState(false)

  const q = questions[current]
  const progress = ((current) / questions.length) * 100

  async function handleSave() {
    const updated = [...questions]
    updated[current] = { ...updated[current], errorType: selectedError, learning: learningNote, status: 'done' }
    setQuestions(updated)
    setSaved(true)

    // Save to Supabase Mistake Book
    try {
      await supabase.from('mistake_book').insert({
        question_id: q.id,
        user_id: 'local-guest-id', // Placeholder till auth
        subject: q.subject,
        chapter: q.chapter,
        difficulty: q.difficulty,
        error_type: selectedError,
        learning_note: learningNote,
      })
    } catch(err) {
      console.log('DB Save failed, caching locally instead.')
    }

    setTimeout(() => {
      setSaved(false)
      setSelectedError(null)
      setLearningNote('')
      if (current < questions.length - 1) setCurrent(current + 1)
    }, 800)
  }

  return (
    <div className="min-h-screen bg-[#0F172A] lg:pl-64">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-xl bg-red-500/15 flex items-center justify-center animate-pulse">
              <Brain className="w-4 h-4 text-red-400" />
            </div>
            <h1 className="text-2xl font-bold text-white">Interrogation Room</h1>
            <span className="text-xs px-2 py-0.5 bg-red-500/15 border border-red-500/25 text-red-400 rounded">
              {questions.filter(q => q.status === 'pending').length} pending
            </span>
          </div>
          <p className="text-white/40 text-sm">Face your mistakes. Understand them. Never repeat them.</p>
        </div>

        {/* Progress */}
        <div className="mb-6">
          <div className="flex justify-between text-xs text-white/30 mb-1.5">
            <span>Question {current + 1} of {questions.length}</span>
            <span>{Math.round(progress)}% complete</span>
          </div>
          <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-blue-500 to-violet-500 rounded-full"
              initial={{ width: 0 }} animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        {/* Question Card */}
        <motion.div
          key={q.id}
          initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
          className="glass rounded-2xl p-6 mb-5 neon-border-blue"
        >
          {/* Meta */}
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xs font-bold text-white">{q.q}</span>
            <span className="text-[10px] text-blue-400">{q.subject}</span>
            <span className="text-[10px] text-white/30">·</span>
            <span className="text-[10px] text-white/40">{q.chapter}</span>
            <span className={`ml-auto text-[10px] px-1.5 py-0.5 rounded font-bold border
              ${q.difficulty === 'EASY' ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
              : q.difficulty === 'MEDIUM' ? 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20'
              : 'text-red-400 bg-red-500/10 border-red-500/20'}`}>
              {q.difficulty}
            </span>
          </div>

          {/* Question Text */}
          <p className="text-sm text-white/90 leading-relaxed mb-4">{q.text}</p>

          {/* Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
            {q.options.map((opt, i) => {
              const optKey = opt[0]
              const isSelected = optKey === q.selected
              const isCorrect = optKey === q.correct
              return (
                <div key={i} className={`flex items-center gap-2 p-3 rounded-xl text-sm border transition-all
                  ${isCorrect ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                  : isSelected ? 'bg-red-500/10 border-red-500/30 text-red-300'
                  : 'bg-white/3 border-white/8 text-white/50'}`}>
                  <span className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold flex-shrink-0
                    ${isCorrect ? 'bg-emerald-500 text-white' : isSelected ? 'bg-red-500 text-white' : 'bg-white/10 text-white/40'}`}>
                    {optKey}
                  </span>
                  <span className="text-xs">{opt.slice(3)}</span>
                  {isCorrect && <span className="ml-auto text-[10px]">✓ Correct</span>}
                  {isSelected && !isCorrect && <span className="ml-auto text-[10px]">✗ Your answer</span>}
                </div>
              )
            })}
          </div>
        </motion.div>

        {/* Error Type Selection */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}
          className="glass rounded-2xl p-5 mb-4">
          <h3 className="text-sm font-semibold text-white/60 mb-3 flex items-center gap-2">
            <Target className="w-4 h-4 text-orange-400" /> Why did you get this wrong?
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {ERROR_TYPES.map(e => (
              <button
                key={e.id}
                onClick={() => setSelectedError(e.id)}
                className={`flex items-start gap-3 p-3 rounded-xl text-left border transition-all
                  ${selectedError === e.id
                    ? 'bg-blue-500/15 border-blue-500/40 text-blue-300'
                    : 'bg-white/3 border-white/8 text-white/50 hover:border-white/20'}`}
              >
                <span className="text-sm">{e.label}</span>
                <span className="text-[10px] text-white/30 mt-0.5 leading-tight">{e.desc}</span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Learning Note */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
          className="glass rounded-2xl p-5 mb-5">
          <h3 className="text-sm font-semibold text-white/60 mb-3 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-violet-400" /> Write your learning point
          </h3>
          <textarea
            id="learning-point-textarea"
            data-testid="learning-point-textarea"
            aria-label="Learning Point Input"
            value={learningNote}
            onChange={e => setLearningNote(e.target.value)}
            placeholder="e.g. 'v = ωr for circular motion. The particle moves tangentially, so v = ω × radius.'"
            rows={3}
            className="w-full bg-white/3 border border-white/10 rounded-xl p-3 text-sm text-white placeholder-white/25 outline-none resize-none focus:border-violet-500/50 transition-colors"
          />
        </motion.div>

        {/* Save Button */}
        <div className="flex gap-3">
          <button
            id="lock-in-button"
            data-testid="lock-in-button"
            aria-label="Lock In Error Details"
            onClick={handleSave}
            disabled={!selectedError}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all
              ${saved ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-400'
              : selectedError ? 'bg-gradient-to-r from-blue-500 to-violet-600 text-white hover:scale-[1.02] glow-blue'
              : 'bg-white/5 border border-white/10 text-white/30 cursor-not-allowed'}`}
          >
            {saved ? '✓ Saved!' : <><Flame className="w-4 h-4" /> Lock In & Next</>}
          </button>
          {current < questions.length - 1 && (
            <button onClick={() => setCurrent(current + 1)}
              className="flex items-center gap-1 px-4 py-3 glass rounded-xl text-sm text-white/50 hover:text-white/80 border border-white/8 transition-colors">
              Skip <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>

      </div>
    </div>
  )
}
