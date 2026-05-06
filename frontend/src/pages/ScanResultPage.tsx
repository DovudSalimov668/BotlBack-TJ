import { useEffect } from 'react'
import { useLocation, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import confetti from 'canvas-confetti'
import { Button } from '@/components/ui/button'
import { CheckCircle2, AlertCircle, QrCode, Wallet, Leaf } from 'lucide-react'

export default function ScanResultPage() {
  const { t } = useTranslation()
  const { state } = useLocation()
  const result = state as { points?: number; total?: number; sku?: string; type?: string; error?: string } | null

  useEffect(() => {
    if (!result?.error) {
      const fire = (angle: number, origin: number) =>
        confetti({
          particleCount: 80,
          spread: 60,
          angle,
          origin: { x: origin, y: 0.65 },
          colors: ['#F40009', '#ffffff', '#FFB800', '#00A651'],
          scalar: 1.1,
        })
      setTimeout(() => { fire(60, 0.2); fire(120, 0.8) }, 100)
      setTimeout(() => { fire(75, 0.35); fire(105, 0.65) }, 350)
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
    <div className="min-h-screen mesh-hero noise relative flex flex-col items-center justify-center p-6 text-center overflow-hidden">
      {/* Glow ring behind check */}
      <div
        className="absolute w-72 h-72 rounded-full opacity-30 pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(244,0,9,0.6) 0%, transparent 70%)' }}
      />

      <motion.div
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', damping: 14, stiffness: 200 }}
        className="relative z-10 w-full max-w-sm"
      >
        {/* Check icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.15, type: 'spring', damping: 12 }}
          className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_50px_rgba(255,255,255,0.25)]"
        >
          <CheckCircle2 size={52} className="text-brand-red" strokeWidth={1.5} />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <p className="text-white/50 text-xs font-semibold tracking-widest uppercase mb-2">
            {isRecycle ? 'Переработано' : 'Куплено'}
          </p>
          <h2 className="display text-white text-4xl mb-1">Отлично!</h2>
          {result?.sku && <p className="text-white/50 text-sm mt-2 mb-8">{result.sku}</p>}
        </motion.div>

        {/* Points bubble */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.4, type: 'spring', damping: 10 }}
          className="glass rounded-3xl p-8 mb-6"
        >
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55 }}
          >
            <span className="text-8xl font-black text-white tracking-tight leading-none">
              +{result?.points}
            </span>
            <p className="text-white/60 text-base font-semibold mt-2">
              {isRecycle ? t('scan.recycle_bonus') : t('scan.purchase_bonus')}
            </p>
            {result?.total !== undefined && (
              <div className="mt-4 pt-4 border-t border-white/15">
                <p className="text-white/40 text-sm">
                  Итого: <strong className="text-white font-black text-lg">{result.total}</strong> pts
                </p>
              </div>
            )}
          </motion.div>
        </motion.div>

        {isRecycle && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="flex items-center justify-center gap-2 glass rounded-2xl py-3 px-5 mb-6 text-white/80 text-sm"
          >
            <Leaf size={16} className="text-brand-eco" />
            <span>{t('scan.co2_saved')} — <strong>0.082 кг CO₂</strong></span>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="flex gap-3"
        >
          <Link to="/scan" className="flex-1">
            <Button className="w-full bg-white text-brand-red hover:bg-white/90 font-black rounded-2xl py-5">
              <QrCode size={17} className="mr-2" />
              {t('scan.scan_another')}
            </Button>
          </Link>
          <Link to="/wallet" className="flex-1">
            <Button className="w-full glass hover:bg-white/20 text-white border border-white/20 font-bold rounded-2xl py-5">
              <Wallet size={17} className="mr-2" />
              {t('nav.wallet')}
            </Button>
          </Link>
        </motion.div>
      </motion.div>
    </div>
  )
}
