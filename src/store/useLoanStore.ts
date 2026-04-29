import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import { useAuthStore } from './authStore'

interface Loan {
  id: string
  amount: number
  note: string
  lender_id: string
  borrower_id: string
  match_id: string
  created_at: string
}

interface LoanState {
  loans: Loan[]
  loading: boolean
  fetchLoans: () => Promise<void>
  addLoan: (amount: number, note: string, toPartner: boolean) => Promise<void>
  deleteLoan: (id: string) => Promise<void>
}

export const useLoanStore = create<LoanState>((set, get) => ({
  loans: [],
  loading: false,

  fetchLoans: async () => {
    const { match } = useAuthStore.getState()
    if (!match) return

    set({ loading: true })
    const { data, error } = await supabase
      .from('loans')
      .select('*')
      .eq('match_id', match.id)
      .order('created_at', { ascending: false })

    if (!error && data) {
      set({ loans: data })
    }
    set({ loading: false })
  },

  addLoan: async (amount, note, toPartner) => {
    const { user, match, partnerProfile } = useAuthStore.getState()
    if (!user || !match || !partnerProfile) return

    const lender_id = toPartner ? user.id : partnerProfile.id
    const borrower_id = toPartner ? partnerProfile.id : user.id

    const { error } = await supabase
      .from('loans')
      .insert({
        amount,
        note,
        lender_id,
        borrower_id,
        match_id: match.id
      })

    if (error) throw error
    get().fetchLoans()
  },

  deleteLoan: async (id) => {
    const { error } = await supabase
      .from('loans')
      .delete()
      .eq('id', id)

    if (error) throw error
    set({ loans: get().loans.filter(l => l.id !== id) })
  }
}))
