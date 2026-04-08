'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { 
  Activity, Brain, Clock, Zap, Target, TrendingUp, 
  Terminal, RefreshCw, Layers, Shield, ArrowRight, ZapOff,
  Database, Cpu, Network
} from 'lucide-react'
import { supabase } from '@/lib/supabase/client'

export default function NeuralLandingPage() {
  const [loading, setLoading] = useState(true)
  const [isNewUser, setIsNewUser] = useState(true)

  useEffect(() => {
    // Check for "Zero Data" state
    const checkState = async () => {
      const hasData = localStorage.getItem('biro_initialized')
      if (hasData) setIsNewUser(false)
      setTimeout(() => setLoading(false), 2000)
    }
    checkState()
  }, [])

  const handleReset = () => {
    localStorage.clear()
    sessionStorage.clear()
    window.location.reload()
  }

  if (loading) return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center font-mono overflow-hidden">
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-10"></div>
      <div className="text-center relative z-10">
        <Cpu className="w-16 h-16 text-[#00d4ff] animate-pulse mx-auto mb-6 glow-cyan" />
        <p className="text-[#00d4ff] text-xs font-black uppercase tracking-[1em] animate-pulse">Initializing_Neural_Layer...</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#020617] text-white font-mono selection:bg-[#00d4ff]/30 overflow-x-hidden">
      <div className="fixed inset-0 bg-[url('/grid.svg')] bg-center opacity-20 pointer-events-none"></div>
      
      {/* Top Banner: Status */}
      <div className="h-10 bg-[#00d4ff]/5 border-b border-[#00d4ff]/20 flex items-center justify-between px-6 relative z-20 backdrop-blur-md">
        <div className="flex items-center gap-4">
           <span className="flex items-center gap-2 text-[8px] font-black text-[#00ff88] uppercase tracking-widest animate-pulse">
             <div className="w-1.5 h-1.5 rounded-full bg-[#00ff88]"></div> System_Online
           </span>
           <span className="text-[8px] font-black text-white/20 uppercase tracking-widest hidden md:block">Biro_Analysis_v4.5.3_Production</span>
        </div>
        <div className="flex items-center gap-4">
           {isNewUser ? (
             <span className="text-[8px] font-black text-yellow-400 uppercase tracking-widest">Buffer: Empty (Fresh_Aspirant)</span>
           ) : (
             <button onClick={handleReset} className="text-[8px] font-black text-red-500 hover:text-red-400 uppercase tracking-widest transition-all">Hard_Neural_Reset</button>
           )}
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 py-20 relative z-10">
        
        {/* Hero Section */}
        <div className="flex flex-col lg:flex-row items-center gap-16 mb-32">
           <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} className="flex-1 space-y-8 text-center lg:text-left">
              <div className="inline-flex items-center gap-3 px-3 py-1 rounded-full bg-[#00d4ff]/10 border border-[#00d4ff]/30 text-[#00d4ff] text-[10px] uppercase font-black tracking-widest">
                <Shield className="w-3.5 h-3.5" /> High-Performance Exam Intelligence
              </div>
              <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-[0.9] text-glow-cyan">
                Deconstruct <br /> <span className="text-[#00d4ff]">The Mock.</span>
              </h1>
              <p className="text-white/40 text-sm max-w-xl uppercase font-bold tracking-wider leading-relaxed mx-auto lg:mx-0">
                Track behavioral chronometrics, eliminate tilt-induced blunders, and achieve subject mastery via 4-layer neural extraction.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                 <Link href="/upload" className="px-10 py-4 bg-[#00d4ff] text-black font-black uppercase tracking-widest text-xs rounded-xl hover:shadow-[0_0_30px_#00d4ff] transition-all flex items-center justify-center gap-3">
                   Launch Simulation <ArrowRight className="w-4 h-4" />
                 </Link>
                 <Link href="/dashboard/master" className="px-10 py-4 border border-white/10 hover:bg-white/5 text-white font-black uppercase tracking-widest text-xs rounded-xl transition-all flex items-center justify-center gap-3">
                   Master Hub
                 </Link>
              </div>
           </motion.div>

           <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="lg:w-[500px] h-[500px] relative">
              <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-transparent z-10"></div>
              <div className="glass rounded-[40px] border-[#00d4ff]/30 w-full h-full relative overflow-hidden group">
                 <div className="absolute inset-0 bg-[#00d4ff]/5 animate-pulse"></div>
                 <div className="p-8 space-y-6 flex flex-col justify-center h-full">
                    {[
                      { label: 'Chronometrics', color: '#00d4ff', val: 0 },
                      { label: 'Behavioral_Tilt', color: '#f97316', val: 0 },
                      { label: 'Subject_Matrix', color: '#00ff88', val: 0 },
                      { label: 'Panic_Spikes', color: '#ef4444', val: 0 },
                    ].map(stat => (
                      <div key={stat.label} className="space-y-2 opacity-60 group-hover:opacity-100 transition-opacity">
                        <div className="flex justify-between text-[10px] font-black uppercase tracking-widest" style={{ color: stat.color }}>
                          <span>{stat.label}</span>
                          <span>{stat.val}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                           <div className="h-full bg-current rounded-full" style={{ color: stat.color, width: '4%' }}></div>
                        </div>
                      </div>
                    ))}
                    <div className="mt-10 p-6 rounded-2xl bg-[#0B1121] border border-white/10 text-center">
                       <p className="text-[10px] text-white/40 uppercase font-black tracking-widest mb-1">Status: BUFFER_WAIT</p>
                       <p className="text-sm font-black text-[#00ff88] uppercase">Waiting for First Input</p>
                    </div>
                 </div>
              </div>
              {/* Decorative Nodes */}
              <div className="absolute -top-10 -right-10 w-24 h-24 bg-[#00d4ff]/10 rounded-full blur-3xl animate-pulse"></div>
              <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-[#7c3aed]/10 rounded-full blur-3xl animate-pulse"></div>
           </motion.div>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           {[
             { title: '4-Layer Tracking', desc: 'Observer, Ghost, Mirror, and Reconstructor layers capture 100% of behavioral signals.', icon: Network, color: 'text-cyan-400' },
             { title: 'NTA-Style Engine', desc: 'Simulate the exact JEE/NEET environment with automatic question synthesis from PDFs.', icon: Layers, color: 'text-emerald-400' },
             { title: 'Neural Analysis', desc: '50+ metrics including Darr Index and Tilt Factor to identify psychological blindspots.', icon: Brain, color: 'text-violet-400' },
           ].map((f, i) => (
             <motion.div key={f.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 * i }}
              className="glass p-8 rounded-3xl border-white/5 hover:border-[#00d4ff]/20 transition-all group"
             >
                <f.icon className={`w-10 h-10 ${f.color} mb-6 glow-current group-hover:scale-110 transition-transform`} />
                <h3 className="text-xl font-black uppercase tracking-tighter mb-3">{f.title}</h3>
                <p className="text-xs text-white/40 leading-relaxed font-bold uppercase tracking-wide">{f.desc}</p>
             </motion.div>
           ))}
        </div>

      </main>

      {/* Footer System Info */}
      <footer className="mt-20 border-t border-white/5 py-10 px-6 text-center">
         <p className="text-[10px] text-white/20 uppercase font-black tracking-[0.5em]">Auth: ASPIRANT_SECURE_GATEWAY // PROD_NODE_BIRO</p>
      </footer>
    </div>
  )
}
