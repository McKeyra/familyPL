import { motion, AnimatePresence } from 'framer-motion'
import { useState, useRef } from 'react'
import { Plus, X, Mic, MicOff, Pencil, MessageCircle } from 'lucide-react'
import useStore from '../store/useStore'
import GlassCard from '../components/ui/GlassCard'
import Button from '../components/ui/Button'

const noteColors = [
  { id: 'yellow', bg: 'bg-yellow-300', border: 'border-yellow-400' },
  { id: 'pink', bg: 'bg-pink-300', border: 'border-pink-400' },
  { id: 'blue', bg: 'bg-blue-300', border: 'border-blue-400' },
  { id: 'green', bg: 'bg-green-300', border: 'border-green-400' },
  { id: 'purple', bg: 'bg-purple-300', border: 'border-purple-400' },
  { id: 'orange', bg: 'bg-orange-300', border: 'border-orange-400' },
]

export default function NoteBoard() {
  const { currentChild, children, notes, addNote, removeNote } = useStore()
  const child = currentChild ? children[currentChild] : null

  const [showAddNote, setShowAddNote] = useState(false)
  const [noteType, setNoteType] = useState('text')
  const [noteContent, setNoteContent] = useState('')
  const [selectedColor, setSelectedColor] = useState('yellow')
  const [isDrawing, setIsDrawing] = useState(false)
  const canvasRef = useRef(null)
  const [lastPos, setLastPos] = useState(null)

  const handleAddNote = () => {
    if (!noteContent.trim()) return

    addNote({
      type: noteType,
      content: noteContent,
      author: currentChild,
      color: noteColors.find(c => c.id === selectedColor)?.bg || 'bg-yellow-300',
    })

    setNoteContent('')
    setShowAddNote(false)
  }

  const startDrawing = (e) => {
    setIsDrawing(true)
    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left
    const y = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top
    setLastPos({ x, y })
  }

  const draw = (e) => {
    if (!isDrawing || !lastPos) return
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const rect = canvas.getBoundingClientRect()
    const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left
    const y = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top

    ctx.beginPath()
    ctx.moveTo(lastPos.x, lastPos.y)
    ctx.lineTo(x, y)
    ctx.strokeStyle = child?.color || '#333'
    ctx.lineWidth = 4
    ctx.lineCap = 'round'
    ctx.stroke()

    setLastPos({ x, y })
  }

  const stopDrawing = () => {
    setIsDrawing(false)
    setLastPos(null)
  }

  const saveDrawing = () => {
    const canvas = canvasRef.current
    const dataUrl = canvas.toDataURL()
    addNote({
      type: 'drawing',
      content: dataUrl,
      author: currentChild,
      color: noteColors.find(c => c.id === selectedColor)?.bg || 'bg-yellow-300',
    })
    setShowAddNote(false)
    // Clear canvas
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, canvas.width, canvas.height)
  }

  if (!child) return null

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
      {/* Header */}
      <motion.div
        className="text-center mb-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <span className="text-5xl block mb-2">📝</span>
        <h1 className="text-3xl font-display font-bold text-gray-800">
          Family Note Board
        </h1>
        <p className="text-gray-600 font-display">
          Leave messages for your family! 💕
        </p>
      </motion.div>

      {/* Add Note Button */}
      <motion.div
        className="flex justify-center mb-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <Button
          variant={child.theme}
          size="lg"
          icon={<Plus className="w-6 h-6" />}
          onClick={() => setShowAddNote(true)}
        >
          Add Note
        </Button>
      </motion.div>

      {/* Notes Grid - Fridge Style */}
      <div className="relative bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl p-6 min-h-[500px] shadow-neumorphic">
        {/* Fridge texture */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.03)_100%)] rounded-3xl" />

        {/* Notes */}
        <div className="relative grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <AnimatePresence>
            {notes.map((note, index) => {
              const author = children[note.author]
              const rotation = (index % 5 - 2) * 3 // Slight random rotation

              return (
                <motion.div
                  key={note.id}
                  className={`
                    ${note.color} p-4 rounded-lg shadow-lg
                    relative
                  `}
                  initial={{ opacity: 0, scale: 0, rotate: -20 }}
                  animate={{ opacity: 1, scale: 1, rotate: rotation }}
                  exit={{ opacity: 0, scale: 0, rotate: 20 }}
                  whileHover={{ scale: 1.05, rotate: 0, zIndex: 10 }}
                  style={{
                    transformOrigin: 'center top',
                  }}
                >
                  {/* Pin/Magnet */}
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-6 h-6 bg-red-500 rounded-full shadow-md flex items-center justify-center">
                    <div className="w-2 h-2 bg-red-700 rounded-full" />
                  </div>

                  {/* Delete button */}
                  <motion.button
                    className="absolute -top-1 -right-1 bg-white rounded-full p-1 shadow-md opacity-0 hover:opacity-100 transition-opacity"
                    onClick={() => removeNote(note.id)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <X className="w-4 h-4 text-gray-500" />
                  </motion.button>

                  {/* Content */}
                  {note.type === 'drawing' ? (
                    <img
                      src={note.content}
                      alt="Drawing"
                      className="w-full h-32 object-contain bg-white/50 rounded"
                    />
                  ) : (
                    <p className="font-display text-gray-800 text-lg min-h-[80px]">
                      {note.content}
                    </p>
                  )}

                  {/* Author */}
                  <div className="mt-3 flex items-center gap-2">
                    <span className="text-xl">{author?.avatar}</span>
                    <span className="font-display font-semibold text-gray-700 text-sm">
                      {author?.name}
                    </span>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>

          {/* Empty state */}
          {notes.length === 0 && (
            <motion.div
              className="col-span-full text-center py-20"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <span className="text-6xl block mb-4">📌</span>
              <p className="text-gray-500 font-display text-lg">
                No notes yet! Add one to get started.
              </p>
            </motion.div>
          )}
        </div>
      </div>

      {/* Add Note Modal */}
      <AnimatePresence>
        {showAddNote && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowAddNote(false)}
          >
            <motion.div
              className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl"
              initial={{ scale: 0.8, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 50 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-2xl font-display font-bold text-gray-800 mb-4 text-center">
                Leave a Note 📝
              </h2>

              {/* Note Type Tabs */}
              <div className="flex gap-2 mb-4">
                <Button
                  variant={noteType === 'text' ? child.theme : 'ghost'}
                  className="flex-1"
                  icon={<MessageCircle className="w-5 h-5" />}
                  onClick={() => setNoteType('text')}
                >
                  Text
                </Button>
                <Button
                  variant={noteType === 'drawing' ? child.theme : 'ghost'}
                  className="flex-1"
                  icon={<Pencil className="w-5 h-5" />}
                  onClick={() => setNoteType('drawing')}
                >
                  Draw
                </Button>
              </div>

              {/* Color Selection */}
              <div className="flex justify-center gap-2 mb-4">
                {noteColors.map((color) => (
                  <motion.button
                    key={color.id}
                    className={`
                      w-10 h-10 rounded-full ${color.bg} ${color.border} border-2
                      ${selectedColor === color.id ? 'ring-2 ring-gray-800 scale-110' : ''}
                    `}
                    onClick={() => setSelectedColor(color.id)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  />
                ))}
              </div>

              {/* Content Input */}
              {noteType === 'text' ? (
                <textarea
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  placeholder="Write your message..."
                  className={`
                    w-full h-40 p-4 rounded-xl border-2 border-gray-200
                    focus:border-purple-400 focus:outline-none
                    font-display text-lg resize-none
                    ${noteColors.find(c => c.id === selectedColor)?.bg}
                  `}
                  maxLength={200}
                />
              ) : (
                <div className={`rounded-xl overflow-hidden ${noteColors.find(c => c.id === selectedColor)?.bg} p-2`}>
                  <canvas
                    ref={canvasRef}
                    width={350}
                    height={200}
                    className="bg-white rounded-lg cursor-crosshair touch-none"
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                  />
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 mt-4">
                <Button
                  variant="ghost"
                  className="flex-1"
                  onClick={() => setShowAddNote(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant={child.theme}
                  className="flex-1"
                  onClick={noteType === 'drawing' ? saveDrawing : handleAddNote}
                  disabled={noteType === 'text' && !noteContent.trim()}
                >
                  Post Note
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
