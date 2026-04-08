'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Activity, Clock, ShieldCheck, ShieldAlert, MonitorPlay, Zap, Power, RotateCcw } from 'lucide-react'
import Link from 'next/link'

export default function ExternalTrackerPage() {
  const [extensionActive, setExtensionActive] = useState(false)
  const [history, setHistory] = useState([
    { id: '1', date: 'Yesterday', platform: 'Mathongo', score: 215, panicSpikes: 2 },
    { id: '2', date: '3 days ago', platform: 'NTA Official', score: 180, panicSpikes: 5 }
  ])

  useEffect(() => {
    // Check if extension is active via localStorage or window messaging
    const isExt = localStorage.getItem('biro_ext_active') === 'true'
    setExtensionActive(isExt)
  }, [])

  const toggleExtension = () => {
    const newState = !extensionActive
    setExtensionActive(newState)
    localStorage.setItem('biro_ext_active', String(newState))
  }

  return (
    <div className="min-h-screen bg-[#0F172A] lg:pl-64">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-xl bg-orange-500/15 flex items-center justify-center">
              <MonitorPlay className="w-4 h-4 text-orange-400" />
            </div>
            <h1 className="text-2xl font-bold text-white">External Test Engine</h1>
          </div>
          <p className="text-white/40 text-sm">Control the background tracker for 3rd-party exams (NTA, Mathongo, Allen).</p>
        </motion.div>

        {/* Control Center */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-8">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass rounded-2xl p-6 relative overflow-hidden group">
            <div className={`absolute inset-0 opacity-10 transition-colors duration-500 ${extensionActive ? 'bg-emerald-500' : 'bg-red-500'}`} />
            <h3 className="text-sm font-semibold text-white/70 mb-4 flex items-center gap-2 relative z-10">
              <Activity className="w-4 h-4" /> Global Tracking Status
            </h3>
            
            <div className="flex items-center justify-between mb-6 relative z-10">
              <div>
                <p className={`text-2xl font-black mb-1 ${extensionActive ? 'text-emerald-400 glow-green' : 'text-red-400 glow-red'}`}>
                  {extensionActive ? 'TRACKING ONLINE' : 'TRACKING OFFLINE'}
                </p>
                <p className="text-xs text-white/40">
                  {extensionActive ? 'Background service worker is sniffing X/Y coords.' : 'Extension is sleeping. No data is being recorded.'}
                </p>
              </div>
              <button onClick={toggleExtension} className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-105 ${extensionActive ? 'bg-emerald-500/20 border border-emerald-500/50' : 'bg-red-500/20 border border-red-500/50'}`}>
                <Power className={`w-6 h-6 ${extensionActive ? 'text-emerald-400' : 'text-red-400'}`} />
              </button>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-xl p-3 relative z-10">
              <p className="text-xs text-white/50 leading-relaxed">
                <strong className="text-white/80">How it works:</strong> You do NOT need to download anything else. The 4-Layer Chrome Extension you installed connects to this dashboard. Turn it ON, go to your external test platform, and take your test natively. We will pull the JSON report instantly.
              </p>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="glass rounded-2xl p-6 flex flex-col justify-center">
             <div className="text-center">
               <ShieldCheck className="w-12 h-12 text-blue-400 mx-auto mb-3" />
               <h3 className="text-lg font-bold text-white mb-2">Proctor Bypass Active</h3>
               <p className="text-sm text-white/40 mb-6">Our tracker exclusively uses DOM mutations and relative canvas framing to bypass extreme security portals.</p>
               
               <button onClick={() => alert('Forces a sync with the extension.')} className="px-5 py-2.5 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-400 rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-2 mx-auto">
                 <RotateCcw className="w-4 h-4" /> Force Extension Sync
               </button>
             </div>
          </motion.div>
        </div>

        {/* External History */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="glass rounded-2xl p-6">
           <h3 className="text-sm font-semibold text-white/70 mb-4 flex items-center gap-2">
             <Clock className="w-4 h-4 text-violet-400" /> External Test History
           </h3>
           <div className="space-y-3">
             {history.length > 0 ? history.map((h) => (
               <div key={h.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white/5 hover:bg-white/10 transition-colors rounded-xl border border-white/5">
                 <div className="mb-3 sm:mb-0">
                   <p className="text-sm font-bold text-white mb-1">{h.platform} Mock Test</p>
                   <p className="text-[10px] text-white/40">{h.date}</p>
                 </div>
                 <div className="flex items-center gap-6">
                   <div className="text-center">
                     <p className="text-xs text-white/30">Net Score</p>
                     <p className="text-sm font-black text-blue-400">{h.score}</p>
                   </div>
                   <div className="text-center">
                     <p className="text-xs text-white/30">Panic Spikes</p>
                     <p className="text-sm font-black text-red-400">{h.panicSpikes}</p>
                   </div>
                   <Link href="/behavioral" className="px-4 py-1.5 bg-white/10 hover:bg-white/20 text-xs font-bold text-white rounded-lg transition-colors">
                     Report
                   </Link>
                 </div>
               </div>
             )) : (
               <div className="p-8 text-center text-white/30 border border-dashed border-white/10 rounded-xl">
                 No external tests recorded yet.
               </div>
             )}
           </div>
        </motion.div>

      </div>
    </div>
  )
}
