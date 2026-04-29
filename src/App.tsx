import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'
import { useAuthStore } from './store/authStore'
import { useExpenseStore } from './store/useExpenseStore'
import { useLoanStore } from './store/useLoanStore'
import { AuthScreen } from './components/Auth/AuthScreen'
import { MatchingScreen } from './components/Match/MatchingScreen'
import { MainLayout } from './components/Layout/MainLayout'
import { BalanceHeader } from './components/Dashboard/BalanceHeader'
import { ExpenseList } from './components/Dashboard/ExpenseList'
import { FixedExpensesScreen } from './components/FixedExpenses/FixedExpensesScreen'
import { LoansScreen } from './components/Loans/LoansScreen'
import { ProfileScreen } from './components/Profile/ProfileScreen'
import { AddExpenseModal } from './components/Dashboard/AddExpenseModal'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader2, Sparkles, CheckCircle2, Plus } from 'lucide-react'

function App() {
  const { user, match, setUser, refreshProfile } = useAuthStore()
  const { fetchExpenses, settleAll, loading: storeLoading } = useExpenseStore()
  const { fetchLoans } = useLoanStore()
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'diarios' | 'fijos' | 'prestamos' | 'perfil'>('diarios')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [settleSuccess, setSettleSuccess] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) refreshProfile()
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) refreshProfile()
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (match?.status === 'active') {
      fetchExpenses()
      fetchLoans()
      
      const expenseSub = supabase
        .channel('db-changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'expenses', filter: `match_id=eq.${match.id}` }, 
        () => fetchExpenses())
        .on('postgres_changes', { event: '*', schema: 'public', table: 'loans', filter: `match_id=eq.${match.id}` }, 
        () => fetchLoans())
        .subscribe()

      return () => { expenseSub.unsubscribe() }
    }
  }, [match])

  const handleSettle = async () => {
    if (window.confirm("¿Están seguros de que quieren saldar todas las deudas?")) {
      try {
        await settleAll()
        setSettleSuccess(true)
        setTimeout(() => setSettleSuccess(false), 3000)
      } catch (err: any) {
        alert("Error al limpiar la cuenta: " + err.message)
      }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="animate-spin text-indigo-500" size={40} />
      </div>
    )
  }

  if (!user) return <AuthScreen />
  if (!match || match.status !== 'active') return <MatchingScreen />

  return (
    <MainLayout 
      activeTab={activeTab} 
      setActiveTab={setActiveTab}
    >
      <div className="space-y-8">
        <AnimatePresence mode='wait'>
          {activeTab === 'diarios' && (
            <motion.div 
              key="diarios"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-8"
            >
              <BalanceHeader />
              
              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => setIsModalOpen(true)}
                  className="flex items-center justify-center gap-3 bg-slate-900 text-white py-5 rounded-[2rem] text-xs font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all"
                >
                  <Plus size={18} strokeWidth={3} />
                  <span>Nuevo Gasto</span>
                </button>

                <button 
                  onClick={handleSettle}
                  disabled={storeLoading || settleSuccess}
                  className={`flex items-center justify-center gap-3 py-5 rounded-[2rem] text-[10px] font-black uppercase tracking-widest transition-all border shadow-premium active:scale-95 ${
                    settleSuccess 
                      ? 'bg-emerald-500 text-white border-emerald-400' 
                      : 'bg-white text-emerald-600 border-emerald-100 hover:bg-emerald-50'
                  }`}
                >
                  {storeLoading ? <Loader2 className="animate-spin" size={14} /> : settleSuccess ? <CheckCircle2 size={16} /> : <Sparkles size={16} />}
                  <span>{settleSuccess ? 'Limpio' : 'Limpiador'}</span>
                </button>
              </div>

              <ExpenseList />
            </motion.div>
          )}

          {activeTab === 'fijos' && (
            <motion.div 
              key="fijos"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <FixedExpensesScreen />
            </motion.div>
          )}

          {activeTab === 'prestamos' && (
            <motion.div 
              key="prestamos"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <LoansScreen />
            </motion.div>
          )}

          {activeTab === 'perfil' && (
            <motion.div 
              key="perfil"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <ProfileScreen />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AddExpenseModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </MainLayout>
  )
}

export default App
