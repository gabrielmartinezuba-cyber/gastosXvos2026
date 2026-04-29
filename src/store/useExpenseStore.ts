import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import { useAuthStore } from './authStore'

interface Expense {
  id: string
  amount: number
  category: string
  note: string
  payer_id: string
  match_id: string
  payer_percentage: number
  created_at: string
  is_settled: boolean
}

interface ExpenseState {
  expenses: Expense[]
  loading: boolean
  fetchExpenses: () => Promise<void>
  addExpense: (amount: number, category: string, note: string, payer_percentage: number) => Promise<void>
  deleteExpense: (id: string) => Promise<void>
  settleAll: () => Promise<void>
}

export const useExpenseStore = create<ExpenseState>((set, get) => ({
  expenses: [],
  loading: false,

  fetchExpenses: async () => {
    const { match } = useAuthStore.getState()
    if (!match) return

    set({ loading: true })
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .eq('match_id', match.id)
      .eq('is_settled', false)
      .order('created_at', { ascending: false })

    if (!error && data) {
      set({ expenses: data })
    }
    set({ loading: false })
  },

  addExpense: async (amount, category, note, payer_percentage = 50) => {
    const { user, match } = useAuthStore.getState()
    if (!user || !match) return

    const newExpense = {
      amount,
      category,
      note,
      payer_id: user.id,
      match_id: match.id,
      payer_percentage,
      is_settled: false
    }

    const { error } = await supabase.from('expenses').insert(newExpense)
    if (error) throw error
    
    // Refresh local state
    get().fetchExpenses()
  },

  deleteExpense: async (id) => {
    const { error } = await supabase.from('expenses').delete().eq('id', id)
    if (error) throw error
    set({ expenses: get().expenses.filter(e => e.id !== id) })
  },

  settleAll: async () => {
    const { match, user } = useAuthStore.getState()
    if (!match || !user) throw new Error("No hay sesión o match activo")

    const currentExpenses = get().expenses
    if (currentExpenses.length === 0) return

    const totalAmount = currentExpenses.reduce((acc, curr) => acc + Number(curr.amount), 0)

    set({ loading: true })
    try {
      // 1. Crear el log de liquidación (Settlement)
      const { error: settlementError } = await supabase.from('settlements').insert({
        match_id: match.id,
        total_amount: totalAmount,
        description: `Liquidación de ${currentExpenses.length} gastos por ${user.email}`
      })

      if (settlementError) {
        console.error("Error al crear settlement:", settlementError)
        throw settlementError
      }

      // 2. Actualizar gastos (Query Estricta)
      const { error: updateError } = await supabase
        .from('expenses')
        .update({ is_settled: true })
        .eq('match_id', match.id)
        .eq('is_settled', false)

      if (updateError) {
        console.error("Error al actualizar gastos:", updateError)
        throw updateError
      }

      // 3. Limpiar estado local
      set({ expenses: [] })
      console.log("Limpieza completada exitosamente.")
      
    } catch (err) {
      console.error("Falla Crítica en SettleAll:", err)
      throw err
    } finally {
      set({ loading: false })
    }
  }
}))
