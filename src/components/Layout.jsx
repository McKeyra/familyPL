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

const navItems = [
  { path: '/dashboard', icon: Home, label: 'Home', emoji: '🏠' },
  { path: '/checklist/morning', icon: CheckSquare, label: 'Tasks', emoji: '✅' },
  { path: '/timer', icon: Clock, label: 'Timer', emoji: '⏰' },
  { path: '/calendar', icon: Calendar, label: 'Calendar', emoji: '📅' },
  { path: '/notes', icon: StickyNote, label: 'Notes', emoji: '📝' },
  { path: '/rewards', icon: Gift, label: 'Rewards', emoji: '🎁' },
  { path: '/grocery', icon: ShoppingCart, label: 'Shopping', emoji: '🛒' },
]

export default function Layout() {
  const navigate = useNavigate()
  const location = useLocation()
  const { currentChild, children, isParentMode } = useStore()

  const child = currentChild ? children[currentChild] : null

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
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className={`absolute w-64 h-64 ${accentColors[theme]} opacity-10 rounded-full blur-3xl`}
            animate={{
              x: [0, 100, 0],
              y: [0, -50, 0],
            }}
            transition={{
              duration: 20 + i * 5,
              repeat: Infinity,
              ease: 'linear',
            }}
            style={{
              left: `${(i * 20) % 100}%`,
              top: `${(i * 15) % 100}%`,
            }}
          />
        ))}
      </div>

      {/* Top header */}
      <motion.header
        className="sticky top-0 z-50 glass safe-top"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        <div className="flex items-center justify-between px-4 py-3">
          {/* Back button */}
          <motion.button
            onClick={() => navigate(-1)}
            className="p-2 rounded-full hover:bg-white/20 transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <ArrowLeft className="w-6 h-6 text-gray-700" />
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
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom navigation */}
      <motion.nav
        className="fixed bottom-0 left-0 right-0 glass safe-bottom z-50"
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        <div className="flex justify-around items-center py-2 px-2">
          {navItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path.split('/')[1] ? `/${item.path.split('/')[1]}` : item.path)

            return (
              <motion.button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`
                  flex flex-col items-center p-2 rounded-2xl min-w-[60px]
                  transition-colors duration-200
                  ${isActive ? 'bg-white/40' : 'hover:bg-white/20'}
                `}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <motion.span
                  className="text-2xl"
                  animate={isActive ? { y: [0, -4, 0] } : {}}
                  transition={{ duration: 0.5 }}
                >
                  {item.emoji}
                </motion.span>
                <span className={`
                  text-xs font-display mt-1
                  ${isActive ? 'font-bold text-gray-800' : 'text-gray-600'}
                `}>
                  {item.label}
                </span>
                {isActive && (
                  <motion.div
                    className={`absolute -bottom-1 w-8 h-1 ${accentColors[theme]} rounded-full`}
                    layoutId="nav-indicator"
                  />
                )}
              </motion.button>
            )
          })}
        </div>
      </motion.nav>
    </div>
  )
}
