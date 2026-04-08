'use client'

import { motion } from 'framer-motion'
import { Brain, Flame, TrendingDown, Eye, RefreshCw, Activity, Zap, AlertTriangle } from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  ScatterChart, Scatter, ZAxis, Cell
} from 'recharts'
import { MetricCard } from '@/components/MetricCard'

const PANIC_TIMELINE = [
  { min: 0, clickRate: 2, switches: 0 },
  { min: 15, clickRate: 3, switches: 1 },
  { min: 30, clickRate: 2, switches: 0 },
  { min: 45, clickRate: 4, switches: 1 },
  { min: 60, clickRate: 3, switches: 0 },
  { min: 75, clickRate: 3, switches: 1 },
  { min: 90, clickRate: 5, switches: 2 },
  { min: 105, clickRate: 4, switches: 1 },
  { min: 120, clickRate: 3, switches: 0 },
  { min: 135, clickRate: 5, switches: 2 },
  { min: 150, clickRate: 6, switches: 2 },
  { min: 165, clickRate: 11, switches: 4 }, // PANIC!
  { min: 175, clickRate: 9, switches: 3 },  // PANIC!
]

const TILT_DATA = [
  { q: 'Q10', acc: 85 }, { q: 'Q15', acc: 80 },
  { q: 'Q16 ❌', acc: 60 }, { q: 'Q17 ❌', acc: 40 }, { q: 'Q18 ❌', acc: 20 }, // tilt trigger
  { q: 'Q19', acc: 35 }, { q: 'Q20', acc: 50 }, { q: 'Q21', acc: 55 }, { q: 'Q22', acc: 70 }, // recovery
  { q: 'Q30', acc: 75 }, { q: 'Q35', acc: 72 },
]

const DARR_QUESTIONS = [
  { q: 14, hoverMs: 7800, options: 3 }, { q: 27, hoverMs: 6200, options: 2 },
  { q: 41, hoverMs: 5500, options: 2 }, { q: 58, hoverMs: 4800, options: 3 },
  { q: 63, hoverMs: 4100, options: 2 },
]

