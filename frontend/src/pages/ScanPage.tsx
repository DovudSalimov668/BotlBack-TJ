import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { Html5QrcodeScanner } from 'html5-qrcode'
import { useScanBottle } from '@/api/bottles'
import { ArrowLeft, Zap } from 'lucide-react'

export default function ScanPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const scannerRef = useRef<Html5QrcodeScanner | null>(null)
  const hasScannedRef = useRef(false)
  const mutation = useScanBottle()

  useEffect(() => {
    scannerRef.current = new Html5QrcodeScanner(
      'qr-reader',
      { fps: 10, qrbox: { width: 240, height: 240 }, aspectRatio: 1.0 },
      false,
    )
    scannerRef.current.render(
      async (decodedText) => {
        if (!hasScannedRef.current) {
          hasScannedRef.current = true
          try {
            const data = await mutation.mutateAsync({ qr_code: decodedText.trim() })
            navigate(`/scan/result/${data.scan_id}`, {
              state: {
                points: data.points_awarded,
                total: data.total_points,
                sku: data.sku,
                type: 'purchase',
                streak_days: data.streak_days,
                unlocked_achievements: data.unlocked_achievements ?? [],
              },
            })
          } catch (err: unknown) {
            const error = err as { response?: { data?: { code?: string } } }
            if (error?.response?.data?.code === 'already_scanned') {
              navigate('/scan/result/error', { state: { error: t('scan.already_scanned') } })
            } else {
              hasScannedRef.current = false
            }
          }
        }
      },
      () => {},
    )
    return () => { scannerRef.current?.clear().catch(() => {}) }
  }, [])

  const Corner = ({ pos }: { pos: 'tl' | 'tr' | 'bl' | 'br' }) => {
    const top  = pos.startsWith('t')
    const left = pos.endsWith('l')
    return (
      <div
        className="absolute w-8 h-8"
        style={{
          top:    top  ? -2 : undefined,
          bottom: !top ? -2 : undefined,
          left:   left ? -2 : undefined,
          right:  !left ? -2 : undefined,
          borderTop:    top  ? '3px solid #F40009' : undefined,
          borderBottom: !top ? '3px solid #F40009' : undefined,
          borderLeft:   left ? '3px solid #F40009' : undefined,
          borderRight:  !left ? '3px solid #F40009' : undefined,
          borderRadius: top && left ? '6px 0 0 0' : top && !left ? '0 6px 0 0' : !top && left ? '0 0 0 6px' : '0 0 6px 0',
        }}
      />
    )
  }

  return (
    <div
      className="min-h-screen flex flex-col relative overflow-hidden"
      style={{ background: '#080808' }}
    >
      {/* Back */}
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex items-center gap-3 px-5 pt-12 pb-4 relative z-20"
      >
        <button
          onClick={() => navigate(-1)}
          className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center"
        >
          <ArrowLeft size={18} className="text-white" />
        </button>
        <h1 className="text-white font-black text-lg">{t('scan.title')}</h1>
      </motion.div>

      {/* Camera area */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 relative z-10">
        <motion.p
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-white/50 text-sm mb-8 text-center"
        >
          {t('scan.subtitle')}
        </motion.p>

        {/* Scanner wrapper with corner brackets */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, type: 'spring', damping: 18 }}
          className="relative"
        >
          {/* Scan line animation */}
          <motion.div
            className="absolute left-2 right-2 h-0.5 z-20 rounded-full"
            style={{ background: 'linear-gradient(90deg, transparent, #F40009, transparent)' }}
            animate={{ top: ['8%', '88%', '8%'] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
          />

          {/* Corner brackets */}
          <div className="absolute inset-0 z-20 pointer-events-none">
            <Corner pos="tl" />
            <Corner pos="tr" />
            <Corner pos="bl" />
            <Corner pos="br" />
          </div>

          {/* Pulsing glow ring */}
          <motion.div
            className="absolute -inset-4 rounded-3xl pointer-events-none z-10"
            animate={{ opacity: [0.15, 0.35, 0.15] }}
            transition={{ duration: 2, repeat: Infinity }}
            style={{ background: 'radial-gradient(circle, rgba(244,0,9,0.3) 0%, transparent 70%)' }}
          />

          <div
            id="qr-reader"
            className="rounded-3xl overflow-hidden"
            style={{ width: 280, height: 280 }}
          />
        </motion.div>

        {/* Status */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8 text-center"
        >
          {mutation.isPending ? (
            <div className="flex items-center gap-3 glass px-6 py-3 rounded-2xl">
              <div className="w-5 h-5 border-2 border-brand-red border-t-transparent rounded-full animate-spin" />
              <span className="text-white/80 text-sm font-medium">{t('common.loading')}</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-white/30 text-sm">
              <motion.div
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="w-2 h-2 bg-brand-red rounded-full"
              />
              Наведите камеру на QR-код
            </div>
          )}
        </motion.div>
      </div>

      {/* Tip */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="px-6 pb-10 text-center"
      >
        <div className="inline-flex items-center gap-2 bg-white/5 rounded-2xl px-5 py-3">
          <Zap size={14} className="text-brand-gold" />
          <p className="text-white/40 text-xs">{t('scan.tip')}</p>
        </div>
      </motion.div>

      {/* Dark vignette edges */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: 'radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.7) 100%)',
      }} />
    </div>
  )
}
