import { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion'
import confetti from 'canvas-confetti'
import { X, Zap, Lock, RotateCcw, CheckCircle2, Star } from 'lucide-react'
import { FlipCard3D } from '@/components/FlipCard3D'
import { usePrizes, useRedeem } from '@/api/rewards'
import { useAuthStore } from '@/store/authStore'
import { useMe } from '@/api/auth'
import { useTranslation as useT } from 'react-i18next'

/* ─── prize meta ─── */
const prizeEmoji = ['💳', '💰', '💎', '🍶', '👜', '👕', '🧲', '🍵']
const prizeGrad  = [
  ['#F40009','#c2000b'],
  ['#FF6B35','#e55a26'],
  ['#6C63FF','#4b44e0'],
  ['#00b4d8','#0096c7'],
  ['#7b2d8b','#5c1d6b'],
  ['#D90429','#b3001b'],
  ['#00A651','#007a3c'],
  ['#FFB800','#e0a000'],
]

/* ─── shimmer overlay (travels across on hover) ─── */
function Shimmer() {
  return (
    <motion.div
      className="absolute inset-0 pointer-events-none rounded-3xl overflow-hidden"
      style={{ zIndex: 10 }}
    >
      <motion.div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.22) 50%, transparent 60%)',
          backgroundSize: '200% 100%',
        }}
        animate={{ backgroundPosition: ['-100% 0', '200% 0'] }}
        transition={{ duration: 1.6, repeat: Infinity, repeatDelay: 2 }}
      />
    </motion.div>
  )
}

/* ─── 3D rotating trophy ─── */
function Trophy3D({ name }: { name: string }) {
  const y = useMotionValue(0)
  const ySpring = useSpring(y, { stiffness: 60, damping: 10 })
  const rotY = useTransform(ySpring, [0, 1], [0, 360])

  useEffect(() => {
    y.set(1)
    const timer = setTimeout(() => y.set(0), 1200)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="flex flex-col items-center py-6" style={{ perspective: 600 }}>
      <motion.div
        style={{ rotateY: rotY, transformStyle: 'preserve-3d' }}
        className="text-7xl mb-4 select-none"
      >
        🏆
      </motion.div>

      {/* Orbiting stars */}
      {[0, 72, 144, 216, 288].map((deg, i) => (
        <motion.div
          key={i}
          className="absolute text-brand-gold"
          style={{ fontSize: 14 }}
          animate={{
            rotate: [deg, deg + 360],
            x: [Math.cos((deg * Math.PI) / 180) * 46, Math.cos(((deg + 360) * Math.PI) / 180) * 46],
            y: [Math.sin((deg * Math.PI) / 180) * 46, Math.sin(((deg + 360) * Math.PI) / 180) * 46],
            opacity: [0.6, 1, 0.6],
          }}
          transition={{ duration: 2.4, repeat: Infinity, ease: 'linear', delay: i * 0.1 }}
        >
          ★
        </motion.div>
      ))}

      <motion.h3
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="text-xl font-black text-brand-charcoal text-center px-4 leading-snug"
      >
        Получено!
      </motion.h3>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="text-gray-500 text-sm mt-1 text-center"
      >
        {name}
      </motion.p>
    </div>
  )
}

/* ─── floating points counter ─── */
function FloatingPoints({ value, onDone }: { value: number; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 1100)
    return () => clearTimeout(t)
  }, [])
  return (
    <AnimatePresence>
      <motion.div
        className="fixed top-1/3 left-1/2 z-[200] pointer-events-none"
        style={{ x: '-50%', y: '-50%' }}
        initial={{ opacity: 1, y: 0, scale: 0.8 }}
        animate={{ opacity: 0, y: -70, scale: 1.4 }}
        transition={{ duration: 1.0, ease: 'easeOut' }}
      >
        <span className="text-5xl font-black text-brand-gold drop-shadow-lg">−{value}</span>
      </motion.div>
    </AnimatePresence>
  )
}

/* ─── main page ─── */
type Prize = { id: number; name: string; points_cost: number; stock_quantity: number }

