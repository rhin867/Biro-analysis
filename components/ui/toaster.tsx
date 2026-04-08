'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react'

type ToastType = 'success' | 'error' | 'info' | 'warning'

interface ToastMessage {
  id: string
  message: string
  type: ToastType
}

const ICON_MAP = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
}

const COLOR_MAP = {
  success: 'border-emerald-500/30 bg-emerald-500/10',
  error: 'border-red-500/30 bg-red-500/10',
  warning: 'border-yellow-500/30 bg-yellow-500/10',
  info: 'border-blue-500/30 bg-blue-500/10',
}

const ICON_COLOR = {
  success: 'text-emerald-400',
  error: 'text-red-400',
  warning: 'text-yellow-400',
  info: 'text-blue-400',
}

let toastFn: ((msg: string, type?: ToastType) => void) | null = null

export function toast(message: string, type: ToastType = 'info') {
  toastFn?.(message, type)
}

export function Toaster() {
  const [toasts, setToasts] = useState<ToastMessage[]>([])

  useEffect(() => {
    toastFn = (message, type = 'info') => {
      const id = Date.now().toString()
      setToasts(prev => [...prev, { id, message, type }])
      setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000)
    }
    return () => { toastFn = null }
  }, [])

  return (
    <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
      <AnimatePresence>
        {toasts.map(t => {
          const Icon = ICON_MAP[t.type]
          return (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, x: 20 }}
              className={`glass rounded-xl px-4 py-3 border flex items-center gap-3 min-w-64 max-w-sm pointer-events-auto ${COLOR_MAP[t.type]}`}
            >
              <Icon className={`w-4 h-4 flex-shrink-0 ${ICON_COLOR[t.type]}`} />
              <p className="text-sm text-white/90 flex-1">{t.message}</p>
              <button onClick={() => setToasts(prev => prev.filter(x => x.id !== t.id))}
                className="text-white/30 hover:text-white/60 flex-shrink-0">
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}
