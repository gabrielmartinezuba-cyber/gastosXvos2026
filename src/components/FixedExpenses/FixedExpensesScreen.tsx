import { useState, useEffect } from 'react'
import { useFixedExpenseStore } from '../../store/useFixedExpenseStore'
import { useAuthStore } from '../../store/authStore'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Trash2, Calendar, Banknote, Loader2, Sparkles } from 'lucide-react'

export const FixedExpensesScreen = () => {
  const { fixedExpenses, fetchFixedExpenses, addFixedExpense, deleteFixedExpense } = useFixedExpenseStore()
  const { profile, partnerProfile } = useAuthStore()
  const [newName, setNewName] = useState('')
  const [newAmount, setNewAmount] = useState('')
  const [isAdding, setIsAdding] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchFixedExpenses()
  }, [])

  const myName = (profile?.display_name || 'Yo').split(' ')[0]
  const rawPartnerName = partnerProfile?.display_name || partnerProfile?.email?.split('@')[0] || 'Pareja'
  const partnerName = rawPartnerName.charAt(0).toUpperCase() + rawPartnerName.slice(1).split(' ')[0]

  const incomeMio = Number(profile?.monthly_income || 0)
  const incomePareja = Number(partnerProfile?.monthly_income || 0)
  const incomeTotal = incomeMio + incomePareja
  const totalFijos = fixedExpenses.reduce((acc, curr) => acc + Number(curr.amount), 0)

  const miPorcentaje = incomeTotal > 0 ? (incomeMio / incomeTotal) : 0.5
  const parejaPorcentaje = incomeTotal > 0 ? (incomePareja / incomeTotal) : 0.5
  const miAporte = totalFijos * miPorcentaje
  const parejaAporte = totalFijos * parejaPorcentaje

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(val)

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newName || !newAmount) return
    setSaving(true)
    setError(null)
    try {
      await addFixedExpense(newName, Number(newAmount))
      setNewName('')
      setNewAmount('')
      setIsAdding(false)
    } catch (err: any) {
      setError(err.message || "Error al guardar.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* Hero Card - Prorrata Proporcional */}
      <div className="bg-slate-900 rounded-[2.5rem] p-8 shadow-emerald-premium text-white relative overflow-hidden min-w-0">
        <div className="absolute top-0 right-0 p-6 opacity-5">
          <Calendar size={80} strokeWidth={3} />
        </div>

        <div className="relative z-10 space-y-6 min-w-0">
          <div className="space-y-1 min-w-0">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Total Fijos</span>
            <h2 className="text-4xl md:text-5xl font-black tracking-tighter leading-none truncate">{formatCurrency(totalFijos)}</h2>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-6 border-t border-white/10 min-w-0">
            <div className="space-y-1 min-w-0 overflow-hidden">
              <p className="text-indigo-400 text-[8px] font-black uppercase tracking-widest truncate">
                {myName} ({(miPorcentaje * 100).toFixed(0)}%)
              </p>
              <p className="text-xl font-black tracking-tighter truncate">{formatCurrency(miAporte)}</p>
            </div>
            <div className="space-y-1 min-w-0 overflow-hidden">
              <p className="text-emerald-400 text-[8px] font-black uppercase tracking-widest truncate">
                {partnerName} ({(parejaPorcentaje * 100).toFixed(0)}%)
              </p>
              <p className="text-xl font-black tracking-tighter truncate">{formatCurrency(parejaAporte)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de Gastos Fijos */}
      <div className="space-y-6">
        <div className="flex justify-between items-center px-2">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Servicios del Mes</h3>
          <button 
            onClick={() => setIsAdding(!isAdding)}
            className="px-4 py-2 rounded-xl bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-widest flex items-center gap-2"
          >
            {isAdding ? 'Cerrar' : <><Plus size={12} strokeWidth={3} /> Agregar</>}
          </button>
        </div>

        <AnimatePresence>
          {isAdding && (
            <motion.form 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              onSubmit={handleAdd}
              className="bg-white p-8 rounded-[2.5rem] shadow-premium border border-slate-100 space-y-6"
            >
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Nombre del servicio</label>
                  <input 
                    type="text" 
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Ej: Alquiler, Expensas..."
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-5 px-6 text-sm font-bold outline-none focus:ring-4 focus:ring-indigo-100 transition-all text-slate-900 placeholder:text-slate-300"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Monto mensual</label>
                  <input 
                    type="number" 
                    value={newAmount}
                    onChange={(e) => setNewAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-5 px-6 text-sm font-bold outline-none focus:ring-4 focus:ring-indigo-100 transition-all text-slate-900 placeholder:text-slate-300"
                  />
                </div>
              </div>
              
              {error && <p className="text-[9px] font-black text-red-500 bg-red-50 p-3 rounded-xl text-center uppercase tracking-tight border border-red-100">{error}</p>}

              <button 
                disabled={saving}
                className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] shadow-xl flex justify-center items-center gap-3 transition-all active:scale-95"
              >
                {saving ? <Loader2 className="animate-spin" size={16} /> : <><Sparkles size={16} /> Guardar Gasto Fijo</>}
              </button>
            </motion.form>
          )}
        </AnimatePresence>

        <div className="space-y-3 pb-10">
          {fixedExpenses.map((expense) => (
            <div 
              key={expense.id}
              className="bg-white/90 backdrop-blur-md p-6 rounded-[2rem] shadow-premium border border-white flex justify-between items-center min-w-0 group hover:bg-white transition-all"
            >
              <div className="flex items-center gap-5 min-w-0 overflow-hidden">
                <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 shrink-0 group-hover:bg-indigo-50 group-hover:text-indigo-500 transition-colors">
                  <Banknote size={18} strokeWidth={2.5} />
                </div>
                <div className="min-w-0 overflow-hidden">
                  <p className="font-black text-slate-800 text-sm tracking-tight truncate">{expense.name}</p>
                  <p className="text-[9px] text-slate-400 font-black uppercase tracking-[0.2em]">Abono Mensual</p>
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0 ml-4">
                <p className="font-black text-lg tracking-tighter truncate">${Number(expense.amount).toLocaleString('es-AR')}</p>
                <button 
                  onClick={() => deleteFixedExpense(expense.id)}
                  className="p-2 text-red-400 hover:bg-red-50 hover:text-red-600 rounded-full transition-all duration-300"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
