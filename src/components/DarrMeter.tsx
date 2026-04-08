'use client'

import { motion } from 'framer-motion'
import { Brain, AlertCircle, CheckCircle, Info } from 'lucide-react'

interface DarrMeterProps {
  darrIndex: number // 0-100
}

export function DarrMeter({ darrIndex }: DarrMeterProps) {
  const getLevel = () => {
    if (darrIndex <= 20) return { label: 'Confident', color: '#00d4ff', text: 'text-[#00d4ff] text-glow-cyan', desc: 'You decide quickly and stick to your answers.' }
    if (darrIndex <= 40) return { label: 'Mild Doubt', color: '#2563eb', text: 'text-blue-400 text-glow-blue', desc: 'Occasional hesitation — mostly healthy.' }
    if (darrIndex <= 60) return { label: 'Hesitant', color: '#7c3aed', text: 'text-[#7c3aed] text-glow-purple', desc: 'Visible fear between options. Work on concept confidence.' }
    if (darrIndex <= 80) return { label: 'High Darr', color: '#ff2d92', text: 'text-[#ff2d92] drop-shadow-[0_0_8px_#ff2d92]', desc: 'Significant hesitation hurting your score.' }
    return { label: 'Paralysed', color: '#ef4444', text: 'text-[#ef4444] glow-red', desc: 'Extreme hesitation. Mindset & speed drills needed urgently.' }
  }

  const level = getLevel()
  const rotation = (darrIndex / 100) * 180 - 90 // -90° to +90°

  const DARRQ_EXAMPLES = [
    { q: 'Q14', hovered: ['A', 'C'], timeMs: 5200 },
    { q: 'Q27', hovered: ['B', 'D', 'B'], timeMs: 7800 },
    { q: 'Q38', hovered: ['A', 'B'], timeMs: 4100 },
  ]

  return (
    <div className="space-y-4 font-mono">
      {/* Gauge */}
      <div className="flex flex-col items-center">
        <div className="relative w-40 h-20 mb-2">
          {/* Arc background */}
          <svg viewBox="0 0 160 80" className="w-full h-full drop-shadow-[0_0_15px_rgba(0,212,255,0.2)]">
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
                <stop offset="0%" stopColor="#00d4ff" />
                <stop offset="50%" stopColor="#7c3aed" />
                <stop offset="100%" stopColor="#ff2d92" />
              </linearGradient>
            </defs>
            {/* Needle */}
            <motion.line
              initial={{ rotate: -90 }}
              animate={{ rotate: rotation - 90 }}
              x1="80" y1="80" x2="80" y2="20"
              stroke="#fff" strokeWidth="2" strokeLinecap="round"
              className="drop-shadow-[0_0_5px_white]"
              style={{ transformOrigin: '80px 80px' }}
              transition={{ type: 'spring', stiffness: 60, damping: 12, delay: 0.5 }}
            />
            <circle cx="80" cy="80" r="4" fill="#00d4ff" className="glow-cyan" />
          </svg>
          <div className="absolute inset-x-0 bottom-0 text-center">
            <motion.span
              initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.6 }}
              className={`text-2xl font-black tracking-widest ${level.text}`}
            >
              {darrIndex}
            </motion.span>
          </div>
        </div>

        <span className={`text-sm font-bold tracking-widest uppercase ${level.text} flex items-center gap-1.5 mt-2`}>
          <Brain className="w-3.5 h-3.5" /> {level.label}
        </span>
        <p className="text-[11px] text-white/40 text-center mt-1 px-2 uppercase tracking-wide">{level.desc}</p>
      </div>

      {/* Top hesitation questions */}
      <div className="space-y-2 mt-4">
        <p className="text-[11px] font-bold text-[#7c3aed] uppercase tracking-[0.15em] flex items-center gap-1.5 px-1 glow-purple">
          <AlertCircle className="w-3 h-3" /> HESITATION_LOGS
        </p>
        <div className="flex flex-col gap-2">
          {DARRQ_EXAMPLES.map((q, i) => (
            <motion.div
              key={q.q}
              initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 + i * 0.1 }}
              className="flex items-center gap-2 p-2.5 rounded-lg bg-[#0B1121]/80 border border-[#7c3aed]/30 relative overflow-hidden"
            >
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#7c3aed] opacity-50"></div>
              <span className="text-xs font-bold text-[#7c3aed] text-glow-purple w-8 ml-1 tracking-wider">{q.q}</span>
              <div className="flex gap-1 flex-1">
                {q.hovered.map((opt, j) => (
                  <span key={j} className="text-[10px] px-1.5 py-0.5 rounded border border-[#00d4ff]/20 bg-[#00d4ff]/10 text-[#00d4ff] font-bold">{opt}</span>
                ))}
              </div>
              <span className="text-[10px] font-bold text-white/50 tracking-wider">{(q.timeMs / 1000).toFixed(1)}s</span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
