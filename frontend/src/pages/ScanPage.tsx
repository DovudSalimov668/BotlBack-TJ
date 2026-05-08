import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import { Html5QrcodeScanner } from 'html5-qrcode'
import { useScanBottle } from '@/api/bottles'
import { ArrowLeft, Zap, QrCode, Keyboard, ChevronRight } from 'lucide-react'

const DEMO_CODES = [
  { code: 'BTL-DEMO-0001', label: 'Coca-Cola 0.5L', type: 'bottle' },
  { code: 'BTL-DEMO-0002', label: 'Fanta 0.5L',     type: 'bottle' },
  { code: 'BTL-DEMO-0003', label: 'Sprite 1L',       type: 'bottle' },
  { code: 'BTL-DEMO-0004', label: 'Bonaqua 0.5L',    type: 'bottle' },
  { code: 'BTL-DEMO-0005', label: 'Fuse Tea 0.5L',   type: 'bottle' },
  { code: 'RP-DEMO-001',   label: 'Базар Мехргон',   type: 'recycle' },
  { code: 'RP-DS-002',     label: 'Душанбе Сити',    type: 'recycle' },
]

export default function ScanPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const scannerRef = useRef<Html5QrcodeScanner | null>(null)
  const hasScannedRef = useRef(false)
  const mutation = useScanBottle()
  const [scanState, setScanState] = useState<'idle' | 'detected' | 'processing'>('idle')
  const [manualMode, setManualMode] = useState(false)
  const [manualCode, setManualCode] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const [scanSize, setScanSize] = useState(256)

  useEffect(() => {
    setScanSize(Math.min(256, window.innerWidth - 80))
  }, [])

  const submitCode = async (code: string) => {
    const trimmed = code.trim().toUpperCase()
    if (!trimmed || hasScannedRef.current) return
    hasScannedRef.current = true
    setScanState('detected')
    setTimeout(() => setScanState('processing'), 300)
    try {
      const data = await mutation.mutateAsync({ qr_code: trimmed })
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
        setScanState('idle')
      }
    }
  }

  useEffect(() => {
    if (manualMode) return
    const box = Math.max(180, scanSize - 32)
    scannerRef.current = new Html5QrcodeScanner(
      'qr-reader',
      { fps: 10, qrbox: { width: box, height: box }, aspectRatio: 1.0 },
      false,
    )
    scannerRef.current.render(
      (decodedText) => submitCode(decodedText),
      () => {},
    )
    return () => { scannerRef.current?.clear().catch(() => {}) }
  }, [manualMode, scanSize])

  /* Corner bracket */
  const Corner = ({ pos }: { pos: 'tl' | 'tr' | 'bl' | 'br' }) => {
    const top  = pos.startsWith('t')
    const left = pos.endsWith('l')
    return (
      <motion.div
        className="absolute w-10 h-10"
        animate={{ opacity: scanState === 'detected' ? [1, 0.4, 1] : 1 }}
        transition={{ duration: 0.3, repeat: scanState === 'detected' ? 3 : 0 }}
        style={{
          top:    top  ? -2 : undefined,
          bottom: !top ? -2 : undefined,
          left:   left ? -2 : undefined,
          right:  !left ? -2 : undefined,
          borderTop:    top  ? '3px solid #F40009' : undefined,
          borderBottom: !top ? '3px solid #F40009' : undefined,
          borderLeft:   left ? '3px solid #F40009' : undefined,
          borderRight:  !left ? '3px solid #F40009' : undefined,
          borderRadius: top && left ? '8px 0 0 0' : top && !left ? '0 8px 0 0' : !top && left ? '0 0 0 8px' : '0 0 8px 0',
          filter: 'drop-shadow(0 0 4px rgba(244,0,9,0.8))',
        }}
      />
    )
  }

  return (
    <div
      className="min-h-screen flex flex-col relative overflow-hidden"
      style={{ background: '#050505' }}
    >
      {/* Animated bg radials */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute rounded-full"
          style={{
            width: 600, height: 600,
            left: '50%', top: '50%',
            x: '-50%', y: '-50%',
            background: 'radial-gradient(circle, rgba(244,0,9,0.12) 0%, transparent 70%)',
          }}
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute rounded-full"
          style={{
            width: 300, height: 300,
            left: '50%', top: '50%',
            x: '-50%', y: '-50%',
            background: 'radial-gradient(circle, rgba(244,0,9,0.06) 0%, transparent 70%)',
          }}
          animate={{ scale: [1.1, 0.9, 1.1] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      {/* Back */}
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex items-center gap-3 px-5 pt-12 pb-4 relative z-20"
      >
        <button
          onClick={() => navigate(-1)}
          className="w-9 h-9 rounded-full bg-white/8 border border-white/10 flex items-center justify-center"
        >
          <ArrowLeft size={18} className="text-white" />
        </button>
        <h1 className="text-white font-black text-lg">{t('scan.title')}</h1>

        {/* QR icon badge */}
        <motion.div
          animate={{ rotate: [0, 5, -5, 0] }}
          transition={{ duration: 4, repeat: Infinity }}
          className="ml-auto w-8 h-8 rounded-xl bg-brand-red/20 flex items-center justify-center"
        >
          <QrCode size={15} className="text-brand-red" />
        </motion.div>
      </motion.div>

      {/* Camera area */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 relative z-10">
        <motion.p
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-white/45 text-sm mb-8 text-center font-medium"
        >
          {t('scan.subtitle')}
        </motion.p>

        {/* Scanner wrapper */}
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, type: 'spring', damping: 16 }}
          className="relative"
        >
          {/* Outer glow ring — pulsing */}
          <motion.div
            className="absolute pointer-events-none"
            style={{
              inset: -20,
              borderRadius: 40,
              background: 'radial-gradient(circle, rgba(244,0,9,0.22) 0%, transparent 70%)',
            }}
            animate={{ opacity: [0.6, 1, 0.6], scale: [0.97, 1.03, 0.97] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
          />

          {/* Second larger ring */}
          <motion.div
            className="absolute pointer-events-none rounded-[48px]"
            style={{ inset: -40, border: '1px solid rgba(244,0,9,0.15)' }}
            animate={{ opacity: [0.3, 0.7, 0.3], scale: [1, 1.04, 1] }}
            transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
          />

          {/* Scanning line — neon sweep */}
          <motion.div
            className="absolute left-3 right-3 z-20 rounded-full"
            style={{
              height: 2,
              background: 'linear-gradient(90deg, transparent 0%, rgba(244,0,9,0.3) 15%, #F40009 50%, rgba(244,0,9,0.3) 85%, transparent 100%)',
              boxShadow: '0 0 12px rgba(244,0,9,0.8), 0 0 24px rgba(244,0,9,0.4)',
            }}
            animate={{ top: ['8%', '88%', '8%'] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
          />

          {/* Corner brackets */}
          <div className="absolute inset-0 z-20 pointer-events-none">
            <Corner pos="tl" />
            <Corner pos="tr" />
            <Corner pos="bl" />
            <Corner pos="br" />
          </div>

          <div
            id="qr-reader"
            className="rounded-3xl overflow-hidden"
            style={{ width: scanSize, height: scanSize }}
          />

          {/* Detected flash overlay */}
          <AnimatePresence>
            {scanState === 'detected' && (
              <motion.div
                className="absolute inset-0 rounded-3xl z-30 flex items-center justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 0.7, 0] }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                style={{ background: 'rgba(244,0,9,0.3)' }}
              />
            )}
          </AnimatePresence>
        </motion.div>

        {/* Status area */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-10 text-center"
        >
          <AnimatePresence mode="wait">
            {mutation.isPending ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex items-center gap-3 glass px-6 py-3 rounded-2xl"
              >
                <div className="w-5 h-5 border-2 border-brand-red border-t-transparent rounded-full animate-spin" />
                <span className="text-white/80 text-sm font-medium">{t('common.loading')}</span>
              </motion.div>
            ) : (
              <motion.div
                key="ready"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-2 text-white/30 text-sm"
              >
                <motion.div
                  animate={{ opacity: [1, 0.3, 1], scale: [1, 1.3, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="w-2 h-2 bg-brand-red rounded-full"
                  style={{ boxShadow: '0 0 6px rgba(244,0,9,0.6)' }}
                />
                Наведите камеру на QR-код
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Manual input / demo codes panel */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="px-6 pb-10 relative z-10 space-y-3"
      >
        {/* Toggle button */}
        <div className="flex justify-center">
          <button
            onClick={() => { setManualMode((v) => !v); setManualCode(''); hasScannedRef.current = false }}
            className="inline-flex items-center gap-2 rounded-2xl px-5 py-2.5 text-xs font-bold transition-all"
            style={manualMode
              ? { background: 'rgba(244,0,9,0.15)', border: '1px solid rgba(244,0,9,0.3)', color: '#F40009' }
              : { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.4)' }
            }
          >
            <Keyboard size={13} />
            {manualMode ? 'Закрыть ввод' : 'Ввести код вручную'}
          </button>
        </div>

        <AnimatePresence>
          {manualMode && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ type: 'spring', damping: 20, stiffness: 260 }}
              className="overflow-hidden"
            >
              {/* Text input */}
              <div className="flex gap-2 mb-3">
                <input
                  ref={inputRef}
                  autoFocus
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value.toUpperCase())}
                  onKeyDown={(e) => e.key === 'Enter' && submitCode(manualCode)}
                  placeholder="BTL-DEMO-0001"
                  className="flex-1 rounded-2xl px-4 py-3 text-white text-sm font-mono font-bold focus:outline-none"
                  style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(244,0,9,0.3)' }}
                />
                <button
                  onClick={() => submitCode(manualCode)}
                  disabled={!manualCode.trim() || mutation.isPending}
                  className="w-12 h-12 rounded-2xl bg-brand-red flex items-center justify-center flex-shrink-0 disabled:opacity-40"
                >
                  <ChevronRight size={20} className="text-white" />
                </button>
              </div>

              {/* Quick-tap demo codes */}
              <p className="text-white/25 text-[10px] font-bold uppercase tracking-widest mb-2 pl-1">Демо-коды</p>
              <div className="grid grid-cols-2 gap-1.5">
                {DEMO_CODES.map(({ code, label, type }) => (
                  <button
                    key={code}
                    onClick={() => submitCode(code)}
                    className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-left transition-all hover:brightness-110 active:scale-95"
                    style={{ background: type === 'bottle' ? 'rgba(244,0,9,0.12)' : 'rgba(0,166,81,0.12)', border: `1px solid ${type === 'bottle' ? 'rgba(244,0,9,0.2)' : 'rgba(0,166,81,0.2)'}` }}
                  >
                    <span className="text-base">{type === 'bottle' ? '🍾' : '♻️'}</span>
                    <div className="min-w-0">
                      <p className="text-white/80 text-[11px] font-bold truncate">{label}</p>
                      <p className="text-white/30 text-[10px] font-mono truncate">{code}</p>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {!manualMode && (
          <div className="flex justify-center">
            <div className="inline-flex items-center gap-2 rounded-2xl px-5 py-3" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <Zap size={14} className="text-brand-gold" style={{ filter: 'drop-shadow(0 0 4px rgba(255,184,0,0.6))' }} />
              <p className="text-white/35 text-xs">{t('scan.tip')}</p>
            </div>
          </div>
        )}
      </motion.div>

      {/* Vignette */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.75) 100%)',
      }} />
    </div>
  )
}
