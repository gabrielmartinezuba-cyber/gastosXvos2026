import { useState } from 'react'
import { useExpenseStore } from '../../store/useExpenseStore'
import { useAuthStore } from '../../store/authStore'
import { motion, AnimatePresence } from 'framer-motion'
import { Trash2, ReceiptText, ArrowUpDown } from 'lucide-react'

// --- Subcomponente de Fila para manejar el estado expandible localmente ---
const ExpenseRow = ({ expense, isMine, partnerName, deleteExpense }: any) => {
  const [isExpanded, setIsExpanded] = useState(false)

  const date = new Date(expense.created_at || Date.now())
  const day = date.getDate().toString().padStart(2, '0')
  const month = date.toLocaleString('es-AR', { month: 'short' })
  const splitText = `${expense.payer_percentage}/${100 - expense.payer_percentage}`

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      onClick={() => setIsExpanded(!isExpanded)}
      className="grid grid-cols-[36px_1fr_45px_auto_44px] gap-2 items-center py-3 px-1 border-b border-slate-100/60 last:border-0 hover:bg-slate-50 transition-colors cursor-pointer"
    >
      {/* 1. Fecha */}
      <div className="text-center bg-slate-50/50 rounded-lg py-1 self-start mt-0.5">
        <p className="text-[11px] font-black text-slate-500 leading-none">{day}</p>
        <p className="text-[8px] font-black uppercase text-slate-400 leading-none mt-0.5">{month}</p>
      </div>
      
      {/* 2. Detalle (Expandible) */}
      <div className="min-w-0 pl-1 self-start pt-1">
        <p className={`font-black text-slate-800 text-sm tracking-tight leading-tight mb-1 ${isExpanded ? 'whitespace-normal break-words' : 'truncate'}`}>
          {expense.note || expense.category}
        </p>
        <div className="flex items-center gap-1.5">
          <div className={`w-1.5 h-1.5 rounded-full ${isMine ? 'bg-indigo-400' : 'bg-emerald-400'}`} />
          <p className="text-[8px] text-slate-400 font-black uppercase tracking-widest truncate">
            {isMine ? 'Pagaste Vos' : `Pagó ${partnerName}`}
          </p>
        </div>
      </div>

      {/* 3. División (Ancho fijo alineado) */}
      <div className="text-[9px] font-black text-slate-400 bg-slate-100/50 px-1 py-1 rounded text-center shrink-0 w-[45px] justify-self-center self-start mt-1">
        {splitText}
      </div>
      
      {/* 4. Monto */}
      <p className="font-black text-sm tracking-tighter text-slate-900 text-right shrink-0 self-start mt-0.5">
        ${Number(expense.amount).toLocaleString('es-AR')}
      </p>

      {/* 5. Acción (Basurero) */}
      <button 
        onClick={(e) => {
          e.stopPropagation() // Previene que se expanda/colapse la fila
          if (window.confirm("¿Borrar este gasto?")) deleteExpense(expense.id)
        }}
        className="w-11 h-11 flex items-center justify-center text-red-300 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all duration-300 shrink-0 ml-auto self-start -mt-1"
      >
        <Trash2 size={16} />
      </button>
    </motion.div>
  )
}

export const ExpenseList = () => {
  const { expenses, deleteExpense } = useExpenseStore()
  const { user, partnerProfile } = useAuthStore()
  const [sortConfig, setSortConfig] = useState<{ key: 'date' | 'amount', direction: 'desc' | 'asc' }>({ key: 'date', direction: 'desc' })

  const rawName = partnerProfile?.display_name || partnerProfile?.email?.split('@')[0] || 'Pareja'
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

  const handleSort = () => {
    if (sortConfig.key === 'date') {
      setSortConfig({ key: 'amount', direction: 'desc' })
    } else if (sortConfig.key === 'amount' && sortConfig.direction === 'desc') {
      setSortConfig({ key: 'amount', direction: 'asc' })
    } else {
      setSortConfig({ key: 'date', direction: 'desc' })
    }
  }

  const sortedExpenses = [...expenses].sort((a, b) => {
    if (sortConfig.key === 'amount') {
      return sortConfig.direction === 'asc' ? Number(a.amount) - Number(b.amount) : Number(b.amount) - Number(a.amount)
    }
    const dateA = new Date(a.created_at || 0).getTime()
    const dateB = new Date(b.created_at || 0).getTime()
    return sortConfig.direction === 'asc' ? dateA - dateB : dateB - dateA
  })

  return (
    <div className="space-y-4 pb-10 px-0 md:px-2">
      <div className="flex justify-between items-center px-4">
        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Actividad Reciente</h3>
        <button 
          onClick={handleSort} 
          className="flex items-center gap-1.5 text-[9px] font-black text-slate-500 uppercase tracking-widest bg-slate-50 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors border border-slate-100"
        >
          <ArrowUpDown size={12} strokeWidth={2.5} />
          {sortConfig.key === 'date' ? 'Recientes' : sortConfig.direction === 'desc' ? 'Mayor Monto' : 'Menor Monto'}
        </button>
      </div>
      
      <div className="bg-white rounded-[2rem] shadow-premium border border-slate-50 p-2">
        <AnimatePresence mode='popLayout'>
          {sortedExpenses.map((expense) => (
            <ExpenseRow 
              key={expense.id} 
              expense={expense} 
              isMine={expense.payer_id === user?.id} 
              partnerName={partnerName} 
              deleteExpense={deleteExpense} 
            />
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}