export default function BehavioralPage() {
  return (
    <div className="min-h-screen bg-[#0F172A] lg:pl-64">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-xl bg-violet-500/15 flex items-center justify-center">
              <Brain className="w-4 h-4 text-violet-400" />
            </div>
            <h1 className="text-2xl font-bold text-white">Behavioral Analysis</h1>
          </div>
          <p className="text-white/40 text-sm">Psychological fingerprint of your test performance.</p>
        </motion.div>

        {/* Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
          {[
            { label: 'Darr Index', value: '42/100', sub: 'Hesitation', color: 'yellow', icon: Brain },
            { label: 'Tilt Factor', value: '18%', sub: 'Accuracy drop', color: 'orange', icon: TrendingDown },
            { label: 'Panic Spikes', value: '2', sub: 'Windows detected', color: 'red', icon: Flame },
            { label: 'Confidence ×', value: '9', sub: 'Fast + wrong', color: 'violet', icon: Zap },
            { label: 'Option Changes', value: '14', sub: '6 helped, 8 hurt', color: 'cyan', icon: RefreshCw },
            { label: 'Review ROI', value: '63%', sub: 'Marked → correct', color: 'green', icon: Eye },
          ].map((m, i) => (
            <MetricCard key={m.label} {...m} delay={i * 0.05} animate />
          ))}
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">

          {/* Panic timeline */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
            className="glass rounded-2xl p-5">
            <h3 className="text-sm font-semibold text-white/70 mb-1 flex items-center gap-2">
              <Flame className="w-4 h-4 text-red-400" /> Panic Spike Timeline
            </h3>
            <p className="text-[11px] text-white/30 mb-4">Click rate and subject switches per 10-min interval</p>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={PANIC_TIMELINE}>
                <defs>
                  <linearGradient id="clickGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="min" tickFormatter={v => `${v}m`} tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} />
                <YAxis tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} />
                <Tooltip contentStyle={{ background: '#0F172A', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 10, color: 'white', fontSize: 12 }} />
                <Area type="monotone" dataKey="clickRate" name="Click Rate" stroke="#EF4444" strokeWidth={2} fill="url(#clickGrad)" />
                <Area type="monotone" dataKey="switches" name="Subject Switches" stroke="#F59E0B" strokeWidth={1.5} fill="none" strokeDasharray="4 3" />
              </AreaChart>
            </ResponsiveContainer>
            <div className="mt-3 flex gap-2">
              <span className="text-[10px] px-2 py-1 bg-red-500/15 border border-red-500/20 text-red-400 rounded">
                ⚡ Panic detected at 165–180 min (11 clicks/5min)
              </span>
            </div>
          </motion.div>

          {/* Tilt factor */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }}
            className="glass rounded-2xl p-5">
            <h3 className="text-sm font-semibold text-white/70 mb-1 flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-orange-400" /> Tilt Factor Map
            </h3>
            <p className="text-[11px] text-white/30 mb-4">Accuracy drop after consecutive wrong answers</p>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={TILT_DATA}>
                <defs>
                  <linearGradient id="tiltGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#7C3AED" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="q" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 9 }} />
                <YAxis domain={[0, 100]} tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} />
                <Tooltip contentStyle={{ background: '#0F172A', border: '1px solid rgba(124,58,237,0.3)', borderRadius: 10, color: 'white', fontSize: 12 }} formatter={(v) => [`${v}%`, 'Accuracy']} />
                <Area type="monotone" dataKey="acc" name="Accuracy %" stroke="#7C3AED" strokeWidth={2} fill="url(#tiltGrad)" />
              </AreaChart>
            </ResponsiveContainer>
            <div className="mt-3 flex gap-2">
              <span className="text-[10px] px-2 py-1 bg-orange-500/15 border border-orange-500/20 text-orange-400 rounded">
                🌀 3 wrong in a row (Q16-18) → -50% accuracy for next 3 questions
              </span>
            </div>
          </motion.div>
        </div>

        {/* Darr Questions Table */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
          className="glass rounded-2xl p-5 mb-5">
          <h3 className="text-sm font-semibold text-white/70 mb-4 flex items-center gap-2">
            <Brain className="w-4 h-4 text-yellow-400" /> Top Hesitation (Darr) Moments
          </h3>
          <div className="space-y-3">
            {DARR_QUESTIONS.map((q, i) => (
              <div key={q.q} className="flex items-center gap-4">
                <span className="text-xs text-white/30 w-4">{i + 1}</span>
                <span className="text-sm font-bold text-yellow-400 w-8">Q{q.q}</span>
                <div className="flex-1">
                  <div className="progress-bar">
                    <div className="progress-fill bg-yellow-500" style={{ width: `${(q.hoverMs / 8000) * 100}%` }} />
                  </div>
                </div>
                <span className="text-sm font-bold text-white w-16 text-right">{(q.hoverMs / 1000).toFixed(1)}s</span>
                <span className="text-[10px] text-white/30 w-20">{q.options} options hovered</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Option Change Analysis */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}
          className="glass rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-white/70 mb-4 flex items-center gap-2">
            <RefreshCw className="w-4 h-4 text-cyan-400" /> Option Change Analysis
          </h3>
          <div className="grid grid-cols-3 gap-4 mb-4">
            {[
              { label: 'Changed & Correct', value: 6, color: 'emerald', pct: 43 },
              { label: 'Changed & Wrong', value: 8, color: 'red', pct: 57 },
              { label: 'Total Changes', value: 14, color: 'blue', pct: 100 },
            ].map(s => (
              <div key={s.label} className="text-center p-3 bg-white/3 rounded-xl border border-white/8">
                <p className={`text-2xl font-black text-${s.color}-400`}>{s.value}</p>
                <p className="text-[10px] text-white/40 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
          <div className="p-3 bg-orange-500/5 border border-orange-500/15 rounded-xl">
            <p className="text-xs text-orange-400/80">
              ⚠ Second-guessing <strong>hurt more than it helped</strong> (57% of changes → wrong). Trust your first instinct on familiar topics.
            </p>
          </div>
        </motion.div>

      </div>
    </div>
  )
}
