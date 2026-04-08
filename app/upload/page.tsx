'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { UploadCloud, FileText, Settings, Key, CheckCircle, Brain, RefreshCw, X } from 'lucide-react'
import { parsePdfToCbt, ParsedQuestion } from '@/lib/pdfEngine'

export default function UploadDashboard() {
  const [file, setFile] = useState<File | null>(null)
  const [status, setStatus] = useState<'IDLE' | 'PARSING' | 'COMPLETED'>('IDLE')
  const [progressMsg, setProgressMsg] = useState('')
  const [progressPct, setProgressPct] = useState(0)
  const [questions, setQuestions] = useState<ParsedQuestion[]>([])

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFile(e.dataTransfer.files[0])
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

  return (
    <div className="min-h-screen bg-[#0F172A] lg:pl-64">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-xl bg-blue-500/15 flex items-center justify-center">
              <UploadCloud className="w-4 h-4 text-blue-400" />
            </div>
            <h1 className="text-2xl font-bold text-white">Engine Workshop</h1>
            <span className="text-[10px] px-2 py-0.5 bg-yellow-500/20 border border-yellow-500/30 text-yellow-400 rounded font-bold">BETA</span>
          </div>
          <p className="text-white/40 text-sm">Upload raw PDFs. Extract CBT mocks offline.</p>
        </motion.div>

        {status === 'IDLE' && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            className="w-full h-64 border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center bg-white/3 hover:bg-white/5 transition-colors cursor-pointer group"
            data-testid="pdf-upload-dropzone"
            id="pdf-upload-dropzone"
            aria-label="Upload PDF Area"
          >
            <div className="w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <FileText className="w-8 h-8 text-blue-400" />
            </div>
            {file ? (
              <div className="text-center">
                <p className="text-lg font-bold text-emerald-400 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" /> {file.name}
                </p>
                <p className="text-sm text-white/40 mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB • Ready to slice</p>
                <button onClick={(e) => { e.stopPropagation(); setFile(null) }} className="mt-4 text-xs text-red-400 hover:underline">Clear selection</button>
              </div>
            ) : (
              <div className="text-center">
                <p className="text-lg font-bold text-white mb-1">Drag & drop your Mock Test PDF</p>
                <p className="text-sm text-white/40 mb-4">or click to browse from device</p>
                <label className="px-6 py-2 bg-white/10 hover:bg-white/15 rounded-lg text-sm text-white cursor-pointer transition-colors shadow-lg" aria-label="Select File Button">
                  Select File
                  <input type="file" id="upload-input" data-testid="upload-input" className="hidden" accept=".pdf" onChange={(e) => {
                    if (e.target.files && e.target.files[0]) setFile(e.target.files[0])
                  }} />
                </label>
              </div>
            )}
          </motion.div>
        )}

        {status === 'PARSING' && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass rounded-2xl p-8 text-center neon-border-blue">
            <RefreshCw className="w-12 h-12 text-blue-400 mx-auto mb-6 animate-spin" />
            <h2 className="text-xl font-bold text-white mb-2">Slicing Architecture</h2>
            <p className="text-white/40 text-sm mb-8">{progressMsg}</p>
            <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden border border-white/5">
              <motion.div 
                className="h-full bg-gradient-to-r from-blue-500 to-violet-500" 
                initial={{ width: 0 }} animate={{ width: `${progressPct}%` }} 
                transition={{ duration: 0.3 }}
              />
            </div>
            <p className="text-[10px] text-white/30 font-mono mt-3 text-right">{progressPct}%</p>
          </motion.div>
        )}

        {status === 'COMPLETED' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="glass rounded-2xl p-6 mb-6 border-emerald-500/20 bg-emerald-500/5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-emerald-400 flex items-center gap-2 mb-1">
                    <CheckCircle className="w-5 h-5" /> Extraction Successful
                  </h2>
                  <p className="text-sm text-white/60">Sliced {questions.length} questions perfectly.</p>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setStatus('IDLE')} className="px-4 py-2 border border-white/10 rounded-xl text-sm text-white/60 hover:text-white transition-colors">Start Over</button>
                  <button id="btn-begin-cbt" data-testid="btn-begin-cbt" aria-label="Begin CBT Attempt" className="px-5 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:scale-105 transition-transform text-white rounded-xl text-sm font-bold shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                    Begin CBT Attempt
                  </button>
                </div>
              </div>
            </div>

            <h3 className="text-sm font-bold text-white/50 mb-4 px-2 uppercase tracking-wide">Extracted Slices Preview</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {questions.map(q => (
                <div key={q.id} className="glass border border-white/10 rounded-xl overflow-hidden p-2">
                  <div className="flex justify-between items-center mb-2 px-2 pt-1 text-xs text-white/40">
                    <span className="font-bold text-blue-400">Q{q.qNumber}</span>
                    <span className="bg-white/5 border border-white/10 px-1.5 py-0.5 rounded">{q.subject}</span>
                  </div>
                  <div className="bg-white rounded-lg p-2 overflow-hidden h-32 flex items-center justify-center">
                    <img src={q.imageUrl} alt={`Question ${q.qNumber}`} className="max-w-full max-h-full object-contain" />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {file && status === 'IDLE' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6 flex justify-end">
            <button 
              id="btn-finalize-extract"
              data-testid="btn-finalize-extract"
              aria-label="Finalize and Extract Mock Test"
              onClick={handleConvert}
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl shadow-[0_0_20px_rgba(37,99,235,0.4)] hover:scale-105 transition-all glow-blue group flex items-center gap-2"
            >
              <Brain className="w-5 h-5 group-hover:animate-pulse" /> Finalize & Extract
            </button>
          </motion.div>
        )}

      </div>
    </div>
  )
}
