import { motion, AnimatePresence } from 'framer-motion'
import { Wallet, Calendar, HandCoins, User } from 'lucide-react'

interface MainLayoutProps {
  children: React.ReactNode
  activeTab: 'diarios' | 'fijos' | 'prestamos' | 'perfil'
  setActiveTab: (tab: 'diarios' | 'fijos' | 'prestamos' | 'perfil') => void
}

export const MainLayout = ({ children, activeTab, setActiveTab }: MainLayoutProps) => {
  const tabs = [
    { id: 'diarios', icon: Wallet, label: 'Diarios' },
    { id: 'fijos', icon: Calendar, label: 'Fijos' },
    { id: 'prestamos', icon: HandCoins, label: 'Préstamos' },
    { id: 'perfil', icon: User, label: 'Perfil' },
  ]

  return (
    <div className="h-[100dvh] max-w-md mx-auto relative flex flex-col overflow-hidden bg-white/50 select-none">
      {/* Header Minimalista */}
      <header className="px-8 pt-10 pb-2 flex justify-center items-center z-50">
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center"
        >
          <div className="flex items-center gap-1 mb-0.5 opacity-30">
            <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full" />
            <span className="text-[8px] font-black text-slate-400 uppercase tracking-[0.4em]">Life-Sync</span>
          </div>
          <h1 className="text-xl font-black text-slate-800 tracking-tighter leading-none">
            gastos<span className="text-indigo-500">X</span>vos
          </h1>
        </motion.div>
      </header>

      {/* Contenedor de Pantallas (Scrollable) */}
      <main className="flex-1 overflow-y-auto scrollbar-hide px-6 pt-6 pb-32">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom Nav (Anclado al ras) */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 max-w-md mx-auto">
        <div className="w-full h-22 glass-dock rounded-t-[2.5rem] rounded-b-none shadow-dock px-2 flex justify-around items-center pointer-events-auto border-t border-white/40">
          {tabs.map((tab) => (
            <TabButton 
              key={tab.id} 
              tab={tab} 
              isActive={activeTab === tab.id} 
              onClick={() => setActiveTab(tab.id as any)} 
            />
          ))}
        </div>
      </nav>
    </div>
  )
}

const TabButton = ({ tab, isActive, onClick }: { tab: any, isActive: boolean, onClick: () => void }) => {
  const Icon = tab.icon
  return (
    <button 
      onClick={onClick}
      className={`flex flex-col items-center gap-1.5 transition-all relative flex-1 group ${isActive ? 'text-indigo-600' : 'text-slate-300'}`}
    >
      <div className={`p-2 rounded-xl transition-all ${isActive ? 'bg-indigo-50 scale-105' : 'group-hover:text-slate-400'}`}>
        <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
      </div>
      <span className="text-[8px] font-black uppercase tracking-widest">{tab.label}</span>
      {isActive && (
        <motion.div 
          layoutId="active-tab-indicator" 
          className="absolute -bottom-2 w-1 h-1 bg-indigo-600 rounded-full" 
        />
      )}
    </button>
  )
}
