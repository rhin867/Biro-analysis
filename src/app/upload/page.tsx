'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  UploadCloud, FileText, Brain, RefreshCw, CheckCircle, 
  Zap, ArrowRight, Shield, Activity, BarChart3, Layers
} from 'lucide-react'
import { parsePdfToCbt, ParsedQuestion } from '@/lib/pdfEngine'
import { useRouter } from 'next/navigation'

export default function UploadDashboard() {
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null)
  const [status, setStatus] = useState<'IDLE' | 'PARSING' | 'REVIEW' | 'COMPLETED'>('IDLE')
  const [progressMsg, setProgressMsg] = useState('IDLE_SYSTEM_READY')
  const [progressPct, setProgressPct] = useState(0)
  const [questions, setQuestions] = useState<ParsedQuestion[]>([])

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    if (e.dataTransfer.files?.[0]) {
      const droppedFile = e.dataTransfer.files[0]
      if (droppedFile.type === 'application/pdf') setFile(droppedFile)
      else alert('PROTOCOL_ERROR: ONLY_PDF_FILES_ACCEPTED')
    }
  }

  const handleConvert = async () => {
    if (!file) return
    setStatus('PARSING')
    try {
      const q = await parsePdfToCbt(file, (msg, pct) => {
        setProgressMsg(msg)
        setProgressPct(pct)
      })
      setQuestions(q)
      setStatus('REVIEW')
    } catch (err: any) {
      console.error(err)
      setStatus('IDLE')
      alert(`ENGINE_CRASH: ${err.message}`)
    }
  }

  const handleBeginCBT = () => {
    const testId = `up_${Date.now()}`
    localStorage.setItem(`test_${testId}`, JSON.stringify(questions))
    router.push(`/cbt/${testId}`)
  }

  return (
    <div className="min-h-screen bg-[#020617] lg:pl-64 text-white font-mono selection:bg-[#00d4ff]/30">
      {/* Background Grid */}
      <div className="fixed inset-0 bg-[url('/grid.svg')] bg-center opacity-10 pointer-events-none"></div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10">
        
        {/* Header Section */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
          <div className="flex items-center gap-4 mb-3">
            <div className="w-12 h-12 rounded-2xl bg-[#00d4ff]/10 border border-[#00d4ff]/30 flex items-center justify-center glow-cyan">
              <Layers className="w-6 h-6 text-[#00d4ff]" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-[#00d4ff] text-glow-cyan uppercase tracking-tighter">Synthesis Terminal</h1>
              <p className="text-white/40 text-[10px] uppercase font-bold flex items-center gap-2">
                <Shield className="w-3 h-3 text-[#00ff88]" /> ENGINE_AUTH_SECURE_V2.5
              </p>
            </div>
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          {status === 'IDLE' && (
            <motion.div 
              key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              className="w-full h-[450px] border-2 border-dashed border-[#00d4ff]/20 rounded-3xl flex flex-col items-center justify-center bg-[#0B1121]/50 hover:bg-[#00d4ff]/5 transition-all cursor-pointer group glass mt-4"
            >
              <FileText className="w-20 h-20 text-[#00d4ff]/40 mb-6 group-hover:text-[#00d4ff] group-hover:scale-110 transition-all duration-500 glow-cyan" />
              
              {file ? (
                <div className="text-center">
                  <p className="text-2xl font-black text-[#00ff88] text-glow-green uppercase mb-2">{file.name}</p>
                  <p className="text-sm text-white/30 font-bold uppercase tracking-widest">{(file.size / 1024 / 1024).toFixed(2)} MB • BUFFER_LOADED</p>
                  <div className="flex gap-4 justify-center mt-10">
                     <button onClick={() => setFile(null)} className="px-6 py-2 text-[10px] text-red-400 border border-red-400/30 rounded-lg hover:bg-red-400/10 uppercase font-black transition-all">Clear</button>
                     <button onClick={handleConvert} className="px-10 py-3 bg-[#00d4ff] text-black font-black rounded-lg hover:shadow-[0_0_30px_#00d4ff] transition-all uppercase text-xs tracking-widest">Synthesize</button>
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <p className="text-xl font-black text-white mb-2 uppercase tracking-tight">Neural Input Required</p>
                  <p className="text-xs text-white/40 uppercase tracking-[0.2em] mb-8">Drop Mock Test PDF for behavioral indexing</p>
                  <label className="px-10 py-3 bg-[#00d4ff]/10 border border-[#00d4ff]/40 hover:bg-[#00d4ff]/20 rounded-xl text-sm text-[#00d4ff] cursor-pointer transition-all shadow-[0_0_20px_rgba(0,212,255,0.2)] font-black uppercase tracking-widest">
                    Load Component
                    <input type="file" className="hidden" accept=".pdf" onChange={(e) => e.target.files?.[0] && setFile(e.target.files[0])} />
                  </label>
                </div>
              )}
            </motion.div>
          )}

          {status === 'PARSING' && (
            <motion.div key="parsing" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass rounded-3xl p-16 text-center border-[#00d4ff]/20 relative overflow-hidden bg-[#0B1121]/80 max-w-2xl mx-auto h-[450px] flex flex-col justify-center">
              <RefreshCw className="w-24 h-24 text-[#00d4ff] mx-auto mb-10 animate-spin glow-cyan" />
              <h2 className="text-3xl font-black text-white mb-4 uppercase tracking-tighter">Deconstructing PDF</h2>
              <p className="text-[#00d4ff] text-xs mb-10 uppercase tracking-[0.4em] font-bold animate-pulse">{progressMsg}</p>
              
              <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden border border-white/10">
                <motion.div 
                  className="h-full bg-gradient-to-r from-[#00d4ff] to-[#7c3aed]" 
                  initial={{ width: 0 }} animate={{ width: `${progressPct}%` }} 
                />
              </div>
            </motion.div>
          )}

          {status === 'REVIEW' && (
            <motion.div key="review" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-10">
              <div className="glass border border-[#00ff88]/30 bg-[#00ff88]/5 rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-8">
                <div>
                  <h2 className="text-3xl font-black text-[#00ff88] text-glow-green uppercase tracking-tighter mb-2">Synthesis_Ready</h2>
                  <p className="text-sm text-white/50 font-bold uppercase">Engine categorized {questions.length} nodes successfully.</p>
                </div>
                <div className="flex gap-4">
                  <button onClick={() => setStatus('IDLE')} className="px-8 py-3 border border-white/10 rounded-xl text-xs font-black uppercase text-white/40 hover:text-white">Reject</button>
                  <button onClick={handleBeginCBT} className="px-12 py-3 bg-[#00ff88] text-black rounded-xl text-xs font-black uppercase tracking-widest hover:shadow-[0_0_40px_rgba(0,255,136,0.6)] transition-all flex items-center gap-3">
                    Initialize Core <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {questions.map((q, idx) => (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}
                    key={q.id} className="glass group border border-white/5 hover:border-[#00d4ff]/30 rounded-2xl p-4 transition-all"
                  >
                    <div className="flex justify-between items-center mb-4">
                       <span className="text-[#00d4ff] text-[10px] font-black uppercase tracking-widest">Node_Q{q.qNumber}</span>
                       <span className="px-2 py-0.5 rounded border border-white/10 bg-white/5 text-[9px] text-white/40 group-hover:text-[#00d4ff] uppercase font-black">{q.subject}</span>
                    </div>
                    <div className="aspect-video bg-[#020617] rounded-xl border border-white/5 mb-4 overflow-hidden flex items-center justify-center p-2">
                       <img src={q.imageUrl} alt="Q" className="max-w-full max-h-full object-contain filter contrast-125" />
                    </div>
                    <p className="text-[10px] text-white/30 line-clamp-2 uppercase leading-relaxed font-bold">{q.extractedText}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  )
}
