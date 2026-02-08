import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Settings, Star, Calendar, Heart } from 'lucide-react'
import useStore from '../store/useStore'
import ProfileCard from '../components/ui/ProfileCard'
import GlassCard from '../components/ui/GlassCard'
import Button from '../components/ui/Button'

export default function Welcome() {
  const navigate = useNavigate()
  const { setCurrentChild, setParentMode, getTodayEvents, children, hearts } = useStore()

  const todayEvents = getTodayEvents()
  const recentHearts = hearts.slice(0, 3)

  const handleChildSelect = (childId) => {
    setCurrentChild(childId)
    navigate('/dashboard')
  }

  const handleParentMode = () => {
    setParentMode(true)
    navigate('/parent')
  }

  return (
    <div className="min-h-screen min-h-[100dvh] bg-gradient-to-br from-purple-400 via-pink-300 to-orange-300 relative overflow-hidden">
      {/* Static background shapes - optimized for mobile */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-40 h-40 sm:w-64 sm:h-64 rounded-full bg-white/15 -top-10 sm:-top-20 -left-5 sm:-left-10" />
        <div className="absolute w-32 h-32 sm:w-48 sm:h-48 rounded-full bg-white/10 top-1/4 right-5 sm:right-10" />
        <div className="absolute w-48 h-48 sm:w-80 sm:h-80 rounded-full bg-white/10 bottom-10 sm:bottom-20 left-1/4" />
        <div className="absolute w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-white/15 bottom-32 sm:bottom-40 right-10 sm:right-20" />
      </div>

      {/* Static stars decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <span className="absolute text-2xl sm:text-3xl top-[15%] left-[10%] opacity-50">⭐</span>
        <span className="absolute text-xl sm:text-2xl top-[25%] right-[15%] opacity-40">⭐</span>
        <span className="absolute text-2xl sm:text-3xl top-[60%] left-[5%] opacity-30">⭐</span>
        <span className="absolute text-xl sm:text-2xl top-[75%] right-[8%] opacity-40">⭐</span>
        <span className="absolute text-2xl sm:text-3xl bottom-[20%] left-[25%] opacity-35">⭐</span>
      </div>

      <div className="relative z-10 min-h-screen min-h-[100dvh] flex flex-col items-center justify-center p-4 sm:p-6">
        {/* Title */}
        <motion.div
          className="text-center mb-6 sm:mb-8 md:mb-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <h1 className="text-3xl sm:text-5xl md:text-7xl font-display font-bold text-white mb-2 sm:mb-4 drop-shadow-lg">
            UR1IFE
          </h1>
          <p className="text-base sm:text-xl md:text-2xl text-white/90 font-display">
            Who's having a great day today? 🌟
          </p>
        </motion.div>

        {/* Profile Cards */}
        <motion.div
          className="flex flex-wrap justify-center gap-4 sm:gap-6 md:gap-8 mb-6 sm:mb-8 md:mb-12"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
        >
          <ProfileCard
            childId="bria"
            size="lg"
            onClick={() => handleChildSelect('bria')}
          />
          <ProfileCard
            childId="naya"
            size="lg"
            onClick={() => handleChildSelect('naya')}
          />
        </motion.div>

        {/* Today's Events Preview */}
        {todayEvents.length > 0 && (
          <motion.div
            className="w-full max-w-md mb-4 sm:mb-6 md:mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <GlassCard variant="default" size="md">
              <div className="flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3">
                <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
                <h3 className="font-display font-bold text-gray-800 text-sm sm:text-base">Today's Events</h3>
              </div>
              <div className="space-y-1.5 sm:space-y-2">
                {todayEvents.map((event) => (
                  <motion.div
                    key={event.id}
                    className="flex items-center gap-2 sm:gap-3 p-1.5 sm:p-2 bg-white/30 rounded-lg sm:rounded-xl"
                    whileHover={{ scale: 1.02 }}
                  >
                    <span className="text-xl sm:text-2xl">{event.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-800 text-sm sm:text-base truncate">{event.title}</p>
                      <p className="text-xs sm:text-sm text-gray-600 truncate">{event.notes}</p>
                    </div>
                    <span className="text-[10px] sm:text-xs bg-white/50 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full shrink-0">
                      {children[event.child]?.name || 'Everyone'}
                    </span>
                  </motion.div>
                ))}
              </div>
            </GlassCard>
          </motion.div>
        )}

        {/* Kindness Echo - Recent hearts */}
        {recentHearts.length > 0 && (
          <motion.div
            className="w-full max-w-md mb-4 sm:mb-6 md:mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <GlassCard variant="default" size="sm">
              <div className="flex items-center justify-center gap-2 sm:gap-3">
                <span>💕</span>
                <span className="text-gray-700 font-display text-sm sm:text-base">
                  {recentHearts.length} hearts shared today!
                </span>
              </div>
            </GlassCard>
          </motion.div>
        )}

        {/* Parent Mode Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <Button
            variant="glass"
            size="lg"
            icon={<Settings className="w-4 h-4 sm:w-5 sm:h-5" />}
            onClick={handleParentMode}
          >
            Parent Portal
          </Button>
        </motion.div>

        {/* Footer decoration */}
        <div className="absolute bottom-4 sm:bottom-6 flex items-center gap-1.5 sm:gap-2 text-white/70">
          <span className="font-display text-xs sm:text-sm">Made with</span>
          <span>❤️</span>
          <span className="font-display text-xs sm:text-sm">for our family</span>
        </div>
      </div>
    </div>
  )
}