export default function RewardsPage() {
  const { t } = useTranslation()
  const { user } = useAuthStore()
  const { data: me } = useMe()
  const { data: prizes, isLoading } = usePrizes()
  const redeem = useRedeem()

  const [flipped, setFlipped]   = useState<number | null>(null)
  const [redeeming, setRedeeming] = useState<number | null>(null)
  const [succeeded, setSucceeded] = useState<number | null>(null)
  const [showFloat, setShowFloat] = useState<number | null>(null)

  const meData = me as { total_points?: number } | undefined
  const points = meData?.total_points ?? user?.total_points ?? 0

  const fireConfetti = () => {
    const burst = (x: number, angle: number) =>
      confetti({ particleCount: 70, spread: 55, angle, origin: { x, y: 0.55 },
        colors: ['#F40009','#FFB800','#ffffff','#00A651'], scalar: 1.2 })
    burst(0.25, 55); burst(0.75, 125)
    setTimeout(() => { burst(0.4, 70); burst(0.6, 110) }, 200)
  }

  const handleRedeem = async (prize: Prize) => {
    if (redeeming !== null) return
    setRedeeming(prize.id)
    try {
      await redeem.mutateAsync(prize.id)
      setShowFloat(prize.points_cost)
      fireConfetti()
      setTimeout(() => {
        setSucceeded(prize.id)
        setFlipped(null)
        setRedeeming(null)
      }, 600)
      setTimeout(() => setSucceeded(null), 3200)
    } catch {
      setRedeeming(null)
    }
  }

  const toggleFlip = (id: number, canAfford: boolean, inStock: boolean) => {
    if (!canAfford || !inStock) return
    setFlipped(flipped === id ? null : id)
  }

  return (
    <div className="min-h-screen bg-[#F8F8F8] pb-28 lg:pb-8 relative overflow-hidden">

      {/* floating -pts label */}
      <AnimatePresence>
        {showFloat !== null && (
          <FloatingPoints value={showFloat} onDone={() => setShowFloat(null)} />
        )}
      </AnimatePresence>

      {/* ── Header ── */}
      <div className="relative mesh-hero noise overflow-hidden px-6 pt-12 pb-10">
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-white/40 text-[10px] font-semibold tracking-widest uppercase mb-1">Магазин призов</p>
          <h1 className="display text-white text-4xl mb-1">{t('rewards.title')}</h1>
          <motion.div
            className="inline-flex items-center gap-2 glass rounded-full px-4 py-1.5 mt-2"
            animate={{ scale: [1, 1.04, 1] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
          >
            <Zap size={13} className="text-brand-gold" />
            <span className="text-white/80 text-sm font-bold">{points} pts</span>
            <span className="text-white/30 text-xs">доступно</span>
          </motion.div>
        </motion.div>
      </div>

      {/* ── Prize grid ── */}
      <div className="px-4 lg:px-8 py-6 lg:max-w-6xl lg:mx-auto">
        {isLoading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-52 bg-gray-200 rounded-3xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {prizes?.map((prize: Prize, i: number) => {
              const canAfford = points >= prize.points_cost
              const inStock   = prize.stock_quantity !== 0
              const locked    = !canAfford || !inStock
              const isFlipped = flipped === prize.id
              const didSucceed = succeeded === prize.id
              const [g1, g2] = prizeGrad[i % prizeGrad.length]

              /* ── card front ── */
              const front = (
                <div className="relative w-full h-full select-none">
                  {/* gradient bg */}
                  <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${g1}, ${g2})` }} />

                  {/* shimmer */}
                  {!locked && <Shimmer />}

                  {/* lock */}
                  {locked && (
                    <div className="absolute top-3 right-3 z-20 w-6 h-6 bg-black/30 rounded-full flex items-center justify-center">
                      <Lock size={11} className="text-white/70" />
                    </div>
                  )}

                  {/* flip hint */}
                  {!locked && (
                    <div className="absolute top-3 right-3 z-20 w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                      <RotateCcw size={10} className="text-white/80" />
                    </div>
                  )}

                  <div className="relative z-10 p-5 pb-4 flex flex-col h-full">
                    {/* 3-D elevated emoji */}
                    <motion.div
                      className="text-4xl mb-3"
                      style={{ filter: 'drop-shadow(0 6px 12px rgba(0,0,0,0.35))' }}
                      animate={!locked ? { y: [0, -4, 0] } : {}}
                      transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut', delay: i * 0.2 }}
                    >
                      {prizeEmoji[i % prizeEmoji.length]}
                    </motion.div>

                    <p className="text-white font-black text-sm leading-tight mb-auto">{prize.name}</p>

                    <div className={`mt-3 inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black
                      ${canAfford ? 'bg-white/25 text-white' : 'bg-black/25 text-white/55'}`}>
                      <Zap size={10} />
                      {prize.points_cost} pts
                    </div>
                  </div>
                </div>
              )

              /* ── card back ── */
              const back = (
                <div className="absolute inset-0 flex flex-col"
                  style={{ background: `linear-gradient(135deg, ${g2}, ${g1})` }}>

                  {/* close flip */}
                  <button
                    className="absolute top-3 right-3 z-20 w-6 h-6 bg-black/25 rounded-full flex items-center justify-center"
                    onClick={(e) => { e.stopPropagation(); setFlipped(null) }}
                  >
                    <X size={11} className="text-white/80" />
                  </button>

                  <div className="flex-1 flex flex-col items-center justify-center p-4 text-center">
                    <motion.div
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={isFlipped ? { scale: 1, opacity: 1 } : {}}
                      transition={{ delay: 0.25, type: 'spring', damping: 14 }}
                      className="text-3xl mb-2"
                    >
                      {prizeEmoji[i % prizeEmoji.length]}
                    </motion.div>
                    <p className="text-white/70 text-xs font-semibold mb-1">{prize.name}</p>
                    <div className="flex items-center gap-1 mb-4">
                      <Zap size={11} className="text-brand-gold" />
                      <span className="text-white font-black text-sm">{prize.points_cost} pts</span>
                    </div>
                  </div>

                  {/* redeem button */}
                  <motion.button
                    initial={{ y: 20, opacity: 0 }}
                    animate={isFlipped ? { y: 0, opacity: 1 } : {}}
                    transition={{ delay: 0.35 }}
                    whileTap={{ scale: 0.94 }}
                    disabled={redeeming !== null}
                    onClick={(e) => { e.stopPropagation(); handleRedeem(prize) }}
                    className="m-3 mt-0 py-3 rounded-2xl font-black text-sm flex items-center justify-center gap-2
                      bg-white text-brand-red disabled:opacity-60 transition-opacity"
                  >
                    {redeeming === prize.id
                      ? <div className="w-4 h-4 border-2 border-brand-red border-t-transparent rounded-full animate-spin" />
                      : <><Zap size={14} /> Обменять</>}
                  </motion.button>
                </div>
              )

              return (
                <motion.div
                  key={prize.id}
                  initial={{ opacity: 0, y: 28, rotateX: -15 }}
                  animate={{ opacity: 1, y: 0, rotateX: 0 }}
                  transition={{ delay: i * 0.07, type: 'spring', damping: 16 }}
                  className="relative"
                  style={{ height: 200 }}
                >
                  {/* success overlay */}
                  <AnimatePresence>
                    {didSucceed && (
                      <motion.div
                        initial={{ scale: 0.7, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 1.1, opacity: 0 }}
                        transition={{ type: 'spring', damping: 12 }}
                        className="absolute inset-0 z-30 rounded-3xl flex flex-col items-center justify-center"
                        style={{ background: 'linear-gradient(135deg,#00A651,#007a3c)' }}
                      >
                        <motion.div
                          animate={{ rotateY: [0, 360] }}
                          transition={{ duration: 1, ease: 'easeInOut' }}
                          style={{ transformStyle: 'preserve-3d' }}
                          className="text-5xl mb-2"
                        >
                          🏆
                        </motion.div>
                        <CheckCircle2 size={20} className="text-white mb-1" />
                        <p className="text-white font-black text-xs">Получено!</p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <FlipCard3D
                    front={front}
                    back={back}
                    flipped={isFlipped}
                    float={!locked && !isFlipped}
                    onFlip={() => toggleFlip(prize.id, canAfford, inStock)}
                    className={`w-full h-full ${locked ? 'opacity-65' : ''}`}
                  />
                </motion.div>
              )
            })}
          </div>
        )}
      </div>

      {/* ── global success modal (shows after all cards reset) ── */}
      <AnimatePresence>
        {succeeded !== null && !prizes?.find((p: Prize) => p.id === succeeded) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end"
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 26 }}
              className="bg-white w-full rounded-t-3xl p-6 max-w-lg mx-auto"
            >
              <Trophy3D name="Поздравляем!" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
