'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Clock, RefreshCw, Terminal } from 'lucide-react'

export default function ChronometricsRedirect() {
  const router = useRouter()

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push('/dashboard/master?tab=CHRONO')
    }, 2000)
    return () => clearTimeout(timer)
  }, [router])

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center font-mono">
      <div className="text-center space-y-6">
        <div className="relative inline-block">
          <Clock className="w-16 h-16 text-[#00d4ff] animate-pulse glow-cyan" />
          <RefreshCw className="absolute inset-0 w-8 h-8 text-[#a855f7] m-auto animate-spin" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Syncing_Time_Indices</h2>
          <p className="text-[#00d4ff] text-[10px] font-bold uppercase tracking-[0.5em] animate-pulse">Relocating Chronometric Precision to Master_Hub...</p>
        </div>
        <div className="mt-8 p-4 rounded-xl bg-white/5 border border-white/5 flex items-center gap-3 max-w-xs mx-auto">
          <Terminal className="w-4 h-4 text-white/30" />
          <p className="text-[10px] text-white/30 text-left font-bold uppercase">Chronometrics are now sub-indexed under Neural_Timeline.</p>
        </div>
      </div>
    </div>
  )
}
