import { useState } from 'react'
import { useAuthStore } from '../../store/authStore'
import { User, Mail, Save, LogOut, Banknote } from 'lucide-react'

export const ProfileScreen = () => {
  const { profile, updateProfile, signOut } = useAuthStore()
  const [displayName, setDisplayName] = useState(profile?.display_name || '')
  const [monthlyIncome, setMonthlyIncome] = useState(profile?.monthly_income?.toString() || '0')
  const [isSaving, setIsSaving] = useState(false)

  const handleUpdate = async () => {
    setIsSaving(true)
    try {
      await updateProfile({ 
        display_name: displayName, 
        monthly_income: Number(monthlyIncome) 
      })
      alert("Perfil actualizado correctamente")
    } catch (error) {
      console.error(error)
      alert("Error al actualizar perfil")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-8 px-2">
      {/* Header Perfil */}
      <div className="space-y-1">
        <h2 className="text-3xl font-black text-slate-800 tracking-tighter">Mi Perfil</h2>
        <p className="text-sm font-bold text-slate-400">Personalizá tu cuenta y finanzas</p>
      </div>

      <div className="space-y-6">
        {/* Card: Información Básica */}
        <div className="bg-white/90 backdrop-blur-md p-8 rounded-[2.5rem] shadow-premium border border-white space-y-8">
          <div className="space-y-6">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-2 flex items-center gap-2">
                <User size={12} strokeWidth={2.5} /> Nombre de usuario
              </label>
              <input 
                type="text" 
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Cómo querés que te llamen"
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-5 px-6 text-sm font-bold outline-none focus:ring-4 focus:ring-indigo-100 transition-all text-slate-900 placeholder:text-slate-300"
              />
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-2 flex items-center gap-2">
                <Banknote size={12} strokeWidth={2.5} /> Ingreso Mensual ($)
              </label>
              <input 
                type="number" 
                value={monthlyIncome}
                onChange={(e) => setMonthlyIncome(e.target.value)}
                placeholder="Tu sueldo neto"
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-5 px-6 text-sm font-bold outline-none focus:ring-4 focus:ring-indigo-100 transition-all font-mono text-slate-900 placeholder:text-slate-300"
              />
            </div>

            <div className="space-y-3 opacity-60">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-2 flex items-center gap-2">
                <Mail size={12} strokeWidth={2.5} /> Correo Registrado
              </label>
              <div className="w-full bg-slate-100/80 border border-slate-200 rounded-2xl py-5 px-6 text-sm font-bold text-slate-500">
                {profile?.email}
              </div>
            </div>
          </div>

          <button 
            onClick={handleUpdate}
            disabled={isSaving}
            className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] shadow-xl flex justify-center items-center gap-3 transition-all active:scale-95"
          >
            {isSaving ? "Guardando..." : <><Save size={16} /> Guardar Cambios</>}
          </button>
        </div>

        {/* Card: Zona Peligrosa */}
        <div className="bg-rose-50/50 p-6 rounded-[2rem] border border-rose-100 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black text-rose-400 uppercase tracking-[0.2em]">Sesión</p>
            <p className="text-xs font-bold text-rose-500">¿Querés salir?</p>
          </div>
          <button 
            onClick={signOut}
            className="bg-white p-4 rounded-2xl text-rose-500 shadow-sm border border-rose-100 hover:bg-rose-500 hover:text-white transition-all active:scale-95"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>
    </div>
  )
}
