import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import Welcome from './pages/Welcome'
import Dashboard from './pages/Dashboard'
import Checklist from './pages/Checklist'
import Timer from './pages/Timer'
import Calendar from './pages/Calendar'
import NoteBoard from './pages/NoteBoard'
import Rewards from './pages/Rewards'
import ParentPortal from './pages/ParentPortal'
import Grocery from './pages/Grocery'
import Layout from './components/Layout'

function App() {
  return (
    <Router>
      <AnimatePresence mode="wait">
        <Routes>
          <Route path="/" element={<Welcome />} />
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/checklist/:routine" element={<Checklist />} />
            <Route path="/timer" element={<Timer />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/notes" element={<NoteBoard />} />
            <Route path="/rewards" element={<Rewards />} />
            <Route path="/grocery" element={<Grocery />} />
            <Route path="/parent" element={<ParentPortal />} />
          </Route>
        </Routes>
      </AnimatePresence>
    </Router>
  )
}

export default App
