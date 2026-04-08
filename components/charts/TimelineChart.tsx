'use client'

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'

const data = [
  { min: '0-15', accuracy: 82, avgTime: 95, questions: 8 },
  { min: '15-30', accuracy: 78, avgTime: 112, questions: 9 },
  { min: '30-45', accuracy: 85, avgTime: 88, questions: 10 },
  { min: '45-60', accuracy: 71, avgTime: 145, questions: 7 },
  { min: '60-75', accuracy: 80, avgTime: 102, questions: 9 },
  { min: '75-90', accuracy: 68, avgTime: 160, questions: 6 },
  { min: '90-105', accuracy: 75, avgTime: 118, questions: 8 },
  { min: '105-120', accuracy: 55, avgTime: 178, questions: 7 },
  { min: '120-135', accuracy: 62, avgTime: 130, questions: 8 },
  { min: '135-150', accuracy: 48, avgTime: 95, questions: 10 },
  { min: '150-165', accuracy: 40, avgTime: 72, questions: 13 },
  { min: '165-180', accuracy: 35, avgTime: 55, questions: 15 },
]

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass rounded-xl p-3 border border-white/10 text-xs space-y-1">
        <p className="text-white/60 font-medium">⏱ {label} min</p>
        <p className="text-blue-400">Accuracy: <span className="font-bold text-white">{payload[0]?.value}%</span></p>
        <p className="text-cyan-400">Avg Time: <span className="font-bold text-white">{payload[1]?.value}s</span></p>
      </div>
    )
  }
  return null
}

export function TimelineChart() {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <AreaChart data={data} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
        <defs>
          <linearGradient id="accuracyGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#2563EB" stopOpacity={0.4} />
            <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="timeGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#06B6D4" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
        <XAxis dataKey="min" tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 9 }} interval={2} />
        <YAxis tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 9 }} />
        <Tooltip content={<CustomTooltip />} />
        <ReferenceLine y={60} stroke="rgba(245,158,11,0.4)" strokeDasharray="4 4" label={{ value: '60% baseline', fill: 'rgba(245,158,11,0.6)', fontSize: 9 }} />
        <Area type="monotone" dataKey="accuracy" stroke="#2563EB" strokeWidth={2} fill="url(#accuracyGrad)" name="Accuracy %" />
        <Area type="monotone" dataKey="avgTime" stroke="#06B6D4" strokeWidth={1.5} fill="url(#timeGrad)" name="Avg Time (s)" strokeDasharray="5 3" />
      </AreaChart>
    </ResponsiveContainer>
  )
}
