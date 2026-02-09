import { motion, AnimatePresence } from 'framer-motion'
import { useState, useRef, useEffect } from 'react'
import { Plus, X, Mic, MicOff, Pencil, MessageCircle, Play, Square, Pause } from 'lucide-react'
import useStore from '../store/useStore'
import GlassCard from '../components/ui/GlassCard'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'

// Softer pastel tones for sticky notes
const noteColors = [
  { id: 'yellow', bg: 'bg-amber-100', border: 'border-amber-200', accent: 'bg-amber-200' },
  { id: 'pink', bg: 'bg-rose-100', border: 'border-rose-200', accent: 'bg-rose-200' },
  { id: 'blue', bg: 'bg-sky-100', border: 'border-sky-200', accent: 'bg-sky-200' },
  { id: 'green', bg: 'bg-emerald-100', border: 'border-emerald-200', accent: 'bg-emerald-200' },
  { id: 'purple', bg: 'bg-violet-100', border: 'border-violet-200', accent: 'bg-violet-200' },
  { id: 'orange', bg: 'bg-orange-100', border: 'border-orange-200', accent: 'bg-orange-200' },
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

  // Voice recording state
  const [isRecording, setIsRecording] = useState(false)
  const [audioBlob, setAudioBlob] = useState(null)
  const [audioUrl, setAudioUrl] = useState(null)
  const [recordingTime, setRecordingTime] = useState(0)
  const mediaRecorderRef = useRef(null)
  const audioChunksRef = useRef([])
  const timerRef = useRef(null)

  // Audio playback state
  const [playingNoteId, setPlayingNoteId] = useState(null)
  const audioRef = useRef(null)

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      if (audioUrl) URL.revokeObjectURL(audioUrl)
    }
  }, [audioUrl])

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      mediaRecorderRef.current = new MediaRecorder(stream)
      audioChunksRef.current = []

      mediaRecorderRef.current.ondataavailable = (e) => {
        audioChunksRef.current.push(e.data)
      }

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
        setAudioBlob(blob)
        const url = URL.createObjectURL(blob)
        setAudioUrl(url)
        stream.getTracks().forEach(track => track.stop())
      }

      mediaRecorderRef.current.start()
      setIsRecording(true)
      setRecordingTime(0)

      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1)
      }, 1000)
    } catch (err) {
      console.error('Error accessing microphone:', err)
      alert('Could not access microphone. Please allow microphone access.')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }

  const handleAddNote = () => {
    if (noteType === 'text' && !noteContent.trim()) return
    if (noteType === 'voice' && !audioBlob) return

    if (noteType === 'voice') {
      // Convert blob to base64 for storage
      const reader = new FileReader()
      reader.readAsDataURL(audioBlob)
      reader.onloadend = () => {
        addNote({
          type: 'voice',
          content: reader.result,
          duration: recordingTime,
          author: currentChild,
          color: noteColors.find(c => c.id === selectedColor)?.bg || 'bg-yellow-300',
        })
        resetForm()
      }
    } else {
      addNote({
        type: noteType,
        content: noteContent,
        author: currentChild,
        color: noteColors.find(c => c.id === selectedColor)?.bg || 'bg-yellow-300',
      })
      resetForm()
    }
  }

  const resetForm = () => {
    setNoteContent('')
    setShowAddNote(false)
    setAudioBlob(null)
    setAudioUrl(null)
    setRecordingTime(0)
    setNoteType('text')
  }

  const playVoiceNote = (noteId, audioData) => {
    if (playingNoteId === noteId) {
      // Stop playing
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
      setPlayingNoteId(null)
    } else {
      // Start playing
      if (audioRef.current) {
        audioRef.current.pause()
      }
      audioRef.current = new Audio(audioData)
      audioRef.current.onended = () => setPlayingNoteId(null)
      audioRef.current.play()
      setPlayingNoteId(noteId)
    }
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

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (!child) return null

  return (
    <div className="p-3 sm:p-4 md:p-6 max-w-4xl mx-auto">
      {/* Header */}
      <motion.div
        className="text-center mb-4 sm:mb-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <span className="text-4xl sm:text-5xl block mb-1.5 sm:mb-2">📝</span>
        <h1 className="text-2xl sm:text-3xl font-display font-bold text-gray-800">
          Family Note Board
        </h1>
        <p className="text-sm sm:text-base text-gray-600 font-display">
          Leave messages for your family! 💕
        </p>
      </motion.div>

      {/* Add Note Button */}
      <motion.div
        className="flex justify-center mb-4 sm:mb-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <Button
          variant={child.theme}
          size="lg"
          icon={<Plus className="w-5 h-5 sm:w-6 sm:h-6" />}
          onClick={() => setShowAddNote(true)}
        >
          Add Note
        </Button>
      </motion.div>

      {/* Notes Grid - Fridge Style */}
      <div className="relative bg-white rounded-2xl sm:rounded-3xl p-3 sm:p-6 min-h-[400px] sm:min-h-[500px] shadow-md border border-gray-100">
        {/* Subtle texture */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.02)_100%)] rounded-3xl pointer-events-none" />

        {/* Notes */}
        <div className="relative grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          <AnimatePresence>
            {notes.map((note, index) => {
              const author = children[note.author]
              const rotation = (index % 5 - 2) * 2 // Subtle rotation
              // Map old colors to new pastel colors
              const colorMap = {
                'bg-yellow-300': 'bg-amber-100',
                'bg-pink-300': 'bg-rose-100',
                'bg-blue-300': 'bg-sky-100',
                'bg-green-300': 'bg-emerald-100',
                'bg-purple-300': 'bg-violet-100',
                'bg-orange-300': 'bg-orange-100',
              }
              const noteColor = colorMap[note.color] || note.color

              return (
                <motion.div
                  key={note.id}
                  className={`
                    ${noteColor} p-3 sm:p-4 rounded-xl sm:rounded-2xl
                    shadow-sm border border-gray-100/50
                    relative
                  `}
                  initial={{ opacity: 0, scale: 0, rotate: -20 }}
                  animate={{ opacity: 1, scale: 1, rotate: rotation }}
                  exit={{ opacity: 0, scale: 0, rotate: 20 }}
                  whileHover={{ scale: 1.03, rotate: 0, zIndex: 10, boxShadow: '0 8px 25px -5px rgba(0, 0, 0, 0.1)' }}
                  style={{
                    transformOrigin: 'center top',
                  }}
                >
                  {/* Modern tape/clip indicator */}
                  <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-8 h-3 sm:w-10 sm:h-4 bg-gray-200/80 rounded-b-md shadow-sm" />

                  {/* Delete button - larger touch target */}
                  <motion.button
                    className="absolute -top-1 -right-1 bg-white rounded-full p-1.5 sm:p-2 shadow-md opacity-70 hover:opacity-100 transition-opacity z-20 min-w-[32px] min-h-[32px] flex items-center justify-center"
                    onClick={() => removeNote(note.id)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <X className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-500" />
                  </motion.button>

                  {/* Content */}
                  {note.type === 'drawing' ? (
                    <img
                      src={note.content}
                      alt="Drawing"
                      className="w-full h-24 sm:h-32 object-contain bg-white/70 rounded-lg mt-1"
                    />
                  ) : note.type === 'voice' ? (
                    <div className="flex flex-col items-center justify-center min-h-[70px] sm:min-h-[90px] mt-1">
                      <motion.button
                        className={`
                          w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center
                          ${playingNoteId === note.id ? 'bg-red-400' : 'bg-white/70'}
                          shadow-md min-w-[44px] min-h-[44px]
                        `}
                        onClick={() => playVoiceNote(note.id, note.content)}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        {playingNoteId === note.id ? (
                          <Square className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                        ) : (
                          <Play className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700 ml-0.5" />
                        )}
                      </motion.button>
                      <p className="mt-2 text-xs sm:text-sm text-gray-600 font-display">
                        🎤 Voice ({note.duration}s)
                      </p>
                    </div>
                  ) : (
                    <p className="font-display text-gray-700 text-sm sm:text-base min-h-[70px] sm:min-h-[90px] mt-1 leading-relaxed">
                      {note.content}
                    </p>
                  )}

                  {/* Author */}
                  <div className="mt-2 sm:mt-3 pt-2 border-t border-gray-200/50 flex items-center gap-1.5 sm:gap-2">
                    <span className="text-lg sm:text-xl">{author?.avatar}</span>
                    <span className="font-display font-medium text-gray-600 text-xs sm:text-sm">
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
              className="col-span-full text-center py-12 sm:py-20"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <span className="text-5xl sm:text-6xl block mb-3 sm:mb-4">📌</span>
              <p className="text-gray-500 font-display text-base sm:text-lg">
                No notes yet! Add one to get started.
              </p>
            </motion.div>
          )}
        </div>
      </div>

      {/* Add Note Modal - Keyboard aware and properly centered */}
      <Modal
        isOpen={showAddNote}
        onClose={() => { resetForm(); setShowAddNote(false); }}
        title="Leave a Note 📝"
        size="md"
      >
        {/* Note Type Tabs */}
        <div className="flex gap-2 mb-4">
          <Button
            variant={noteType === 'text' ? child.theme : 'clean'}
            size="md"
            className="flex-1"
            icon={<MessageCircle className="w-4 h-4 sm:w-5 sm:h-5" />}
            onClick={() => setNoteType('text')}
          >
            <span className="text-xs sm:text-base">Text</span>
          </Button>
          <Button
            variant={noteType === 'voice' ? child.theme : 'clean'}
            size="md"
            className="flex-1"
            icon={<Mic className="w-4 h-4 sm:w-5 sm:h-5" />}
            onClick={() => setNoteType('voice')}
          >
            <span className="text-xs sm:text-base">Voice</span>
          </Button>
          <Button
            variant={noteType === 'drawing' ? child.theme : 'clean'}
            size="md"
            className="flex-1"
            icon={<Pencil className="w-4 h-4 sm:w-5 sm:h-5" />}
            onClick={() => setNoteType('drawing')}
          >
            <span className="text-xs sm:text-base">Draw</span>
          </Button>
        </div>

        {/* Color Selection */}
        <div className="flex justify-center gap-2 sm:gap-3 mb-4">
          {noteColors.map((color) => (
            <motion.button
              key={color.id}
              className={`
                w-10 h-10 sm:w-12 sm:h-12 rounded-full ${color.bg} ${color.border} border-2
                min-w-[40px] min-h-[40px]
                ${selectedColor === color.id ? 'ring-2 ring-gray-800 ring-offset-2 scale-110' : ''}
              `}
              onClick={() => setSelectedColor(color.id)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            />
          ))}
        </div>

        {/* Content Input */}
        {noteType === 'text' && (
          <textarea
            value={noteContent}
            onChange={(e) => setNoteContent(e.target.value)}
            placeholder="Write your message..."
            className={`
              w-full h-32 sm:h-40 p-4 rounded-xl border-2 border-gray-200
              focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-100
              font-display text-base sm:text-lg resize-none
              ${noteColors.find(c => c.id === selectedColor)?.bg}
            `}
            maxLength={200}
            autoFocus
          />
        )}

        {noteType === 'voice' && (
          <div className={`rounded-xl p-4 sm:p-6 ${noteColors.find(c => c.id === selectedColor)?.bg} text-center`}>
            {!audioBlob ? (
              <>
                <motion.button
                  className={`
                    w-20 h-20 sm:w-24 sm:h-24 rounded-full mx-auto flex items-center justify-center
                    ${isRecording ? 'bg-red-400' : 'bg-white/70'}
                    shadow-lg min-w-[56px] min-h-[56px]
                  `}
                  onClick={isRecording ? stopRecording : startRecording}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  animate={isRecording ? { scale: [1, 1.1, 1] } : {}}
                  transition={isRecording ? { repeat: Infinity, duration: 1 } : {}}
                >
                  {isRecording ? (
                    <Square className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                  ) : (
                    <Mic className="w-8 h-8 sm:w-10 sm:h-10 text-gray-700" />
                  )}
                </motion.button>
                <p className="mt-4 font-display text-gray-700 text-sm sm:text-base">
                  {isRecording ? (
                    <span className="text-red-600 font-bold">
                      Recording... {formatTime(recordingTime)}
                    </span>
                  ) : (
                    'Tap to record a voice message!'
                  )}
                </p>
              </>
            ) : (
              <>
                <div className="flex items-center justify-center gap-4">
                  <motion.button
                    className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white/70 flex items-center justify-center shadow-lg min-w-[48px] min-h-[48px]"
                    onClick={() => {
                      const audio = new Audio(audioUrl)
                      audio.play()
                    }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Play className="w-6 h-6 sm:w-8 sm:h-8 text-gray-700 ml-1" />
                  </motion.button>
                </div>
                <p className="mt-4 font-display text-gray-700 text-sm sm:text-base">
                  Voice recorded! ({formatTime(recordingTime)})
                </p>
                <button
                  className="mt-2 text-sm text-gray-500 underline min-h-[36px] px-3"
                  onClick={() => {
                    setAudioBlob(null)
                    setAudioUrl(null)
                    setRecordingTime(0)
                  }}
                >
                  Record again
                </button>
              </>
            )}
          </div>
        )}

        {noteType === 'drawing' && (
          <div className={`rounded-xl overflow-hidden ${noteColors.find(c => c.id === selectedColor)?.bg} p-2`}>
            <canvas
              ref={canvasRef}
              width={350}
              height={180}
              className="bg-white rounded-lg cursor-crosshair touch-none w-full"
              style={{ maxWidth: '100%', height: 'auto', aspectRatio: '350/180' }}
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
        <div className="flex gap-3 mt-5 pt-4 border-t border-gray-100">
          <Button
            variant="clean"
            size="lg"
            className="flex-1"
            onClick={() => { resetForm(); setShowAddNote(false); }}
          >
            Cancel
          </Button>
          <Button
            variant={child.theme}
            size="lg"
            className="flex-1"
            onClick={noteType === 'drawing' ? saveDrawing : handleAddNote}
            disabled={
              (noteType === 'text' && !noteContent.trim()) ||
              (noteType === 'voice' && !audioBlob)
            }
          >
            Post Note
          </Button>
        </div>
      </Modal>
    </div>
  )
}
