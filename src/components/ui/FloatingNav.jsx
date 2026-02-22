import { motion } from 'framer-motion'
import { useNavigate, useLocation } from 'react-router-dom'
import { Home, CheckSquare, Star, Settings } from 'lucide-react'
import useStore from '../../store/useStore'

const tabs = [
  { id: 'home', path: '/home', label: 'Home', icon: Home },
  { id: 'tasks', path: '/dashboard', label: 'Tasks', icon: CheckSquare },
  { id: 'rewards', path: '/rewards', label: 'Rewards', icon: Star },
  { id: 'parent', path: '/', label: 'Settings', icon: Settings },
]

export default function FloatingNav() {
  const navigate = useNavigate()
  const location = useLocation()
  const { currentChild, children, isParentMode } = useStore()

  const child = currentChild ? children[currentChild] : null
  const theme = child?.theme || 'bria'

  // Theme colors - includes parent/slate theme
  const themeColors = {
    bria: {
      primary: '#F43F5E',
      bg: 'rgba(244, 63, 94, 0.12)',
    },
    naya: {
      primary: '#14B8A6',
      bg: 'rgba(20, 184, 166, 0.12)',
    },
    parent: {
      primary: '#475569',
      bg: 'rgba(71, 85, 105, 0.12)',
    },
  }

  // Use parent theme when in parent mode or on parent page
  const effectiveTheme = isParentMode || location.pathname === '/' ? 'parent' : theme
  const activeTheme = themeColors[effectiveTheme] || themeColors.bria

  // Determine active tab
  const getActiveTab = () => {
    const path = location.pathname
    if (path === '/home' || path === '/home-alt') return 'home'
    if (path === '/') return 'parent'
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
      className="fixed z-50 left-0 right-0 flex justify-center pointer-events-none"
      style={{
        bottom: 0,
        paddingBottom: 'max(16px, env(safe-area-inset-bottom, 16px))',
        paddingLeft: 'env(safe-area-inset-left, 0px)',
        paddingRight: 'env(safe-area-inset-right, 0px)',
      }}
    >
      <div
        className="flex items-center gap-1 px-3 py-2 pointer-events-auto"
        style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderRadius: '24px',
          boxShadow: '0 4px 24px rgba(0,0,0,0.1), 0 1px 4px rgba(0,0,0,0.06)',
          border: '1px solid rgba(255,255,255,0.8)',
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
              className="relative flex flex-col items-center justify-center transition-all duration-200 outline-none"
              style={{
                width: isActive ? 72 : 56,
                height: 48,
                borderRadius: '16px',
                background: isActive ? activeTheme.bg : 'transparent',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              <Icon
                size={20}
                strokeWidth={isActive ? 2 : 1.5}
                style={{
                  color: isActive ? activeTheme.primary : '#94A3B8',
                  transition: 'color 0.2s ease',
                }}
              />
              <span
                style={{
                  fontSize: '10px',
                  fontWeight: isActive ? 600 : 500,
                  color: isActive ? activeTheme.primary : '#94A3B8',
                  transition: 'all 0.2s ease',
                  marginTop: '2px',
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
