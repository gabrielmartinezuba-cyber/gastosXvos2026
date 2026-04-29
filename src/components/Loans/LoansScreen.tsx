import { useState, useEffect } from 'react'
import { useLoanStore } from '../../store/useLoanStore'
import { useAuthStore } from '../../store/authStore'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Trash2, HandCoins, Loader2, ArrowRightLeft, Sparkles } from 'lucide-react'

export const LoansScreen = () => {
  const { loans, fetchLoans, addLoan, deleteLoan } = useLoanStore()
  const { user, partnerProfile } = useAuthStore()
  const [amount, setAmount] = useState('')
  const [note, setNote] = useState('')
  const [toPartner, setToPartner] = useState(true)
  const [isAdding, setIsAdding] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchLoans()
  }, [])

  const partnerName = (partnerProfile?.display_name || partnerProfile?.email?.split('@')[0] || 'Pareja').split(' ')[0]

  const totalLePreste = loans
    .filter(l => l.lender_id === user?.id)
    .reduce((acc, curr) => acc + Number(curr.amount), 0)

  const totalMePresto = loans
    .filter(l => l.lender_id !== user?.id)
    .reduce((acc, curr) => acc + Number(curr.amount), 0)

  const balanceNeto = totalLePreste - totalMePresto

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(Math.abs(val))

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!amount || Number(amount) <= 0) return
    setSaving(true)
    setError(null)
    try {
      await addLoan(Number(amount), note, toPartner)
      setAmount('')
      setNote('')
      setIsAdding(false)
    } catch (err: any) {
      setError(err.message || "Error al registrar.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* Hero Card - Balance Neto de Préstamos */}
      <div className="bg-gradient-to-br from-orange-400 to-amber-600 rounded-[2.5rem] p-8 shadow-orange-premium text-white relative overflow-hidden min-w-0">
        <div className="absolute top-0 right-0 p-6 opacity-10">
          <HandCoins size={70} strokeWidth={3} />
        </div>

        <div className="relative z-10 space-y-6 min-w-0">
          <div className="space-y-1 min-w-0">
            <span className="text-[10px] font-black text-orange-100/60 uppercase tracking-[0.3em]">Estado de Préstamos</span>
            {balanceNeto === 0 ? (
              <h2 className="text-2xl font-black tracking-tighter truncate italic">Saldos en cero</h2>
            ) : balanceNeto > 0 ? (
              <div className="space-y-1 min-w-0">
                <h2 className="text-xl font-black text-orange-50 tracking-tight leading-none">
                  {partnerName} te debe
                </h2>
                <p className="text-4xl font-black tracking-tighter leading-none">{formatCurrency(balanceNeto)}</p>
              </div>
            ) : (
              <div className="space-y-1 min-w-0">
                <h2 className="text-xl font-black text-orange-50 tracking-tight leading-none">
                  Le debés a {partnerName}
                </h2>
                <p className="text-4xl font-black tracking-tighter leading-none">{formatCurrency(balanceNeto)}</p>
              </div>
            )}
          </div>

          <div className="inline-flex bg-white/10 px-4 py-2 rounded-xl items-center gap-2 text-[8px] font-black uppercase tracking-widest border border-white/5 backdrop-blur-sm">
            <Sparkles size={10} />
            {loans.length} Préstamos activos
          </div>
        </div>
      </div>

      {/* Lista de Préstamos */}
      <div className="space-y-6">
        <div className="flex justify-between items-center px-2">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Registro de Préstamos</h3>
          <button 
            onClick={() => setIsAdding(!isAdding)}
            className="px-4 py-2 rounded-xl bg-orange-50 text-orange-700 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 border border-orange-100"
          >
            {isAdding ? 'Cerrar' : <><Plus size={12} strokeWidth={3} /> Nuevo</>}
          </button>
        </div>

        <AnimatePresence>
          {isAdding && (
            <motion.form 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              onSubmit={handleAdd}
              className="bg-white p-8 rounded-[2.5rem] shadow-premium border border-slate-100 space-y-8"
            >
              <div className="flex gap-2 p-1.5 bg-slate-50 border border-slate-100 rounded-2xl">
                <button 
                  type="button"
                  onClick={() => setToPartner(true)}
                  className={`flex-1 py-4 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${toPartner ? 'bg-white text-orange-600 shadow-sm border border-orange-100' : 'text-slate-400'}`}
                >
                  Yo presté
                </button>
                <button 
                  type="button"
                  onClick={() => setToPartner(false)}
                  className={`flex-1 py-4 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${!toPartner ? 'bg-white text-orange-600 shadow-sm border border-orange-100' : 'text-slate-400'}`}
                >
                  Me prestaron
                </button>
              </div>

              <div className="space-y-6">
                <div className="space-y-2 text-center">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Monto a registrar</label>
                  <input 
                    type="number" 
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-slate-50 border border-slate-100 rounded-3xl py-6 px-6 text-4xl font-black outline-none focus:ring-4 focus:ring-orange-100 transition-all text-slate-900 tracking-tighter text-center placeholder:text-slate-200"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Nota o concepto</label>
                  <input 
                    type="text" 
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Ej: Favor, Tarjeta..."
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-5 px-6 text-sm font-bold outline-none focus:ring-4 focus:ring-orange-100 transition-all text-slate-900 placeholder:text-slate-300"
                  />
                </div>
              </div>

              {error && <p className="text-[9px] font-black text-red-500 bg-red-50 p-3 rounded-xl text-center uppercase tracking-tight border border-red-100">{error}</p>}

              <button 
                disabled={saving}
                className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] shadow-xl flex justify-center items-center gap-3 transition-all active:scale-95"
              >
                {saving ? <Loader2 className="animate-spin" size={14} /> : 'Registrar Préstamo'}
              </button>
            </motion.form>
          )}
        </AnimatePresence>

        <div className="space-y-3">
          {loans.map((loan) => {
            const isILent = loan.lender_id === user?.id
            return (
              <div 
                key={loan.id}
                className="bg-white/90 backdrop-blur-md p-6 rounded-[2rem] shadow-premium border border-white flex justify-between items-center min-w-0 group hover:bg-white transition-all"
              >
                <div className="flex items-center gap-5 min-w-0">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-all duration-500 ${
                    isILent ? 'bg-orange-50 text-orange-600 shadow-sm' : 'bg-slate-50 text-slate-300'
                  }`}>
                    <ArrowRightLeft size={18} strokeWidth={2.5} className={!isILent ? 'rotate-180' : ''} />
                  </div>
                  <div className="min-w-0">
                    <p className="font-black text-slate-800 text-sm tracking-tight">{loan.note || 'Sin nota'}</p>
                    <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">
                      {isILent ? `Prestaste a ${partnerName}` : `${partnerName} te prestó`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0 ml-4">
                  <p className="font-black text-lg tracking-tighter text-slate-900">
                    ${Number(loan.amount).toLocaleString('es-AR')}
                  </p>
                  <button 
                    onClick={() => {
                      if (window.confirm("¿Se devolvió este dinero?")) deleteLoan(loan.id)
                    }}
                    className="p-2 text-red-400 hover:bg-red-50 hover:text-red-600 rounded-full transition-all duration-300"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
