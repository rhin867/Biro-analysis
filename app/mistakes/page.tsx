'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { BookMarked, Search, Filter, Download, CheckCircle2, Circle, Edit3, Tag } from 'lucide-react'
import jsPDF from 'jspdf'

const MISTAKES = [
  {
    id: '1', q: 'Q14', subject: 'PHYSICS', chapter: 'Thermodynamics', topic: 'Heat Engine Efficiency',
    difficulty: 'MEDIUM', errorType: 'CONCEPTUAL', question: 'A Carnot engine operates between 800K and 300K. Find its efficiency.',
    correct: 'A', selected: 'C', learning: 'η = 1 - T_cold/T_hot = 1 - 300/800 = 62.5%. Always use Kelvin temperatures.',
    nextReview: '2025-01-15', resolved: false, tags: ['formula', 'thermodynamics']
  },
  {
    id: '2', q: 'Q27', subject: 'CHEMISTRY', chapter: 'Equilibrium', topic: 'Le Chatelier Principle',
    difficulty: 'EASY', errorType: 'MISREAD', question: 'Which change will NOT shift the equilibrium of N2 + 3H2 ⇌ 2NH3?',
    correct: 'D', selected: 'B', learning: 'Missed the word "NOT". Always underline negatives.',
    nextReview: '2025-01-12', resolved: false, tags: ['misread', 'equilibrium']
  },
  {
    id: '3', q: 'Q45', subject: 'MATHEMATICS', chapter: 'Integration', topic: 'By Parts',
    difficulty: 'HARD', errorType: 'CALCULATION', question: '∫x·e^x dx = ?',
    correct: 'B', selected: 'A', learning: 'Applied ILATE wrong — chose exponential as first function. ILATE: Inverse > Log > Algebraic > Trig > Exponential.',
    nextReview: '2025-01-20', resolved: true, tags: ['ILATE', 'integration']
  },
]

const ERROR_STYLES: Record<string, string> = {
  CONCEPTUAL: 'bg-violet-500/15 text-violet-400 border-violet-500/20',
  CALCULATION: 'bg-red-500/15 text-red-400 border-red-500/20',
  MISREAD: 'bg-orange-500/15 text-orange-400 border-orange-500/20',
  SILLY: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/20',
  FORMULA_FORGOTTEN: 'bg-pink-500/15 text-pink-400 border-pink-500/20',
}

const SUB_COLORS: Record<string, string> = {
  PHYSICS: 'text-blue-400',
  CHEMISTRY: 'text-emerald-400',
  MATHEMATICS: 'text-violet-400',
}

