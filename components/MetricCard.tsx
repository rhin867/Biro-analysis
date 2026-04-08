'use client'

import { motion } from 'framer-motion'
import { LucideIcon } from 'lucide-react'

interface MetricCardProps {
  label: string
  value: string
  sub: string
  color: string
  icon: any
  delay?: number
  animate?: boolean
}

const COLOR_MAP = {
  blue:   { bg: 'bg-blue-500/10',   border: 'border-blue-500/20',   text: 'text-blue-400',   glow: 'glow-blue' },
  violet: { bg: 'bg-violet-500/10', border: 'border-violet-500/20', text: 'text-violet-400', glow: 'glow-purple' },
  cyan:   { bg: 'bg-cyan-500/10',   border: 'border-cyan-500/20',   text: 'text-cyan-400',   glow: 'glow-cyan' },
  red:    { bg: 'bg-red-500/10',    border: 'border-red-500/20',    text: 'text-red-400',    glow: 'glow-red' },
  green:  { bg: 'bg-emerald-500/10',border: 'border-emerald-500/20',text: 'text-emerald-400',glow: 'glow-green' },
  yellow: { bg: 'bg-yellow-500/10', border: 'border-yellow-500/20', text: 'text-yellow-400', glow: 'glow-yellow' },
  orange: { bg: 'bg-orange-500/10', border: 'border-orange-500/20', text: 'text-orange-400', glow: 'glow-red' },
}

export function MetricCard({ label, value, sub, color, icon: Icon, delay = 0, animate = true }: MetricCardProps) {
  const c = COLOR_MAP[color as keyof typeof COLOR_MAP] || COLOR_MAP.blue

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={animate ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{ delay, duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
      className={`relative glass rounded-xl p-4 border ${c.border} cursor-pointer group
        hover:scale-[1.03] transition-transform duration-200 overflow-hidden`}
    >
      {/* Ambient glow */}
      <div className={`absolute inset-0 ${c.bg} opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl`} />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-2">
          <p className="text-[11px] font-medium text-white/40 uppercase tracking-wider">{label}</p>
          <div className={`w-6 h-6 rounded-md ${c.bg} flex items-center justify-center`}>
            <Icon className={`w-3.5 h-3.5 ${c.text}`} />
          </div>
        </div>
        <p className={`text-xl sm:text-2xl font-bold ${c.text} leading-none mb-1`}>{value}</p>
        <p className="text-[11px] text-white/30">{sub}</p>
      </div>
    </motion.div>
  )
}
