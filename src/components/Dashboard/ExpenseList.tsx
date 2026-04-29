import { useExpenseStore } from '../../store/useExpenseStore'
import { useAuthStore } from '../../store/authStore'
import { motion, AnimatePresence } from 'framer-motion'
import { Trash2, ShoppingCart, Utensils, Zap, Banknote, Tag, ReceiptText } from 'lucide-react'

const categoryIcons: Record<string, any> = {
  'Supermercado': ShoppingCart,
  'Comida': Utensils,
  'Servicios': Zap,
  'Préstamo': Banknote,
  'Otros': Tag
}

export const ExpenseList = () => {
  const { expenses, deleteExpense } = useExpenseStore()
  const { user, partnerProfile } = useAuthStore()

  const rawName = partnerProfile?.display_name || partnerProfile?.email?.split('@')[0] || 'Tu pareja'
  const partnerName = rawName.charAt(0).toUpperCase() + rawName.slice(1).split(' ')[0]

  if (expenses.length === 0) {
    return (
      <div className="py-24 text-center space-y-6 opacity-30 select-none">
        <div className="w-20 h-20 bg-white rounded-3xl shadow-premium flex items-center justify-center mx-auto text-slate-200">
          <ReceiptText size={40} strokeWidth={1.5} />
        </div>
        <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.4em]">Sin gastos recientes</p>
      </div>
    )
  }

  return (
    <div className="space-y-8 pb-10">
      <div className="flex justify-between items-center px-4">
        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Actividad Reciente</h3>
        <span className="text-[10px] font-black bg-indigo-50 text-indigo-500 px-3 py-1 rounded-full">{expenses.length}</span>
      </div>
      
      <div className="space-y-3">
        <AnimatePresence mode='popLayout'>
          {expenses.map((expense) => {
            const Icon = categoryIcons[expense.category] || Tag
            const isMine = expense.payer_id === user?.id

            return (
              <motion.div 
                layout
                key={expense.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white/90 backdrop-blur-md p-6 rounded-[2rem] shadow-premium border border-white flex justify-between items-center group hover:bg-white transition-all duration-300 min-w-0"
              >
                <div className="flex items-center gap-5 min-w-0">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-all duration-500 ${
                    isMine ? 'bg-indigo-50 text-indigo-500' : 'bg-emerald-50 text-emerald-500'
                  }`}>
                    <Icon size={18} strokeWidth={2.5} />
                  </div>
                  <div className="min-w-0">
                    <p className="font-black text-slate-800 text-sm tracking-tight leading-none mb-1.5 truncate">{expense.note || expense.category}</p>
                    <div className="flex items-center gap-2">
                      <div className={`w-1.5 h-1.5 rounded-full ${isMine ? 'bg-indigo-400' : 'bg-emerald-400'}`} />
                      <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest truncate">
                        {isMine ? 'PAGASTE VOS' : `PAGÓ ${partnerName.toUpperCase()}`}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 shrink-0 ml-4">
                  <p className="font-black text-lg tracking-tighter text-slate-900">
                    ${Number(expense.amount).toLocaleString('es-AR')}
                  </p>
                  <button 
                    onClick={() => {
                      if (window.confirm("¿Borrar este gasto?")) deleteExpense(expense.id)
                    }}
                    className="p-2 text-red-400 hover:bg-red-50 hover:text-red-600 rounded-full transition-all duration-300"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </div>
  )
}
