'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import {
  LayoutDashboard, FlaskConical, Brain, Target, BookMarked,
  Settings, ChevronRight, BarChart3, Clock, Zap, TrendingUp,
  AlertTriangle, Trophy, Eye, Flame, Activity, Plus, Menu, X,
  GraduationCap, Star, MonitorPlay
} from 'lucide-react'
import { MetricCard } from '@/components/MetricCard'
import { ScoreGauge } from '@/components/charts/ScoreGauge'
import { TimelineChart } from '@/components/charts/TimelineChart'
import { SubjectRadar } from '@/components/charts/SubjectRadar'
import { RecentTests } from '@/components/RecentTests'
import { QuickActions } from '@/components/QuickActions'
import { DarrMeter } from '@/components/DarrMeter'
import { BlunderAlert } from '@/components/BlunderAlert'
import { supabase } from '@/lib/supabase/client'

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/', badge: null },
  { icon: FlaskConical, label: 'New Test', href: '/upload', badge: 'NEW' },
  { icon: BarChart3, label: 'Analysis', href: '/behavioral', badge: null },
  { icon: Brain, label: 'Behavioral', href: '/behavioral', badge: null },
  { icon: Clock, label: 'Chronometrics', href: '/chronometrics', badge: null },
  { icon: AlertTriangle, label: 'Blunders', href: '/blunders', badge: null },
  { icon: Target, label: 'Action Plan', href: '/plan', badge: 'AI' },
  { icon: Eye, label: 'Interrogation', href: '/interrogation', badge: null },
  { icon: MonitorPlay, label: 'External Test', href: '/external', badge: 'PRO' },
  { icon: Settings, label: 'Settings', href: '/settings', badge: null },
]

// Default ZERO state for new user
const DEFAULT_METRICS = {
  netScore: 0,
  totalMarks: 300,
  percentile: 0,
  attempted: 0,
  total: 75,
  correct: 0,
  incorrect: 0,
  darrIndex: 0,
  blunders: 0,
  panicDetected: false,
  tiltFactor: 0,
  avgTime: 0,
  scorePotenial: 0,
}

