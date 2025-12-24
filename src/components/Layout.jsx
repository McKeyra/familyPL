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

// Full nav for older children (6+)
const navItemsOlder = [
  { path: '/dashboard', icon: Home, label: 'Home', emoji: '🏠' },
  { path: '/checklist/morning', icon: CheckSquare, label: 'Tasks', emoji: '✅' },
  { path: '/timer', icon: Clock, label: 'Timer', emoji: '⏰' },
  { path: '/progress', icon: Star, label: 'Progress', emoji: '📊' },
  { path: '/notes', icon: StickyNote, label: 'Notes', emoji: '📝' },
  { path: '/rewards', icon: Gift, label: 'Rewards', emoji: '🎁' },
]

// Simplified nav for young children (5 and under)
const navItemsYoung = [
  { path: '/dashboard', icon: Home, label: 'Home', emoji: '🏠' },
  { path: '/checklist/morning', icon: CheckSquare, label: 'Do', emoji: '✅' },
  { path: '/rewards', icon: Gift, label: 'Prizes', emoji: '🎁' },
]

export default function Layout() {
  const navigate = useNavigate()
  const location = useLocation()
  const { currentChild, children, isParentMode } = useStore()

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
    <div className={`min-h-screen bg-gradient-to-br ${bgGradients[theme]} transition-colors duration-500`}>
      {/* Static background elements - optimized for mobile */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute w-96 h-96 ${accentColors[theme]} opacity-10 rounded-full blur-3xl -top-20 -left-20`} />
        <div className={`absolute w-80 h-80 ${accentColors[theme]} opacity-5 rounded-full blur-3xl bottom-20 right-10`} />
      </div>

      {/* Top header */}
      <motion.header
        className="sticky top-0 z-50 glass safe-top"
        initial={{ y: -60 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.2 }}
      >
        <div className="flex items-center justify-between px-4 py-3">
          {/* Back button - extra large for young children */}
          <motion.button
            onClick={() => navigate(-1)}
            className={`
              rounded-2xl bg-white/30 hover:bg-white/40 active:bg-white/50 transition-colors shadow-sm
              ${isYoungChild ? 'p-4 -m-2' : 'p-3 -m-1'}
            `}
            whileTap={{ scale: 0.95 }}
          >
            <ArrowLeft className={`text-gray-700 ${isYoungChild ? 'w-10 h-10 stroke-[3]' : 'w-6 h-6'}`} />
          </motion.button>

          {/* Current child indicator */}
          {child && (
            <motion.div
              className="flex items-center gap-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <span className="text-2xl">{child.avatar}</span>
              <span className="font-display font-bold text-gray-800">{child.name}</span>
              <div className="flex items-center gap-1 bg-yellow-400 rounded-full px-2 py-1">
                <Star className="w-4 h-4 text-yellow-700 fill-yellow-700" />
                <span className="text-sm font-bold text-yellow-700">{child.stars}</span>
              </div>
            </motion.div>
          )}

          {isParentMode && (
            <motion.div
              className="flex items-center gap-2 bg-parent-500 text-white px-3 py-1 rounded-full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <Settings className="w-4 h-4" />
              <span className="font-display font-semibold">Parent Mode</span>
            </motion.div>
          )}

          {/* Home button */}
          <motion.button
            onClick={() => navigate('/')}
            className="p-2 rounded-full hover:bg-white/20 transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <span className="text-2xl">👋</span>
          </motion.button>
        </div>
      </motion.header>

      {/* Main content */}
      <main className="relative z-10 pb-24">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom navigation */}
      <motion.nav
        className="fixed bottom-0 left-0 right-0 glass safe-bottom z-50"
        initial={{ y: 80 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.2 }}
      >
        <div className={`flex justify-around items-center ${isYoungChild ? 'py-3 px-4' : 'py-2 px-2'}`}>
          {navItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path.split('/')[1] ? `/${item.path.split('/')[1]}` : item.path)

            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`
                  flex flex-col items-center rounded-2xl
                  transition-all duration-150 active:scale-95
                  ${isActive ? 'bg-white/40' : 'hover:bg-white/20'}
                  ${isYoungChild ? 'p-3 min-w-[80px]' : 'p-2 min-w-[60px]'}
                `}
              >
                <span className={isYoungChild ? 'text-4xl' : 'text-2xl'}>
                  {item.emoji}
                </span>
                <span className={`
                  font-display mt-1
                  ${isActive ? 'font-bold text-gray-800' : 'text-gray-600'}
                  ${isYoungChild ? 'text-base' : 'text-xs'}
                `}>
                  {item.label}
                </span>
                {isActive && (
                  <div
                    className={`absolute -bottom-1 ${isYoungChild ? 'w-12 h-1.5' : 'w-8 h-1'} ${accentColors[theme]} rounded-full`}
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
