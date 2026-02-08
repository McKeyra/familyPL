import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Home,
  CheckSquare,
  Clock,
  Calendar,
  Gift,
  ShoppingCart,
  Settings,
  ArrowLeft,
  Star,
  WifiOff,
  Users,
} from 'lucide-react'
import useStore from '../store/useStore'
import useDailyReset from '../hooks/useDailyReset'
import useSupabaseSync, { getSyncQueueLength } from '../hooks/useSupabaseSync'
import useStarSync from '../hooks/useStarSync'
import useNetworkStatus from '../hooks/useNetworkStatus'

// Page title mapping for context-aware header
const pageTitles = {
  '/': 'Home',
  '/dashboard': 'Dashboard',
  '/checklist/morning': 'Morning',
  '/checklist/bedtime': 'Bedtime',
  '/checklist/chores': 'Chores',
  '/timer': 'Timer',
  '/calendar': 'Calendar',
  '/notes': 'Notes',
  '/rewards': 'Rewards',
  '/grocery': 'Grocery',
  '/progress': 'Progress',
  '/parent': 'Parent',
}

// Main nav items - consistent across all views (without kids - they have custom buttons)
const mainNavItems = [
  { path: '/', icon: Home, label: 'Home' },
  { path: '/grocery', icon: ShoppingCart, label: 'Grocery' },
  { path: '/parent', icon: Settings, label: 'Parent' },
]

// Full nav for older children (6+) - shown in kid mode
const navItemsOlder = [
  { path: '/', icon: Home, label: 'Home', emoji: '🏠' },
  { path: '/checklist/morning', icon: CheckSquare, label: 'Tasks', emoji: '✅' },
  { path: '/timer', icon: Clock, label: 'Timer', emoji: '⏰' },
  { path: '/progress', icon: Star, label: 'Progress', emoji: '📊' },
  { path: '/rewards', icon: Gift, label: 'Rewards', emoji: '🎁' },
]

// Simplified nav for young children (5 and under)
const navItemsYoung = [
  { path: '/', icon: Home, label: 'Home', emoji: '🏠' },
  { path: '/checklist/morning', icon: CheckSquare, label: 'Do', emoji: '✅' },
  { path: '/rewards', icon: Gift, label: 'Prizes', emoji: '🎁' },
]

