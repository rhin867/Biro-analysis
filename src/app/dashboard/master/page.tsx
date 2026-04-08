'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Activity, Brain, Clock, Zap, Target, Flame, TrendingDown, 
  Terminal, RefreshCw, AlertTriangle, LayoutDashboard, Database,
  ArrowRight, Shield, Cpu, Network, ZapOff
} from 'lucide-react'
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, BarChart, Bar, Cell
} from 'recharts'
import { supabase, hardNeuralReset } from '@/lib/supabase/client'

/**
 * BIRO-ANALYSIS MASTER HUB v2.5
 * Consolidated Neural Terminal for high-performance extraction.
 */
export default function MasterAnalyticsHub() {
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'BEHAVIORAL' | 'CHRONO' | 'MISTAKES'>('OVERVIEW')
  const [loading, setLoading] = useState(true)
  const [metrics, setMetrics] = useState({
    darrIndex: 0,
    tiltFactor: 0,
    panicSpikes: 0,
    precision: 0,
    totalNodes: 0,
    syncedEvents: 0
  })

  useEffect(() => {
    // Initializing Engine
    const timer = setTimeout(() => {
      // Check if we have session data, otherwise keep it at ZERO
      const storedMetrics = localStorage.getItem('biro_session_metrics')
      if (storedMetrics) setMetrics(JSON.parse(storedMetrics))
      setLoading(false)
    }, 1500)
    return () => clearTimeout(timer)
  }, [])

  const handleManualPurge = () => {
    if (confirm('CRITICAL_WARNING: ERASE_NEURAL_BUFFER?')) {
      hardNeuralReset()
      setMetrics({ darrIndex: 0, tiltFactor: 0, panicSpikes: 0, precision: 0, totalNodes: 0, syncedEvents: 0 })
      window.location.reload()
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center font-mono">
      <div className="absolute inset-0 bg-grid opacity-5"></div>
      <div className="text-center relative z-10">
        <RefreshCw className="w-16 h-16 text-[#00d4ff] animate-spin mx-auto mb-6 glow-cyan" />
        <p className="text-[#00d4ff] text-xs font-black uppercase tracking-[1em] animate-pulse">Synchronizing_Matrix...</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#020617] lg:pl-64 text-white font-mono selection:bg-[#00d4ff]/30">
      <div className="fixed inset-0 bg-grid opacity-10 pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-6 py-10 relative z-10">
        
        {/* Navigation & Hard Reset Control */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 mb-12 border-b border-white/5 pb-10">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Activity className="w-6 h-6 text-[#00ff88] glow-green" />
              <h1 className="text-4xl font-black text-white uppercase tracking-tighter">Neural_Terminal</h1>
            </div>
            <p className="text-white/40 text-[10px] uppercase font-bold tracking-[0.5em]">High_Performance_Unified_Hub_v2.5</p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4">
            <button 
              onClick={handleManualPurge}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 text-[10px] font-black uppercase hover:bg-red-500/20 transition-all glow-red"
            >
              <ZapOff className="w-4 h-4" /> Purge_System
            </button>
            <div className="flex bg-[#0B1121]/80 backdrop-blur-md p-1.5 rounded-2xl border border-white/5 gap-2">
              {[
                { id: 'OVERVIEW', icon: LayoutDashboard },
                { id: 'BEHAVIORAL', icon: Brain },
                { id: 'CHRONO', icon: Clock },
                { id: 'MISTAKES', icon: AlertTriangle }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all ${activeTab === tab.id ? 'bg-[#00d4ff] text-black shadow-[0_0_20px_#00d4ff]' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
                >
                  <tab.icon className="w-3.5 h-3.5" /> {tab.id}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content Area */}
        <AnimatePresence mode="wait">
          {activeTab === 'OVERVIEW' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-10">
              
              {/* Top Indices */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: 'Darr_Index', value: metrics.darrIndex !== 0 ? metrics.darrIndex : 'ZERO', color: '#fbbf24', icon: Brain, status: metrics.darrIndex > 0 ? 'ACTIVE' : 'NULL' },
                  { label: 'Tilt_Factor', value: metrics.tiltFactor !== 0 ? `${metrics.tiltFactor}%` : 'ZERO', color: '#f97316', icon: TrendingDown, status: metrics.tiltFactor > 0 ? 'DETECTED' : 'STABLE' },
                  { label: 'Panic_Spikes', value: metrics.panicSpikes !== 0 ? metrics.panicSpikes : 'ZERO', color: '#ef4444', icon: Flame, status: metrics.panicSpikes > 0 ? 'CRITICAL' : 'ZERO' },
                  { label: 'Avg_Precision', value: metrics.precision !== 0 ? `${metrics.precision}%` : 'ZERO', color: '#10b981', icon: Target, status: metrics.precision > 0 ? 'SYNCED' : 'INITIALIZING' }
                ].map(stat => (
                  <div key={stat.label} className="glass rounded-3xl p-6 border-white/5 hover:border-[#00d4ff]/20 transition-all flex flex-col gap-5 relative group">
                     <div className="flex justify-between items-start relative z-10">
                        <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">{stat.label}</span>
                        <stat.icon className="w-4 h-4" style={{ color: stat.color }} />
                     </div>
                     <div>
                        <p className="text-4xl font-black text-white tracking-tighter">{stat.value}</p>
                        <span className="text-[9px] font-black px-2 py-0.5 rounded uppercase mt-3 inline-block border border-white/10" style={{ color: stat.color, backgroundColor: `${stat.color}10` }}>{stat.status}</span>
                     </div>
                     <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl"></div>
                  </div>
                ))}
              </div>

              {/* Main Matrix Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Timeline Window */}
                <div className="lg:col-span-2 glass rounded-[40px] p-8 border-white/5 bg-[#0B1121]/50 backdrop-blur-3xl overflow-hidden relative">
                   <div className="flex items-center justify-between mb-10">
                      <h3 className="text-sm font-black uppercase tracking-[0.3em] text-[#00d4ff] flex items-center gap-3">
                        <Terminal className="w-4 h-4" /> Neural_Timeline_Window
                      </h3>
                      <div className="flex items-center gap-3">
                         <div className="w-2 h-2 rounded-full bg-[#00ff88] animate-pulse"></div>
                         <span className="text-[9px] text-white/30 uppercase font-bold">Awaiting_Active_Telemetry</span>
                      </div>
                   </div>
                   <div className="h-[300px] flex items-center justify-center border border-dashed border-white/5 rounded-3xl bg-white/5">
                      <div className="text-center opacity-30">
                         <Network className="w-12 h-12 mx-auto mb-4" />
                         <p className="text-[10px] font-black uppercase">Start a Simulation to Begin Data Generation</p>
                      </div>
                   </div>
                </div>

                {/* Behavioral Mirror */}
                <div className="glass rounded-[40px] p-8 border-white/5 bg-[#0B1121]/50 backdrop-blur-3xl">
                   <h3 className="text-sm font-black uppercase tracking-[0.3em] text-[#00ff88] mb-10 flex items-center gap-3">
                     <Shield className="w-4 h-4" /> Psychological_Mirror
                   </h3>
                   <div className="space-y-8">
                      {[
                        { label: 'Hesitation_Nodes', val: 0, goal: 100, color: '#3b82f6' },
                        { label: 'Focus_Persistence', val: 0, goal: 100, color: '#10b981' },
                        { label: 'Decision_Velocity', val: 0, goal: 100, color: '#a855f7' },
                      ].map(bar => (
                        <div key={bar.label} className="space-y-3">
                          <div className="flex justify-between text-[11px] font-black uppercase tracking-widest text-white/40">
                             <span>{bar.label}</span>
                             <span>{bar.val}%</span>
                          </div>
                          <div className="h-2 bg-white/5 rounded-full overflow-hidden border border-white/5">
                             <div className="h-full bg-current rounded-full" style={{ color: bar.color, width: '4%' }}></div>
                          </div>
                        </div>
                      ))}
                   </div>
                   <div className="mt-20 p-6 rounded-3xl bg-[#020617] border border-white/5 text-[10px] text-white/30 leading-relaxed uppercase tracking-widest font-bold text-center">
                     Initial Benchmarking Required. <br /> <span className="text-[#00ff88]">Zero Data State</span>
                   </div>
                </div>

              </div>

              {/* Action Footer */}
              <div className="glass rounded-[40px] p-10 border-[#7c3aed]/30 bg-[#7c3aed]/5 flex flex-col md:flex-row items-center justify-between gap-10">
                 <div className="flex items-center gap-8">
                    <div className="w-20 h-20 rounded-3xl bg-[#7c3aed]/10 border border-[#7c3aed]/40 flex items-center justify-center glow-purple">
                       <Zap className="w-10 h-10 text-[#7c3aed]" />
                    </div>
                    <div>
                       <h4 className="text-2xl font-black text-white uppercase tracking-tighter mb-2">Initialize_Strategic_Path</h4>
                       <p className="text-[10px] text-white/40 uppercase font-black tracking-[0.4em]">AI_MENTOR: Awaiting_Simulation_Data</p>
                    </div>
                 </div>
                 <Link href="/upload" className="w-full md:w-auto px-12 py-4 bg-[#7c3aed] text-white font-black rounded-2xl text-xs uppercase tracking-[0.3em] hover:shadow-[0_0_40px_rgba(124,58,237,0.5)] transition-all flex items-center justify-center gap-4">
                   Capture New Test <ArrowRight className="w-4 h-4" />
                 </Link>
              </div>

            </motion.div>
          )}

          {activeTab === 'BEHAVIORAL' && (
             <div className="min-h-[400px] flex items-center justify-center opacity-40">
                <p className="text-xl font-black uppercase tracking-[1em]">Behavioral_Buffer_Empty</p>
             </div>
          )}
        </AnimatePresence>

      </div>
    </div>
  )
}
