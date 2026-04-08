'use client'

import { motion } from 'framer-motion'
import { Brain, AlertCircle, CheckCircle, Info } from 'lucide-react'

interface DarrMeterProps {
  darrIndex: number // 0-100
}

export function DarrMeter({ darrIndex }: DarrMeterProps) {
  const getLevel = () => {
    if (darrIndex <= 20) return { label: 'Confident', color: '#10B981', text: 'text-emerald-400', desc: 'You decide quickly and stick to your answers.' }
    if (darrIndex <= 40) return { label: 'Mild Doubt', color: '#3B82F6', text: 'text-blue-400', desc: 'Occasional hesitation — mostly healthy.' }
    if (darrIndex <= 60) return { label: 'Hesitant', color: '#F59E0B', text: 'text-yellow-400', desc: 'Visible fear between options. Work on concept confidence.' }
    if (darrIndex <= 80) return { label: 'High Darr', color: '#EF4444', text: 'text-red-400', desc: 'Significant hesitation hurting your score.' }
    return { label: 'Paralysed', color: '#DC2626', text: 'text-red-500', desc: 'Extreme hesitation. Mindset & speed drills needed urgently.' }
  }

  const level = getLevel()
  const rotation = (darrIndex / 100) * 180 - 90 // -90° to +90°

  const DARRQ_EXAMPLES = [
    { q: 'Q14', hovered: ['A', 'C'], timeMs: 5200 },
    { q: 'Q27', hovered: ['B', 'D', 'B'], timeMs: 7800 },
    { q: 'Q38', hovered: ['A', 'B'], timeMs: 4100 },
  ]

  return (
    <div className="space-y-4">
      {/* Gauge */}
      <div className="flex flex-col items-center">
        <div className="relative w-40 h-20 mb-2">
          {/* Arc background */}
          <svg viewBox="0 0 160 80" className="w-full h-full">
            <path d="M 10 80 A 70 70 0 0 1 150 80" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="12" strokeLinecap="round" />
            <path
              d="M 10 80 A 70 70 0 0 1 150 80"
              fill="none"
              stroke={`url(#darrGrad)`}
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray={`${(darrIndex / 100) * 220} 220`}
            />
            <defs>
              <linearGradient id="darrGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#10B981" />
                <stop offset="40%" stopColor="#F59E0B" />
                <stop offset="100%" stopColor="#EF4444" />
              </linearGradient>
            </defs>
            {/* Needle */}
            <motion.line
              initial={{ rotate: -90 }}
              animate={{ rotate: rotation - 90 }}
              x1="80" y1="80" x2="80" y2="20"
              stroke="white" strokeWidth="2" strokeLinecap="round"
              style={{ transformOrigin: '80px 80px' }}
              transition={{ type: 'spring', stiffness: 60, damping: 12, delay: 0.5 }}
            />
            <circle cx="80" cy="80" r="4" fill="white" />
          </svg>
          <div className="absolute inset-x-0 bottom-0 text-center">
            <motion.span
              initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.6 }}
              className={`text-2xl font-black ${level.text}`}
            >
              {darrIndex}
            </motion.span>
          </div>
        </div>

        <span className={`text-sm font-bold ${level.text} flex items-center gap-1.5`}>
          <Brain className="w-3.5 h-3.5" /> {level.label}
        </span>
        <p className="text-[11px] text-white/40 text-center mt-1 px-2">{level.desc}</p>
      </div>

      {/* Top hesitation questions */}
      <div className="space-y-2">
        <p className="text-[11px] font-semibold text-white/40 uppercase tracking-wider flex items-center gap-1.5">
          <AlertCircle className="w-3 h-3" /> Top Darr Moments
        </p>
        {DARRQ_EXAMPLES.map((q, i) => (
          <motion.div
            key={q.q}
            initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7 + i * 0.1 }}
            className="flex items-center gap-2 p-2 rounded-lg bg-yellow-500/5 border border-yellow-500/15"
          >
            <span className="text-xs font-bold text-yellow-400 w-8">{q.q}</span>
            <div className="flex gap-1 flex-1">
              {q.hovered.map((opt, j) => (
                <span key={j} className="text-[10px] px-1.5 py-0.5 rounded bg-yellow-500/15 text-yellow-300 font-mono">{opt}</span>
              ))}
            </div>
            <span className="text-[10px] text-white/30">{(q.timeMs / 1000).toFixed(1)}s</span>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
