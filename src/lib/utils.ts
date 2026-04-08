import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatSeconds(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

export function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  if (hours > 0) return `${hours}h ${minutes}m`
  if (minutes > 0) return `${minutes}m ${seconds}s`
  return `${seconds}s`
}

export function pctColor(pct: number): string {
  if (pct >= 80) return 'text-emerald-400'
  if (pct >= 60) return 'text-blue-400'
  if (pct >= 40) return 'text-yellow-400'
  return 'text-red-400'
}

export function getDifficultyColor(diff: string): string {
  switch (diff) {
    case 'EASY': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
    case 'MEDIUM': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20'
    case 'HARD': return 'text-red-400 bg-red-500/10 border-red-500/20'
    default: return 'text-white/40'
  }
}

export function getSubjectColor(subject: string): string {
  switch (subject) {
    case 'PHYSICS': return 'text-blue-400'
    case 'CHEMISTRY': return 'text-emerald-400'
    case 'MATHEMATICS': return 'text-violet-400'
    case 'BIOLOGY': return 'text-green-400'
    case 'BOTANY': return 'text-lime-400'
    case 'ZOOLOGY': return 'text-teal-400'
    default: return 'text-white/60'
  }
}

export function generateSessionId(): string {
  return `biro_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

export function calcPercentage(part: number, total: number, decimals = 1): number {
  if (total === 0) return 0
  return Math.round((part / total) * Math.pow(10, decimals + 2)) / Math.pow(10, decimals)
}