export default function DashboardPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeNav, setActiveNav] = useState('/')
  const [animateMetrics, setAnimateMetrics] = useState(false)
  const [metrics, setMetrics] = useState(DEFAULT_METRICS)

  useEffect(() => {
    async function loadMetrics() {
      try {
        const { data, error } = await supabase
          .from('behavioral_analysis')
          .select('*')
          .limit(1)
          .single()
        
        if (data) {
          setMetrics({
            ...DEFAULT_METRICS,
            netScore: data.raw_score || 0,
            darrIndex: data.darr_index || 0,
            blunders: data.blunder_count || 0,
            panicDetected: !!data.panic_spike_detected,
            tiltFactor: data.tilt_factor || 0,
            scorePotenial: data.score_potential || 0,
          })
        }
      } catch (err) {
        // Fallback to zero if connection fails or no data
        console.log('Using zero-data state')
      }
      setTimeout(() => setAnimateMetrics(true), 150)
    }
    loadMetrics()
  }, [])

  return (
    <div className="min-h-screen bg-[#0F172A] flex">
      {/* ── Sidebar ── */}
      <AnimatePresence>
        {(sidebarOpen || true) && (
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            className="hidden lg:flex flex-col w-64 fixed inset-y-0 left-0 z-40 glass border-r border-white/5"
          >
            {/* Logo */}
            <div className="flex items-center gap-3 px-6 py-5 border-b border-white/5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center glow-blue">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-white text-sm tracking-wide">Biro-Analysis</h1>
                <p className="text-[10px] text-blue-400 font-mono">JEE · NEET Intelligence</p>
              </div>
            </div>

            {/* Nav */}
            <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setActiveNav(item.href)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group
                    ${activeNav === item.href
                      ? 'bg-blue-500/15 text-blue-400 neon-border-blue'
                      : 'text-white/50 hover:text-white/80 hover:bg-white/5'
                    }`}
                >
                  <item.icon className={`w-4 h-4 flex-shrink-0 transition-colors
                    ${activeNav === item.href ? 'text-blue-400' : 'text-white/30 group-hover:text-white/60'}`} />
                  <span className="flex-1">{item.label}</span>
                  {item.badge && (
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold
                      ${item.badge === 'AI' ? 'bg-violet-500/20 text-violet-400' : 'bg-blue-500/20 text-blue-400'}`}>
                      {item.badge}
                    </span>
                  )}
                </Link>
              ))}
            </nav>

            {/* User card */}
            <div className="p-4 border-t border-white/5">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/8 transition-colors cursor-pointer">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-violet-500 flex items-center justify-center">
                  <span className="text-xs font-bold text-white">A</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-white truncate">Aspirant</p>
                  <p className="text-[10px] text-white/40">JEE Advanced 2025</p>
                </div>
                <Star className="w-3.5 h-3.5 text-yellow-400" />
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* ── Mobile header ── */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 glass border-b border-white/5 flex items-center px-4 py-3">
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-1.5 rounded-lg hover:bg-white/10">
          {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
        <div className="flex-1 flex items-center justify-center gap-2">
          <GraduationCap className="w-5 h-5 text-blue-400" />
          <span className="font-bold text-sm gradient-text">Biro-Analysis</span>
        </div>
      </div>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="lg:hidden fixed inset-0 z-30 bg-black/60 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* ── Main Content ── */}
      <main className="flex-1 lg:ml-64 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-16 lg:pt-8">

          {/* ── Header ── */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <motion.h2
                initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                className="text-2xl sm:text-3xl font-bold text-white"
              >
                Welcome back, <span className="gradient-text">Aspirant</span> 👋
              </motion.h2>
              <p className="text-white/40 text-sm mt-1">Last test: JEE Mains Mock · 2 days ago</p>
            </div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
              <Link href="/upload"
                className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium text-sm transition-all hover:scale-105 glow-blue">
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">New Test</span>
              </Link>
            </motion.div>
          </div>

          {/* ── Alert Banner (Panic Detected) ── */}
          {metrics.panicDetected && (
            <motion.div
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 rounded-xl border border-red-500/30 bg-red-500/10 flex items-center gap-3"
            >
              <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center flex-shrink-0">
                <Flame className="w-4 h-4 text-red-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-red-400">⚠️ Panic Spike Detected</p>
                <p className="text-xs text-white/50 mt-0.5">
                  Erratic behavior detected in the last 15 minutes of your test. 8 rapid clicks + 3 subject switches.
                </p>
              </div>
              <Link href="/behavioral" className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 flex-shrink-0">
                Analyze <ChevronRight className="w-3 h-3" />
              </Link>
            </motion.div>
          )}

          {/* ── Top Metrics Grid ── */}
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3 mb-6">
            {[
              { label: 'Net Score', value: `${metrics.netScore}`, sub: `/ ${metrics.totalMarks}`, color: 'blue', icon: Trophy },
              { label: 'Percentile', value: `${metrics.percentile}%`, sub: 'Projected', color: 'violet', icon: TrendingUp },
              { label: 'Accuracy', value: metrics.attempted > 0 ? `${Math.round((metrics.correct / metrics.attempted) * 100)}%` : '0%', sub: `${metrics.correct}/${metrics.attempted}`, color: 'cyan', icon: Target },
              { label: 'Darr Index', value: `${metrics.darrIndex}`, sub: 'Hesitation', color: 'yellow', icon: Brain },
              { label: 'Blunders', value: `${metrics.blunders}`, sub: 'Easy wrong', color: 'red', icon: AlertTriangle },
              { label: 'Potential', value: `${metrics.scorePotenial}`, sub: 'If fixed', color: 'green', icon: Zap },
            ].map((m, i) => (
              <MetricCard key={m.label} {...m} delay={i * 0.05} animate={animateMetrics} />
            ))}
          </div>

          {/* ── Main Grid ── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">
            {/* Score gauge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="glass rounded-2xl p-5 neon-border-blue"
            >
              <h3 className="text-sm font-semibold text-white/70 mb-4 flex items-center gap-2">
                <Activity className="w-4 h-4 text-blue-400" /> Score Overview
              </h3>
              <ScoreGauge
                score={metrics.netScore}
                maxScore={metrics.totalMarks}
                percentile={metrics.percentile}
              />
            </motion.div>

            {/* Radar chart */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.35 }}
              className="glass rounded-2xl p-5"
            >
              <h3 className="text-sm font-semibold text-white/70 mb-4 flex items-center gap-2">
                <Brain className="w-4 h-4 text-violet-400" /> Subject Performance
              </h3>
              <SubjectRadar />
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              className="glass rounded-2xl p-5"
            >
              <h3 className="text-sm font-semibold text-white/70 mb-4 flex items-center gap-2">
                <Zap className="w-4 h-4 text-yellow-400" /> Quick Actions
              </h3>
              <QuickActions />
            </motion.div>
          </div>

          {/* ── Timeline + Darr ── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">
            <div className="lg:col-span-2 glass rounded-2xl p-5">
              <h3 className="text-sm font-semibold text-white/70 mb-4 flex items-center gap-2">
                <Clock className="w-4 h-4 text-cyan-400" /> Time vs Accuracy Timeline
              </h3>
              <TimelineChart />
            </div>
            <div className="glass rounded-2xl p-5">
              <h3 className="text-sm font-semibold text-white/70 mb-4 flex items-center gap-2">
                <Brain className="w-4 h-4 text-yellow-400" /> Darr (Hesitation) Meter
              </h3>
              <DarrMeter darrIndex={metrics.darrIndex} />
            </div>
          </div>

          {/* ── Blunders + Recent Tests ── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <BlunderAlert />
            <RecentTests />
          </div>

        </div>
      </main>
    </div>
  )
}
