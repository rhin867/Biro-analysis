'use client'

import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, Tooltip } from 'recharts'

const data = [
  { subject: 'Physics', score: 72, full: 100 },
  { subject: 'Chemistry', score: 85, full: 100 },
  { subject: 'Maths', score: 58, full: 100 },
  { subject: 'Attempt Rate', score: 91, full: 100 },
  { subject: 'Time Mgmt', score: 65, full: 100 },
  { subject: 'Accuracy', score: 79, full: 100 },
]

export function SubjectRadar() {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <RadarChart data={data}>
        <PolarGrid stroke="rgba(255,255,255,0.08)" />
        <PolarAngleAxis
          dataKey="subject"
          tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 10 }}
        />
        <Radar
          name="Score"
          dataKey="score"
          stroke="#2563EB"
          fill="#2563EB"
          fillOpacity={0.15}
          strokeWidth={2}
        />
        <Tooltip
          contentStyle={{
            background: 'rgba(15,23,42,0.95)',
            border: '1px solid rgba(37,99,235,0.3)',
            borderRadius: '10px',
            color: 'white',
            fontSize: 12,
          }}
          formatter={(v: number) => [`${v}%`, 'Score']}
        />
      </RadarChart>
    </ResponsiveContainer>
  )
}
