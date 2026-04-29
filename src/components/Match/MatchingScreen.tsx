import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../store/authStore'
import { motion } from 'framer-motion'
import { Link2, Copy, Check, LogOut, Loader2, Heart, Sparkles } from 'lucide-react'

export const MatchingScreen = () => {
  const { user, refreshProfile, signOut } = useAuthStore()
  const [inviteCode, setInviteCode] = useState<string | null>(null)
  const [inputCode, setInputCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Buscar si ya existe un match pendiente
  useEffect(() => {
    checkExistingMatch()
  }, [])

  // Escuchar cambios en tiempo real si hay un código generado
  useEffect(() => {
    if (!inviteCode) return

    console.log("Suscribiendo a cambios para el match:", inviteCode)
    
    const channel = supabase
      .channel(`match-${inviteCode}`)
      .on('postgres_changes', { 
        event: 'UPDATE', 
        schema: 'public', 
        table: 'matches', 
        filter: `id=eq.${inviteCode}` 
      }, (payload) => {
        console.log("Cambio detectado en Match:", payload.new.status)
        if (payload.new.status === 'active') {
          refreshProfile()
        }
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [inviteCode])

  const checkExistingMatch = async () => {
    if (!user) return
    const { data } = await supabase
      .from('matches')
      .select('id')
      .eq('user1_id', user.id)
      .eq('status', 'pending')
      .single()
    
    if (data) setInviteCode(data.id)
  }

  const createInvite = async () => {
    if (!user) return
    setLoading(true)
    setError(null)
    try {
      const code = Math.random().toString(36).substring(2, 8).toUpperCase()
      console.log("Intentando crear Match:", { code, user1_id: user.id })
      
      const { error } = await supabase
        .from('matches')
        .insert({ id: code, user1_id: user.id, status: 'pending' })
      
      if (error) {
        console.error("Error INSERT matches:", error)
        throw new Error("No pudimos generar el código. Reintentá en un momento.")
      }
      setInviteCode(code)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const joinMatch = async () => {
    if (!inputCode || !user) return
    setLoading(true)
    setError(null)
    try {
      const { data: match, error: matchError } = await supabase
        .from('matches')
        .update({ user2_id: user.id, status: 'active' })
        .eq('id', inputCode.toUpperCase())
        .eq('status', 'pending')
        .select()
        .single()

      if (matchError || !match) {
        throw new Error("Código inválido o ya expirado. Revisalo con tu pareja.")
      }

      await supabase.from('profiles').update({ match_id: match.id }).eq('id', match.user1_id)
      await supabase.from('profiles').update({ match_id: match.id }).eq('id', match.user2_id)

      await refreshProfile()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = () => {
    if (inviteCode) {
      navigator.clipboard.writeText(inviteCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="min-h-screen p-6 flex flex-col">
      <header className="flex justify-between items-center py-8 max-w-md mx-auto w-full">
        <h1 className="text-2xl font-black text-slate-800 tracking-tighter">gastos<span className="text-indigo-500">X</span>vos</h1>
        <motion.button 
          whileTap={{ scale: 0.9 }}
          onClick={signOut} 
          className="bg-white p-3 rounded-2xl shadow-premium border border-slate-50 text-slate-300 hover:text-red-500 transition-colors"
        >
          <LogOut size={20} />
        </motion.button>
      </header>

      <main className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full space-y-10">
        <div className="text-center space-y-4">
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="bg-indigo-100 w-20 h-20 rounded-[2rem] flex items-center justify-center mx-auto shadow-xl shadow-indigo-100"
          >
            <Heart className="text-indigo-600 fill-indigo-600" size={40} />
          </motion.div>
          <div className="space-y-1">
            <h2 className="text-4xl font-black text-slate-800 tracking-tighter italic">Casi listos...</h2>
            <p className="text-slate-400 font-bold text-sm tracking-tight">Para empezar, vinculate con tu pareja.</p>
          </div>
        </div>

        {/* Sección de Crear Invitación */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-8 rounded-[2.5rem] shadow-premium border border-white space-y-6"
        >
          <div className="flex items-center gap-3">
            <div className="bg-emerald-50 p-2 rounded-xl text-emerald-500">
              <Link2 size={20} />
            </div>
            <h3 className="font-black text-slate-700 tracking-tight">Invitá a tu pareja</h3>
          </div>
          
          {!inviteCode ? (
            <button 
              onClick={createInvite}
              disabled={loading}
              className="w-full bg-slate-800 text-white py-5 rounded-2xl font-black shadow-xl active:scale-95 transition-all flex justify-center items-center gap-3 uppercase text-xs tracking-widest"
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : (
                <>
                  <Sparkles size={18} />
                  <span>Generar Invitación</span>
                </>
              )}
            </button>
          ) : (
            <div className="space-y-4">
              <div 
                onClick={copyToClipboard}
                className="bg-slate-50 border-2 border-dashed border-indigo-100 rounded-[2rem] p-6 flex justify-between items-center cursor-pointer active:bg-indigo-50 transition-colors relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                <span className="text-3xl font-black text-indigo-600 tracking-[0.3em] relative z-10">{inviteCode}</span>
                {copied ? <Check className="text-emerald-500 relative z-10" /> : <Copy className="text-slate-300 relative z-10" />}
              </div>
              <div className="flex items-center justify-center gap-2">
                <Loader2 className="animate-spin text-indigo-500" size={14} />
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Esperando a tu pareja...</p>
              </div>
            </div>
          )}
        </motion.div>

        <div className="relative flex justify-center text-[10px] uppercase font-black tracking-[0.4em] text-slate-300">
          <span className="bg-transparent px-4">o</span>
        </div>

        {/* Sección de Ingresar Código */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-8 rounded-[2.5rem] shadow-premium border border-white space-y-6"
        >
          <h3 className="font-black text-slate-700 tracking-tight">Ingresá el código de tu pareja</h3>
          <div className="space-y-4">
            <input 
              type="text" 
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value.toUpperCase())}
              placeholder="CÓDIGO"
              className="w-full bg-slate-50 border-none rounded-2xl py-5 px-6 focus:ring-2 focus:ring-indigo-500 transition-all outline-none font-black text-center text-3xl tracking-[0.4em] text-indigo-600 placeholder:text-slate-200"
            />
            {error && <p className="text-red-500 text-[10px] font-black text-center bg-red-50 py-3 rounded-xl px-4">{error}</p>}
            <button 
              onClick={joinMatch}
              disabled={loading || !inputCode}
              className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-black shadow-xl shadow-indigo-100 active:scale-95 transition-all flex justify-center items-center uppercase text-xs tracking-widest"
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : 'Vincularme'}
            </button>
          </div>
        </motion.div>
      </main>
    </div>
  )
}
