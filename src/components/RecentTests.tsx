'use client'

import { motion } from 'framer-motion'
import { Calendar, Trophy, TrendingUp, TrendingDown, ChevronRight } from 'lucide-react'
import Link from 'next/link'

const TESTS = [
  { id: '1', name: 'JEE Mains Full Mock #12', date: '2 days ago', score: 214, total: 300, percentile: 97.8, trend: 'up', type: 'FULL_LENGTH' },
  { id: '2', name: 'Allen DLP Physics Set 4', date: '5 days ago', score: 78, total: 120, percentile: 89.2, trend: 'up', type: 'SUBJECT' },
  { id: '3', name: 'JEE Mains Full Mock #11', date: '1 week ago', score: 198, total: 300, percentile: 94.1, trend: 'down', type: 'FULL_LENGTH' },
  { id: '4', name: 'Chemistry Chapter Test', date: '10 days ago', score: 52, total: 80, percentile: 91.5, trend: 'up', type: 'CHAPTER' },
]

const TYPE_STYLE: Record<string, string> = {
  FULL_LENGTH: 'bg-blue-500/15 text-blue-400',
  SUBJECT: 'bg-violet-500/15 text-violet-400',
  CHAPTER: 'bg-cyan-500/15 text-cyan-400',
  MOCK: 'bg-orange-500/15 text-orange-400',
}

export function RecentTests() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}
      className="glass rounded-2xl p-5"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-white/70 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-cyan-400" /> Recent Tests
        </h3>
        <Link href="/analysis" className="text-xs text-white/30 hover:text-white/60 flex items-center gap-1 transition-colors">
          All tests <ChevronRight className="w-3 h-3" />
        </Link>
      </div>

      <div className="space-y-2">
        {TESTS.map((t, i) => (
          <Link href={`/analysis/${t.id}`} key={t.id}>
            <motion.div
              initial={{ opacity: 0, x: 15 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 + i * 0.07 }}
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors cursor-pointer group"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500/20 to-violet-500/20 flex items-center justify-center flex-shrink-0">
                <Trophy className="w-3.5 h-3.5 text-blue-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-xs font-medium text-white truncate group-hover:text-blue-300 transition-colors">
                    {t.name}
                  </p>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase flex-shrink-0 ${TYPE_STYLE[t.type]}`}>
                    {t.type.replace('_', ' ')}
                  </span>
                </div>
                <p className="text-[11px] text-white/30 mt-0.5">{t.date}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="flex items-center gap-1 justify-end">
                  <span className="text-sm font-bold text-white">{t.score}</span>
                  <span className="text-[10px] text-white/30">/{t.total}</span>
                  {t.trend === 'up'
                    ? <TrendingUp className="w-3 h-3 text-emerald-400" />
                    : <TrendingDown className="w-3 h-3 text-red-400" />
                  }
                </div>
                <p className="text-[11px] text-violet-400">{t.percentile}%ile</p>
              </div>
            </motion.div>
          </Link>
        ))}
      </div>
    </motion.div>
  )
}
