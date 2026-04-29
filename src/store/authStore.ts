import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import type { User } from '@supabase/supabase-js'

interface AuthState {
  user: User | null
  profile: any | null
  match: any | null
  partnerProfile: any | null
  loading: boolean
  initialized: boolean
  setUser: (user: User | null) => void
  setProfile: (profile: any | null) => void
  setMatch: (match: any | null) => void
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
  updateProfile: (updates: { display_name?: string, monthly_income?: number }) => Promise<void>
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  profile: null,
  match: null,
  partnerProfile: null,
  loading: true,
  initialized: false,

  setUser: (user) => set({ user }),
  setProfile: (profile) => set({ profile }),
  setMatch: (match) => set({ match }),

  signOut: async () => {
    await supabase.auth.signOut()
    set({ user: null, profile: null, match: null, partnerProfile: null })
  },

  updateProfile: async (updates) => {
    const user = get().user
    if (!user) return

    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id)

    if (error) throw error
    
    await get().refreshProfile()
  },

  refreshProfile: async () => {
    const user = get().user
    if (!user) return

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profile) {
      set({ profile })
      
      // Fetch match if exists
      if (profile.match_id) {
        const { data: match } = await supabase
          .from('matches')
          .select('*')
          .eq('id', profile.match_id)
          .single()
        
        if (match) {
          set({ match })

          // Fetch partner profile
          const partnerId = match.user1_id === user.id ? match.user2_id : match.user1_id
          if (partnerId) {
            const { data: pProfile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', partnerId)
              .single()
            set({ partnerProfile: pProfile })
          }
        }
      }
    }
  }
}))
