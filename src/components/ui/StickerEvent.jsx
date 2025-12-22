import { motion } from 'framer-motion'

const stickers = {
  soccer: { emoji: '⚽', bg: 'bg-green-400' },
  dance: { emoji: '💃', bg: 'bg-pink-400' },
  birthday: { emoji: '🎂', bg: 'bg-purple-400' },
  school: { emoji: '📚', bg: 'bg-blue-400' },
  doctor: { emoji: '🏥', bg: 'bg-red-400' },
  music: { emoji: '🎵', bg: 'bg-indigo-400' },
  swim: { emoji: '🏊', bg: 'bg-cyan-400' },
  art: { emoji: '🎨', bg: 'bg-amber-400' },
  park: { emoji: '🌳', bg: 'bg-emerald-400' },
  movie: { emoji: '🎬', bg: 'bg-slate-500' },
  sleepover: { emoji: '🛏️', bg: 'bg-violet-400' },
  holiday: { emoji: '🎉', bg: 'bg-rose-400' },
}

export default function StickerEvent({
  event,
  size = 'md',
  onClick,
  draggable = false,
}) {
  const sticker = stickers[event.sticker] || { emoji: event.emoji, bg: 'bg-gray-400' }

  const sizeClasses = {
    sm: 'w-12 h-12 text-xl',
    md: 'w-16 h-16 text-2xl',
    lg: 'w-24 h-24 text-4xl',
  }

  const labelSizes = {
    sm: 'text-xs max-w-12',
    md: 'text-sm max-w-16',
    lg: 'text-base max-w-24',
  }

  return (
    <motion.div
      className="flex flex-col items-center gap-1 cursor-pointer"
      onClick={onClick}
      whileHover={{ scale: 1.1, rotate: [-2, 2, -2, 0] }}
      whileTap={{ scale: 0.95 }}
      drag={draggable}
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      dragElastic={0.1}
      initial={{ opacity: 0, scale: 0, rotate: -20 }}
      animate={{ opacity: 1, scale: 1, rotate: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      {/* Sticker */}
      <div
        className={`
          ${sizeClasses[size]}
          ${sticker.bg}
          rounded-2xl shadow-lg
          flex items-center justify-center
          relative overflow-hidden
          border-2 border-white/50
        `}
      >
        {/* Shine effect */}
        <motion.div
          className="absolute top-1 left-1 w-4 h-4 bg-white/40 rounded-full blur-sm"
          animate={{ opacity: [0.4, 0.7, 0.4] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        <span>{sticker.emoji}</span>
      </div>

      {/* Label */}
      <span className={`
        ${labelSizes[size]}
        font-display font-medium text-gray-700
        text-center truncate
      `}>
        {event.title}
      </span>
    </motion.div>
  )
}

export { stickers }
