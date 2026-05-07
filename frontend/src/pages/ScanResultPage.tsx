import { useEffect, useState } from 'react'
import { useLocation, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import confetti from 'canvas-confetti'
import { Button } from '@/components/ui/button'
import { CheckCircle2, AlertCircle, QrCode, Wallet, Leaf, Sparkles, Flame } from 'lucide-react'
import { NumberRoll } from '@/components/NumberRoll'
import { AchievementUnlockModal, UnlockedAchievement } from '@/components/AchievementUnlockModal'

export default function ScanResultPage() {
  const { t } = useTranslation()
  const { state } = useLocation()
  const result = state as {
    points?: number; total?: number; sku?: string; type?: string; error?: string
    streak_days?: number; unlocked_achievements?: UnlockedAchievement[]
  } | null

  const [unlockQueue, setUnlockQueue] = useState<UnlockedAchievement[]>(result?.unlocked_achievements ?? [])

  useEffect(() => {
    if (!result?.error) {
      const fire = (angle: number, origin: number, particles = 80) =>
        confetti({
          particleCount: particles,
          spread: 70,
          angle,
          origin: { x: origin, y: 0.6 },
          colors: ['#F40009', '#ffffff', '#FFB800', '#00A651', '#FF6B35'],
          scalar: 1.2,
          ticks: 200,
        })
      // Wave 1: dual side bursts
      setTimeout(() => { fire(60, 0.15, 100); fire(120, 0.85, 100) }, 100)
      // Wave 2: inward
      setTimeout(() => { fire(75, 0.3, 60); fire(105, 0.7, 60) }, 400)
      // Wave 3: top shower
      setTimeout(() => {
        confetti({
          particleCount: 80, spread: 180, startVelocity: 25, origin: { x: 0.5, y: 0.2 },
          colors: ['#F40009', '#FFB800', '#ffffff', '#00A651'], scalar: 0.9, gravity: 0.8,
        })
      }, 700)
    }
  }, [])

  if (result?.error) {
    return (
      <div className="min-h-screen bg-[#F8F8F8] flex flex-col items-center justify-center p-8 text-center">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', damping: 14 }}>
          <div className="w-24 h-24 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle size={48} className="text-orange-400" />
          </div>
          <h2 className="text-2xl font-black text-brand-charcoal mb-2">{result.error}</h2>
          <p className="text-gray-400 text-sm mb-10">Эта бутылка уже была зарегистрирована ранее</p>
          <div className="flex gap-3 justify-center">
            <Link to="/scan">
              <Button className="bg-brand-red hover:bg-red-600 text-white font-black rounded-2xl px-6">
                <QrCode size={17} className="mr-2" />
                {t('scan.scan_another')}
              </Button>
            </Link>
            <Link to="/wallet">
              <Button variant="outline" className="rounded-2xl px-6 border-2 font-bold">
                {t('nav.wallet')}
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    )
  }

  const isRecycle = result?.type === 'recycle'

  return (
    <div className="min-h-screen aurora relative flex flex-col items-center justify-center p-6 lg:p-12 text-center overflow-hidden">
      {/* expanding ring pulses behind check */}
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="absolute rounded-full pointer-events-none"
          initial={{ width: 100, height: 100, opacity: 0 }}
          animate={{ width: 500, height: 500, opacity: [0, 0.4, 0] }}
          transition={{ duration: 2.4, delay: i * 0.4, repeat: Infinity, ease: 'easeOut' }}
          style={{ border: '2px solid rgba(244,0,9,0.5)', filter: 'blur(1px)' }}
        />
      ))}

      <motion.div
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', damping: 14, stiffness: 200 }}
        className="relative z-10 w-full max-w-sm"
      >
        {/* 3D rotating check icon */}
        <motion.div
          initial={{ scale: 0, rotateY: -180 }}
          animate={{ scale: 1, rotateY: 0 }}
          transition={{ delay: 0.15, type: 'spring', damping: 12 }}
          style={{ transformStyle: 'preserve-3d', perspective: 800 }}
          className="w-28 h-28 mx-auto mb-8"
        >
          <motion.div
            className="w-full h-full bg-white rounded-full flex items-center justify-center shadow-[0_0_60px_rgba(255,255,255,0.4)]"
            animate={{ rotateY: [0, 8, 0, -8, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          >
            <CheckCircle2 size={60} className={isRecycle ? 'text-brand-eco' : 'text-brand-red'} strokeWidth={1.5} />
          </motion.div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <div className="inline-flex items-center gap-1.5 glass px-3 py-1 rounded-full mb-3">
            <Sparkles size={11} className="text-brand-gold" />
            <p className="text-white/85 text-[10px] font-bold tracking-[0.2em] uppercase">
              {isRecycle ? 'Переработано' : 'Куплено'}
            </p>
          </div>
          <h2 className="display text-white text-5xl mb-1">Отлично!</h2>
          {result?.sku && <p className="text-white/45 text-sm mt-3 mb-8 font-medium">{result.sku}</p>}
        </motion.div>

        {/* Massive rolling counter */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.4, type: 'spring', damping: 10 }}
          className="glass rounded-[2rem] p-8 mb-6 relative overflow-hidden"
        >
          {/* shimmer */}
          <motion.div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.1) 50%, transparent 60%)',
              backgroundSize: '200% 100%',
            }}
            animate={{ backgroundPosition: ['-100% 0', '200% 0'] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
          />

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55 }}
            className="relative"
          >
            <div className="flex items-baseline justify-center gap-1">
              <span className="text-white/80 text-5xl font-black">+</span>
              <NumberRoll
                value={result?.points ?? 0}
                duration={1.4}
                className="text-[112px] font-black text-white tracking-tighter leading-[0.85]"
              />
            </div>
            <p className="text-white/60 text-base font-bold mt-2 tracking-wide">
              {isRecycle ? t('scan.recycle_bonus') : t('scan.purchase_bonus')}
            </p>

            {result?.total !== undefined && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5 }}
                className="mt-5 pt-5 border-t border-white/15"
              >
                <p className="text-white/45 text-xs font-semibold tracking-widest uppercase mb-1">Итого</p>
                <p className="text-white font-black text-3xl tracking-tight flex items-baseline justify-center">
                  <NumberRoll value={result.total} duration={1.6} />
                  <span className="text-white/60 text-base ml-2 font-medium">pts</span>
                </p>
              </motion.div>
            )}
          </motion.div>
        </motion.div>

        {isRecycle && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.9, type: 'spring', damping: 14 }}
            className="flex items-center justify-center gap-2 rounded-2xl py-3 px-5 mb-3 text-white text-sm font-semibold"
            style={{ background: 'linear-gradient(135deg, rgba(0,166,81,0.4), rgba(0,122,60,0.5))', backdropFilter: 'blur(20px)', border: '1px solid rgba(0,166,81,0.4)' }}
          >
            <Leaf size={16} className="text-brand-eco" />
            <span>{t('scan.co2_saved')} — <strong>0.082 кг CO₂</strong></span>
          </motion.div>
        )}

        {result?.streak_days && result.streak_days > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.0, type: 'spring', damping: 14 }}
            className="flex items-center justify-center gap-2 rounded-2xl py-3 px-5 mb-6 text-white text-sm font-bold"
            style={{ background: 'linear-gradient(135deg, rgba(255,107,53,0.5), rgba(244,0,9,0.5))', backdropFilter: 'blur(20px)', border: '1px solid rgba(244,0,9,0.4)' }}
          >
            <motion.span
              animate={{ y: [0, -2, 0], rotate: [-5, 5, -5] }}
              transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
            >
              <Flame size={16} fill="#FFB800" strokeWidth={1} />
            </motion.span>
            <span>Серия: <strong className="text-brand-gold">{result.streak_days} {result.streak_days === 1 ? 'день' : result.streak_days < 5 ? 'дня' : 'дней'}</strong> подряд!</span>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
          className="flex gap-3"
        >
          <Link to="/scan" className="flex-1">
            <motion.div whileTap={{ scale: 0.96 }} whileHover={{ scale: 1.02 }}>
              <Button className="w-full bg-white text-brand-red hover:bg-white/90 font-black rounded-2xl py-5 shadow-[0_8px_30px_rgba(255,255,255,0.2)]">
                <QrCode size={17} className="mr-2" />
                {t('scan.scan_another')}
              </Button>
            </motion.div>
          </Link>
          <Link to="/wallet" className="flex-1">
            <motion.div whileTap={{ scale: 0.96 }} whileHover={{ scale: 1.02 }}>
              <Button className="w-full glass hover:bg-white/20 text-white border border-white/20 font-bold rounded-2xl py-5">
                <Wallet size={17} className="mr-2" />
                {t('nav.wallet')}
              </Button>
            </motion.div>
          </Link>
        </motion.div>
      </motion.div>

      {/* Achievement queue — show one at a time, dismiss to advance */}
      <AchievementUnlockModal
        achievement={unlockQueue[0] ?? null}
        onClose={() => setUnlockQueue((q) => q.slice(1))}
      />
    </div>
  )
}
