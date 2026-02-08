import { motion } from 'framer-motion'
import { useNavigate, useLocation } from 'react-router-dom'
import { Home, CheckSquare, Star, Settings } from 'lucide-react'
import useStore from '../../store/useStore'

const tabs = [
  { id: 'home', path: '/', label: 'Home', icon: Home },
  { id: 'tasks', path: '/dashboard', label: 'Tasks', icon: CheckSquare },
  { id: 'rewards', path: '/rewards', label: 'Rewards', icon: Star },
  { id: 'parent', path: '/parent', label: 'Settings', icon: Settings },
]

export default function FloatingNav() {
  const navigate = useNavigate()
  const location = useLocation()
  const { currentChild, children } = useStore()

  const child = currentChild ? children[currentChild] : null
  const theme = child?.theme || 'bria'

  // Theme colors
  const themeColors = {
    bria: {
      primary: '#F43F5E',
      bg: 'rgba(244, 63, 94, 0.12)',
    },
    naya: {
      primary: '#14B8A6',
      bg: 'rgba(20, 184, 166, 0.12)',
    },
  }

  const activeTheme = themeColors[theme] || themeColors.bria

  // Determine active tab
  const getActiveTab = () => {
    const path = location.pathname
    if (path === '/') return 'home'
    if (path === '/parent') return 'parent'
    if (path === '/rewards') return 'rewards'
    // Tasks includes dashboard, checklists, timer, calendar, notes
    if (path.startsWith('/dashboard') || path.startsWith('/checklist') ||
        path === '/timer' || path === '/calendar' || path === '/notes') {
      return 'tasks'
    }
    return 'home'
  }

  const activeTab = getActiveTab()

  return (
    <motion.nav
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      className="fixed z-50"
      style={{
        bottom: 'max(24px, env(safe-area-inset-bottom))',
        left: '50%',
        transform: 'translateX(-50%)',
      }}
    >
      <div
        className="flex items-center gap-1 px-2 py-1.5"
        style={{
          background: 'rgba(255, 255, 255, 0.92)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderRadius: '9999px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.08)',
          border: '1px solid rgba(255,255,255,0.6)',
        }}
      >
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id

          return (
            <motion.button
              key={tab.id}
              onClick={() => navigate(tab.path)}
              whileTap={{ scale: 0.92 }}
              className="relative flex flex-col items-center gap-0.5 transition-all duration-200 outline-none"
              style={{
                padding: isActive ? '10px 20px' : '10px 14px',
                borderRadius: '9999px',
                background: isActive ? activeTheme.bg : 'transparent',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              <Icon
                size={20}
                strokeWidth={isActive ? 2.5 : 1.5}
                style={{
                  color: isActive ? activeTheme.primary : '#94A3B8',
                  transition: 'color 0.2s ease',
                }}
              />
              <span
                style={{
                  fontSize: '10px',
                  fontWeight: isActive ? 600 : 400,
                  color: isActive ? activeTheme.primary : '#94A3B8',
                  transition: 'all 0.2s ease',
                }}
              >
                {tab.label}
              </span>
            </motion.button>
          )
        })}
      </div>
    </motion.nav>
  )
}
