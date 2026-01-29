import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { lazy, Suspense } from 'react'
import Welcome from './pages/Welcome'
import HomeScreen from './pages/HomeScreen'
import Dashboard from './pages/Dashboard'
import Checklist from './pages/Checklist'
import Timer from './pages/Timer'
import Calendar from './pages/Calendar'
import NoteBoard from './pages/NoteBoard'
import Rewards from './pages/Rewards'
import ParentPortal from './pages/ParentPortal'
import Grocery from './pages/Grocery'
import Progress from './pages/Progress'
import Layout from './components/Layout'

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
        <Route path="/" element={
          <AnimatedPage>
            <HomeScreen />
          </AnimatedPage>
        } />
        <Route path="/welcome" element={
          <AnimatedPage>
            <Welcome />
          </AnimatedPage>
        } />
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/checklist/:routine" element={<Checklist />} />
          <Route path="/timer" element={<Timer />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/notes" element={<NoteBoard />} />
          <Route path="/rewards" element={<Rewards />} />
          <Route path="/grocery" element={<Grocery />} />
          <Route path="/progress" element={<Progress />} />
          <Route path="/parent" element={<ParentPortal />} />
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
      </Suspense>
    </Router>
  )
}

export default App
