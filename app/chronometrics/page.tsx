'use client'

import { motion } from 'framer-motion'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Legend, Cell
} from 'recharts'
import {
  Clock, Zap, AlertTriangle, TrendingDown, Target, Brain, Activity
} from 'lucide-react'
import { MetricCard } from '@/components/MetricCard'

const TIME_DATA = [
  { subject: 'Physics', avgTime: 142, correct: 95, incorrect: 210, skipped: 45 },
  { subject: 'Chemistry', avgTime: 112, correct: 78, incorrect: 165, skipped: 32 },
  { subject: 'Mathematics', avgTime: 198, correct: 142, incorrect: 285, skipped: 58 },
]

const SINK_DATA = [
  { q: 'Q23', time: 520, subject: 'MATHS', chapter: 'Integration', correct: false },
  { q: 'Q41', time: 480, subject: 'PHYSICS', chapter: 'Optics', correct: false },
  { q: 'Q67', time: 440, subject: 'MATHS', chapter: 'Vectors', correct: true },
  { q: 'Q12', time: 410, subject: 'CHEMISTRY', chapter: 'Electrochemistry', correct: false },
  { q: 'Q55', time: 390, subject: 'PHYSICS', chapter: 'Thermodynamics', correct: true },
]

const HOURLY = [
  { period: 'Q1-15', avg: 95, accuracy: 82 },
  { period: 'Q16-30', avg: 118, accuracy: 78 },
  { period: 'Q31-45', avg: 134, accuracy: 71 },
  { period: 'Q46-60', avg: 145, accuracy: 65 },
  { period: 'Q61-75', avg: 88, accuracy: 55 },
]

export default function ChronometricsPage() {
  return (
    <div className="min-h-screen bg-[#0F172A] lg:pl-64">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/15 flex items-center justify-center">
              <Clock className="w-4 h-4 text-cyan-400" />
            </div>
            <h1 className="text-2xl font-bold text-white">Chronometrics</h1>
          </div>
          <p className="text-white/40 text-sm">Deep time intelligence — where did you spend your precious minutes?</p>
        </motion.div>

        {/* Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
          {[
            { label: 'Avg Time/Q', value: '127s', sub: 'Overall', color: 'cyan', icon: Clock },
            { label: 'Physics Avg', value: '142s', sub: 'Per question', color: 'blue', icon: Activity },
            { label: 'Chem Avg', value: '112s', sub: 'Per question', color: 'green', icon: Activity },
            { label: 'Maths Avg', value: '198s', sub: 'Per question', color: 'violet', icon: Activity },
            { label: 'Fast Wrong', value: '9', sub: 'Impulsive clicks', color: 'red', icon: Zap },
            { label: 'Fatigue Drop', value: '27%', sub: 'Accuracy loss', color: 'yellow', icon: TrendingDown },
          ].map((m, i) => (
            <MetricCard key={m.label} {...m} delay={i * 0.05} animate />
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
          {/* Time per subject */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
            className="glass rounded-2xl p-5">
            <h3 className="text-sm font-semibold text-white/70 mb-4 flex items-center gap-2">
              <Brain className="w-4 h-4 text-violet-400" /> Time by Outcome (seconds)
            </h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={TIME_DATA} barSize={22}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="subject" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} />
                <YAxis tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} />
                <Tooltip contentStyle={{ background: '#0F172A', border: '1px solid rgba(37,99,235,0.3)', borderRadius: 10, color: 'white', fontSize: 12 }} />
                <Legend formatter={(v) => <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11 }}>{v}</span>} />
                <Bar dataKey="correct" name="Correct" fill="#10B981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="incorrect" name="Incorrect" fill="#EF4444" radius={[4, 4, 0, 0]} />
                <Bar dataKey="skipped" name="Skipped" fill="rgba(255,255,255,0.15)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Fatigue chart */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }}
            className="glass rounded-2xl p-5">
            <h3 className="text-sm font-semibold text-white/70 mb-4 flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-red-400" /> Fatigue Mapping (Speed vs Accuracy)
            </h3>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={HOURLY}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="period" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} />
                <YAxis tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} />
                <Tooltip contentStyle={{ background: '#0F172A', border: '1px solid rgba(37,99,235,0.3)', borderRadius: 10, color: 'white', fontSize: 12 }} />
                <Legend formatter={(v) => <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11 }}>{v}</span>} />
                <Line type="monotone" dataKey="avg" name="Avg Time(s)" stroke="#06B6D4" strokeWidth={2} dot={{ fill: '#06B6D4', r: 3 }} />
                <Line type="monotone" dataKey="accuracy" name="Accuracy %" stroke="#10B981" strokeWidth={2} dot={{ fill: '#10B981', r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* Time Sinks */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
          className="glass rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-white/70 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-yellow-400" /> Top 5 Time Sinks
          </h3>
          <div className="space-y-3">
            {SINK_DATA.map((s, i) => (
              <div key={s.q} className="flex items-center gap-4">
                <span className="text-xs font-bold text-white/30 w-4">{i + 1}</span>
                <div className="w-8 h-8 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                  <Clock className="w-3.5 h-3.5 text-yellow-400" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-white">{s.q}</span>
                    <span className="text-[10px] text-white/40">{s.subject} · {s.chapter}</span>
                    {!s.correct && <span className="text-[9px] bg-red-500/15 text-red-400 px-1.5 py-0.5 rounded">WRONG</span>}
                    {s.correct && <span className="text-[9px] bg-emerald-500/15 text-emerald-400 px-1.5 py-0.5 rounded">CORRECT</span>}
                  </div>
                  <div className="progress-bar w-full">
                    <div className="progress-fill" style={{ width: `${(s.time / 520) * 100}%`, background: s.correct ? '#10B981' : '#EF4444' }} />
                  </div>
                </div>
                <span className="text-sm font-bold text-yellow-400 w-12 text-right">{s.time}s</span>
              </div>
            ))}
          </div>
          <div className="mt-4 p-3 rounded-xl bg-yellow-500/5 border border-yellow-500/15">
            <p className="text-xs text-yellow-400/80">
              ⚠ These 5 questions consumed <strong>37 minutes</strong> (20% of test time) — only 2 were answered correctly.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
