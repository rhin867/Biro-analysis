'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Activity, Brain, Clock, Zap, Target, Flame, TrendingDown, 
  Terminal, RefreshCw, AlertTriangle, LayoutDashboard, Database
} from 'lucide-react'
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip
} from 'recharts'
import { supabase } from '@/lib/supabase/client'

const NEURAL_TIMELINE = [
  { min: 0, arousal: 40, focus: 85 },
  { min: 30, arousal: 45, focus: 82 },
  { min: 60, arousal: 60, focus: 75 },
  { min: 90, arousal: 85, focus: 60 },
  { min: 120, arousal: 70, focus: 65 },
  { min: 150, arousal: 95, focus: 40 },
  { min: 180, arousal: 80, focus: 55 },
]

const SUBJECT_MASTERY = [
  { sub: 'PHYSICS', mastery: 68, color: '#3b82f6' },
  { sub: 'CHEMISTRY', mastery: 82, color: '#10b981' },
  { sub: 'MATHEMATICS', mastery: 45, color: '#a855f7' },
]

export default function MasterAnalyticsHub() {
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'BEHAVIORAL' | 'CHRONO' | 'MISTAKES'>('OVERVIEW')
  const [loading, setLoading] = useState(true)

  const handleNeuralPurge = async () => {
    if (!confirm('SYSTEM_WARNING: THIS_WILL_ERASE_ALL_LOCAL_BUFFERS. PROCEED?')) return
    localStorage.clear()
    alert('NEURAL_PURGE_COMPLETE: LOCAL_CACHE_ZEROED')
    window.location.reload()
  }

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1500)
    return () => clearTimeout(timer)
  }, [])

  if (loading) return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center font-mono">
      <div className="text-center">
        <RefreshCw className="w-16 h-16 text-[#00d4ff] animate-spin mx-auto mb-6 glow-cyan" />
        <p className="text-[#00d4ff] text-xs font-black uppercase tracking-[0.5em] animate-pulse">Synchronizing_Neural_Data...</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#020617] lg:pl-64 text-white font-mono selection:bg-[#00d4ff]/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative">
        
        {/* Navigation / Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-10 border-b border-white/5 pb-8">
          <div className="flex items-center justify-between w-full lg:w-auto">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Activity className="w-6 h-6 text-[#00ff88] glow-green" />
                <h1 className="text-3xl font-black text-white uppercase tracking-tighter">Master_Engine</h1>
              </div>
              <p className="text-white/40 text-[10px] uppercase font-bold tracking-widest">Unified_Behavioral_Analytics_Stream_v4.2</p>
            </div>
            <button 
              onClick={handleNeuralPurge}
              className="lg:hidden p-2 rounded-lg bg-red-500/10 border border-red-500/30 text-red-500"
              title="PURGE_SYSTEM"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4">
            <button 
              onClick={handleNeuralPurge}
              className="hidden lg:flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-[9px] font-black uppercase hover:bg-red-500/20 transition-all"
            >
              <RefreshCw className="w-3 h-3" /> Purge_Neural_State
            </button>
            <div className="flex bg-[#0B1121] p-1 rounded-xl border border-white/5 gap-2">
              {[
                { id: 'OVERVIEW', icon: LayoutDashboard },
                { id: 'BEHAVIORAL', icon: Brain },
                { id: 'CHRONO', icon: Clock },
                { id: 'MISTAKES', icon: AlertTriangle }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-[10px] font-black uppercase transition-all ${activeTab === tab.id ? 'bg-[#00d4ff] text-black shadow-[0_0_20px_#00d4ff]' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
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
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-8">
              
              {/* Top Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: 'Darr_Index', value: '42/100', color: '#fbbf24', icon: Brain, status: 'MODERATE' },
                  { label: 'Tilt_Factor', value: '18%', color: '#f97316', icon: TrendingDown, status: 'STABLE' },
                  { label: 'Panic_Spikes', value: '02', color: '#ef4444', icon: Flame, status: 'CRITICAL' },
                  { label: 'Avg_Precision', value: '74%', color: '#10b981', icon: Target, status: 'OPTIMAL' }
                ].map(stat => (
                  <div key={stat.label} className="glass rounded-2xl p-5 border-white/5 hover:border-white/10 transition-all flex flex-col gap-4 relative overflow-hidden group">
                     <div className="flex justify-between items-start relative z-10">
                        <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">{stat.label}</span>
                        <stat.icon className="w-4 h-4" style={{ color: stat.color }} />
                     </div>
                     <div className="relative z-10">
                        <p className="text-3xl font-black text-white">{stat.value}</p>
                        <span className="text-[8px] font-black px-1.5 py-0.5 rounded uppercase mt-2 inline-block border border-white/10" style={{ color: stat.color, backgroundColor: `${stat.color}15` }}>{stat.status}</span>
                     </div>
                     <div className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-transparent via-white/10 to-transparent w-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </div>
                ))}
              </div>

              {/* Main Charts Row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Neural Timeline */}
                <div className="glass rounded-3xl p-6 border-white/5 relative overflow-hidden bg-[#0B1121]/50 backdrop-blur-xl">
                   <div className="flex items-center justify-between mb-8">
                      <h3 className="text-xs font-black uppercase tracking-widest text-[#00d4ff] flex items-center gap-2">
                        <Terminal className="w-3.5 h-3.5" /> Neural_Timeline_Audit
                      </h3>
                      <span className="text-[8px] text-white/20 uppercase font-black tracking-widest">RealTime_Data_Feed</span>
                   </div>
                   <ResponsiveContainer width="100%" height={260}>
                      <AreaChart data={NEURAL_TIMELINE}>
                        <defs>
                          <linearGradient id="colorFocus" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#00d4ff" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#00d4ff" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
                        <XAxis dataKey="min" tick={{ fill: '#ffffff40', fontSize: 10 }} tickFormatter={v => `${v}m`} />
                        <YAxis tick={{ fill: '#ffffff40', fontSize: 10 }} />
                        <Tooltip contentStyle={{ background: '#0B1121', border: '1px solid #ffffff10', borderRadius: '12px', fontSize: '10px' }} />
                        <Area type="monotone" dataKey="focus" stroke="#00d4ff" fillOpacity={1} fill="url(#colorFocus)" strokeWidth={3} />
                        <Area type="monotone" dataKey="arousal" stroke="#ef4444" fill="transparent" strokeWidth={2} strokeDasharray="5 5" />
                      </AreaChart>
                   </ResponsiveContainer>
                </div>

                {/* Subject Mastery Heatmap */}
                <div className="glass rounded-3xl p-6 border-white/5 bg-[#0B1121]/50">
                   <div className="flex items-center justify-between mb-8">
                      <h3 className="text-xs font-black uppercase tracking-widest text-[#00ff88] flex items-center gap-2">
                        <Target className="w-3.5 h-3.5" /> Subject_Mastery_Matrix
                      </h3>
                   </div>
                   <div className="space-y-6">
                      {SUBJECT_MASTERY.map(sub => (
                        <div key={sub.sub} className="space-y-2">
                           <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                              <span>{sub.sub}</span>
                              <span style={{ color: sub.color }}>{sub.mastery}%</span>
                           </div>
                           <div className="h-2 bg-white/5 rounded-full overflow-hidden border border-white/5">
                              <motion.div 
                                className="h-full rounded-full" 
                                initial={{ width: 0 }} animate={{ width: `${sub.mastery}%` }} 
                                style={{ backgroundColor: sub.color, boxShadow: `0 0 10px ${sub.color}60` }}
                              />
                           </div>
                        </div>
                      ))}
                   </div>
                   <div className="mt-10 p-4 rounded-2xl bg-[#020617] border border-white/5 text-[9px] text-white/40 leading-relaxed uppercase tracking-wider font-bold">
                     <span className="text-[#00ff88] block mb-1">STRATEGIC_ADVICE:</span>
                     Neural load in [MATHEMATICS] is suboptimal. Recommend [Vectors_Interrogation] session to stabilize proficiency.
                   </div>
                </div>

              </div>

              {/* Action Plan Strip */}
              <div className="glass rounded-3xl p-8 border-[#7c3aed]/20 bg-[#7c3aed]/5 flex flex-col md:flex-row items-center justify-between gap-10">
                 <div className="flex items-center gap-6">
                    <div className="w-16 h-16 rounded-2xl bg-[#7c3aed]/10 border border-[#7c3aed]/40 flex items-center justify-center glow-purple">
                       <Zap className="w-8 h-8 text-[#7c3aed]" />
                    </div>
                    <div>
                       <h4 className="text-xl font-black text-[#a855f7] uppercase tracking-tighter mb-1">Strategic_Next_Steps</h4>
                       <p className="text-[10px] text-white/40 uppercase font-black tracking-widest">AI_MENTOR: READY_TO_EXECUTE</p>
                    </div>
                 </div>
                 <button className="w-full md:w-auto px-10 py-3 bg-[#7c3aed] text-white font-black rounded-xl text-xs uppercase tracking-widest hover:shadow-[0_0_30px_#7c3aed] transition-all">Generate_Prep_Plan</button>
              </div>

            </motion.div>
          )}

          {activeTab === 'BEHAVIORAL' && (
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20 glass rounded-3xl border-white/5">
                <Brain className="w-20 h-20 text-[#00d4ff] mx-auto mb-6 opacity-20" />
                <h3 className="text-xl font-black uppercase text-white/40">Detailed_Psychological_Stream_Initializing...</h3>
             </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  )
}
