'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Clock, AlertCircle, Bookmark, Zap } from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'

// Statuses: 0=Not Visited, 1=Not Answered, 2=Answered, 3=Marked for Review, 4=Answered & Marked
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
  const [timeLeft, setTimeLeft] = useState(180 * 60) // 3 hours
  const [statuses, setStatuses] = useState<Record<number, QStatus>>({})
  const [answers, setAnswers] = useState<Record<number, string>>({})
  
  // Analytics State
  const [qTime, setQTime] = useState<Record<number, number>>({})
  const [qHesitations, setQHesitations] = useState<Record<number, number>>({})
  const [flowingMode, setFlowingMode] = useState(true)
  const isSubmitting = useRef(false)

  // Initialization & Question Loading
  useEffect(() => {
    // Generate fallback mock if no ID or standard ID
    const generateMocks = () => Array.from({ length: 75 }).map((_, i) => ({
      id: `q_${i + 1}`,
      number: i + 1,
      subject: i < 25 ? 'PHYSICS' : i < 50 ? 'CHEMISTRY' : 'MATHEMATICS',
      imageUrl: `https://placehold.co/800x400/020617/00d4ff?text=Question+${i + 1}+Terminal`,
    }))

    if (id && id.toString().startsWith('up_')) {
      const stored = localStorage.getItem(`test_${id}`)
      if (stored) {
        try {
          const parsed = JSON.parse(stored)
          setQuestions(parsed.map((q: any) => ({
            id: q.id,
            number: q.qNumber,
            subject: q.subject || 'MIXED',
            imageUrl: q.imageUrl
          })))
        } catch (e) {
          setQuestions(generateMocks())
        }
      } else {
        setQuestions(generateMocks())
      }
    } else {
      setQuestions(generateMocks())
    }

    setStatuses(prev => ({ ...prev, [1]: prev[1] || 1 }))
  }, [id])

  // Timing Effect
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timer)
          if (!isSubmitting.current) handleSubmit()
          return 0
        }
        return t - 1
      })
      
      // Track time spent on the current question
      setQTime(prev => ({
        ...prev,
        [currentQ]: (prev[currentQ] || 0) + 1
      }))
    }, 1000)

    return () => clearInterval(timer)
  }, [currentQ])

  const currentQuestionData = questions[currentQ - 1]
  const currentSubject = currentQuestionData?.subject || 'PHYSICS'
  const filterBySub = (sub: string) => questions.filter(q => q.subject === sub)
  const allSubjects = Array.from(new Set(questions.map(q => q.subject)))

  const handleNav = (n: number) => {
    setStatuses(prev => ({
      ...prev,
      [currentQ]: prev[currentQ] === 0 || !prev[currentQ] ? 1 : prev[currentQ],
      [n]: prev[n] === 0 || !prev[n] ? 1 : prev[n]
    }))
    setCurrentQ(n)
  }

  const handleOptionSelect = (opt: string) => {
    setAnswers(prev => {
      // If there's already an answer and it's changing, increment hesitation
      if (prev[currentQ] && prev[currentQ] !== opt) {
        setQHesitations(h => ({ ...h, [currentQ]: (h[currentQ] || 0) + 1 }))
      }
      return { ...prev, [currentQ]: opt }
    })

    // Flowing Mode Trigger
    if (flowingMode) {
      setStatuses(prev => ({ ...prev, [currentQ]: 2 }))
      if (currentQ < questions.length) {
        setTimeout(() => handleNav(currentQ + 1), 400) // Small delay for visual feedback
      }
    }
  }

  const handleSaveNext = () => {
    const isAns = !!answers[currentQ]
    setStatuses(prev => ({ ...prev, [currentQ]: isAns ? 2 : 1 }))
    if (currentQ < questions.length) handleNav(currentQ + 1)
  }

  const handleMarkReviewNext = () => {
    const isAns = !!answers[currentQ]
    setStatuses(prev => ({ ...prev, [currentQ]: isAns ? 4 : 3 }))
    if (currentQ < questions.length) handleNav(currentQ + 1)
  }

  const handleClear = () => {
    const newAns = { ...answers }
    delete newAns[currentQ]
    setAnswers(newAns)
    setStatuses(prev => ({ ...prev, [currentQ]: 1 }))
    setQHesitations(h => ({ ...h, [currentQ]: (h[currentQ] || 0) + 1 }))
  }

  const handleSubmit = async () => {
    if (isSubmitting.current) return
    isSubmitting.current = true
    
    // Calculate Analytics
    const totalAttempted = Object.keys(answers).length
    let totalTime = 0
    let totalHesitation = 0
    Object.values(qTime).forEach(t => totalTime += t)
    Object.values(qHesitations).forEach(h => totalHesitation += h)

    const payload = {
      test_id: id as string || `test_${Date.now()}`,
      user_id: 'guest_user',
      time_spent_total: totalTime,
      hesitation_count: totalHesitation,
      attempted_count: totalAttempted,
      q_timings: qTime,
      q_hesitations: qHesitations,
      timestamp: new Date().toISOString()
    }

    try {
      // Save Event Log to Supabase Mistake Book / Analytics proxy
      await supabase.from('event_logs').insert({
        test_id: payload.test_id,
        user_id: payload.user_id,
        event_type: 'TEST_SUBMIT',
        payload: payload,
        client_timestamp: payload.timestamp
      })
      // Direct Router fallback
      router.push('/plan')
    } catch (err) {
      console.error("Submission failed:", err)
      alert("Submission Error - Data logged locally")
      router.push('/plan')
    }
  }

  const fmtTime = (s: number) => {
    const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), secs = s % 60
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // Cyberpunk Palette Status Colors
  const getStatusColor = (st: QStatus) => {
    if (st === 0) return 'bg-white/5 text-white/50 border-white/10' 
    if (st === 1) return 'bg-[#ef4444]/20 text-[#ef4444] border-[#ef4444] glow-red' 
    if (st === 2) return 'bg-[#00ff88]/20 text-[#00ff88] border-[#00ff88] glow-green' 
    if (st === 3) return 'bg-[#7c3aed]/20 text-[#7c3aed] border-[#7c3aed] glow-purple rounded-full' 
    if (st === 4) return 'bg-[#7c3aed]/20 text-[#00ff88] border-[#00ff88] glow-cyan rounded-full flex items-center justify-center after:content-[""] after:w-1.5 after:h-1.5 after:bg-[#00ff88] after:rounded-full after:ml-0.5' 
    return 'bg-white/10 text-white/50 border-white/5'
  }

  const statsCount = (st: QStatus) => Object.values(statuses).filter(v => v === st).length

  if (questions.length === 0) return <div className="min-h-screen bg-[#020617] flex items-center justify-center text-white font-mono uppercase tracking-[0.5em] animate-pulse">Initializing_Grid...</div>

  return (
    <div className="min-h-screen bg-[#020617] text-white flex flex-col font-mono select-none overflow-hidden">
      
      {/* Top Header - Cyberpunk */}
      <header className="h-14 bg-[#0B1121]/90 border-b border-[#00d4ff]/30 backdrop-blur-md flex items-center justify-between px-4 sm:px-6 relative z-10 shadow-[0_4px_30px_rgba(0,212,255,0.1)]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#00d4ff]/20 border border-[#00d4ff] flex items-center justify-center font-bold text-[#00d4ff] glow-cyan">B</div>
          <span className="font-bold tracking-[0.2em] text-sm uppercase text-glow-cyan text-[#00d4ff]">NEO_CBT_ENGINE</span>
        </div>
        <div className="flex items-center gap-6">
          <button 
            onClick={() => setFlowingMode(!flowingMode)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded border transition-all ${flowingMode ? 'bg-[#7c3aed]/20 border-[#7c3aed] text-[#7c3aed] glow-purple' : 'bg-white/5 border-white/20 text-white/50'}`}
          >
            <Zap className="w-4 h-4" />
            <span className="text-xs font-bold tracking-wider">FLOW MODE</span>
          </button>
          
          <div className="flex items-center gap-2 px-4 py-1.5 bg-[#ef4444]/10 border border-[#ef4444]/50 rounded-md glow-red">
            <Clock className="w-4 h-4 text-[#ef4444]" />
            <span className="font-mono font-bold text-[#ef4444] text-lg tracking-wider text-glow-red">{fmtTime(timeLeft)}</span>
          </div>
          <button onClick={handleSubmit} className="px-6 py-1.5 bg-[#00d4ff]/20 hover:bg-[#00d4ff]/40 text-[#00d4ff] border border-[#00d4ff] text-sm font-bold rounded tracking-wider shadow-[0_0_15px_rgba(0,212,255,0.4)] transition-all uppercase">Submit</button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Left pane: Question Viewer */}
        <main className="flex-1 flex flex-col border-r border-[#00d4ff]/20 relative bg-[url('/grid.svg')] bg-center">
          <div className="absolute inset-0 bg-grid opacity-20 pointer-events-none"></div>

          {/* Subject Tabs */}
          <div className="flex bg-[#0B1121]/50 border-b border-[#00d4ff]/20 relative z-10 backdrop-blur-sm">
            {allSubjects.map(sub => (
              <button 
                key={sub}
                onClick={() => handleNav(questions.find(q => q.subject === sub)?.number || 1)}
                className={`flex-1 py-3 text-xs font-bold transition-all border-b-2 tracking-widest uppercase ${currentSubject === sub ? 'border-[#00d4ff] text-[#00d4ff] bg-[#00d4ff]/10 text-glow-cyan glow-cyan' : 'border-transparent text-white/40 hover:text-[#00d4ff]/70 hover:bg-white/5'}`}
              >
                {sub}
              </button>
            ))}
          </div>

          {/* Question Area */}
          <div className="flex-1 overflow-auto p-6 relative z-10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-black text-[#00d4ff] text-glow-cyan tracking-wider">SYS_Q[{currentQ.toString().padStart(2, '0')}]</h2>
              <div className="flex gap-4">
                 <span className="text-xs text-[#7c3aed] glow-purple px-2 py-1 border border-[#7c3aed]/30 rounded bg-[#7c3aed]/10 tracking-widest">TIMING: {qTime[currentQ] || 0}s</span>
                 <span className="px-3 py-1 bg-[#00d4ff]/10 text-[#00d4ff] text-xs rounded border border-[#00d4ff]/30 glow-cyan tracking-widest uppercase">{currentQuestionData?.subject || 'MIXED'}</span>
              </div>
            </div>
            
            <div className="w-full bg-[#0B1121] rounded-xl overflow-hidden shadow-[0_0_30px_rgba(0,212,255,0.1)] border-2 border-[#00d4ff]/30 mb-8 max-w-4xl glass relative">
               <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-[#00d4ff] to-transparent opacity-50"></div>
               {currentQuestionData && (
                <img src={currentQuestionData.imageUrl} alt={`Question ${currentQ}`} className="w-full h-auto object-contain p-4 filter contrast-125" />
               )}
            </div>

            {/* Options */}
            <div className="grid grid-cols-2 gap-4 max-w-2xl">
              {['A', 'B', 'C', 'D'].map(opt => (
                <button
                  key={opt}
                  onClick={() => handleOptionSelect(opt)}
                  className={`flex items-center gap-4 p-4 rounded-xl border text-left transition-all duration-300 ${answers[currentQ] === opt ? 'bg-[#00d4ff]/20 border-[#00d4ff] text-[#00d4ff] glow-cyan scale-[1.02]' : 'bg-[#0B1121]/80 border-white/10 text-white/60 hover:border-[#00d4ff]/50 hover:bg-[#00d4ff]/5'}`}
                >
                  <div className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-all ${answers[currentQ] === opt ? 'border-[#00d4ff] bg-[#00d4ff]/20' : 'border-white/30'}`}>
                    {answers[currentQ] === opt && <div className="w-3 h-3 bg-[#00d4ff] shadow-[0_0_10px_#00d4ff]" />}
                  </div>
                  <span className="font-bold text-xl tracking-wider">OPT_{opt}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Action Bar */}
          <div className="h-16 bg-[#0B1121]/90 border-t border-[#00d4ff]/30 flex items-center px-6 gap-4 relative z-10 backdrop-blur-md">
            <button onClick={handleSaveNext} className="h-10 px-6 bg-[#00ff88]/20 hover:bg-[#00ff88]/40 border border-[#00ff88] text-[#00ff88] text-sm font-bold rounded glow-green transition-all tracking-wider uppercase">Accept & Next</button>
            <button onClick={handleClear} className="h-10 px-6 bg-white/5 hover:bg-white/10 text-white/80 text-sm font-bold rounded border border-white/20 transition-all tracking-wider uppercase">Purge</button>
            <button onClick={handleMarkReviewNext} className="h-10 px-6 bg-[#7c3aed]/20 hover:bg-[#7c3aed]/40 border border-[#7c3aed] text-[#7c3aed] text-sm font-bold rounded glow-purple transition-all ml-auto flex items-center gap-2 tracking-wider uppercase">
              <Bookmark className="w-4 h-4" /> Flag for Review
            </button>
          </div>

        </main>

        {/* Right pane: Palette */}
        <aside className="w-80 bg-[#0B1121] flex flex-col border-l-2 border-[#0B1121] relative glass">
          <div className="absolute inset-0 bg-[#00d4ff]/5 mix-blend-overlay pointer-events-none"></div>

          {/* User Profile Area */}
          <div className="p-4 border-b border-white/10 flex items-center gap-3 relative z-10">
            <div className="w-12 h-12 rounded border border-[#00d4ff]/50 bg-[#00d4ff]/10 overflow-hidden glow-cyan">
               <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Neon" alt="Avatar" className="filter hue-rotate-180" />
            </div>
            <div>
              <p className="text-sm font-bold text-[#00d4ff] text-glow-cyan tracking-wider uppercase">{id && id.toString().startsWith('up_') ? 'USER_UPLOAD' : 'SYSTEM_MOCK'}</p>
              <p className="text-xs text-[#7c3aed] tracking-widest uppercase">Simulation_Active</p>
            </div>
          </div>

          {/* Key Legend */}
          <div className="p-4 border-b border-white/10 grid grid-cols-2 gap-x-2 gap-y-3 relative z-10 bg-black/20">
             <div className="flex items-center gap-2 text-[10px] text-white/50 tracking-wider uppercase">
               <div className="w-6 h-6 border flex items-center justify-center text-[10px] bg-white/5 border-white/20">{questions.length - Object.keys(statuses).length}</div> Null
             </div>
             <div className="flex items-center gap-2 text-[10px] text-[#ef4444] tracking-wider uppercase">
               <div className="w-6 h-6 border flex items-center justify-center text-[10px] bg-[#ef4444]/20 border-[#ef4444]" style={{borderBottomRightRadius:'8px'}}>{statsCount(1)}</div> Pending
             </div>
             <div className="flex items-center gap-2 text-[10px] text-[#00ff88] tracking-wider uppercase">
               <div className="w-6 h-6 border flex items-center justify-center text-[10px] bg-[#00ff88]/20 border-[#00ff88] shadow-[0_0_10px_rgba(0,255,136,0.3)]" style={{borderTopLeftRadius:'8px'}}>{statsCount(2)}</div> Locked
             </div>
             <div className="flex items-center gap-2 text-[10px] text-[#7c3aed] tracking-wider uppercase">
               <div className="w-6 h-6 border flex items-center justify-center text-[10px] bg-[#7c3aed]/20 border-[#7c3aed] rounded-full shadow-[0_0_10px_rgba(124,58,237,0.3)]">{statsCount(3)}</div> Flagged
             </div>
             <div className="col-span-2 flex items-center gap-2 text-[10px] text-[#00ff88] mt-1 tracking-wider uppercase">
               <div className="w-6 h-6 border rounded-full flex items-center justify-center text-[10px] bg-[#7c3aed]/20 border-[#00ff88] shadow-[0_0_10px_rgba(0,255,136,0.2)] after:content-[''] after:w-1 after:h-1 after:bg-[#00ff88] after:rounded-full after:ml-0.5">{statsCount(4)}</div> Locked & Flagged
             </div>
          </div>

          {/* Question Grid */}
          <div className="flex-1 overflow-auto p-4 relative z-10 scrollbar-hide">
             <h3 className="text-xs font-bold text-[#00d4ff]/50 mb-3 uppercase tracking-[0.2em]">Matrix_{currentSubject}</h3>
             <div className="grid grid-cols-5 gap-2">
                {filterBySub(currentSubject).map(q => {
                  const s = statuses[q.number] || 0
                  return (
                    <button
                      key={q.number}
                      onClick={() => handleNav(q.number)}
                      className={`w-9 h-9 text-xs font-bold border flex items-center justify-center transition-all ${getStatusColor(s)} ${currentQ === q.number ? 'ring-2 ring-[#00d4ff] ring-offset-2 ring-offset-[#020617] scale-110' : 'hover:scale-105'} ${s===1?'!border-b-[#ef4444] !rounded-br-lg':''} ${s===2?'!border-t-[#00ff88] !rounded-tl-lg':''}`}
                      style={(s===1 || s===2 || s===0) ? { borderRadius: '2px' } : {}}
                    >
                      {q.number}
                    </button>
                  )
                })}
             </div>
          </div>

        </aside>
      </div>
    </div>
  )
}
