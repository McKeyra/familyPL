import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { lazy, Suspense } from 'react'
import { SpeedInsights } from '@vercel/speed-insights/react'

// Eagerly load the parent portal for instant first paint (main landing page)
import ParentPortal from './pages/ParentPortal'
import Layout from './components/Layout'

// Lazy load all other pages for faster initial bundle
const Welcome = lazy(() => import('./pages/Welcome'))
const HomeScreen = lazy(() => import('./pages/HomeScreen'))
const Landing = lazy(() => import('./pages/Landing'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const Checklist = lazy(() => import('./pages/Checklist'))
const Timer = lazy(() => import('./pages/Timer'))
const Calendar = lazy(() => import('./pages/Calendar'))
const NoteBoard = lazy(() => import('./pages/NoteBoard'))
const Rewards = lazy(() => import('./pages/Rewards'))
const Grocery = lazy(() => import('./pages/Grocery'))
const Progress = lazy(() => import('./pages/Progress'))

// Lazy load FloatingTimer since it's not needed for first paint
const FloatingTimer = lazy(() => import('./components/FloatingTimer'))

// Page transition variants - smooth and fast
const pageVariants = {
  initial: {
    opacity: 0,
  },
  in: {
    opacity: 1,
  },
  out: {
    opacity: 0,
  }
}

const pageTransition = {
  type: "tween",
  ease: "anticipate",
  duration: 0.3
}

// Loading fallback
function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-100">
      <motion.div
        className="flex flex-col items-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <motion.div
          className="w-8 h-8 border-2 border-gray-200 border-t-gray-600 rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
        <p className="mt-4 text-sm text-gray-400 font-medium">Loading...</p>
      </motion.div>
    </div>
  )
}

// Animated page wrapper
function AnimatedPage({ children }) {
  return (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={pageTransition}
      className="will-change-opacity"
    >
      {children}
    </motion.div>
  )
}

// Routes with animation
function AnimatedRoutes() {
  const location = useLocation()

  return (
    <AnimatePresence mode="wait" initial={false}>
      <Routes location={location} key={location.pathname}>
        {/* Welcome/onboarding page - no nav */}
        <Route path="/welcome" element={
          <AnimatedPage>
            <Welcome />
          </AnimatedPage>
        } />
        {/* All main app pages wrapped in Layout with FloatingNav */}
        <Route element={<Layout />}>
          <Route path="/" element={<ParentPortal />} />
          <Route path="/home" element={<HomeScreen />} />
          <Route path="/home-alt" element={<Landing />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/checklist/:routine" element={<Checklist />} />
          <Route path="/timer" element={<Timer />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/notes" element={<NoteBoard />} />
          <Route path="/rewards" element={<Rewards />} />
          <Route path="/grocery" element={<Grocery />} />
          <Route path="/progress" element={<Progress />} />
        </Route>
      </Routes>
    </AnimatePresence>
  )
}

function App() {
  return (
    <Router>
      <Suspense fallback={<PageLoader />}>
        <AnimatedRoutes />
        <FloatingTimer />
      </Suspense>
      <SpeedInsights />
    </Router>
  )
}

export default App