export default function MistakeBookPage() {
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<string | null>(null)

  const filtered = MISTAKES.filter(m =>
    m.subject.includes(search.toUpperCase()) ||
    m.chapter.toLowerCase().includes(search.toLowerCase()) ||
    m.tags.some(t => t.toLowerCase().includes(search.toLowerCase()))
  )

  function exportPDF() {
    const doc = new jsPDF()
    doc.setFontSize(18)
    doc.text('Biro-Analysis: Mistake Book', 20, 20)
    doc.setFontSize(11)
    let y = 35
    MISTAKES.forEach((m, i) => {
      if (y > 260) { doc.addPage(); y = 20 }
      doc.setFont('helvetica', 'bold')
      doc.text(`${i + 1}. ${m.q} | ${m.subject} — ${m.chapter}`, 20, y)
      y += 7
      doc.setFont('helvetica', 'normal')
      doc.text(`Error: ${m.errorType} | Difficulty: ${m.difficulty}`, 20, y)
      y += 7
      doc.text(`Q: ${m.question.slice(0, 80)}`, 20, y)
      y += 7
      doc.text(`Selected: ${m.selected}  Correct: ${m.correct}`, 20, y)
      y += 7
      if (m.learning) {
        const lines = doc.splitTextToSize(`Learning: ${m.learning}`, 170)
        doc.text(lines, 20, y)
        y += lines.length * 6
      }
      y += 5
    })
    doc.save('Biro-Mistake-Book.pdf')
  }

  return (
    <div className="min-h-screen bg-[#0F172A] lg:pl-64">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-8 h-8 rounded-xl bg-violet-500/15 flex items-center justify-center">
                <BookMarked className="w-4 h-4 text-violet-400" />
              </div>
              <h1 className="text-2xl font-bold text-white">Mistake Book</h1>
            </div>
            <p className="text-white/40 text-sm">{MISTAKES.length} mistakes logged · {MISTAKES.filter(m => !m.resolved).length} pending review</p>
          </div>
          <button onClick={exportPDF}
            className="flex items-center gap-2 px-4 py-2 bg-violet-500/15 hover:bg-violet-500/25 border border-violet-500/30 text-violet-400 rounded-xl text-sm font-medium transition-all">
            <Download className="w-4 h-4" /> Export PDF
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by subject, chapter, or tag..."
            className="w-full pl-10 pr-4 py-3 glass rounded-xl text-sm text-white placeholder-white/30 border border-white/8 focus:border-violet-500/50 outline-none transition-colors"
          />
        </div>

        {/* Mistake Cards */}
        <div className="space-y-3">
          {filtered.map((m, i) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className={`glass rounded-2xl overflow-hidden border transition-all cursor-pointer
                ${selected === m.id ? 'border-violet-500/40' : 'border-white/5 hover:border-white/15'}
                ${m.resolved ? 'opacity-60' : ''}`}
              onClick={() => setSelected(selected === m.id ? null : m.id)}
            >
              {/* Header row */}
              <div className="flex items-center gap-3 p-4">
                <div
                  onClick={e => { e.stopPropagation() }}
                  className="w-5 h-5 flex-shrink-0 cursor-pointer"
                >
                  {m.resolved
                    ? <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    : <Circle className="w-5 h-5 text-white/20" />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold text-white">{m.q}</span>
                    <span className={`text-[10px] font-semibold ${SUB_COLORS[m.subject]}`}>{m.subject}</span>
                    <span className="text-[10px] text-white/30">·</span>
                    <span className="text-[10px] text-white/40">{m.chapter}</span>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded border font-bold uppercase ${ERROR_STYLES[m.errorType] || ''}`}>
                      {m.errorType}
                    </span>
                    {m.difficulty === 'EASY' && <span className="text-[9px] bg-red-500/15 border border-red-500/20 text-red-400 px-1.5 py-0.5 rounded font-bold">BLUNDER !</span>}
                  </div>
                  <p className="text-[11px] text-white/40 mt-1 truncate">{m.question}</p>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <span className="text-[10px] text-red-400 bg-red-500/10 px-1.5 py-0.5 rounded font-mono">{m.selected}</span>
                  <span className="text-[10px] text-white/30">→</span>
                  <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded font-mono">{m.correct}</span>
                </div>
              </div>

              {/* Expanded detail */}
              {selected === m.id && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                  className="border-t border-white/5 p-4 bg-white/2"
                >
                  <p className="text-xs font-semibold text-white/50 mb-2 flex items-center gap-1.5">
                    <Edit3 className="w-3 h-3" /> Learning Point
                  </p>
                  <p className="text-sm text-white/80 bg-violet-500/8 border border-violet-500/15 rounded-xl p-3 font-mono leading-relaxed">
                    {m.learning}
                  </p>
                  <div className="flex items-center gap-2 mt-3 flex-wrap">
                    <Tag className="w-3 h-3 text-white/30" />
                    {m.tags.map(tag => (
                      <span key={tag} className="text-[10px] px-2 py-0.5 rounded bg-white/5 border border-white/10 text-white/50">
                        #{tag}
                      </span>
                    ))}
                    <span className="ml-auto text-[10px] text-white/30">Next review: {m.nextReview}</span>
                  </div>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>

      </div>
    </div>
  )
}
