import { motion, AnimatePresence } from 'framer-motion'
import { useEffect } from 'react'
import confetti from 'canvas-confetti'
import { Crown, X } from 'lucide-react'

const TIER_META: Record<string, { color: string; bg: string; tagline: string }> = {
  Silver:   { color: '#9CA3AF', bg: 'linear-gradient(135deg,#D1D5DB,#6B7280)', tagline: 'Серебряный уровень' },
  Gold:     { color: '#FFB800', bg: 'linear-gradient(135deg,#FFD75A,#C28800)', tagline: 'Золотой уровень' },
  Platinum: { color: '#A78BFA', bg: 'linear-gradient(135deg,#C4B5FD,#7C3AED)', tagline: 'Платиновый уровень' },
}

interface Props {
  tier: string | null
  onClose: () => void
}

export function TierUpModal({ tier, onClose }: Props) {
  useEffect(() => {
    if (!tier) return
    const meta = TIER_META[tier]
    if (!meta) return
    // Big multi-wave confetti
    const fire = (origin: number, angle: number) =>
      confetti({
        particleCount: 100, spread: 80, angle, origin: { x: origin, y: 0.5 },
        colors: [meta.color, '#ffffff', '#F40009', '#FFB800'], scalar: 1.3, ticks: 300,
      })
    setTimeout(() => { fire(0.2, 70); fire(0.8, 110) }, 100)
    setTimeout(() => { fire(0.5, 90) }, 600)
  }, [tier])

  if (!tier) return null
  const meta = TIER_META[tier]
  if (!meta) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9100] bg-black/80 backdrop-blur-md flex items-center justify-center p-6"
        onClick={onClose}
      >
        {/* Aurora glow */}
        <div className="absolute inset-0" style={{
          background: `radial-gradient(circle at 50% 50%, ${meta.color}40 0%, transparent 60%)`,
        }} />

        {/* Star field */}
        {Array.from({ length: 30 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute pointer-events-none rounded-full"
            initial={{
              x: typeof window !== 'undefined' ? Math.random() * window.innerWidth : 0,
              y: typeof window !== 'undefined' ? Math.random() * window.innerHeight : 0,
              scale: 0,
              opacity: 0,
            }}
            animate={{ scale: [0, 1, 0], opacity: [0, 1, 0] }}
            transition={{ duration: 2, delay: Math.random() * 1.5, repeat: Infinity, repeatDelay: Math.random() * 2 }}
            style={{ width: 4, height: 4, background: '#fff', boxShadow: `0 0 8px ${meta.color}` }}
          />
        ))}

        <motion.div
          initial={{ scale: 0.5, opacity: 0, y: 30 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.5, opacity: 0 }}
          transition={{ type: 'spring', damping: 14, stiffness: 180 }}
          onClick={(e) => e.stopPropagation()}
          className="relative bg-brand-dark rounded-[2rem] p-8 max-w-sm w-full text-center overflow-hidden"
        >
          {/* Conic gold halo */}
          <motion.div
            className="absolute inset-0 pointer-events-none opacity-15"
            style={{ background: `conic-gradient(from 0deg, transparent, ${meta.color}, transparent)` }}
            animate={{ rotate: 360 }}
            transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
          />

          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 w-8 h-8 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors"
          >
            <X size={14} className="text-white/70" />
          </button>

          <div className="relative z-10">
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-white/40 text-[10px] font-bold tracking-[0.3em] uppercase"
            >
              Поздравляем!
            </motion.p>

            <motion.h2
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="display text-white text-2xl mt-1"
            >
              Новый уровень
            </motion.h2>

            {/* Crown medallion */}
            <motion.div
              initial={{ scale: 0, rotateY: -180 }}
              animate={{ scale: 1, rotateY: 0 }}
              transition={{ delay: 0.45, type: 'spring', damping: 10 }}
              className="my-6 flex justify-center"
              style={{ perspective: 800 }}
            >
              <motion.div
                animate={{ rotateY: [0, 360] }}
                transition={{ duration: 8, repeat: Infinity, ease: 'linear', delay: 1.5 }}
                style={{ transformStyle: 'preserve-3d' }}
                className="w-32 h-32 rounded-full flex items-center justify-center"
              >
                <div
                  className="w-32 h-32 rounded-full flex items-center justify-center"
                  style={{ background: meta.bg, boxShadow: `0 12px 60px ${meta.color}99, inset 0 2px 12px rgba(255,255,255,0.4)` }}
                >
                  <Crown size={56} className="text-white" strokeWidth={1.5} fill="white" fillOpacity={0.2} />
                </div>
              </motion.div>
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="display text-5xl"
              style={{ background: meta.bg, WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
            >
              {tier}
            </motion.p>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.75 }}
              className="text-white/60 text-sm mt-2 mb-6"
            >
              {meta.tagline}
            </motion.p>

            <motion.button
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              whileTap={{ scale: 0.96 }}
              whileHover={{ scale: 1.02 }}
              onClick={onClose}
              className="w-full text-brand-dark font-black py-4 rounded-2xl"
              style={{ background: meta.bg, boxShadow: `0 8px 24px ${meta.color}66` }}
            >
              Продолжить
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
