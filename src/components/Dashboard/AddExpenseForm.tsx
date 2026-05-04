import { useState } from 'react'
import { useExpenseStore } from '../../store/useExpenseStore'
import { useAuthStore } from '../../store/authStore'
import { motion } from 'framer-motion'
import { ShoppingCart, Utensils, Zap, Banknote, Tag, Loader2, Users, Info } from 'lucide-react'

const categories = [
  { id: 'Supermercado', icon: ShoppingCart },
  { id: 'Comida', icon: Utensils },
  { id: 'Servicios', icon: Zap },
  { id: 'Otros', icon: Tag }
]

const splitOptions = [
  { id: 50, label: '50/50' },
  { id: 65, label: '65/35' },
  { id: 35, label: '35/65' }
]

export const AddExpenseForm = ({ onClose }: { onClose: () => void }) => {
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('Supermercado')
  const [note, setNote] = useState('')
  const [split, setSplit] = useState(50)
  const [loading, setLoading] = useState(false)
  
  const { addExpense } = useExpenseStore()
  const { partnerProfile } = useAuthStore()

  const rawPartnerName = partnerProfile?.display_name || partnerProfile?.email?.split('@')[0] || 'Tu pareja'
  const partnerName = rawPartnerName.charAt(0).toUpperCase() + rawPartnerName.slice(1).split(' ')[0]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!amount || Number(amount) <= 0) return

    setLoading(true)
    try {
      await addExpense(Number(amount), category, note, split)
      onClose()
      setAmount('')
      setNote('')
      setSplit(50)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.form 
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      onSubmit={handleSubmit}
      className="bg-white p-8 rounded-[2.5rem] shadow-premium border border-slate-100 space-y-8"
    >
      <div className="space-y-6">
        {/* Monto */}
        <div className="space-y-2 text-center">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Monto del gasto ($)</label>
          <input 
            autoFocus
            type="number" 
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00" 
            className="w-full bg-slate-50 border border-slate-100 rounded-3xl py-6 px-6 text-4xl font-black outline-none focus:ring-4 focus:ring-indigo-100 transition-all text-slate-900 tracking-tighter text-center placeholder:text-slate-200 shadow-inner"
            required
          />
        </div>

        {/* Categoría */}
        <div className="space-y-3">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] ml-1">Categoría</label>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-2 px-2">
            {categories.map((cat) => {
              const Icon = cat.icon
              const isSelected = category === cat.id
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategory(cat.id)}
                  className={`flex flex-col items-center gap-2 min-w-[70px] p-3 rounded-2xl transition-all border ${
                    isSelected 
                      ? 'bg-indigo-50 border-indigo-200 text-indigo-600 shadow-sm scale-105' 
                      : 'bg-white border-slate-100 text-slate-400 hover:bg-slate-50'
                  }`}
                >
                  <Icon size={18} strokeWidth={2.5} />
                  <span className="text-[8px] font-black uppercase">{cat.id}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Split Selector */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 ml-1">
            <Users size={14} className="text-slate-400" />
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em]">¿Cómo dividimos?</label>
          </div>
          
          <div className="grid grid-cols-3 gap-2 bg-slate-50 border border-slate-100 p-1.5 rounded-2xl">
            {splitOptions.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => setSplit(option.id)}
                className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  split === option.id 
                    ? 'bg-white text-indigo-600 shadow-sm border border-indigo-100' 
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>

          <div className="bg-indigo-50/50 p-4 rounded-2xl flex items-start gap-3 border border-indigo-100/50">
            <Info size={16} className="text-indigo-500 mt-0.5 shrink-0" />
            <p className="text-[10px] text-indigo-700 font-bold leading-relaxed uppercase tracking-widest">
              {split === 50 ? (
                `Cada uno asume el 50%. ${partnerName} te deberá la mitad.`
              ) : split === 65 ? (
                `Vos asumís el 65%. ${partnerName} te deberá el 35% restante.`
              ) : (
                `Vos asumís el 35%. ${partnerName} te deberá el 65% restante.`
              )}
            </p>
          </div>
        </div>

        {/* Nota */}
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Nota o detalle</label>
          <input 
            type="text" 
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Ej: Cena, Supermercado..." 
            className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-5 px-6 text-sm font-bold outline-none focus:ring-4 focus:ring-indigo-100 transition-all text-slate-900 placeholder:text-slate-300"
          />
        </div>
      </div>

      <button 
        type="submit"
        disabled={loading}
        className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] shadow-xl flex justify-center items-center gap-3 transition-all active:scale-95"
      >
        {loading ? <Loader2 className="animate-spin" size={16} /> : 'Registrar Gasto'}
      </button>
    </motion.form>
  )
}
