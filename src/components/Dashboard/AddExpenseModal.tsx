import { useState } from 'react'
import { useExpenseStore } from '../../store/useExpenseStore'
import { useAuthStore } from '../../store/authStore'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ShoppingCart, Utensils, Zap, Banknote, Tag, Loader2, Users, Info } from 'lucide-react'

const categories = [
  { id: 'Supermercado', icon: ShoppingCart },
  { id: 'Comida', icon: Utensils },
  { id: 'Servicios', icon: Zap },
  { id: 'Préstamo', icon: Banknote },
  { id: 'Otros', icon: Tag }
]

const splitOptions = [
  { id: 50, label: '50/50', description: 'Mitad y mitad' },
  { id: 65, label: '65/35', description: 'Vos asumís más' },
  { id: 35, label: '35/65', description: 'Tu pareja asume más' }
]

export const AddExpenseModal = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('Supermercado')
  const [note, setNote] = useState('')
  const [split, setSplit] = useState(50)
  const [loading, setLoading] = useState(false)
  
  const { addExpense } = useExpenseStore()
  const { partnerProfile } = useAuthStore()

  const rawPartnerName = partnerProfile?.display_name || partnerProfile?.email?.split('@')[0] || 'Tu pareja'
  const partnerName = rawPartnerName.charAt(0).toUpperCase() + rawPartnerName.slice(1)

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
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[60]"
          />
          <motion.div 
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-2xl rounded-t-[3.5rem] p-8 z-[70] shadow-2xl border-t border-white"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-black text-slate-800 tracking-tighter">Nuevo Gasto</h2>
              <button onClick={onClose} className="bg-slate-100 p-2.5 rounded-full text-slate-400 hover:text-slate-600 transition-colors">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 max-h-[80vh] overflow-y-auto pb-4 scrollbar-hide">
              {/* Monto */}
              <div className="space-y-1">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.25em] ml-1">Monto ($)</label>
                <div className="relative">
                  <input 
                    autoFocus
                    type="number" 
                    inputMode="decimal"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00" 
                    className="w-full text-5xl font-black py-6 px-4 bg-slate-50/50 rounded-3xl outline-none focus:ring-4 focus:ring-indigo-100 transition-all placeholder:text-slate-200 tracking-tighter text-slate-900 shadow-inner border border-slate-100"
                    required
                  />
                </div>
              </div>

              {/* Categoría */}
              <div className="space-y-3">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.25em] ml-1">Categoría</label>
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-2 px-2">
                  {categories.map((cat) => {
                    const Icon = cat.icon
                    const isSelected = category === cat.id
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setCategory(cat.id)}
                        className={`flex flex-col items-center gap-3 min-w-[80px] p-4 rounded-[2rem] transition-all ${
                          isSelected 
                            ? 'bg-slate-800 text-white shadow-xl scale-105' 
                            : 'bg-slate-50 text-slate-400 border border-transparent'
                        }`}
                      >
                        <Icon size={20} />
                        <span className="text-[9px] font-black uppercase">{cat.id}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Split Selector (Pills) */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 ml-1">
                  <Users size={14} className="text-slate-400" />
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.25em]">¿Cómo dividimos?</label>
                </div>
                
                <div className="grid grid-cols-3 gap-2 bg-slate-50 border border-slate-100 p-1.5 rounded-3xl">
                  {splitOptions.map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setSplit(option.id)}
                      className={`py-3 rounded-2xl text-[10px] font-black transition-all ${
                        split === option.id 
                          ? 'bg-white text-indigo-600 shadow-sm' 
                          : 'text-slate-400 hover:text-slate-600'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>

                <div className="bg-indigo-50/50 p-4 rounded-2xl flex items-start gap-3 border border-indigo-100/50">
                  <Info size={16} className="text-indigo-500 mt-0.5" />
                  <p className="text-[11px] text-indigo-700 font-bold leading-relaxed">
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
              <div className="space-y-1">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.25em] ml-1">Nota (opcional)</label>
                <input 
                  type="text" 
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Ej: Cena, Supermercado..." 
                  className="w-full bg-slate-50/80 border border-slate-200 rounded-2xl py-5 px-6 outline-none focus:ring-4 focus:ring-indigo-100 transition-all font-bold text-slate-900 placeholder:text-slate-300"
                />
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 text-white py-6 rounded-[2rem] font-black shadow-2xl active:scale-95 transition-all text-sm uppercase tracking-[0.2em] flex justify-center items-center gap-3"
              >
                {loading ? <Loader2 className="animate-spin" size={20} /> : 'Registrar Gasto'}
              </button>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
