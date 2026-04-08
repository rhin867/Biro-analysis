'use client'

import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'
import { motion } from 'framer-motion'
import { TrendingUp } from 'lucide-react'

interface ScoreGaugeProps {
  score: number
  maxScore: number
  percentile: number
}

export function ScoreGauge({ score, maxScore, percentile }: ScoreGaugeProps) {
  const pct = score / maxScore
  const data = [
    { value: pct * 100, name: 'Score' },
    { value: 100 - pct * 100, name: 'Remaining' },
  ]

  const getColor = () => {
    if (pct >= 0.8) return '#10B981'
    if (pct >= 0.6) return '#2563EB'
    if (pct >= 0.4) return '#F59E0B'
    return '#EF4444'
  }

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-full h-36 flex items-center justify-center">
        <ResponsiveContainer width="100%" height={144}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="80%"
              startAngle={180}
              endAngle={0}
              innerRadius="65%"
              outerRadius="85%"
              dataKey="value"
              strokeWidth={0}
            >
              <Cell fill={getColor()} />
              <Cell fill="rgba(255,255,255,0.04)" />
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute bottom-2 text-center">
          <motion.p
            initial={{ scale: 0 }} animate={{ scale: 1 }}
            transition={{ delay: 0.4, type: 'spring' }}
            className="text-3xl font-black text-white leading-none"
            style={{ color: getColor() }}
          >
            {score}
          </motion.p>
          <p className="text-xs text-white/40 mt-0.5">out of {maxScore}</p>
        </div>
      </div>

      {/* Stats row */}
      <div className="w-full mt-2 grid grid-cols-3 gap-2 text-center">
        {[
          { label: 'Percentile', value: `${percentile}%`, color: 'text-violet-400' },
          { label: 'Score %', value: `${Math.round(pct * 100)}%`, color: 'text-blue-400' },
          { label: 'Rank Est.', value: `~2.4K`, color: 'text-cyan-400' },
        ].map(s => (
          <div key={s.label} className="glass-light rounded-lg p-2">
            <p className={`text-sm font-bold ${s.color}`}>{s.value}</p>
            <p className="text-[10px] text-white/30">{s.label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
