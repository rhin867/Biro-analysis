'use client'

import { motion } from 'framer-motion'
import { AlertTriangle, ChevronRight, Frown } from 'lucide-react'
import Link from 'next/link'

const BLUNDERS = [
  { q: 'Q3', subject: 'PHYSICS', chapter: 'Kinematics', topic: 'Projectile Motion', difficulty: 'EASY', selected: 'B', correct: 'A', type: 'CALCULATION' },
  { q: 'Q18', subject: 'CHEMISTRY', chapter: 'Mole Concept', topic: 'Limiting Reagent', difficulty: 'EASY', selected: 'A', correct: 'C', type: 'MISREAD' },
  { q: 'Q41', subject: 'MATHEMATICS', chapter: 'Quadratic', topic: 'Discriminant', difficulty: 'EASY', selected: 'D', correct: 'B', type: 'SILLY' },
]

const TYPE_COLOR: Record<string, string> = {
  CALCULATION: 'text-red-400 bg-red-500/10 border-red-500/20',
  MISREAD: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
  SILLY: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
  CONCEPTUAL: 'text-violet-400 bg-violet-500/10 border-violet-500/20',
}

const SUB_COLOR: Record<string, string> = {
  PHYSICS: 'text-blue-400', CHEMISTRY: 'text-emerald-400', MATHEMATICS: 'text-violet-400',
}

export function BlunderAlert() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
      className="glass rounded-2xl p-5"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-white/70 flex items-center gap-2">
          <Frown className="w-4 h-4 text-red-400" />
          Blunder Report
          <span className="ml-1 text-[10px] px-1.5 py-0.5 bg-red-500/20 text-red-400 rounded-full font-bold">
            {BLUNDERS.length} blunders
          </span>
        </h3>
        <Link href="/blunders" className="text-xs text-white/30 hover:text-white/60 flex items-center gap-1 transition-colors">
          View all <ChevronRight className="w-3 h-3" />
        </Link>
      </div>

      <div className="space-y-2">
        {BLUNDERS.map((b, i) => (
          <motion.div
            key={b.q}
            initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.55 + i * 0.08 }}
            className="flex items-center gap-3 p-3 rounded-xl bg-red-500/5 border border-red-500/10 hover:border-red-500/25 transition-colors cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-lg bg-red-500/15 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-4 h-4 text-red-400" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-xs font-bold text-white">{b.q}</span>
                <span className={`text-[10px] font-medium ${SUB_COLOR[b.subject]}`}>{b.subject}</span>
                <span className="text-[10px] text-white/30">·</span>
                <span className="text-[10px] text-white/30">{b.chapter}</span>
              </div>
              <p className="text-[11px] text-white/40 truncate">{b.topic}</p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <div className="flex items-center gap-1">
                <span className="text-[10px] text-red-400 bg-red-500/15 px-1.5 py-0.5 rounded font-mono">{b.selected}</span>
                <span className="text-[10px] text-white/30">→</span>
                <span className="text-[10px] text-emerald-400 bg-emerald-500/15 px-1.5 py-0.5 rounded font-mono">{b.correct}</span>
              </div>
              <span className={`text-[9px] px-1.5 py-0.5 rounded border font-bold uppercase ${TYPE_COLOR[b.type]}`}>
                {b.type}
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-3 p-3 rounded-xl bg-amber-500/8 border border-amber-500/15">
        <p className="text-xs text-amber-400/80 flex items-start gap-2">
          <AlertTriangle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
          <span>These 3 blunders on <strong>EASY</strong> questions cost you <strong>-15 marks</strong>. Toppers solve these in &lt;30s with 98%+ accuracy.</span>
        </p>
      </div>
    </motion.div>
  )
}
