'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Target, Send, Bot, User, Sparkles, Activity, Clock, AlertTriangle } from 'lucide-react'

// Mocking Supabase Fetch for context
const MOCK_USER_CONTEXT = {
  exam: 'JEE Mains',
  recentScore: 180,
  maxScore: 300,
  weakSubjects: ['Physics - Rotational Dynamics', 'Math - Calculus'],
  panicDetected: true,
  darrIndex: 45
}

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
}

export default function AIPlanPage() {
  const [messages, setMessages] = useState<Message[]>([
    { 
      id: 'welcome', 
      role: 'assistant', 
      content: `Hello! I'm your Biro-Analysis Mentor. I've analyzed your recent ${MOCK_USER_CONTEXT.exam} test (Score: ${MOCK_USER_CONTEXT.recentScore}/${MOCK_USER_CONTEXT.maxScore}). I noticed you struggled with ${MOCK_USER_CONTEXT.weakSubjects.join(' and ')}, and had some panic spikes. How can I help you recover and plan your next 3 days?`
    }
  ])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  const SUGGESTED_PROMPTS = [
    "Generate a 3-day strict recovery plan.",
    "Why did my accuracy drop in Physics?",
    "How do I reduce my Darr (Hesitation) Index?",
    "Build a strategy to avoid panic spikes."
  ]

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isTyping])

  const handleSend = async (text: string) => {
    if (!text.trim()) return

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: text }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setIsTyping(true)

    // Simulate AI Response (In production, this hits an API endpoint like /api/chat passing MOCK_USER_CONTEXT)
    setTimeout(() => {
      const response: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Based on your recent test telemetry context, here is what I recommend for: "${text}"\n\n1. **Immediate Focus**: Spend 2 hours revising Rotational Dynamics. Your Darr Index of ${MOCK_USER_CONTEXT.darrIndex} shows you hesitated a lot there.\n2. **Mock Strategy**: Do NOT attempt a full mock tomorrow. Do chapter-wise tests.\n3. **Psychology**: I noticed a Panic Spike around the 160-minute mark. Practice breathing exercises when you feel overwhelmed.`
      }
      setMessages(prev => [...prev, response])
      setIsTyping(false)
    }, 1500)
  }

  return (
    <div className="min-h-screen bg-[#0F172A] lg:pl-64 flex flex-col">
      <div className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col h-screen">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 flex-shrink-0">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-xl bg-violet-500/15 flex items-center justify-center">
              <Target className="w-4 h-4 text-violet-400" />
            </div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              AI Mentor <span className="text-[10px] px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded-full font-bold">GPT-4 Turbo</span>
            </h1>
          </div>
          <p className="text-white/40 text-sm">Context-aware planning engine using your live telemetry metrics.</p>
        </motion.div>

        {/* Telemetry Context Bar */}
        <div className="flex gap-4 mb-6 overflow-x-auto pb-2 flex-shrink-0">
           <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg whitespace-nowrap">
             <Activity className="w-3 h-3 text-emerald-400" /> <span className="text-xs text-white/60">Score Context: <strong className="text-white">180/300</strong></span>
           </div>
           <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg whitespace-nowrap">
             <Clock className="w-3 h-3 text-yellow-400" /> <span className="text-xs text-white/60">Darr Index: <strong className="text-white">45</strong></span>
           </div>
           <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg whitespace-nowrap">
             <AlertTriangle className="w-3 h-3 text-red-400" /> <span className="text-xs text-white/60">Panic Detected: <strong className="text-white">True</strong></span>
           </div>
        </div>

        {/* Chat Window */}
        <div className="flex-1 glass rounded-2xl border-white/10 overflow-hidden flex flex-col mb-4">
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6">
            <AnimatePresence>
              {messages.map((m) => (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, y: 10, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  className={`flex gap-4 max-w-[85%] ${m.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
                >
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${m.role === 'user' ? 'bg-blue-500/20 text-blue-400' : 'bg-violet-500/20 text-violet-400'}`}>
                    {m.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </div>
                  <div className={`p-4 rounded-2xl text-sm leading-relaxed ${m.role === 'user' ? 'bg-blue-500 text-white rounded-tr-none' : 'bg-white/5 border border-white/10 text-white/80 rounded-tl-none'}`}>
                    {/* Render newlines for basic formatting */}
                    {m.content.split('\n').map((line, i) => (
                      <p key={i} className={line.trim() ? 'mb-2 last:mb-0' : 'mb-0'}>
                        {line.includes('**') ? (
                          <span dangerouslySetInnerHTML={{ __html: line.replace(/\*\*(.*?)\*\*/g, '<strong class="text-white">$1</strong>') }} />
                        ) : line}
                      </p>
                    ))}
                  </div>
                </motion.div>
              ))}
              {isTyping && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-4 max-w-[85%]">
                   <div className="w-8 h-8 rounded-xl bg-violet-500/20 text-violet-400 flex items-center justify-center">
                     <Bot className="w-4 h-4" />
                   </div>
                   <div className="p-4 rounded-2xl bg-white/5 border border-white/10 rounded-tl-none flex items-center gap-1">
                     <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                     <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                     <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                   </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Input Area */}
          <div className="p-4 bg-white/2 border-t border-white/5">
            {/* Suggested Prompts */}
            {messages.length === 1 && (
              <div className="flex gap-2 overflow-x-auto pb-4 mb-2 scrollbar-none">
                {SUGGESTED_PROMPTS.map(p => (
                  <button
                    key={p}
                    onClick={() => handleSend(p)}
                    className="flex-shrink-0 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs text-white/60 hover:text-white transition-colors"
                  >
                    <Sparkles className="w-3 h-3 inline mr-1 text-violet-400" /> {p}
                  </button>
                ))}
              </div>
            )}
            
            <form
              onSubmit={(e) => { e.preventDefault(); handleSend(input); }}
              className="flex gap-3"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about your performance or request a study plan..."
                className="flex-1 bg-white/5 border border-white/10 focus:border-violet-500/50 rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 outline-none transition-colors"
              />
              <button
                type="submit"
                disabled={!input.trim() || isTyping}
                className="w-12 h-12 rounded-xl bg-violet-600 hover:bg-violet-500 text-white flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(124,58,237,0.3)]"
              >
                <Send className="w-5 h-5 ml-1" />
              </button>
            </form>
          </div>
        </div>

      </div>
    </div>
  )
}
