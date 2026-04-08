'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { AlertTriangle, Eye, Calculator, BookOpen, Target, Frown } from 'lucide-react'
import { MetricCard } from '@/components/MetricCard'

const BLUNDER_DATA = [
  { subject: 'Physics', count: 1 }, { subject: 'Chemistry', count: 1 }, { subject: 'Maths', count: 1 }
]

const BLUNDERS = [
  {
    q: 'Q3', subject: 'PHYSICS', chapter: 'Kinematics', difficulty: 'EASY',
    selected: 'B', correct: 'A', errorType: 'CALCULATION',
    text: 'A ball is thrown at 30° to horizontal at 20 m/s. Horizontal range is:',
    impact: '-5 marks', peerAccuracy: '94%',
    learning: 'R = v²sin2θ/g. I used sin30 instead of sin60. Always double the angle first.',
  },
  {
    q: 'Q18', subject: 'CHEMISTRY', chapter: 'Mole Concept', difficulty: 'EASY',
    selected: 'A', correct: 'C', errorType: 'MISREAD',
    text: 'The number of moles in 22g of CO2 is:', impact: '-5 marks', peerAccuracy: '97%',
    learning: 'Missed that molar mass of CO2 = 44g/mol not 22. Read units carefully.',
  },
  {
    q: 'Q41', subject: 'MATHEMATICS', chapter: 'Quadratic Equations', difficulty: 'EASY',
    selected: 'D', correct: 'B', errorType: 'SILLY',
    text: 'If discriminant = 0, the equation has:', impact: '-5 marks', peerAccuracy: '98%',
    learning: 'D=0 means equal roots (repeated roots), not no real roots.',
  },
]

const ERROR_TYPES = [
  { type: 'CALCULATION', count: 4, color: '#EF4444' },
  { type: 'CONCEPTUAL', count: 3, color: '#7C3AED' },
  { type: 'MISREAD', count: 3, color: '#F59E0B' },
  { type: 'SILLY', count: 2, color: '#EC4899' },
  { type: 'BLIND_GUESS', count: 1, color: '#6B7280' },
  { type: 'FORMULA_FORGOTTEN', count: 1, color: '#06B6D4' },
]

export default function BlundersPage() {
  const [expanded, setExpanded] = useState<string | null>(null)

  return (
    <div className="min-h-screen bg-[#0F172A] lg:pl-64">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-xl bg-red-500/15 flex items-center justify-center">
              <Frown className="w-4 h-4 text-red-400" />
            </div>
            <h1 className="text-2xl font-bold text-white">Blunder Report</h1>
          </div>
          <p className="text-white/40 text-sm">Wrong answers on EASY questions — your biggest opportunity.</p>
        </motion.div>

        {/* Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-6">
          {[
            { label: 'Total Blunders', value: '3', sub: 'Easy wrong', color: 'red', icon: AlertTriangle },
            { label: 'Marks Lost', value: '−15', sub: 'Recoverable', color: 'orange', icon: Target },
            { label: 'Calc Errors', value: '4', sub: 'Preventable', color: 'yellow', icon: Calculator },
            { label: 'Misread Q', value: '3', sub: 'Attention gap', color: 'violet', icon: Eye },
          ].map((m, i) => (
            <MetricCard key={m.label} {...m} delay={i * 0.05} animate />
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
            className="glass rounded-2xl p-5">
            <h3 className="text-sm font-semibold text-white/70 mb-4">Error Type Breakdown</h3>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={ERROR_TYPES} layout="vertical" barSize={14}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                <XAxis type="number" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} />
                <YAxis dataKey="type" type="category" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 10 }} width={100} />
                <Tooltip contentStyle={{ background: '#0F172A', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 10, color: 'white', fontSize: 12 }} />
                <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                  {ERROR_TYPES.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }}
            className="glass rounded-2xl p-5">
            <h3 className="text-sm font-semibold text-white/70 mb-4">Blunders by Subject</h3>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={BLUNDER_DATA} barSize={30}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="subject" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} />
                <YAxis tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} />
                <Tooltip contentStyle={{ background: '#0F172A', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 10, color: 'white', fontSize: 12 }} />
                <Bar dataKey="count" fill="#EF4444" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* Blunder Cards */}
        <div className="space-y-3">
          {BLUNDERS.map((b, i) => (
            <motion.div key={b.q}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + i * 0.08 }}
              className="glass rounded-2xl overflow-hidden border border-red-500/15 hover:border-red-500/30 transition-all cursor-pointer"
              onClick={() => setExpanded(expanded === b.q ? null : b.q)}
            >
              <div className="flex items-center gap-3 p-4">
                <div className="w-8 h-8 rounded-lg bg-red-500/15 flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-4 h-4 text-red-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-bold text-white">{b.q}</span>
                    <span className="text-xs text-blue-400">{b.subject}</span>
                    <span className="text-xs text-white/30">·</span>
                    <span className="text-xs text-white/40">{b.chapter}</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-red-500/15 border border-red-500/20 text-red-400 font-bold ml-1">EASY BLUNDER</span>
                  </div>
                  <p className="text-[11px] text-white/40 mt-0.5 truncate">{b.text}</p>
                </div>
                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                  <span className="text-xs font-bold text-red-400">{b.impact}</span>
                  <span className="text-[10px] text-white/30">Peers: {b.peerAccuracy}</span>
                </div>
              </div>

              {expanded === b.q && (
                <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }}
                  className="border-t border-white/5 p-4 bg-red-500/3 space-y-3">
                  <p className="text-sm text-white/80">{b.text}</p>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-white/50">Your answer:</span>
                    <span className="px-2 py-0.5 bg-red-500/20 border border-red-500/30 text-red-300 rounded font-mono text-sm">{b.selected}</span>
                    <span className="text-white/30">→</span>
                    <span className="text-xs text-white/50">Correct:</span>
                    <span className="px-2 py-0.5 bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 rounded font-mono text-sm">{b.correct}</span>
                  </div>
                  <div className="p-3 bg-yellow-500/5 border border-yellow-500/15 rounded-xl">
                    <p className="text-xs text-yellow-400/80 flex items-start gap-2">
                      <BookOpen className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                      {b.learning}
                    </p>
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
