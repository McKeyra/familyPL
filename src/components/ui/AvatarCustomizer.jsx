import { motion, AnimatePresence } from 'framer-motion'
import { useState, useRef } from 'react'
import { Camera, Type, Smile, X, Check, Upload } from 'lucide-react'
import useStore from '../../store/useStore'
import Button from './Button'

const emojiOptions = [
  '😊', '😎', '🦸', '🧚', '🦄', '🐱', '🐶', '🐰',
  '🌟', '🌈', '🎀', '👑', '🦋', '🐻', '🐼', '🦊',
  '🌸', '💖', '✨', '🎨', '🎮', '⚽', '🎵', '🌺',
]

const colorOptions = [
  { name: 'Orange', bg: 'bg-gradient-to-br from-orange-400 to-orange-600' },
  { name: 'Cyan', bg: 'bg-gradient-to-br from-cyan-400 to-cyan-600' },
  { name: 'Purple', bg: 'bg-gradient-to-br from-purple-400 to-purple-600' },
  { name: 'Pink', bg: 'bg-gradient-to-br from-pink-400 to-pink-600' },
  { name: 'Green', bg: 'bg-gradient-to-br from-green-400 to-green-600' },
  { name: 'Blue', bg: 'bg-gradient-to-br from-blue-400 to-blue-600' },
]

export default function AvatarCustomizer({ isOpen, onClose, childId }) {
  const { children, updateChildAvatar } = useStore()
  const child = children[childId]

  const [activeTab, setActiveTab] = useState('emoji')
  const [selectedEmoji, setSelectedEmoji] = useState(child?.avatarType === 'emoji' ? child.avatar : '😊')
  const [selectedLetter, setSelectedLetter] = useState(child?.avatarType === 'letter' ? child.avatar : child?.name?.charAt(0) || 'A')
  const [previewImage, setPreviewImage] = useState(child?.avatarImage || null)

  const fileInputRef = useRef(null)

  if (!child) return null

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewImage(reader.result)
        setActiveTab('image')
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSave = () => {
    if (activeTab === 'emoji') {
      updateChildAvatar(childId, 'emoji', selectedEmoji, null)
    } else if (activeTab === 'letter') {
      updateChildAvatar(childId, 'letter', selectedLetter, null)
    } else if (activeTab === 'image' && previewImage) {
      updateChildAvatar(childId, 'image', child.name.charAt(0), previewImage)
    }
    onClose()
  }

  const getCurrentPreview = () => {
    if (activeTab === 'emoji') {
      return (
        <span className="text-5xl">{selectedEmoji}</span>
      )
    } else if (activeTab === 'letter') {
      return (
        <span className="text-4xl font-display font-bold text-white">{selectedLetter}</span>
      )
    } else if (activeTab === 'image' && previewImage) {
      return (
        <img src={previewImage} alt="Avatar" className="w-full h-full object-cover rounded-full" />
      )
    }
    return <span className="text-4xl font-display font-bold text-white">{child.name.charAt(0)}</span>
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl max-h-[90vh] overflow-y-auto"
            initial={{ scale: 0.8, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.8, y: 50 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-display font-bold text-gray-800">
                Choose Your Avatar
              </h2>
              <motion.button
                className="p-2 rounded-full hover:bg-gray-100"
                onClick={onClose}
                whileTap={{ scale: 0.9 }}
              >
                <X className="w-5 h-5 text-gray-500" />
              </motion.button>
            </div>

            {/* Preview */}
            <div className="flex justify-center mb-6">
              <motion.div
                className={`w-24 h-24 rounded-full ${child.theme === 'bria' ? 'bg-gradient-to-br from-rose-400 to-pink-500' : 'bg-gradient-to-br from-cyan-400 to-cyan-600'} flex items-center justify-center shadow-lg overflow-hidden`}
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                {getCurrentPreview()}
              </motion.div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-4">
              <motion.button
                className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl font-display font-semibold transition-colors ${activeTab === 'emoji' ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-600'}`}
                onClick={() => setActiveTab('emoji')}
                whileTap={{ scale: 0.95 }}
              >
                <Smile className="w-4 h-4" />
                Emoji
              </motion.button>
              <motion.button
                className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl font-display font-semibold transition-colors ${activeTab === 'letter' ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-600'}`}
                onClick={() => setActiveTab('letter')}
                whileTap={{ scale: 0.95 }}
              >
                <Type className="w-4 h-4" />
                Letter
              </motion.button>
              <motion.button
                className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl font-display font-semibold transition-colors ${activeTab === 'image' ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-600'}`}
                onClick={() => setActiveTab('image')}
                whileTap={{ scale: 0.95 }}
              >
                <Camera className="w-4 h-4" />
                Photo
              </motion.button>
            </div>

            {/* Content */}
            <div className="mb-6">
              {activeTab === 'emoji' && (
                <motion.div
                  className="grid grid-cols-6 gap-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  {emojiOptions.map((emoji) => (
                    <motion.button
                      key={emoji}
                      className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${selectedEmoji === emoji ? 'bg-purple-100 ring-2 ring-purple-400' : 'bg-gray-50 hover:bg-gray-100'}`}
                      onClick={() => setSelectedEmoji(emoji)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      {emoji}
                    </motion.button>
                  ))}
                </motion.div>
              )}

              {activeTab === 'letter' && (
                <motion.div
                  className="space-y-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <div className="grid grid-cols-7 gap-2">
                    {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U'].map((letter) => (
                      <motion.button
                        key={letter}
                        className={`w-10 h-10 rounded-lg flex items-center justify-center font-display font-bold text-lg ${selectedLetter === letter ? 'bg-purple-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                        onClick={() => setSelectedLetter(letter)}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        {letter}
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}

              {activeTab === 'image' && (
                <motion.div
                  className="text-center space-y-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <motion.button
                    className="w-full py-4 border-2 border-dashed border-gray-300 rounded-2xl hover:border-purple-400 transition-colors flex flex-col items-center gap-2"
                    onClick={() => fileInputRef.current?.click()}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Upload className="w-8 h-8 text-gray-400" />
                    <span className="font-display text-gray-600">
                      {previewImage ? 'Change Photo' : 'Upload a Photo'}
                    </span>
                  </motion.button>

                  {previewImage && (
                    <p className="text-sm text-green-600 font-display">
                      ✓ Photo ready!
                    </p>
                  )}
                </motion.div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button variant="ghost" className="flex-1" onClick={onClose}>
                Cancel
              </Button>
              <Button
                variant={child.theme}
                className="flex-1"
                icon={<Check className="w-5 h-5" />}
                onClick={handleSave}
              >
                Save
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
