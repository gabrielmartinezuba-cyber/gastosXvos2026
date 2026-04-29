import { useState, useEffect } from 'react'
import { useAuthStore } from '../../store/authStore'
import { motion, AnimatePresence } from 'framer-motion'
import { X, User, Check, Loader2, Banknote } from 'lucide-react'

export const ProfileModal = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
  const { profile, updateProfile } = useAuthStore()
  const [name, setName] = useState('')
  const [income, setIncome] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (profile) {
      setName(profile.display_name || '')
      setIncome(profile.monthly_income?.toString() || '')
    }
  }, [profile])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    setLoading(true)
    try {
      await updateProfile({
        display_name: name.trim(),
        monthly_income: income ? Number(income) : 0
      })
      console.log("Perfil actualizado exitosamente:", { name, income })
      setSuccess(true)
      setTimeout(() => {
        setSuccess(false)
        onClose()
      }, 1500)
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
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[60]"
          />
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-md bg-white rounded-[2.5rem] p-8 z-[70] shadow-2xl shadow-black/20"
          >
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-3">
                <div className="bg-indigo-100 p-2.5 rounded-2xl text-indigo-600">
                  <User size={24} />
                </div>
                <h2 className="text-2xl font-black text-slate-800 tracking-tight">Mi Perfil</h2>
              </div>
              <button onClick={onClose} className="bg-slate-50 p-2.5 rounded-full text-slate-400 hover:bg-slate-100 transition-colors">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-6">
              <div className="space-y-3">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Tu Nombre</label>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Tu nombre o apodo" 
                  className="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-100 focus:bg-white rounded-2xl py-4 px-6 outline-none transition-all font-bold text-slate-800 text-lg shadow-inner"
                  required
                />
              </div>

              <div className="space-y-3">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Ingresos Mensuales (Opcional)</label>
                <div className="relative">
                  <Banknote className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                  <input 
                    type="number" 
                    value={income}
                    onChange={(e) => setIncome(e.target.value)}
                    placeholder="0.00" 
                    className="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-100 focus:bg-white rounded-2xl py-4 pl-12 pr-6 outline-none transition-all font-bold text-slate-800 text-lg shadow-inner"
                  />
                </div>
                <p className="text-[10px] text-slate-400 px-1 font-medium italic leading-relaxed">
                  Servirá para calcular gastos proporcionales a tu sueldo en el futuro.
                </p>
              </div>

              <button 
                type="submit"
                disabled={loading || success}
                className={`w-full py-5 rounded-[1.5rem] font-black shadow-xl active:scale-95 transition-all text-sm uppercase tracking-widest flex justify-center items-center gap-3 ${
                  success 
                    ? 'bg-emerald-500 text-white shadow-emerald-200' 
                    : 'bg-indigo-600 text-white shadow-indigo-200 hover:bg-indigo-700'
                }`}
              >
                {loading ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : success ? (
                  <>
                    <Check size={20} />
                    <span>¡Guardado!</span>
                  </>
                ) : (
                  'Guardar Cambios'
                )}
              </button>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
