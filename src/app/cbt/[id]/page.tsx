'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Clock, AlertCircle, Bookmark, Zap, ChevronLeft, ChevronRight, Send } from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'

type QStatus = 0 | 1 | 2 | 3 | 4

interface CBTQuestion {
  id: string
  number: number
  subject: string
  imageUrl: string
}

export default function CBTEnginePage() {
  const router = useRouter()
  const { id } = useParams()

  const [questions, setQuestions] = useState<CBTQuestion[]>([])
  const [currentQ, setCurrentQ] = useState(1)
  const [timeLeft, setTimeLeft] = useState(180 * 60)
  const [statuses, setStatuses] = useState<Record<number, QStatus>>({})
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [qTime, setQTime] = useState<Record<number, number>>({})
  const [qHesitations, setQHesitations] = useState<Record<number, number>>({})
  const [flowingMode, setFlowingMode] = useState(true)
  const isSubmitting = useRef(false)

  // Behavioral Logging
  const logEvent = async (type: string, payload: any = {}) => {
    try {
      await supabase.from('event_logs').insert({
        test_id: id as string,
        user_id: 'guest_user',
        event_type: type,
        payload: { ...payload, timestamp: Date.now() },
        client_timestamp: new Date().toISOString()
      })
    } catch (e) { console.warn('[Log] Dropped:', type) }
  }

  // Init
  useEffect(() => {
    // Clear state for fresh session
    console.log('--- Initializing Neural Session ---')
    
    const fetchQuestions = () => {
      const generateMocks = () => Array.from({ length: 75 }).map((_, i) => ({
        id: `q_${i + 1}`,
        number: i + 1,
        subject: i < 25 ? 'PHYSICS' : i < 50 ? 'CHEMISTRY' : 'MATHEMATICS',
        imageUrl: `https://placehold.co/800x400/1e293b/00d4ff?text=Question+${i + 1}`,
      }))

      if (id?.toString().startsWith('up_')) {
        const stored = localStorage.getItem(`test_${id}`)
        if (stored) return JSON.parse(stored).map((q: any) => ({
          id: q.id, number: q.qNumber, subject: q.subject, imageUrl: q.imageUrl
        }))
      }
      return generateMocks()
    }

    const q = fetchQuestions()
    setQuestions(q)
    setStatuses({ 1: 1 })
    logEvent('SESSION_INIT', { questionCount: q.length })
  }, [id])

  // Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(t => t > 0 ? t - 1 : 0)
      setQTime(prev => ({ ...prev, [currentQ]: (prev[currentQ] || 0) + 1 }))
    }, 1000)
    return () => clearInterval(timer)
  }, [currentQ])

  const handleNav = (n: number) => {
    if (n === currentQ || n < 1 || n > questions.length) return
    logEvent('QUESTION_NAV', { from: currentQ, to: n, timeOnPrev: qTime[currentQ] })
    setStatuses(prev => ({ ...prev, [currentQ]: prev[currentQ] || 1, [n]: prev[n] || 1 }))
    setCurrentQ(n)
  }

  const handleOptionSelect = (opt: string) => {
    logEvent('OPTION_SELECT', { q: currentQ, option: opt })
    if (answers[currentQ] && answers[currentQ] !== opt) {
      setQHesitations(h => ({ ...h, [currentQ]: (h[currentQ] || 0) + 1 }))
      logEvent('HESITATION', { q: currentQ })
    }
    setAnswers(prev => ({ ...prev, [currentQ]: opt }))
    
    if (flowingMode) {
      setStatuses(prev => ({ ...prev, [currentQ]: 2 }))
      setTimeout(() => handleNav(currentQ + 1), 300)
    }
  }

  const handleSaveNext = () => {
    setStatuses(prev => ({ ...prev, [currentQ]: answers[currentQ] ? 2 : 1 }))
    handleNav(currentQ + 1)
  }

  const handleClear = () => {
    logEvent('ANS_PURGE', { q: currentQ })
    const a = { ...answers }; delete a[currentQ]; setAnswers(a)
    setStatuses(prev => ({ ...prev, [currentQ]: 1 }))
  }

  const handleSubmit = async () => {
    if (isSubmitting.current) return
    isSubmitting.current = true
    logEvent('TEST_SUBMIT_START')
    router.push('/dashboard/master')
  }

  const currentQuestionData = questions[currentQ - 1]
  const fmtTime = (s: number) => {
    const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), secs = s % 60
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  if (questions.length === 0) return <div className="min-h-screen bg-[#020617] flex items-center justify-center font-mono text-[#00d4ff] animate-pulse">BOOTING_CORE...</div>

  return (
    <div className="min-h-screen bg-[#020617] text-white flex flex-col font-mono select-none overflow-hidden">
      {/* Header */}
      <header className="h-16 bg-[#0B1121] border-b border-[#00d4ff]/20 flex items-center justify-between px-6 z-20">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-[#00d4ff]/10 border border-[#00d4ff]/40 flex items-center justify-center font-bold text-[#00d4ff] glow-cyan">B</div>
          <span className="font-black tracking-[0.3em] text-xs uppercase text-[#00d4ff] hidden md:block">Neural_CBT_v4</span>
        </div>

        <div className="flex items-center gap-8">
           <div onClick={() => setFlowingMode(!flowingMode)} className={`flex items-center gap-2 px-3 py-1 cursor-pointer border rounded-md transition-all ${flowingMode ? 'bg-[#00ff88]/10 border-[#00ff88]/40 text-[#00ff88]' : 'bg-white/5 border-white/10 text-white/30'}`}>
              <Zap className="w-3 h-3" /> <span className="text-[10px] font-black uppercase">Flow_Active</span>
           </div>
           <div className="flex items-center gap-3 px-5 py-2 bg-red-500/10 border border-red-500/30 rounded-lg glow-red">
             <Clock className="w-4 h-4 text-red-500" />
             <span className="font-bold text-red-500 text-xl tracking-widest">{fmtTime(timeLeft)}</span>
           </div>
           <button onClick={handleSubmit} className="px-8 py-2 bg-[#00d4ff] text-black font-black rounded uppercase text-xs tracking-widest hover:shadow-[0_0_20px_#00d4ff] transition-all">End_Session</button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Main Area */}
        <main className="flex-1 flex flex-col border-r border-white/5 relative bg-[url('/grid.svg')] bg-center bg-opacity-5">
          <div className="flex-1 overflow-auto p-10 relative z-10 transition-all">
             <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-black text-[#00d4ff] text-glow-cyan">NODE_Q[{currentQ.toString().padStart(2, '0')}]</h2>
                <div className="flex gap-4">
                  <span className="px-3 py-1 bg-white/5 border border-white/10 rounded text-[10px] font-black text-white/40">{currentQuestionData?.subject}</span>
                  <span className="px-3 py-1 bg-[#7c3aed]/10 border border-[#7c3aed]/30 rounded text-[10px] font-black text-[#a855f7]">DELTA: {qTime[currentQ] || 0}s</span>
                </div>
             </div>

             <div className="w-full max-w-5xl glass rounded-3xl p-1 bg-[#0B1121]/80 border-white/10 shadow-2xl mb-10 overflow-hidden">
                <img src={currentQuestionData?.imageUrl} alt="Q" className="w-full h-auto object-contain min-h-[400px] filter contrast-125" />
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mb-20">
                {['A', 'B', 'C', 'D'].map(opt => (
                  <button 
                    key={opt} onClick={() => handleOptionSelect(opt)}
                    className={`flex items-center gap-6 p-5 rounded-2xl border text-left transition-all group ${answers[currentQ] === opt ? 'bg-[#00d4ff]/10 border-[#00d4ff] text-[#00d4ff] glow-cyan' : 'bg-white/5 border-white/10 text-white/40 hover:border-white/20'}`}
                  >
                    <div className={`w-8 h-8 rounded-lg border-2 flex items-center justify-center font-black ${answers[currentQ] === opt ? 'bg-[#00d4ff] text-black border-[#00d4ff]' : 'border-white/20'}`}>{opt}</div>
                    <span className="font-bold tracking-widest text-lg uppercase">Select_Option_{opt}</span>
                  </button>
                ))}
             </div>
          </div>

          {/* Nav Controls */}
          <div className="h-20 bg-[#0B1121]/90 border-t border-white/10 flex items-center justify-between px-10 backdrop-blur-md z-20">
             <div className="flex gap-4">
                <button onClick={() => handleNav(currentQ - 1)} className="p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all"><ChevronLeft /></button>
                <button onClick={() => handleNav(currentQ + 1)} className="p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all"><ChevronRight /></button>
             </div>
             <div className="flex gap-4">
                <button onClick={handleClear} className="px-8 py-3 border border-red-500/30 text-red-500 rounded-xl font-black text-xs hover:bg-red-500/10 uppercase tracking-widest">Nullify</button>
                <button onClick={handleSaveNext} className="px-12 py-3 bg-[#00ff88] text-black rounded-xl font-black text-xs hover:shadow-[0_0_30px_#00ff88] transition-all uppercase tracking-[0.2em]">Commit & Next</button>
             </div>
          </div>
        </main>

        {/* Matrix Panel */}
        <aside className="w-96 bg-[#0B1121] border-l border-white/10 flex flex-col p-6 overflow-hidden glass">
           <div className="mb-10 text-center">
              <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] mb-4">Neural_Matrix_Overview</p>
              <div className="grid grid-cols-2 gap-4">
                 <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                    <p className="text-2xl font-black text-white">{questions.length}</p>
                    <p className="text-[8px] text-white/30 uppercase font-black">Total_Nodes</p>
                 </div>
                 <div className="p-4 rounded-2xl bg-[#00ff88]/5 border border-[#00ff88]/20">
                    <p className="text-2xl font-black text-[#00ff88]">{Object.keys(answers).length}</p>
                    <p className="text-[8px] text-[#00ff88]/50 uppercase font-black">Committed</p>
                 </div>
              </div>
           </div>

           <div className="flex-1 overflow-auto scrollbar-hide pr-2">
              <div className="grid grid-cols-4 gap-3">
                 {questions.map(q => (
                  <button 
                    key={q.number} onClick={() => handleNav(q.number)}
                    className={`h-12 rounded-xl border font-black text-xs transition-all ${currentQ === q.number ? 'ring-2 ring-[#00d4ff] ring-offset-4 ring-offset-[#020617] scale-105 bg-[#00d4ff]/10 border-[#00d4ff] text-[#00d4ff]' : answers[q.number] ? 'bg-[#00ff88]/10 border-[#00ff88]/30 text-[#00ff88]' : statuses[q.number] ? 'bg-red-500/10 border-red-500/30 text-red-500' : 'bg-white/5 border-white/5 text-white/30'}`}
                  >
                    {q.number}
                  </button>
                 ))}
              </div>
           </div>
        </aside>
      </div>
    </div>
  )
}
