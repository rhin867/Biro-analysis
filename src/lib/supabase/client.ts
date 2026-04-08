import { createClient } from '@supabase/supabase-js'

// BIRO-ANALYSIS SUPABASE CLIENT v2.5
// Robust fallback for development and zero-data enforcement

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
})

/**
 * UTILITY: System State Purge
 * Resets all local indices to Zero. Used for new aspirants.
 */
export const hardNeuralReset = () => {
  if (typeof window !== 'undefined') {
    localStorage.clear()
    sessionStorage.clear()
    console.log('[Biro] Neural_Layer_Zeroed: Success')
  }
}