export default function Layout() {
  const navigate = useNavigate()
  const location = useLocation()
  const { currentChild, children, isParentMode, setCurrentChild } = useStore()

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

  // Use main nav for parent mode or when no child is selected
  // Use kid-specific nav when a child is selected
  const navItems = isParentMode || !currentChild
    ? mainNavItems
    : (isYoungChild ? navItemsYoung : navItemsOlder)

  // Get current page title
  const currentPageTitle = pageTitles[location.pathname] ||
    (location.pathname.startsWith('/checklist/') ? 'Tasks' : 'UR1IFE')

  // Earth-tone gradients for consistent theming
  const bgGradients = {
    bria: 'from-rose-100 via-pink-50 to-rose-50',
    naya: 'from-sky-100 via-blue-50 to-cyan-50',
    parent: 'from-stone-100 via-amber-50 to-stone-50',
  }

  const accentColors = {
    bria: 'bg-rose-400',
    naya: 'bg-sky-400',
    parent: 'bg-stone-500',
  }

  const headerBg = {
    bria: 'bg-rose-400/90',
    naya: 'bg-sky-400/90',
    parent: 'bg-stone-500/90',
  }

  const theme = isParentMode ? 'parent' : (child?.theme || 'bria')

  return (
    <div className={`min-h-screen min-h-[100dvh] bg-gradient-to-br ${bgGradients[theme]} transition-colors duration-300`}>
      {/* Subtle background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute ${accentColors[theme]} opacity-5 rounded-full blur-3xl
          w-48 h-48 sm:w-64 sm:h-64 md:w-80 md:h-80
          -top-10 -left-10 sm:-top-16 sm:-left-16`}
        />
        <div className={`absolute ${accentColors[theme]} opacity-5 rounded-full blur-3xl
          w-40 h-40 sm:w-56 sm:h-56 md:w-72 md:h-72
          bottom-10 right-5 sm:bottom-16 sm:right-8`}
        />
      </div>

      {/* Top header with context-aware title */}
      <motion.header
        className={`sticky top-0 z-50 ${headerBg[theme]} backdrop-blur-lg shadow-sm safe-top safe-left safe-right`}
        initial={{ y: -60 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.2 }}
      >
        <div className="flex items-center justify-between px-3 py-2 sm:px-4 sm:py-3">
          {/* Back button */}
          <motion.button
            onClick={() => {
              if (window.history.length > 2) {
                navigate(-1)
              } else {
                navigate('/')
              }
            }}
            className={`
              rounded-xl bg-white/20 hover:bg-white/30 active:bg-white/40 transition-colors
              ${isYoungChild ? 'p-2.5 sm:p-3' : 'p-2 sm:p-2.5'}
            `}
            whileTap={{ scale: 0.95 }}
          >
            <ArrowLeft className={`text-white
              ${isYoungChild ? 'w-6 h-6 sm:w-7 sm:h-7' : 'w-5 h-5 sm:w-6 sm:h-6'}`}
            />
          </motion.button>

          {/* Page Title - Context Aware */}
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
              className="flex items-center gap-2"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              <span className="font-display font-bold text-white text-sm sm:text-base">
                {currentPageTitle}
              </span>
              {isParentMode && (
                <span className="bg-white/20 text-white text-xs px-2 py-0.5 rounded-full">
                  Parent
                </span>
              )}
            </motion.div>
          </div>

          {/* Home button */}
          <motion.button
            onClick={() => navigate('/')}
            className="p-2 sm:p-2.5 rounded-xl bg-white/20 hover:bg-white/30 transition-colors"
            whileTap={{ scale: 0.9 }}
          >
            <Home className={`text-white ${isYoungChild ? 'w-6 h-6 sm:w-7 sm:h-7' : 'w-5 h-5 sm:w-6 sm:h-6'}`} />
          </motion.button>
        </div>
      </motion.header>

      {/* Main content */}
      <main className={`relative z-10 safe-left safe-right
        ${isYoungChild ? 'pb-28 sm:pb-32' : 'pb-20 sm:pb-24'}`}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{
              type: "spring",
              stiffness: 380,
              damping: 30,
            }}
            className="will-change-transform"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom navigation */}
      <motion.nav
        className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-lg border-t border-gray-200/50 safe-bottom safe-left safe-right z-50"
        initial={{ y: 80 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.2 }}
      >
        <div className={`flex justify-around items-center max-w-3xl mx-auto
          ${isYoungChild ? 'py-2 px-2 sm:py-3 sm:px-4' : 'py-1.5 px-1 sm:py-2 sm:px-2'}`}
        >
          {/* Render main nav items with B and N buttons inserted */}
          {isParentMode || !currentChild ? (
            <>
              {/* Home */}
              <button
                onClick={() => navigate('/')}
                className={`
                  relative flex flex-col items-center rounded-xl
                  transition-all duration-150 active:scale-95
                  ${location.pathname === '/' ? 'bg-gray-100' : 'hover:bg-gray-50'}
                  p-1.5 sm:p-2 min-w-[48px] sm:min-w-[56px]
                `}
              >
                <Home className={`w-5 h-5 sm:w-6 sm:h-6 stroke-[1.5] ${location.pathname === '/' ? 'text-stone-600' : 'text-gray-400'}`} />
                <span className={`font-display mt-0.5 sm:mt-1 text-[10px] sm:text-xs ${location.pathname === '/' ? 'font-semibold text-gray-800' : 'text-gray-500'}`}>
                  Home
                </span>
              </button>

              {/* Grocery */}
              <button
                onClick={() => navigate('/grocery')}
                className={`
                  relative flex flex-col items-center rounded-xl
                  transition-all duration-150 active:scale-95
                  ${location.pathname === '/grocery' ? 'bg-gray-100' : 'hover:bg-gray-50'}
                  p-1.5 sm:p-2 min-w-[48px] sm:min-w-[56px]
                `}
              >
                <ShoppingCart className={`w-5 h-5 sm:w-6 sm:h-6 stroke-[1.5] ${location.pathname === '/grocery' ? 'text-stone-600' : 'text-gray-400'}`} />
                <span className={`font-display mt-0.5 sm:mt-1 text-[10px] sm:text-xs ${location.pathname === '/grocery' ? 'font-semibold text-gray-800' : 'text-gray-500'}`}>
                  Grocery
                </span>
              </button>

              {/* Bria */}
              <button
                onClick={() => {
                  setCurrentChild('bria')
                  navigate('/dashboard')
                }}
                className="flex flex-col items-center p-1.5 sm:p-2 rounded-xl hover:bg-rose-50 transition-colors min-w-[48px] sm:min-w-[56px]"
              >
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center shadow-sm">
                  <span className="text-white font-bold text-xs sm:text-sm">B</span>
                </div>
                <span className="text-[10px] sm:text-xs font-medium text-rose-600 mt-0.5 sm:mt-1">Bria</span>
              </button>

              {/* Naya */}
              <button
                onClick={() => {
                  setCurrentChild('naya')
                  navigate('/dashboard')
                }}
                className="flex flex-col items-center p-1.5 sm:p-2 rounded-xl hover:bg-cyan-50 transition-colors min-w-[48px] sm:min-w-[56px]"
              >
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-cyan-400 to-teal-500 flex items-center justify-center shadow-sm">
                  <span className="text-white font-bold text-xs sm:text-sm">N</span>
                </div>
                <span className="text-[10px] sm:text-xs font-medium text-cyan-600 mt-0.5 sm:mt-1">Naya</span>
              </button>

              {/* Parent */}
              <button
                onClick={() => navigate('/parent')}
                className={`
                  relative flex flex-col items-center rounded-xl
                  transition-all duration-150 active:scale-95
                  ${location.pathname === '/parent' ? 'bg-gray-100' : 'hover:bg-gray-50'}
                  p-1.5 sm:p-2 min-w-[48px] sm:min-w-[56px]
                `}
              >
                <Settings className={`w-5 h-5 sm:w-6 sm:h-6 stroke-[1.5] ${location.pathname === '/parent' ? 'text-stone-600' : 'text-gray-400'}`} />
                <span className={`font-display mt-0.5 sm:mt-1 text-[10px] sm:text-xs ${location.pathname === '/parent' ? 'font-semibold text-gray-800' : 'text-gray-500'}`}>
                  Parent
                </span>
              </button>
            </>
          ) : (
            /* Kid-specific navigation */
            navItems.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.path ||
                (item.path === '/checklist/morning' && location.pathname.startsWith('/checklist'))

              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`
                    relative flex flex-col items-center rounded-xl
                    transition-all duration-150 active:scale-95
                    ${isActive ? 'bg-gray-100' : 'hover:bg-gray-50'}
                    ${isYoungChild ? 'p-2 sm:p-3 min-w-[60px] sm:min-w-[80px]' : 'p-1.5 sm:p-2 min-w-[48px] sm:min-w-[60px]'}
                  `}
                >
                  <Icon className={`
                    ${isYoungChild ? 'w-6 h-6 sm:w-7 sm:h-7' : 'w-5 h-5 sm:w-6 sm:h-6'}
                    ${isActive ? (theme === 'bria' ? 'text-rose-500' : theme === 'naya' ? 'text-sky-500' : 'text-stone-600') : 'text-gray-400'}
                    stroke-[1.5]
                  `} />
                  <span className={`
                    font-display mt-0.5 sm:mt-1
                    ${isActive ? 'font-semibold text-gray-800' : 'text-gray-500'}
                    ${isYoungChild ? 'text-xs sm:text-sm' : 'text-[10px] sm:text-xs'}
                  `}>
                    {item.label}
                  </span>
                  {isActive && (
                    <div className={`absolute -bottom-0.5 sm:-bottom-1 rounded-full ${accentColors[theme]}
                      ${isYoungChild ? 'w-8 sm:w-10 h-1' : 'w-6 sm:w-8 h-0.5 sm:h-1'}`}
                    />
                  )}
                </button>
              )
            })
          )}
        </div>
      </motion.nav>
    </div>
  )
}
