'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Clock, AlertCircle, Eye, CheckCircle2, CircleDashed, ChevronRight, Bookmark } from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'

// Statuses: 0=Not Visited, 1=Not Answered, 2=Answered, 3=Marked for Review, 4=Answered & Marked
type QStatus = 0 | 1 | 2 | 3 | 4

const MOCK_QUESTIONS = Array.from({ length: 75 }).map((_, i) => ({
  id: `q_${i + 1}`,
  number: i + 1,
  subject: i < 25 ? 'PHYSICS' : i < 50 ? 'CHEMISTRY' : 'MATHEMATICS',
  imageUrl: `https://placehold.co/800x400/2563EB/white?text=Question+${i + 1}+Image`,
}))

export default function CBTEnginePage() {
  const router = useRouter()
  const { id } = useParams()

  const [currentQ, setCurrentQ] = useState(1)
  const [timeLeft, setTimeLeft] = useState(180 * 60) // 3 hours
  const [statuses, setStatuses] = useState<Record<number, QStatus>>({})
  const [answers, setAnswers] = useState<Record<number, string>>({})

  useEffect(() => {
    // Initializer matching NTA rules: start Q1 as 'Not Answered' (1) if it was Not Visited (0)
    setStatuses(prev => ({ ...prev, [1]: prev[1] || 1 }))
    
    const timer = setInterval(() => {
      setTimeLeft(t => (t > 0 ? t - 1 : 0))
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const currentSubject = MOCK_QUESTIONS[currentQ - 1]?.subject || 'PHYSICS'
  const filterBySub = (sub: string) => MOCK_QUESTIONS.filter(q => q.subject === sub)

  const handleNav = (n: number) => {
    // Current Q goes from Not Visited(0) -> Not Answered(1) if not answered
    setStatuses(prev => ({
      ...prev,
      [currentQ]: prev[currentQ] === 0 || !prev[currentQ] ? 1 : prev[currentQ],
      [n]: prev[n] === 0 || !prev[n] ? 1 : prev[n]
    }))
    setCurrentQ(n)
  }

  const handleSaveNext = () => {
    const isAns = !!answers[currentQ]
    setStatuses(prev => ({ ...prev, [currentQ]: isAns ? 2 : 1 }))
    if (currentQ < 75) handleNav(currentQ + 1)
  }

  const handleMarkReviewNext = () => {
    const isAns = !!answers[currentQ]
    setStatuses(prev => ({ ...prev, [currentQ]: isAns ? 4 : 3 }))
    if (currentQ < 75) handleNav(currentQ + 1)
  }

  const handleClear = () => {
    const newAns = { ...answers }
    delete newAns[currentQ]
    setAnswers(newAns)
    setStatuses(prev => ({ ...prev, [currentQ]: 1 }))
  }

  const fmtTime = (s: number) => {
    const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), secs = s % 60
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const getStatusColor = (st: QStatus) => {
    if (st === 0) return 'bg-white/10 text-white/50 border-white/5' // Not visited
    if (st === 1) return 'bg-red-500/20 text-red-400 border-red-500/40' // Not answered
    if (st === 2) return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' // Answered
    if (st === 3) return 'bg-violet-500/20 text-violet-400 border-violet-500/40 rounded-full' // Marked
    if (st === 4) return 'bg-violet-500/20 text-emerald-400 border-emerald-500/50 rounded-full flex items-center justify-center after:content-[""] after:w-1.5 after:h-1.5 after:bg-emerald-400 after:rounded-full after:ml-0.5' // Ans + Marked
    return 'bg-white/10 text-white/50 border-white/5'
  }

  const statsCount = (st: QStatus) => Object.values(statuses).filter(v => v === st).length

  return (
    <div className="min-h-screen bg-[#0F172A] flex flex-col font-sans select-none overflow-hidden">
      
      {/* Top Header */}
      <header className="h-14 bg-white/5 border-b border-white/10 flex items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center font-bold text-blue-400">B</div>
          <span className="font-bold text-white tracking-widest text-sm uppercase">CBT ENGINE</span>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 px-4 py-1.5 bg-red-500/10 border border-red-500/20 rounded-md">
            <Clock className="w-4 h-4 text-red-400" />
            <span className="font-mono font-bold text-red-400 text-lg tracking-wider">{fmtTime(timeLeft)}</span>
          </div>
          <button onClick={() => alert('Submitted!')} className="px-5 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-bold rounded shadow-[0_0_15px_rgba(16,185,129,0.4)] transition-colors">Submit</button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Left pane: Question Viewer */}
        <main className="flex-1 flex flex-col border-r border-white/10 relative">
          
          {/* Subject Tabs */}
          <div className="flex bg-white/5 border-b border-white/10">
            {['PHYSICS', 'CHEMISTRY', 'MATHEMATICS'].map(sub => (
              <button 
                key={sub}
                onClick={() => handleNav(MOCK_QUESTIONS.find(q => q.subject === sub)?.number || 1)}
                className={`flex-1 py-3 text-xs font-bold transition-all border-b-2 ${currentSubject === sub ? 'border-blue-500 text-blue-400 bg-blue-500/5' : 'border-transparent text-white/40 hover:text-white/80 hover:bg-white/5'}`}
              >
                {sub}
              </button>
            ))}
          </div>

          {/* Question Area */}
          <div className="flex-1 overflow-auto p-6 bg-white/2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-black text-white">Question {currentQ}</h2>
              <span className="px-3 py-1 bg-white/5 text-white/50 text-xs rounded border border-white/10">Single Correct</span>
            </div>
            
            <div className="w-full bg-white rounded-xl overflow-hidden shadow-2xl border-4 border-white/10 mb-8 max-w-4xl">
               {/* Note: the image is dynamic and rendered exactly as cropped during parsing */}
               <img src={MOCK_QUESTIONS[currentQ - 1]?.imageUrl} alt={`Question ${currentQ}`} className="w-full h-auto object-contain" />
            </div>

            {/* Options */}
            <div className="grid grid-cols-2 gap-4 max-w-2xl">
              {['A', 'B', 'C', 'D'].map(opt => (
                <button
                  key={opt}
                  onClick={() => setAnswers(p => ({ ...p, [currentQ]: opt }))}
                  className={`flex items-center gap-3 p-4 rounded-xl border text-left transition-all ${answers[currentQ] === opt ? 'bg-blue-500/20 border-blue-500/50 text-blue-300 shadow-[0_0_20px_rgba(37,99,235,0.2)]' : 'bg-white/5 border-white/10 text-white/60 hover:border-white/30'}`}
                >
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${answers[currentQ] === opt ? 'border-blue-400' : 'border-white/30'}`}>
                    {answers[currentQ] === opt && <div className="w-2.5 h-2.5 rounded-full bg-blue-400" />}
                  </div>
                  <span className="font-bold text-lg">{opt}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Action Bar */}
          <div className="h-16 bg-white/5 border-t border-white/10 flex items-center px-6 gap-3">
            <button onClick={handleSaveNext} className="h-10 px-6 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-bold rounded shadow-lg transition-colors">Save & Next</button>
            <button onClick={handleClear} className="h-10 px-6 bg-white/10 hover:bg-white/20 text-white text-sm font-bold rounded border border-white/10 transition-colors">Clear</button>
            <button onClick={handleMarkReviewNext} className="h-10 px-6 bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold rounded shadow-lg transition-colors ml-auto flex items-center gap-2">
              <Bookmark className="w-4 h-4" /> Save & Mark for Review
            </button>
          </div>

        </main>

        {/* Right pane: Palette */}
        <aside className="w-80 bg-[#0B1121] flex flex-col">
          
          {/* User Profile Area */}
          <div className="p-4 border-b border-white/10 flex items-center gap-3">
            <div className="w-12 h-12 rounded bg-white/10 overflow-hidden">
               <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="Avatar" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">Guest Candidate</p>
              <p className="text-xs text-white/40">JEE Mains Mock 1</p>
            </div>
          </div>

          {/* Key Legend */}
          <div className="p-4 border-b border-white/10 grid grid-cols-2 gap-x-2 gap-y-3">
             <div className="flex items-center gap-2 text-[10px] text-white/60">
               <div className="w-6 h-6 border flex items-center justify-center text-[10px] bg-white/10 border-white/10">{75 - Object.keys(statuses).length}</div> Not Visited
             </div>
             <div className="flex items-center gap-2 text-[10px] text-white/60">
               <div className="w-6 h-6 border flex items-center justify-center text-[10px] bg-red-500/20 text-red-400 border-red-500/40 text-red-400" style={{borderBottomRightRadius:'8px'}}>{statsCount(1)}</div> Not Answered
             </div>
             <div className="flex items-center gap-2 text-[10px] text-white/60">
               <div className="w-6 h-6 border flex items-center justify-center text-[10px] bg-emerald-500/20 text-emerald-400 border-emerald-500/40" style={{borderTopLeftRadius:'8px'}}>{statsCount(2)}</div> Answered
             </div>
             <div className="flex items-center gap-2 text-[10px] text-white/60">
               <div className="w-6 h-6 border rounded-full flex items-center justify-center text-[10px] bg-violet-500/20 text-violet-400 border-violet-500/40">{statsCount(3)}</div> Marked Review
             </div>
             <div className="col-span-2 flex items-center gap-2 text-[10px] text-white/60 mt-1">
               <div className="w-6 h-6 border rounded-full flex items-center justify-center text-[10px] bg-violet-500/20 text-emerald-400 border-emerald-500/40 after:content-[''] after:w-1 after:h-1 after:bg-emerald-400 after:rounded-full after:ml-0.5">{statsCount(4)}</div> Answered & Marked for Review 
             </div>
          </div>

          {/* Question Grid */}
          <div className="flex-1 overflow-auto p-4">
             <h3 className="text-xs font-bold text-white/40 mb-3 uppercase tracking-wider">{currentSubject}</h3>
             <div className="grid grid-cols-5 gap-2">
                {filterBySub(currentSubject).map(q => {
                  const s = statuses[q.number] || 0
                  return (
                    <button
                      key={q.number}
                      onClick={() => handleNav(q.number)}
                      className={`w-9 h-9 text-xs font-bold border flex items-center justify-center transition-all shadow-sm ${getStatusColor(s)} ${currentQ === q.number ? 'ring-2 ring-white scale-110 shadow-[0_0_15px_rgba(255,255,255,0.4)]' : 'hover:brightness-125'} ${s===1?'!border-b-amber-600 !rounded-br-lg':''} ${s===2?'!border-t-emerald-600 !rounded-tl-lg':''}`}
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
