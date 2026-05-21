import { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Trophy, Lock } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAchievements } from '@/api/users'
import { NumberRoll } from '@/components/NumberRoll'
import { ShareButton } from '@/components/ShareButton'
import { CardSkeleton } from '@/components/Skeleton'
import { AchievementUnlockModal, UnlockedAchievement } from '@/components/AchievementUnlockModal'

type Achievement = UnlockedAchievement & { unlocked: boolean; threshold?: number }

export default function AchievementsPage() {
  const navigate = useNavigate()
  const { data, isLoading } = useAchievements()
  const [previewAchievement, setPreviewAchievement] = useState<UnlockedAchievement | null>(null)

  const achievements: Achievement[] = data?.achievements ?? []
  const unlocked = data?.unlocked ?? 0
  const total = data?.total ?? 0
  const progress = total > 0 ? (unlocked / total) * 100 : 0

  return (
    <div className="min-h-screen bg-[#F8F8F8] pb-28 lg:pb-8">
      {/* Hero */}
      <div className="relative aurora overflow-hidden px-6 pt-12 pb-8">
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <button onClick={() => navigate(-1)} className="w-10 h-10 glass rounded-full flex items-center justify-center">
              <ArrowLeft size={18} className="text-white" />
            </button>
            <ShareButton
              title="Мои достижения"
              text={`Я разблокировал ${unlocked}/${total} достижений в BotlBack TJ!`}
              className="w-10 h-10 glass rounded-full flex items-center justify-center text-white"
              size={16}
            />
          </div>

          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-brand-gold/20 rounded-2xl flex items-center justify-center">
              <Trophy size={20} className="text-brand-gold" />
            </div>
            <div>
              <p className="text-white/40 text-[10px] font-bold tracking-widest uppercase">Достижения</p>
              <h1 className="display text-white text-3xl leading-none">Коллекция</h1>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-5 mb-1 flex items-baseline justify-between">
            <p className="text-white text-2xl font-black">
              <NumberRoll value={unlocked} duration={1.4} />
              <span className="text-white/40 text-sm ml-1">/ {total}</span>
            </p>
            <p className="text-brand-gold text-xs font-black">{Math.round(progress)}%</p>
          </div>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1.4, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="h-full"
              style={{ background: 'linear-gradient(90deg, #FFB800, #F40009)' }}
            />
          </div>
        </motion.div>
      </div>

      {/* Grid */}
      <div className="px-5 lg:px-8 py-6 lg:max-w-4xl lg:mx-auto">
        {isLoading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[...Array(6)].map((_, i) => <CardSkeleton key={i} />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {achievements.map((a, i) => (
              <motion.button
                key={a.code}
                initial={{ opacity: 0, y: 16, rotateX: -10 }}
                animate={{ opacity: 1, y: 0, rotateX: 0 }}
                transition={{ delay: i * 0.05, type: 'spring', damping: 16 }}
                whileHover={{ y: -3, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => a.unlocked && setPreviewAchievement(a)}
                disabled={!a.unlocked}
                className={`relative rounded-3xl p-4 text-left overflow-hidden ${a.unlocked ? 'bg-white shadow-sm' : 'bg-gray-100/50'}`}
                style={{ transformStyle: 'preserve-3d', perspective: 600 }}
              >
                {a.unlocked ? (
                  <>
                    <div className="absolute -right-6 -top-6 w-20 h-20 rounded-full opacity-20"
                      style={{ background: 'radial-gradient(circle, #FFB800, transparent 70%)' }} />
                    <motion.div
                      animate={{ y: [0, -3, 0], rotate: [-2, 2, -2] }}
                      transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: i * 0.2 }}
                      className="text-4xl mb-2"
                      style={{ filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.15))' }}
                    >
                      {a.emoji}
                    </motion.div>
                  </>
                ) : (
                  <div className="relative mb-2 text-4xl grayscale opacity-30">
                    {a.emoji}
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center">
                      <Lock size={11} className="text-gray-500" />
                    </div>
                  </div>
                )}
                <p className={`font-black text-sm leading-tight ${a.unlocked ? 'text-brand-charcoal' : 'text-gray-400'}`}>
                  {a.name}
                </p>
                <p className={`text-[11px] mt-0.5 leading-snug ${a.unlocked ? 'text-gray-500' : 'text-gray-400'}`}>
                  {a.description}
                </p>
              </motion.button>
            ))}
          </div>
        )}
      </div>

      <AchievementUnlockModal achievement={previewAchievement} onClose={() => setPreviewAchievement(null)} />
    </div>
  )
}
