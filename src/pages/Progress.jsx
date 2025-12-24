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
    <div className="p-3 sm:p-4 md:p-6 max-w-4xl mx-auto">
      {/* Header */}
      <motion.div
        className="text-center mb-4 sm:mb-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <span className="text-4xl sm:text-5xl block mb-1.5 sm:mb-2">📊</span>
        <h1 className="text-2xl sm:text-3xl font-display font-bold text-gray-800">
          {child.name}'s Progress
        </h1>
        <p className="text-sm sm:text-base text-gray-600 font-display">
          See how amazing you're doing!
        </p>
      </motion.div>

      {/* Streak Card */}
      <motion.div
        className="mb-4 sm:mb-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <GlassCard variant={child.theme} glow={child.theme} size="lg">
          <div className="flex flex-col sm:flex-row items-center sm:justify-between gap-3 sm:gap-4">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="text-5xl sm:text-6xl">
                🔥
              </div>
              <div className="text-center sm:text-left">
                <h2 className="text-2xl sm:text-4xl font-display font-bold text-white">
                  {streak.currentStreak} Day Streak!
                </h2>
                <p className="text-white/80 font-display text-sm sm:text-base">
                  Keep it going, superstar!
                </p>
              </div>
            </div>
            <div className="text-center sm:text-right">
              <p className="text-white/70 font-display text-xs sm:text-sm">Best Streak</p>
              <p className="text-xl sm:text-2xl font-bold text-white flex items-center justify-center sm:justify-end gap-1">
                <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-300" />
                {streak.longestStreak} days
              </p>
            </div>
          </div>

          {/* Streak flames visualization */}
          <div className="mt-3 sm:mt-4 flex justify-center gap-1.5 sm:gap-2">
            {[...Array(7)].map((_, i) => (
              <motion.div
                key={i}
                className={`text-2xl sm:text-3xl ${i < streak.currentStreak ? 'opacity-100' : 'opacity-30'}`}
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
      <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-4 sm:mb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <GlassCard variant="default" className="text-center">
            <Star className="w-8 h-8 sm:w-10 sm:h-10 text-yellow-500 mx-auto mb-1.5 sm:mb-2" />
            <p className="text-2xl sm:text-3xl font-display font-bold text-gray-800">
              {report.totalStars}
            </p>
            <p className="text-xs sm:text-base text-gray-600 font-display">Stars</p>
          </GlassCard>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <GlassCard variant="default" className="text-center">
            <Trophy className="w-8 h-8 sm:w-10 sm:h-10 text-purple-500 mx-auto mb-1.5 sm:mb-2" />
            <p className="text-2xl sm:text-3xl font-display font-bold text-gray-800">
              {report.totalTasks}
            </p>
            <p className="text-xs sm:text-base text-gray-600 font-display">Tasks</p>
          </GlassCard>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <GlassCard variant="default" className="text-center">
            <Calendar className="w-8 h-8 sm:w-10 sm:h-10 text-green-500 mx-auto mb-1.5 sm:mb-2" />
            <p className="text-2xl sm:text-3xl font-display font-bold text-gray-800">
              {report.daysActive}/7
            </p>
            <p className="text-xs sm:text-base text-gray-600 font-display">Days</p>
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
          <div className="flex items-center gap-1.5 sm:gap-2 mb-3 sm:mb-4">
            <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
            <h3 className="font-display font-bold text-gray-800 text-base sm:text-lg">
              This Week's Progress
            </h3>
          </div>

          {/* Bar Chart */}
          <div className="flex items-end justify-between gap-1 sm:gap-2 h-32 sm:h-40">
            {last7Days.map((day, index) => (
              <div key={day.fullDate} className="flex-1 flex flex-col items-center">
                <motion.div
                  className={`
                    w-full rounded-t-md sm:rounded-t-lg
                    ${child.theme === 'bria' ? 'bg-gradient-to-t from-bria-400 to-bria-300' : 'bg-gradient-to-t from-naya-400 to-naya-300'}
                  `}
                  initial={{ height: 0 }}
                  animate={{ height: `${(day.stars / maxStars) * 100}%` }}
                  transition={{ delay: 0.1 * index, duration: 0.5 }}
                  style={{ minHeight: day.stars > 0 ? '16px' : '4px' }}
                />
                <div className="mt-1.5 sm:mt-2 text-center">
                  <p className="text-[10px] sm:text-xs text-gray-500 font-display">{day.date}</p>
                  {day.stars > 0 && (
                    <p className="text-xs sm:text-sm font-bold text-gray-700">{day.stars}⭐</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </motion.div>

      {/* Active Challenges */}
      <motion.div
        className="mt-4 sm:mt-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <GlassCard variant="default">
          <div className="flex items-center gap-1.5 sm:gap-2 mb-3 sm:mb-4">
            <span className="text-xl sm:text-2xl">🤝</span>
            <h3 className="font-display font-bold text-gray-800 text-base sm:text-lg">
              Team Challenges
            </h3>
          </div>

          <div className="space-y-3 sm:space-y-4">
            {challenges.filter(c => c.active).map((challenge) => {
              const progress = getChallengeProgress(challenge.id)
              return (
                <div key={challenge.id} className="bg-white/30 rounded-lg sm:rounded-xl p-3 sm:p-4">
                  <div className="flex items-start justify-between mb-2 gap-2">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <span className="text-2xl sm:text-3xl">{challenge.emoji}</span>
                      <div>
                        <h4 className="font-display font-bold text-gray-800 text-sm sm:text-base">
                          {challenge.title}
                        </h4>
                        <p className="text-xs sm:text-sm text-gray-600">{challenge.description}</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs sm:text-sm text-gray-500">Reward</p>
                      <p className="font-bold text-purple-600 text-sm sm:text-base">{challenge.reward}</p>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="bg-gray-200 rounded-full h-3 sm:h-4 overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-purple-400 to-pink-400 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${progress.percentage}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-xs sm:text-sm text-gray-600">
                      {progress.total} / {challenge.target}
                    </span>
                    <span className="text-xs sm:text-sm font-bold text-purple-600">
                      {Math.round(progress.percentage)}%
                    </span>
                  </div>

                  {/* Individual contributions */}
                  <div className="flex gap-3 sm:gap-4 mt-2">
                    <div className="flex items-center gap-1 text-xs sm:text-sm">
                      <span>👧</span>
                      <span className="text-gray-600">Bria: {challenge.progress.bria || 0}</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs sm:text-sm">
                      <span>👶</span>
                      <span className="text-gray-600">Naya: {challenge.progress.naya || 0}</span>
                    </div>
                  </div>
                </div>
              )
            })}

            {challenges.filter(c => c.active).length === 0 && (
              <p className="text-center text-gray-500 py-3 sm:py-4 font-display text-sm sm:text-base">
                No active challenges. Ask mom or dad to create one!
              </p>
            )}
          </div>
        </GlassCard>
      </motion.div>

      {/* Motivational Message */}
      <motion.div
        className="mt-4 sm:mt-6 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
      >
        <GlassCard variant={child.theme} size="sm">
          <p className="font-display font-semibold text-white text-base sm:text-lg">
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
