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
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-300 to-orange-300 relative overflow-hidden">
      {/* Animated background shapes */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-white/20 backdrop-blur-sm"
            style={{
              width: 100 + i * 50,
              height: 100 + i * 50,
              left: `${(i * 15) % 100}%`,
              top: `${(i * 12) % 100}%`,
            }}
            animate={{
              x: [0, 30, 0],
              y: [0, -20, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 8 + i * 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>

      {/* Floating stars */}
      {[...Array(12)].map((_, i) => (
        <motion.div
          key={`star-${i}`}
          className="absolute text-3xl pointer-events-none"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -20, 0],
            opacity: [0.3, 1, 0.3],
            rotate: [0, 360],
          }}
          transition={{
            duration: 5 + Math.random() * 5,
            repeat: Infinity,
            delay: Math.random() * 2,
          }}
        >
          ⭐
        </motion.div>
      ))}

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-6">
        {/* Title */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.h1
            className="text-5xl md:text-7xl font-display font-bold text-white mb-4 drop-shadow-lg"
            animate={{
              textShadow: [
                '0 0 20px rgba(255,255,255,0.5)',
                '0 0 40px rgba(255,255,255,0.8)',
                '0 0 20px rgba(255,255,255,0.5)',
              ],
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            Happy Day Helper
          </motion.h1>
          <motion.p
            className="text-xl md:text-2xl text-white/90 font-display"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Who's having a great day today? 🌟
          </motion.p>
        </motion.div>

        {/* Profile Cards */}
        <motion.div
          className="flex flex-wrap justify-center gap-8 mb-12"
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
            className="w-full max-w-md mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <GlassCard variant="default" size="md">
              <div className="flex items-center gap-2 mb-3">
                <Calendar className="w-5 h-5 text-purple-600" />
                <h3 className="font-display font-bold text-gray-800">Today's Events</h3>
              </div>
              <div className="space-y-2">
                {todayEvents.map((event) => (
                  <motion.div
                    key={event.id}
                    className="flex items-center gap-3 p-2 bg-white/30 rounded-xl"
                    whileHover={{ scale: 1.02 }}
                  >
                    <span className="text-2xl">{event.emoji}</span>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800">{event.title}</p>
                      <p className="text-sm text-gray-600">{event.notes}</p>
                    </div>
                    <span className="text-xs bg-white/50 px-2 py-1 rounded-full">
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
            className="w-full max-w-md mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <GlassCard variant="default" size="sm">
              <div className="flex items-center justify-center gap-3">
                <motion.span
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  💕
                </motion.span>
                <span className="text-gray-700 font-display">
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
          transition={{ delay: 0.8 }}
        >
          <Button
            variant="glass"
            size="lg"
            icon={<Settings className="w-5 h-5" />}
            onClick={handleParentMode}
          >
            Parent Portal
          </Button>
        </motion.div>

        {/* Footer decoration */}
        <motion.div
          className="absolute bottom-6 flex items-center gap-2 text-white/70"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <span className="font-display text-sm">Made with</span>
          <motion.span
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          >
            ❤️
          </motion.span>
          <span className="font-display text-sm">for our family</span>
        </motion.div>
      </div>
    </div>
  )
}
