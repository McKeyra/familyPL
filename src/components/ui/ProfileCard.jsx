import { motion } from 'framer-motion'
import { Star } from 'lucide-react'
import useStore from '../../store/useStore'

export default function ProfileCard({
  childId,
  size = 'md',
  showStars = true,
  onClick,
  selected = false,
}) {
  const child = useStore((state) => state.children[childId])

  if (!child) return null

  const sizeClasses = {
    sm: 'w-20 h-20',
    md: 'w-32 h-32',
    lg: 'w-48 h-48',
    xl: 'w-64 h-64',
  }

  const avatarSizes = {
    sm: 'text-3xl',
    md: 'text-5xl',
    lg: 'text-7xl',
    xl: 'text-8xl',
  }

  const nameSizes = {
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-2xl',
    xl: 'text-3xl',
  }

  const themeColors = {
    bria: {
      gradient: 'from-bria-400 to-bria-600',
      glow: 'shadow-glow-bria',
      ring: 'ring-bria-400',
      bg: 'bg-bria-500/20',
    },
    naya: {
      gradient: 'from-naya-400 to-naya-600',
      glow: 'shadow-glow-naya',
      ring: 'ring-naya-400',
      bg: 'bg-naya-500/20',
    },
  }

  const theme = themeColors[child.theme]

  return (
    <motion.div
      className={`
        ${sizeClasses[size]}
        relative flex flex-col items-center justify-center
        bg-gradient-to-br ${theme.gradient}
        rounded-3xl
        cursor-pointer
        ${selected ? `ring-4 ${theme.ring} ${theme.glow}` : ''}
        overflow-hidden
      `}
      onClick={onClick}
      whileHover={{
        scale: 1.05,
        boxShadow: `0 0 60px ${child.color}50`,
      }}
      whileTap={{ scale: 0.95 }}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      {/* Animated glow background */}
      <motion.div
        className="absolute inset-0 bg-white/20"
        animate={{
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Avatar */}
      <motion.div
        className={`${avatarSizes[size]} mb-2 relative z-10`}
        animate={{ y: [0, -5, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      >
        {child.avatar}
      </motion.div>

      {/* Name */}
      <span className={`${nameSizes[size]} font-display font-bold text-white relative z-10`}>
        {child.name}
      </span>

      {/* Stars badge */}
      {showStars && (
        <motion.div
          className="absolute -top-2 -right-2 bg-yellow-400 rounded-full px-2 py-1 flex items-center gap-1 shadow-lg"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring' }}
        >
          <Star className="w-4 h-4 text-yellow-700 fill-yellow-700" />
          <span className="text-sm font-bold text-yellow-700">{child.stars}</span>
        </motion.div>
      )}

      {/* Selection indicator */}
      {selected && (
        <motion.div
          className="absolute bottom-2 w-8 h-1 bg-white rounded-full"
          layoutId="selection-indicator"
        />
      )}
    </motion.div>
  )
}
