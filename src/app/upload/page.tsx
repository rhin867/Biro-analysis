'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { UploadCloud, FileText, Settings, Key, CheckCircle, Brain, RefreshCw, X, Zap, ArrowRight } from 'lucide-react'
import { parsePdfToCbt, ParsedQuestion } from '@/lib/pdfEngine'
import { useRouter } from 'next/navigation'

export default function UploadDashboard() {
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null)
  const [status, setStatus] = useState<'IDLE' | 'PARSING' | 'COMPLETED'>('IDLE')
  const [progressMsg, setProgressMsg] = useState('')
  const [progressPct, setProgressPct] = useState(0)
  const [questions, setQuestions] = useState<ParsedQuestion[]>([])

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0]
      if (droppedFile.type === 'application/pdf') {
        setFile(droppedFile)
      } else {
        alert('Currently only PDF files are supported for CBT extraction.')
      }
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
      setStatus('COMPLETED')
    } catch (err) {
      console.error(err)
      setStatus('IDLE')
      alert('Error parsing PDF.')
    }
  }

  const handleBeginCBT = () => {
    const testId = `up_${Date.now()}`
    // Store questions in localStorage for the CBT engine to pick up
    localStorage.setItem(`test_${testId}`, JSON.stringify(questions))
    router.push(`/cbt/${testId}`)
  }

  return (
    <div className="min-h-screen bg-[#020617] lg:pl-64 text-white font-mono selection:bg-[#00d4ff]/30">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
        <div className="absolute inset-0 bg-grid opacity-10 pointer-events-none"></div>

        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8 relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-[#00d4ff]/10 border border-[#00d4ff]/30 flex items-center justify-center glow-cyan">
              <UploadCloud className="w-5 h-5 text-[#00d4ff]" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-[#00d4ff] text-glow-cyan uppercase tracking-tighter">Engine Workshop</h1>
              <p className="text-white/40 text-[10px] uppercase tracking-widest font-bold">PDF_TO_CBT_SYNTHESIZER_v2.0</p>
            </div>
          </div>
        </motion.div>

        {status === 'IDLE' && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            className="w-full h-80 border-2 border-dashed border-[#00d4ff]/20 rounded-2xl flex flex-col items-center justify-center bg-[#0B1121]/50 hover:bg-[#00d4ff]/5 transition-all cursor-pointer group relative overflow-hidden glass"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-[#00d4ff]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            
            <div className="w-20 h-20 rounded-2xl bg-[#00d4ff]/10 border border-[#00d4ff]/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform glow-cyan">
              <FileText className="w-10 h-10 text-[#00d4ff]" />
            </div>

            {file ? (
              <div className="text-center relative z-10">
                <p className="text-xl font-black text-[#00ff88] flex items-center gap-2 text-glow-green uppercase tracking-wider">
                  <CheckCircle className="w-6 h-6" /> {file.name}
                </p>
                <p className="text-sm text-white/40 mt-2 font-bold select-none tracking-widest uppercase">{(file.size / 1024 / 1024).toFixed(2)} MB • READY_FOR_EXTRACTION</p>
                <button onClick={(e) => { e.stopPropagation(); setFile(null) }} className="mt-6 text-[10px] text-[#ef4444] border border-[#ef4444]/30 px-3 py-1 rounded bg-[#ef4444]/5 hover:bg-[#ef4444]/20 uppercase font-black transition-all">Abort Selection</button>
              </div>
            ) : (
              <div className="text-center relative z-10">
                <p className="text-xl font-black text-white mb-2 uppercase tracking-tight">Awaiting Neural Input</p>
                <p className="text-xs text-white/40 mb-6 uppercase tracking-[0.2em]">Drag & Drop Mock PDF or Browse Local Nodes</p>
                <label className="px-8 py-3 bg-[#00d4ff]/10 border border-[#00d4ff]/40 hover:bg-[#00d4ff]/20 rounded-xl text-sm text-[#00d4ff] cursor-pointer transition-all shadow-[0_0_20px_rgba(0,212,255,0.2)] font-black uppercase tracking-widest" aria-label="Select File Button">
                  Select File
                  <input type="file" id="upload-input" className="hidden" accept=".pdf" onChange={(e) => {
                    if (e.target.files && e.target.files[0]) setFile(e.target.files[0])
                  }} />
                </label>
              </div>
            )}
            
            <div className="absolute bottom-4 left-0 right-0 text-center opacity-30 select-none">
              <span className="text-[8px] uppercase tracking-[0.5em] font-bold">SECURE_SANDBOX_ENCLAVE</span>
            </div>
          </motion.div>
        )}

        {status === 'PARSING' && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass rounded-2xl p-10 text-center border-[#00d4ff]/30 relative overflow-hidden bg-[#0B1121]/80">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#00d4ff] to-transparent animate-pulse"></div>
            <RefreshCw className="w-16 h-16 text-[#00d4ff] mx-auto mb-8 animate-spin drop-shadow-[0_0_15px_rgba(0,212,255,0.5)]" />
            <h2 className="text-2xl font-black text-white mb-2 uppercase tracking-tighter">Slicing Architecture</h2>
            <p className="text-[#00d4ff] text-[10px] mb-10 uppercase tracking-[0.3em] font-bold h-4">{progressMsg}</p>
            
            <div className="w-full h-4 bg-white/5 rounded-full overflow-hidden border border-white/10 p-0.5">
              <motion.div 
                className="h-full bg-gradient-to-r from-[#00d4ff] via-[#7c3aed] to-[#ff2d92] rounded-full shadow-[0_0_15px_rgba(0,212,255,0.5)]" 
                initial={{ width: 0 }} animate={{ width: `${progressPct}%` }} 
                transition={{ duration: 0.3 }}
              />
            </div>
            <div className="flex justify-between mt-3 px-1">
              <span className="text-[10px] text-white/20 uppercase font-black">EXTRACTING_MATRIX</span>
              <span className="text-[12px] text-[#00d4ff] font-black tracking-widest glow-cyan">{progressPct}%</span>
            </div>
          </motion.div>
        )}

        {status === 'COMPLETED' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
            <div className="glass rounded-2xl p-8 border-[#00ff88]/30 bg-[#00ff88]/5 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Zap className="w-12 h-12 text-[#00ff88]" />
              </div>
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                  <h2 className="text-2xl font-black text-[#00ff88] flex items-center gap-3 mb-2 text-glow-green uppercase tracking-tighter">
                    <CheckCircle className="w-7 h-7" /> Synthesis Complete
                  </h2>
                  <p className="text-sm text-white/60 tracking-wide font-bold uppercase">Mapped {questions.length} question nodes successfully into the CBT core.</p>
                </div>
                <div className="flex gap-4 w-full md:w-auto">
                  <button onClick={() => setStatus('IDLE')} className="flex-1 md:px-6 py-3 border border-white/10 rounded-xl text-xs text-white/40 hover:text-white uppercase font-black tracking-widest transition-all">Reset</button>
                  <button 
                    onClick={handleBeginCBT}
                    className="flex-1 md:px-8 py-3 bg-[#00ff88]/10 border border-[#00ff88]/50 hover:bg-[#00ff88]/20 transition-all text-[#00ff88] rounded-xl text-xs font-black uppercase tracking-[0.2em] glow-green flex items-center justify-center gap-2"
                  >
                    Launch Simulation <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-3 mb-6 px-2">
                <div className="h-0.5 flex-1 bg-gradient-to-r from-transparent to-white/10"></div>
                <h3 className="text-[10px] font-black text-white/30 uppercase tracking-[0.5em]">Slice_Preview_Manifest</h3>
                <div className="h-0.5 flex-1 bg-gradient-to-l from-transparent to-white/10"></div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {questions.map(q => (
                  <div key={q.id} className="glass border border-white/10 rounded-xl overflow-hidden p-3 hover:border-[#00d4ff]/40 transition-all group">
                    <div className="flex justify-between items-center mb-3 px-1 text-[10px] font-black uppercase tracking-widest">
                      <span className="text-[#00d4ff] scale-110">NODE_Q{q.qNumber.toString().padStart(2, '0')}</span>
                      <span className="bg-white/5 border border-white/10 px-2 py-0.5 rounded text-white/40 group-hover:text-glow-cyan transition-all">{q.subject}</span>
                    </div>
                    <div className="bg-[#020617]/80 rounded-lg p-2 overflow-hidden h-40 flex items-center justify-center border border-white/5">
                      <img src={q.imageUrl} alt={`Question ${q.qNumber}`} className="max-w-full max-h-full object-contain filter contrast-125 brightness-110" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {file && status === 'IDLE' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-8 flex justify-center">
            <button 
              onClick={handleConvert}
              className="w-full py-4 bg-[#00d4ff]/10 border border-[#00d4ff]/50 text-[#00d4ff] font-black rounded-2xl shadow-[0_0_30px_rgba(0,212,255,0.2)] hover:bg-[#00d4ff]/20 transition-all glow-cyan group flex items-center justify-center gap-3 uppercase tracking-[0.4em] relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              <Brain className="w-6 h-6 group-hover:scale-125 transition-transform" /> Synthesize Grid
            </button>
          </motion.div>
        )}

      </div>
    </div>
  )
}
