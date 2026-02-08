import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, WifiOff } from 'lucide-react'
import useStore from '../store/useStore'
import useDailyReset from '../hooks/useDailyReset'
import useSupabaseSync, { getSyncQueueLength } from '../hooks/useSupabaseSync'
import useStarSync from '../hooks/useStarSync'
import useNetworkStatus from '../hooks/useNetworkStatus'
import FloatingNav from './ui/FloatingNav'

// Page title mapping for context-aware header
const pageTitles = {
  '/': 'Home',
  '/dashboard': 'Tasks',
  '/checklist/morning': 'Morning',
  '/checklist/bedtime': 'Bedtime',
  '/checklist/chores': 'Chores',
  '/timer': 'Timer',
  '/calendar': 'Calendar',
  '/notes': 'Notes',
  '/rewards': 'Rewards',
  '/grocery': 'Grocery',
  '/progress': 'Progress',
  '/parent': 'Settings',
}

export default function Layout() {
  const navigate = useNavigate()
  const location = useLocation()
  const { currentChild, children, isParentMode } = useStore()

  // Check for daily reset on app load
  useDailyReset()

  // Sync with Supabase
  useSupabaseSync()

  // Sync star data with Supabase
  useStarSync()

  // Network status for offline indicator
  const { isOnline } = useNetworkStatus()
  const pendingCount = getSyncQueueLength()

  const child = currentChild ? children[currentChild] : null
  const isYoungChild = child && child.age <= 5

  // Get current page title
  const currentPageTitle = pageTitles[location.pathname] ||
    (location.pathname.startsWith('/checklist/') ? 'Tasks' : 'UR1IFE')

  // Theme colors
  const themeColors = {
    bria: {
      headerBg: 'bg-rose-500/90',
      accent: 'bg-rose-400',
      gradient: 'from-rose-50 via-pink-50 to-rose-100',
    },
    naya: {
      headerBg: 'bg-teal-500/90',
      accent: 'bg-teal-400',
      gradient: 'from-teal-50 via-cyan-50 to-teal-100',
    },
    parent: {
      headerBg: 'bg-slate-600/90',
      accent: 'bg-slate-500',
      gradient: 'from-slate-50 via-gray-50 to-slate-100',
    },
  }

  const theme = isParentMode ? 'parent' : (child?.theme || 'bria')
  const colors = themeColors[theme] || themeColors.bria

  // Hide header on landing page
  const showHeader = location.pathname !== '/'

  return (
    <div className={`min-h-screen min-h-[100dvh] bg-gradient-to-br ${colors.gradient} transition-colors duration-300`}>
      {/* Subtle background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute ${colors.accent} opacity-5 rounded-full blur-3xl
          w-48 h-48 sm:w-64 sm:h-64 md:w-80 md:h-80
          -top-10 -left-10 sm:-top-16 sm:-left-16`}
        />
        <div className={`absolute ${colors.accent} opacity-5 rounded-full blur-3xl
          w-40 h-40 sm:w-56 sm:h-56 md:w-72 md:h-72
          bottom-32 right-5 sm:bottom-40 sm:right-8`}
        />
      </div>

      {/* Compact header */}
      {showHeader && (
        <motion.header
          className={`sticky top-0 z-40 ${colors.headerBg} backdrop-blur-lg shadow-sm safe-top safe-left safe-right`}
          initial={{ y: -60 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div className="flex items-center justify-between px-3 py-2 sm:px-4">
            {/* Back button */}
            <motion.button
              onClick={() => {
                if (window.history.length > 2) {
                  navigate(-1)
                } else {
                  navigate('/')
                }
              }}
              className="p-2 rounded-xl bg-white/20 hover:bg-white/30 active:bg-white/40 transition-colors"
              whileTap={{ scale: 0.95 }}
            >
              <ArrowLeft className="w-5 h-5 text-white" strokeWidth={2} />
            </motion.button>

            {/* Page Title - Compact */}
            <div className="flex items-center gap-2">
              {!isOnline && (
                <motion.div
                  className="flex items-center gap-1 bg-amber-500 text-white px-2 py-1 rounded-full text-xs font-medium"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <WifiOff className="w-3 h-3" />
                  {pendingCount > 0 && <span>{pendingCount}</span>}
                </motion.div>
              )}
              <motion.div
                key={currentPageTitle}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                <span className="font-semibold text-white text-sm">
                  {currentPageTitle}
                </span>
              </motion.div>
            </div>

            {/* Spacer for balance */}
            <div className="w-9" />
          </div>
        </motion.header>
      )}

      {/* Main content with bottom padding for floating nav */}
      <main className={`relative z-10 safe-left safe-right pb-28 ${isYoungChild ? 'pb-32' : 'pb-28'}`}>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{
              type: 'spring',
              stiffness: 380,
              damping: 30,
            }}
            className="will-change-transform"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Floating Navigation - Consistent across all screens */}
      <FloatingNav />
    </div>
  )
}
