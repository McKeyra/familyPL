import { motion } from 'framer-motion'
import { Flame, Star, Calendar, Trophy, TrendingUp } from 'lucide-react'
import { format, subDays } from 'date-fns'
import useStore from '../store/useStore'
import GlassCard from '../components/ui/GlassCard'

export default function Progress() {
  const { currentChild, children, getWeeklyReport, streaks, challenges, getChallengeProgress } = useStore()
  const child = currentChild ? children[currentChild] : null

  if (!child) return null

  const report = getWeeklyReport(currentChild)
  const streak = streaks[currentChild]

  // Generate last 7 days for the chart
  const last7Days = [...Array(7)].map((_, i) => {
    const date = subDays(new Date(), 6 - i)
    const dateStr = format(date, 'yyyy-MM-dd')
    const dayData = report.dailyData[dateStr] || { tasks: 0, stars: 0 }
    return {
      date: format(date, 'EEE'),
      fullDate: dateStr,
      ...dayData,
    }
  })

  const maxStars = Math.max(...last7Days.map(d => d.stars), 1)

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
      {/* Header */}
      <motion.div
        className="text-center mb-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <span className="text-5xl block mb-2">📊</span>
        <h1 className="text-3xl font-display font-bold text-gray-800">
          {child.name}'s Progress
        </h1>
        <p className="text-gray-600 font-display">
          See how amazing you're doing!
        </p>
      </motion.div>

      {/* Streak Card */}
      <motion.div
        className="mb-6"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
      >
        <GlassCard variant={child.theme} glow={child.theme} size="lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <motion.div
                className="text-6xl"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                🔥
              </motion.div>
              <div>
                <h2 className="text-4xl font-display font-bold text-white">
                  {streak.currentStreak} Day Streak!
                </h2>
                <p className="text-white/80 font-display">
                  Keep it going, superstar!
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-white/70 font-display text-sm">Best Streak</p>
              <p className="text-2xl font-bold text-white flex items-center gap-1">
                <Trophy className="w-6 h-6 text-yellow-300" />
                {streak.longestStreak} days
              </p>
            </div>
          </div>

          {/* Streak flames visualization */}
          <div className="mt-4 flex justify-center gap-2">
            {[...Array(7)].map((_, i) => (
              <motion.div
                key={i}
                className={`text-3xl ${i < streak.currentStreak ? 'opacity-100' : 'opacity-30'}`}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1 * i }}
              >
                🔥
              </motion.div>
            ))}
          </div>
        </GlassCard>
      </motion.div>

      {/* Weekly Summary */}
      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <GlassCard variant="default" className="text-center">
            <Star className="w-10 h-10 text-yellow-500 mx-auto mb-2" />
            <p className="text-3xl font-display font-bold text-gray-800">
              {report.totalStars}
            </p>
            <p className="text-gray-600 font-display">Stars This Week</p>
          </GlassCard>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <GlassCard variant="default" className="text-center">
            <Trophy className="w-10 h-10 text-purple-500 mx-auto mb-2" />
            <p className="text-3xl font-display font-bold text-gray-800">
              {report.totalTasks}
            </p>
            <p className="text-gray-600 font-display">Tasks Completed</p>
          </GlassCard>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <GlassCard variant="default" className="text-center">
            <Calendar className="w-10 h-10 text-green-500 mx-auto mb-2" />
            <p className="text-3xl font-display font-bold text-gray-800">
              {report.daysActive}/7
            </p>
            <p className="text-gray-600 font-display">Active Days</p>
          </GlassCard>
        </motion.div>
      </div>

      {/* Weekly Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <GlassCard variant="default" size="lg">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-green-500" />
            <h3 className="font-display font-bold text-gray-800 text-lg">
              This Week's Progress
            </h3>
          </div>

          {/* Bar Chart */}
          <div className="flex items-end justify-between gap-2 h-40">
            {last7Days.map((day, index) => (
              <div key={day.fullDate} className="flex-1 flex flex-col items-center">
                <motion.div
                  className={`
                    w-full rounded-t-lg
                    ${child.theme === 'bria' ? 'bg-gradient-to-t from-bria-400 to-bria-300' : 'bg-gradient-to-t from-naya-400 to-naya-300'}
                  `}
                  initial={{ height: 0 }}
                  animate={{ height: `${(day.stars / maxStars) * 100}%` }}
                  transition={{ delay: 0.1 * index, duration: 0.5 }}
                  style={{ minHeight: day.stars > 0 ? '20px' : '4px' }}
                />
                <div className="mt-2 text-center">
                  <p className="text-xs text-gray-500 font-display">{day.date}</p>
                  {day.stars > 0 && (
                    <p className="text-sm font-bold text-gray-700">{day.stars}⭐</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </motion.div>

      {/* Active Challenges */}
      <motion.div
        className="mt-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <GlassCard variant="default">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">🤝</span>
            <h3 className="font-display font-bold text-gray-800 text-lg">
              Team Challenges
            </h3>
          </div>

          <div className="space-y-4">
            {challenges.filter(c => c.active).map((challenge) => {
              const progress = getChallengeProgress(challenge.id)
              return (
                <div key={challenge.id} className="bg-white/30 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{challenge.emoji}</span>
                      <div>
                        <h4 className="font-display font-bold text-gray-800">
                          {challenge.title}
                        </h4>
                        <p className="text-sm text-gray-600">{challenge.description}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Reward</p>
                      <p className="font-bold text-purple-600">{challenge.reward}</p>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="bg-gray-200 rounded-full h-4 overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-purple-400 to-pink-400 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${progress.percentage}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-sm text-gray-600">
                      {progress.total} / {challenge.target}
                    </span>
                    <span className="text-sm font-bold text-purple-600">
                      {Math.round(progress.percentage)}%
                    </span>
                  </div>

                  {/* Individual contributions */}
                  <div className="flex gap-4 mt-2">
                    <div className="flex items-center gap-1 text-sm">
                      <span>👧</span>
                      <span className="text-gray-600">Bria: {challenge.progress.bria || 0}</span>
                    </div>
                    <div className="flex items-center gap-1 text-sm">
                      <span>👶</span>
                      <span className="text-gray-600">Naya: {challenge.progress.naya || 0}</span>
                    </div>
                  </div>
                </div>
              )
            })}

            {challenges.filter(c => c.active).length === 0 && (
              <p className="text-center text-gray-500 py-4 font-display">
                No active challenges. Ask mom or dad to create one!
              </p>
            )}
          </div>
        </GlassCard>
      </motion.div>

      {/* Motivational Message */}
      <motion.div
        className="mt-6 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
      >
        <GlassCard variant={child.theme} size="sm">
          <p className="font-display font-semibold text-white text-lg">
            {streak.currentStreak >= 7
              ? "🌟 INCREDIBLE! You're on fire!"
              : streak.currentStreak >= 3
              ? "🎉 Amazing job! Keep going!"
              : "💪 Great start! You can do this!"}
          </p>
        </GlassCard>
      </motion.div>
    </div>
  )
}
