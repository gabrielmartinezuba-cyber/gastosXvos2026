import { useAuthStore } from '../../store/authStore'
import { useExpenseStore } from '../../store/useExpenseStore'
import { ArrowUpRight, ArrowDownLeft } from 'lucide-react'

export const BalanceHeader = () => {
  const { user, partnerProfile } = useAuthStore()
  const { expenses } = useExpenseStore()

  const rawName = partnerProfile?.display_name || partnerProfile?.email?.split('@')[0] || 'Tu pareja'
  const partnerName = rawName.charAt(0).toUpperCase() + rawName.slice(1)

  // Totales Brutos
  const totalBrutoMio = expenses
    .filter(e => e.payer_id === user?.id)
    .reduce((acc, curr) => acc + Number(curr.amount), 0)

  const totalBrutoPareja = expenses
    .filter(e => e.payer_id !== user?.id)
    .reduce((acc, curr) => acc + Number(curr.amount), 0)

  // Motor de Balance ASIMÉTRICO
  let partnerOwesMe = 0
  let iOwePartner = 0

  expenses.forEach(e => {
    const amount = Number(e.amount)
    const payerPercentage = Number(e.payer_percentage || 50)
    const debtPercentage = 100 - payerPercentage
    const debtAmount = (amount * debtPercentage) / 100

    if (e.payer_id === user?.id) {
      partnerOwesMe += debtAmount
    } else {
      iOwePartner += debtAmount
    }
  })

  const balance = partnerOwesMe - iOwePartner

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(Math.abs(val))

  return (
    <div className="bg-gradient-to-br from-emerald-500 to-teal-700 rounded-[2.5rem] p-8 shadow-emerald-premium border border-emerald-400/30 relative overflow-hidden group min-w-0 text-white">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 p-6 opacity-10 pointer-events-none">
        <ArrowUpRight size={100} strokeWidth={3} />
      </div>

      <div className="flex items-center gap-2 mb-6">
        <div className="w-2 h-2 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.5)] animate-pulse" />
        <span className="text-[10px] font-black text-emerald-100 uppercase tracking-[0.25em] opacity-80">Estado de cuenta</span>
      </div>
      
      <div className="relative z-10 min-w-0">
        {Math.abs(balance) < 1 ? (
          <h2 className="text-3xl font-black text-white tracking-tighter truncate">Están a mano</h2>
        ) : balance > 0 ? (
          <div className="space-y-1 min-w-0">
            <h2 className="text-xl font-black text-emerald-100/70 tracking-tight leading-none truncate">
              {partnerName} te debe
            </h2>
            <p className="text-4xl md:text-5xl font-black text-white tracking-tighter truncate leading-none">
              {formatCurrency(balance)}
            </p>
          </div>
        ) : (
          <div className="space-y-1 min-w-0">
            <h2 className="text-xl font-black text-emerald-100/70 tracking-tight leading-none truncate">
              Le debés a {partnerName}
            </h2>
            <p className="text-4xl md:text-5xl font-black text-white tracking-tighter truncate leading-none">
              {formatCurrency(balance)}
            </p>
          </div>
        )}
      </div>

      {/* Sub-tarjetas Brutas Invertidas */}
      <div className="mt-8 grid grid-cols-2 gap-3 min-w-0">
        <div className="bg-white/10 backdrop-blur-md rounded-3xl p-5 border border-white/10 flex flex-col gap-1 min-w-0 overflow-hidden">
          <div className="flex items-center gap-1.5 text-emerald-200 font-black text-[8px] uppercase tracking-widest truncate">
            <ArrowUpRight size={10} strokeWidth={3} />
            <span>Tus Gastos</span>
          </div>
          <p className="text-lg font-black text-white tracking-tighter truncate">{formatCurrency(totalBrutoMio)}</p>
        </div>
        <div className="bg-white/10 backdrop-blur-md rounded-3xl p-5 border border-white/10 flex flex-col gap-1 min-w-0 overflow-hidden">
          <div className="flex items-center gap-1.5 text-emerald-200 font-black text-[8px] uppercase tracking-widest truncate">
            <ArrowDownLeft size={10} strokeWidth={3} />
            <span>Gastos de {partnerName}</span>
          </div>
          <p className="text-lg font-black text-white tracking-tighter truncate">{formatCurrency(totalBrutoPareja)}</p>
        </div>
      </div>
    </div>
  )
}
