import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import { useAuthStore } from './authStore'

interface FixedExpense {
  id: string
  name: string
  amount: number
  match_id: string
  created_at: string
}

interface FixedExpenseState {
  fixedExpenses: FixedExpense[]
  loading: boolean
  fetchFixedExpenses: () => Promise<void>
  addFixedExpense: (name: string, amount: number) => Promise<void>
  deleteFixedExpense: (id: string) => Promise<void>
}

export const useFixedExpenseStore = create<FixedExpenseState>((set, get) => ({
  fixedExpenses: [],
  loading: false,

  fetchFixedExpenses: async () => {
    const { match } = useAuthStore.getState()
    if (!match) return

    set({ loading: true })
    const { data, error } = await supabase
      .from('fixed_expenses')
      .select('*')
      .eq('match_id', match.id)
      .order('created_at', { ascending: true })

    if (!error && data) {
      set({ fixedExpenses: data })
    }
    set({ loading: false })
  },

  addFixedExpense: async (name, amount) => {
    const { match } = useAuthStore.getState()
    if (!match) return

    const { error } = await supabase
      .from('fixed_expenses')
      .insert({ name, amount, match_id: match.id })

    if (error) throw error
    get().fetchFixedExpenses()
  },

  deleteFixedExpense: async (id) => {
    const { error } = await supabase
      .from('fixed_expenses')
      .delete()
      .eq('id', id)

    if (error) throw error
    set({ fixedExpenses: get().fixedExpenses.filter(e => e.id !== id) })
  }
}))
