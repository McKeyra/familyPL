import { motion } from 'framer-motion'

export default function ChildAvatar({
  child,
  size = 'md',
  onClick,
  className = '',
  showBorder = false,
}) {
  const sizeClasses = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-sm',
    md: 'w-12 h-12 text-xl',
    lg: 'w-16 h-16 sm:w-20 sm:h-20 text-2xl sm:text-3xl',
    xl: 'w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 text-3xl sm:text-4xl md:text-5xl',
  }

  const themeGradients = {
    bria: 'bg-gradient-to-br from-rose-400 to-pink-500',
    naya: 'bg-gradient-to-br from-cyan-400 to-teal-500',
  }

  const renderAvatarContent = () => {
    const avatarType = child.avatarType || 'letter'

    if (avatarType === 'image' && child.avatarImage) {
      return (
        <img
          src={child.avatarImage}
          alt={child.name}
          className="w-full h-full object-cover"
        />
      )
    }

    if (avatarType === 'emoji') {
      return <span>{child.avatar}</span>
    }

    // Default to letter
    return <span className="font-display font-bold text-white">{child.avatar || child.name?.charAt(0)}</span>
  }

  const Component = onClick ? motion.button : motion.div

  return (
    <Component
      className={`
        ${sizeClasses[size]}
        ${themeGradients[child.theme]}
        rounded-full flex items-center justify-center overflow-hidden
        ${showBorder ? 'ring-4 ring-white shadow-xl' : 'shadow-lg'}
        ${onClick ? 'cursor-pointer hover:scale-105 transition-transform' : ''}
        ${className}
      `}
      onClick={onClick}
      whileTap={onClick ? { scale: 0.95 } : undefined}
    >
      {renderAvatarContent()}
    </Component>
  )
}
