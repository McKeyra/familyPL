import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, WifiOff } from 'lucide-react'
import useStore from '../store/useStore'
import useDailyReset from '../hooks/useDailyReset'
import useSupabaseSync, { getSyncQueueLength } from '../hooks/useSupabaseSync'
import useStarSync from '../hooks/useStarSync'
import useNetworkStatus from '../hooks/useNetworkStatus'
import FloatingNav from './ui/FloatingNav'

// Pages that should not show the back button
const noBackButtonPages = ['/', '/home', '/home-alt', '/dashboard', '/rewards']

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

  // Theme colors - simplified for backgrounds only
  const themeColors = {
    bria: {
      accent: 'bg-rose-400',
      gradient: 'from-rose-50 via-pink-50 to-rose-100',
      backBtn: 'bg-rose-500 hover:bg-rose-600',
    },
    naya: {
      accent: 'bg-teal-400',
      gradient: 'from-teal-50 via-cyan-50 to-teal-100',
      backBtn: 'bg-teal-500 hover:bg-teal-600',
    },
    parent: {
      accent: 'bg-slate-500',
      gradient: 'from-slate-50 via-gray-50 to-slate-100',
      backBtn: 'bg-slate-500 hover:bg-slate-600',
    },
  }

  const theme = isParentMode ? 'parent' : (child?.theme || 'bria')
  const colors = themeColors[theme] || themeColors.bria

  // Show floating back button on sub-pages
  const showBackButton = !noBackButtonPages.includes(location.pathname)

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

      {/* Floating back button - minimal, only on sub-pages */}
      <AnimatePresence>
        {showBackButton && (
          <motion.button
            onClick={() => {
              if (window.history.length > 2) {
                navigate(-1)
              } else {
                navigate('/home')
              }
            }}
            className={`fixed top-4 left-4 z-50 w-11 h-11 rounded-full ${colors.backBtn} text-white shadow-lg safe-top safe-left flex items-center justify-center`}
            initial={{ opacity: 0, scale: 0.8, x: -20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.8, x: -20 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <ArrowLeft className="w-5 h-5" strokeWidth={2} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Offline indicator - floating */}
      <AnimatePresence>
        {!isOnline && (
          <motion.div
            className="fixed top-4 right-4 z-50 flex items-center gap-1.5 bg-amber-500 text-white px-3 py-1.5 rounded-full text-xs font-medium shadow-lg safe-top safe-right"
            initial={{ opacity: 0, scale: 0.8, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -10 }}
          >
            <WifiOff className="w-3.5 h-3.5" />
            <span>Offline</span>
            {pendingCount > 0 && <span className="bg-white/20 px-1.5 rounded-full">{pendingCount}</span>}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main content with bottom padding for floating nav */}
      <main className={`relative z-10 safe-left safe-right ${isYoungChild ? 'pb-32' : 'pb-28'}`}>
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
