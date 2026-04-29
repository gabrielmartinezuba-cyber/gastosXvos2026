import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../store/authStore'
import { motion, AnimatePresence } from 'framer-motion'
import { LogIn, UserPlus, Mail, Lock, Loader2, Sparkles } from 'lucide-react'

export const AuthScreen = () => {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const setUser = useAuthStore((state) => state.setUser)

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (isLogin) {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        setUser(data.user)
      } else {
        const { data, error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
        setUser(data.user)
      }
    } catch (err: any) {
      setError(err.message === 'Invalid login credentials' ? 'Email o contraseña incorrectos' : err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 relative overflow-hidden bg-white">
      {/* Background Decor */}
      <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[40%] bg-indigo-50/50 rounded-full blur-[100px]" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[40%] bg-rose-50/50 rounded-full blur-[100px]" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md space-y-12 relative z-10"
      >
        {/* Logo & Intro */}
        <div className="text-center space-y-4">
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', damping: 15 }}
            className="w-20 h-20 bg-slate-900 rounded-[2rem] shadow-2xl flex items-center justify-center mx-auto mb-8 ring-8 ring-indigo-50/50"
          >
            <Sparkles className="text-white" size={40} strokeWidth={2.5} />
          </motion.div>
          <div className="space-y-1">
            <h1 className="text-5xl font-black text-slate-800 tracking-tighter leading-none">
              gastos<span className="text-indigo-600">X</span>vos
            </h1>
            <p className="text-slate-400 font-bold text-sm tracking-tight">Finanzas compartidas nivel premium.</p>
          </div>
        </div>

        {/* Card de Formulario */}
        <div className="glass-card p-10 rounded-[3rem] shadow-indigo-premium border border-white">
          <div className="flex gap-4 p-2 bg-slate-50 rounded-2xl mb-10">
            <button 
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${isLogin ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}
            >
              Iniciar Sesión
            </button>
            <button 
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${!isLogin ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}
            >
              Registrarme
            </button>
          </div>

          <form onSubmit={handleAuth} className="space-y-6">
            <div className="space-y-4">
              <div className="relative">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} strokeWidth={2.5} />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email" 
                  className="w-full bg-slate-50 border-none rounded-2xl py-5 pl-14 pr-6 outline-none focus:ring-2 focus:ring-indigo-100 transition-all font-bold text-slate-800"
                  required
                />
              </div>
              <div className="relative">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} strokeWidth={2.5} />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Contraseña" 
                  className="w-full bg-slate-50 border-none rounded-2xl py-5 pl-14 pr-6 outline-none focus:ring-2 focus:ring-indigo-100 transition-all font-bold text-slate-800"
                  required
                />
              </div>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-rose-50 text-rose-500 text-[10px] font-black p-4 rounded-xl text-center uppercase tracking-widest border border-rose-100"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-slate-900 text-white py-6 rounded-2xl font-black uppercase text-[10px] tracking-[0.3em] shadow-2xl flex justify-center items-center gap-3 active:scale-95 transition-all"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  {isLogin ? <LogIn size={18} strokeWidth={3} /> : <UserPlus size={18} strokeWidth={3} />}
                  <span>{isLogin ? 'Entrar' : 'Comenzar'}</span>
                </>
              )}
            </button>
          </form>
        </div>

        <footer className="text-center opacity-20 select-none">
          <p className="text-[9px] font-black uppercase tracking-[0.5em]">Built with Love & AI</p>
        </footer>
      </motion.div>
    </div>
  )
}
