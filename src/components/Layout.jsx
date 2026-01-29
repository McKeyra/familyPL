import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Home,
  CheckSquare,
  Clock,
  Calendar,
  StickyNote,
  Gift,
  ShoppingCart,
  Settings,
  ArrowLeft,
  Star,
} from 'lucide-react'
import useStore from '../store/useStore'
import useDailyReset from '../hooks/useDailyReset'
import useSupabaseSync from '../hooks/useSupabaseSync'

// Full nav for older children (6+)
const navItemsOlder = [
  { path: '/', icon: Home, label: 'Home', emoji: '🏠' },
  { path: '/checklist/morning', icon: CheckSquare, label: 'Tasks', emoji: '✅' },
  { path: '/timer', icon: Clock, label: 'Timer', emoji: '⏰' },
  { path: '/progress', icon: Star, label: 'Progress', emoji: '📊' },
  { path: '/notes', icon: StickyNote, label: 'Notes', emoji: '📝' },
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
  const { currentChild, children, isParentMode } = useStore()

  // Check for daily reset on app load
  useDailyReset()

  // Sync with Supabase
  useSupabaseSync()

  const child = currentChild ? children[currentChild] : null
  const isYoungChild = child && child.age <= 5
  const navItems = isYoungChild ? navItemsYoung : navItemsOlder

  const bgGradients = {
    bria: 'from-orange-100 via-pink-50 to-amber-100',
    naya: 'from-cyan-100 via-blue-50 to-teal-100',
    parent: 'from-purple-100 via-indigo-50 to-violet-100',
  }

  const accentColors = {
    bria: 'bg-bria-500',
    naya: 'bg-naya-500',
    parent: 'bg-parent-500',
  }

  const theme = isParentMode ? 'parent' : (child?.theme || 'bria')

  return (
    <div className={`min-h-screen min-h-[100dvh] bg-gradient-to-br ${bgGradients[theme]} transition-colors duration-300`}>
      {/* Static background elements - responsive sizing */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute ${accentColors[theme]} opacity-10 rounded-full blur-3xl
          w-48 h-48 sm:w-64 sm:h-64 md:w-80 md:h-80 lg:w-96 lg:h-96
          -top-10 -left-10 sm:-top-16 sm:-left-16 md:-top-20 md:-left-20`}
        />
        <div className={`absolute ${accentColors[theme]} opacity-5 rounded-full blur-3xl
          w-40 h-40 sm:w-56 sm:h-56 md:w-72 md:h-72 lg:w-80 lg:h-80
          bottom-10 right-5 sm:bottom-16 sm:right-8 md:bottom-20 md:right-10`}
        />
      </div>

      {/* Top header - simplified */}
      <motion.header
        className="sticky top-0 z-50 glass safe-top safe-left safe-right landscape-compact"
        initial={{ y: -60 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.2 }}
      >
        <div className="flex items-center justify-between px-3 py-2 sm:px-4 sm:py-3">
          {/* Back button */}
          <motion.button
            onClick={() => navigate('/')}
            className={`
              rounded-xl sm:rounded-2xl bg-white/30 hover:bg-white/40 active:bg-white/50 transition-colors shadow-sm
              ${isYoungChild
                ? 'p-2.5 sm:p-3'
                : 'p-2 sm:p-2.5'}
            `}
            whileTap={{ scale: 0.95 }}
          >
            <ArrowLeft className={`text-gray-700
              ${isYoungChild
                ? 'w-7 h-7 sm:w-8 sm:h-8 stroke-[2.5]'
                : 'w-5 h-5 sm:w-6 sm:h-6'}`}
            />
          </motion.button>

          {/* Page title area - minimal */}
          {isParentMode && (
            <motion.div
              className="flex items-center gap-1 sm:gap-2 bg-parent-500 text-white px-2 py-0.5 sm:px-3 sm:py-1 rounded-full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <Settings className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="font-display font-semibold text-xs sm:text-sm">Parent</span>
            </motion.div>
          )}

          {/* Home button */}
          <motion.button
            onClick={() => navigate('/')}
            className="p-2 sm:p-2.5 rounded-xl bg-white/30 hover:bg-white/40 transition-colors"
            whileTap={{ scale: 0.9 }}
          >
            <Home className={`text-gray-700 ${isYoungChild ? 'w-6 h-6 sm:w-7 sm:h-7' : 'w-5 h-5 sm:w-6 sm:h-6'}`} />
          </motion.button>
        </div>
      </motion.header>

      {/* Main content - responsive padding for bottom nav */}
      <main className={`relative z-10 safe-left safe-right
        ${isYoungChild ? 'pb-28 sm:pb-32' : 'pb-20 sm:pb-24'}
        landscape-compact`}
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

      {/* Bottom navigation - responsive sizing */}
      <motion.nav
        className="fixed bottom-0 left-0 right-0 glass safe-bottom safe-left safe-right z-50 landscape-compact"
        initial={{ y: 80 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.2 }}
      >
        <div className={`flex justify-around items-center max-w-3xl mx-auto
          ${isYoungChild
            ? 'py-2 px-2 sm:py-3 sm:px-4'
            : 'py-1.5 px-1 sm:py-2 sm:px-2'}`}
        >
          {navItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path.split('/')[1] ? `/${item.path.split('/')[1]}` : item.path)

            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`
                  relative flex flex-col items-center rounded-xl sm:rounded-2xl
                  transition-all duration-150 active:scale-95
                  ${isActive ? 'bg-white/40' : 'hover:bg-white/20'}
                  ${isYoungChild
                    ? 'p-2 sm:p-3 min-w-[60px] sm:min-w-[80px]'
                    : 'p-1.5 sm:p-2 min-w-[48px] sm:min-w-[60px]'}
                `}
              >
                <span className={`
                  ${isYoungChild
                    ? 'text-2xl sm:text-3xl md:text-4xl'
                    : 'text-xl sm:text-2xl'}
                `}>
                  {item.emoji}
                </span>
                <span className={`
                  font-display mt-0.5 sm:mt-1
                  ${isActive ? 'font-bold text-gray-800' : 'text-gray-600'}
                  ${isYoungChild
                    ? 'text-xs sm:text-sm md:text-base'
                    : 'text-[10px] sm:text-xs'}
                `}>
                  {item.label}
                </span>
                {isActive && (
                  <div
                    className={`absolute -bottom-0.5 sm:-bottom-1 rounded-full ${accentColors[theme]}
                      ${isYoungChild
                        ? 'w-8 sm:w-10 md:w-12 h-1 sm:h-1.5'
                        : 'w-6 sm:w-8 h-0.5 sm:h-1'}`}
                  />
                )}
              </button>
            )
          })}
        </div>
      </motion.nav>
    </div>
  )
}
