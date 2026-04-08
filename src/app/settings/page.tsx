'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Settings, Key, User, Brain, Shield, Bell, ChevronRight, Eye, EyeOff, Check } from 'lucide-react'

const AI_PROVIDERS = [
  { id: 'openai', name: 'OpenAI', models: ['gpt-4o', 'gpt-4o-mini', 'gpt-3.5-turbo'] },
  { id: 'anthropic', name: 'Anthropic', models: ['claude-3-5-sonnet', 'claude-3-haiku'] },
  { id: 'gemini', name: 'Google Gemini', models: ['gemini-1.5-pro', 'gemini-1.5-flash'] },
]

export default function SettingsPage() {
  const [provider, setProvider] = useState('openai')
  const [model, setModel] = useState('gpt-4o-mini')
  const [apiKey, setApiKey] = useState('')
  const [showKey, setShowKey] = useState(false)
  const [saved, setSaved] = useState(false)

  const selectedProvider = AI_PROVIDERS.find(p => p.id === provider)

  function saveSettings() {
    // Store in localStorage (or Supabase)
    localStorage.setItem('biro_ai_provider', provider)
    localStorage.setItem('biro_ai_model', model)
    localStorage.setItem('biro_ai_key', apiKey)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="min-h-screen bg-[#0F172A] lg:pl-64">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center">
              <Settings className="w-4 h-4 text-white/60" />
            </div>
            <h1 className="text-2xl font-bold text-white">Settings</h1>
          </div>
          <p className="text-white/40 text-sm">Configure your AI provider, tracking preferences, and profile.</p>
        </div>

        {/* Profile Card */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="glass rounded-2xl p-5 mb-4">
          <h2 className="text-sm font-semibold text-white/60 mb-4 flex items-center gap-2">
            <User className="w-4 h-4 text-blue-400" /> Profile
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { label: 'Full Name', placeholder: 'Rahul Sharma', key: 'name' },
              { label: 'Target Exam', placeholder: 'JEE Advanced', key: 'exam' },
              { label: 'Target College', placeholder: 'IIT Bombay', key: 'college' },
              { label: 'Target Score', placeholder: '280', key: 'score' },
              { label: 'Coaching', placeholder: 'Allen / Aakash / Self', key: 'coaching' },
              { label: 'Class', placeholder: '12th / Dropper', key: 'class' },
            ].map(f => (
              <div key={f.key}>
                <label className="text-[11px] text-white/40 block mb-1">{f.label}</label>
                <input
                  type="text" placeholder={f.placeholder}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/20 outline-none focus:border-blue-500/50 transition-colors"
                />
              </div>
            ))}
          </div>
        </motion.div>

        {/* AI Provider Card */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="glass rounded-2xl p-5 mb-4 neon-border-blue">
          <h2 className="text-sm font-semibold text-white/60 mb-1 flex items-center gap-2">
            <Brain className="w-4 h-4 text-violet-400" /> AI Provider
          </h2>
          <p className="text-[11px] text-white/30 mb-4">
            Use your own API key — zero cost limits, zero data sent to us.
          </p>

          {/* Provider Select */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            {AI_PROVIDERS.map(p => (
              <button key={p.id} onClick={() => { setProvider(p.id); setModel(p.models[0]) }}
                className={`p-3 rounded-xl border text-xs font-semibold transition-all
                  ${provider === p.id
                    ? 'bg-violet-500/20 border-violet-500/40 text-violet-300'
                    : 'bg-white/3 border-white/10 text-white/40 hover:border-white/20'}`}>
                {p.name}
                {provider === p.id && <Check className="w-3 h-3 inline ml-1" />}
              </button>
            ))}
          </div>

          {/* Model Select */}
          <div className="mb-4">
            <label className="text-[11px] text-white/40 block mb-1">Model</label>
            <select
              value={model} onChange={e => setModel(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-violet-500/50 transition-colors"
            >
              {selectedProvider?.models.map(m => (
                <option key={m} value={m} className="bg-[#0F172A]">{m}</option>
              ))}
            </select>
          </div>

          {/* API Key Input */}
          <div>
            <label className="text-[11px] text-white/40 block mb-1">
              API Key <span className="text-[10px] text-yellow-400/70">(stored locally only, never sent to our servers)</span>
            </label>
            <div className="relative">
              <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30" />
              <input
                type={showKey ? 'text' : 'password'}
                value={apiKey} onChange={e => setApiKey(e.target.value)}
                placeholder="sk-... or AIza..."
                className="w-full pl-9 pr-10 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-white/20 outline-none focus:border-violet-500/50 transition-colors font-mono"
              />
              <button onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60">
                {showKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </motion.div>

        {/* Supabase Config */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="glass rounded-2xl p-5 mb-4">
          <h2 className="text-sm font-semibold text-white/60 mb-1 flex items-center gap-2">
            <Shield className="w-4 h-4 text-cyan-400" /> Database (Supabase)
          </h2>
          <p className="text-[11px] text-white/30 mb-4">Connect your own Supabase project for data storage.</p>
          <div className="space-y-3">
            {[
              { label: 'Supabase URL', placeholder: 'https://your-project.supabase.co', key: 'url' },
              { label: 'Anon Key', placeholder: 'eyJhbGci...', key: 'key', mono: true },
            ].map(f => (
              <div key={f.key}>
                <label className="text-[11px] text-white/40 block mb-1">{f.label}</label>
                <input type="text" placeholder={f.placeholder}
                  className={`w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/20 outline-none focus:border-cyan-500/50 transition-colors ${f.mono ? 'font-mono' : ''}`}
                />
              </div>
            ))}
          </div>
        </motion.div>

        {/* Save Button */}
        <button onClick={saveSettings}
          className={`w-full py-3 rounded-xl font-semibold text-sm transition-all
            ${saved
              ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-400'
              : 'bg-gradient-to-r from-blue-500 to-violet-600 text-white hover:scale-[1.01] glow-blue'}`}>
          {saved ? '✓ Settings Saved!' : 'Save Settings'}
        </button>

      </div>
    </div>
  )
}
