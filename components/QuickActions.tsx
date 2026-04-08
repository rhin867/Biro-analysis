'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { FlaskConical, BookOpen, Brain, FileText, Zap, RefreshCw } from 'lucide-react'

const ACTIONS = [
  { icon: FlaskConical, label: 'Start New Test', href: '/test/new', color: 'from-blue-500 to-blue-700', glow: 'glow-blue', desc: 'Record analysis' },
  { icon: BookOpen, label: 'Mistake Book', href: '/mistakes', color: 'from-violet-500 to-violet-700', glow: 'glow-purple', desc: '12 pending review' },
  { icon: Brain, label: 'AI Action Plan', href: '/plan', color: 'from-emerald-500 to-teal-600', glow: 'glow-green', desc: 'Get 3-day plan' },
  { icon: RefreshCw, label: 'Revision Queue', href: '/revision', color: 'from-amber-500 to-orange-600', glow: 'glow-yellow', desc: '8 due today' },
  { icon: FileText, label: 'Export Report', href: '/report', color: 'from-cyan-500 to-blue-600', glow: 'glow-cyan', desc: 'Download PDF' },
  { icon: Zap, label: 'Score Simulator', href: '/simulator', color: 'from-pink-500 to-red-600', glow: '', desc: 'What-if analysis' },
]

export function QuickActions() {
  return (
    <div className="grid grid-cols-2 gap-2">
      {ACTIONS.map((a, i) => (
        <Link href={a.href} key={a.label}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 + i * 0.05 }}
            className={`group relative p-3 rounded-xl bg-gradient-to-br ${a.color} bg-opacity-10 
              border border-white/10 hover:border-white/20 hover:scale-[1.04] 
              transition-all duration-200 cursor-pointer overflow-hidden`}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <a.icon className="w-4 h-4 text-white/80 mb-1.5" />
            <p className="text-xs font-semibold text-white leading-tight">{a.label}</p>
            <p className="text-[10px] text-white/40 mt-0.5">{a.desc}</p>
          </motion.div>
        </Link>
      ))}
    </div>
  )
}
