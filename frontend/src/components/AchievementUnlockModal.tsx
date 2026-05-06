import { motion, AnimatePresence } from 'framer-motion'
import { useEffect } from 'react'
import confetti from 'canvas-confetti'
import { X, Sparkles } from 'lucide-react'

export type UnlockedAchievement = {
  code: string
  name: string
  description: string
  emoji: string
}

interface Props {
  achievement: UnlockedAchievement | null
  onClose: () => void
}

export function AchievementUnlockModal({ achievement, onClose }: Props) {
  useEffect(() => {
    if (!achievement) return
    // Gold burst
    const fire = (origin: number) =>
      confetti({
        particleCount: 80, spread: 70, origin: { x: origin, y: 0.5 },
        colors: ['#FFB800', '#F40009', '#ffffff', '#FFD75A'], scalar: 1.2, ticks: 250,
      })
    setTimeout(() => { fire(0.3); fire(0.7) }, 100)
  }, [achievement])

  return (
    <AnimatePresence>
      {achievement && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9000] bg-black/70 backdrop-blur-md flex items-center justify-center p-6"
          onClick={onClose}
        >
          {/* Pulsing rings */}
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="absolute rounded-full pointer-events-none"
              initial={{ width: 100, height: 100, opacity: 0 }}
              animate={{ width: 500, height: 500, opacity: [0, 0.4, 0] }}
              transition={{ duration: 2.4, delay: i * 0.4, repeat: Infinity, ease: 'easeOut' }}
              style={{ border: '2px solid rgba(255,184,0,0.5)' }}
            />
          ))}

          <motion.div
            initial={{ scale: 0.6, opacity: 0, rotateX: -20 }}
            animate={{ scale: 1, opacity: 1, rotateX: 0 }}
            exit={{ scale: 0.6, opacity: 0 }}
            transition={{ type: 'spring', damping: 14, stiffness: 200 }}
            onClick={(e) => e.stopPropagation()}
            style={{ transformStyle: 'preserve-3d', perspective: 800 }}
            className="relative bg-white rounded-[2rem] p-8 max-w-sm w-full text-center overflow-hidden"
          >
            {/* Gold glow */}
            <div className="absolute inset-0 pointer-events-none" style={{
              background: 'radial-gradient(ellipse at top, rgba(255,184,0,0.25) 0%, transparent 60%)',
            }} />

            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-10 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
            >
              <X size={14} className="text-gray-500" />
            </button>

            <div className="relative z-10">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-1.5 bg-brand-gold/15 text-brand-gold text-[10px] font-bold tracking-widest uppercase px-3 py-1 rounded-full mb-5"
              >
                <Sparkles size={12} />
                Достижение разблокировано
              </motion.div>

              {/* Spinning emoji medallion */}
              <motion.div
                initial={{ scale: 0, rotateY: -180 }}
                animate={{ scale: 1, rotateY: 0 }}
                transition={{ delay: 0.3, type: 'spring', damping: 10 }}
                style={{ transformStyle: 'preserve-3d' }}
                className="mb-4"
              >
                <motion.div
                  animate={{ rotateY: [0, 8, 0, -8, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 0.8 }}
                  className="w-28 h-28 mx-auto rounded-full flex items-center justify-center text-5xl"
                  style={{
                    background: 'conic-gradient(from 0deg, #FFB800, #FFD75A, #FFB800, #C28800, #FFB800)',
                    boxShadow: '0 12px 40px rgba(255,184,0,0.5), inset 0 2px 8px rgba(255,255,255,0.4)',
                  }}
                >
                  <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center">
                    <span style={{ filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.15))' }}>{achievement.emoji}</span>
                  </div>
                </motion.div>
              </motion.div>

              <motion.h3
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="display text-brand-charcoal text-3xl"
              >
                {achievement.name}
              </motion.h3>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.65 }}
                className="text-gray-500 text-sm mt-2 mb-6"
              >
                {achievement.description}
              </motion.p>

              <motion.button
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                whileTap={{ scale: 0.96 }}
                whileHover={{ scale: 1.02 }}
                onClick={onClose}
                className="w-full bg-brand-red text-white font-black py-4 rounded-2xl shadow-[0_8px_24px_rgba(244,0,9,0.4)]"
              >
                Отлично!
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
