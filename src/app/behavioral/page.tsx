'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { RefreshCw, Activity, Terminal } from 'lucide-react'

export default function BehavioralRedirect() {
  const router = useRouter()

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push('/dashboard/master?tab=BEHAVIORAL')
    }, 2000)
    return () => clearTimeout(timer)
  }, [router])

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center font-mono">
      <div className="text-center space-y-6">
        <div className="relative inline-block">
          <RefreshCw className="w-16 h-16 text-[#00d4ff] animate-spin glow-cyan" />
          <Activity className="absolute inset-0 w-8 h-8 text-[#00ff88] m-auto animate-pulse" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Redirecting_Neural_Stream</h2>
          <p className="text-[#00d4ff] text-[10px] font-bold uppercase tracking-[0.5em] animate-pulse">Consolidating Behavioral Analytics into Master_Hub...</p>
        </div>
        <div className="mt-8 p-4 rounded-xl bg-white/5 border border-white/5 flex items-center gap-3 max-w-xs mx-auto">
          <Terminal className="w-4 h-4 text-white/30" />
          <p className="text-[10px] text-white/30 text-left font-bold uppercase">Consolidation ensures 0ms latency for cross-telemetry indices.</p>
        </div>
      </div>
    </div>
  )
}
