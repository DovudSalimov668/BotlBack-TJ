import { useEffect, useRef, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import { Html5QrcodeScanner } from 'html5-qrcode'
import { useScanBottle, useRecycleBottle, verifyRecyclingPoint } from '@/api/bottles'
import api from '@/lib/axios'
import { ArrowLeft, Zap, QrCode, Keyboard, ChevronRight, MapPin, RotateCcw, Recycle } from 'lucide-react'

// ── QR type detection ─────────────────────────────────────────────────────────
function getQRType(code: string): 'bottle' | 'recycling_point' | 'unknown' {
  if (code.startsWith('BTL-')) return 'bottle'
  if (code.startsWith('RP-')) return 'recycling_point'
  return 'unknown'
}

// ── State machine ─────────────────────────────────────────────────────────────
type ScanPhase =
  | { kind: 'idle' }
  | { kind: 'need_rp'; bottleQR: string; bottleName: string }
  | { kind: 'has_rp'; rpQR: string; rpName: string; rpAddress: string }
  | { kind: 'processing' }

// ── Demo codes ────────────────────────────────────────────────────────────────
const DEMO_CODES = [
  { code: 'BTL-DEMO-0001', label: 'Coca-Cola 0.5L',  type: 'bottle' as const },
  { code: 'BTL-DEMO-0002', label: 'Fanta 0.5L',      type: 'bottle' as const },
  { code: 'BTL-DEMO-0003', label: 'Sprite 1L',        type: 'bottle' as const },
  { code: 'BTL-DEMO-0004', label: 'Bonaqua 0.5L',     type: 'bottle' as const },
  { code: 'BTL-DEMO-0005', label: 'Fuse Tea 0.5L',    type: 'bottle' as const },
  { code: 'RP-DEMO-001',   label: 'Базар Мехргон',    type: 'recycling_point' as const },
  { code: 'RP-DS-002',     label: 'Душанбе Сити',     type: 'recycling_point' as const },
]

export default function ScanPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const scannerRef = useRef<Html5QrcodeScanner | null>(null)
  const hasScannedRef = useRef(false)
  const scanMutation = useScanBottle()
  const recycleMutation = useRecycleBottle()
  const [phase, setPhase] = useState<ScanPhase>({ kind: 'idle' })
  const [statusMsg, setStatusMsg] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [manualMode, setManualMode] = useState(false)
  const [manualCode, setManualCode] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const [scanSize, setScanSize] = useState(256)

  useEffect(() => {
    setScanSize(Math.min(256, window.innerWidth - 80))
  }, [])

  const reset = useCallback(() => {
    hasScannedRef.current = false
    setPhase({ kind: 'idle' })
    setStatusMsg(null)
    setErrorMsg(null)
  }, [])

  // ── Core logic ──────────────────────────────────────────────────────────────
  const handleCode = useCallback(async (raw: string) => {
    const code = raw.trim().toUpperCase()
    if (!code || hasScannedRef.current) return
    hasScannedRef.current = true
    setErrorMsg(null)

    const qrType = getQRType(code)

    // ── Case 1: Recycling point QR ─────────────────────────────────────────
    if (qrType === 'recycling_point') {
      if (phase.kind === 'need_rp') {
        // User already has a bottle scanned — do recycle
        setPhase({ kind: 'processing' })
        setStatusMsg('Recycling...')
        try {
          const data = await recycleMutation.mutateAsync({
            bottle_qr: phase.bottleQR,
            recycling_point_qr: code,
          })
          navigate(`/scan/result/${data.scan_id}`, {
            state: {
              points: data.points_awarded,
              total: data.total_points,
              sku: data.recycling_point ?? phase.bottleName,
              type: 'recycle',
              streak_days: data.streak_days,
              unlocked_achievements: data.unlocked_achievements ?? [],
              co2_saved_kg: data.co2_saved_kg,
            },
          })
        } catch (err: unknown) {
          const e = err as { response?: { data?: { code?: string; error?: string } } }
          const errCode = e?.response?.data?.code
          if (errCode === 'not_owner') {
            setErrorMsg('Эта бутылка куплена другим пользователем')
          } else if (errCode === 'already_recycled') {
            setErrorMsg(t('scan.already_recycled'))
          } else {
            setErrorMsg(e?.response?.data?.error ?? 'Ошибка переработки')
          }
          reset()
        }
        return
      }

      // Idle state: verify RP and store it
      setStatusMsg('Проверяем точку переработки...')
      try {
        const rp = await verifyRecyclingPoint(code)
        setPhase({ kind: 'has_rp', rpQR: code, rpName: rp.name, rpAddress: rp.address })
        setStatusMsg(null)
        hasScannedRef.current = false
      } catch {
        setErrorMsg('Точка переработки не найдена или неактивна')
        hasScannedRef.current = false
        setStatusMsg(null)
      }
      return
    }

    // ── Case 2: Bottle QR ──────────────────────────────────────────────────
    if (qrType === 'bottle' || qrType === 'unknown') {
      if (phase.kind === 'has_rp') {
        // We're at a recycling point — recycle this bottle
        setPhase({ kind: 'processing' })
        setStatusMsg('Recycling...')
        try {
          const data = await recycleMutation.mutateAsync({
            bottle_qr: code,
            recycling_point_qr: phase.rpQR,
          })
          navigate(`/scan/result/${data.scan_id}`, {
            state: {
              points: data.points_awarded,
              total: data.total_points,
              sku: data.recycling_point ?? code,
              type: 'recycle',
              streak_days: data.streak_days,
              unlocked_achievements: data.unlocked_achievements ?? [],
              co2_saved_kg: data.co2_saved_kg,
            },
          })
        } catch (err: unknown) {
          const e = err as { response?: { data?: { code?: string; error?: string } } }
          const errCode = e?.response?.data?.code
          if (errCode === 'not_purchased') {
            setErrorMsg('Сначала отсканируйте бутылку при покупке')
          } else if (errCode === 'not_owner') {
            setErrorMsg('Эта бутылка куплена другим пользователем')
          } else if (errCode === 'already_recycled') {
            setErrorMsg(t('scan.already_recycled'))
          } else {
            setErrorMsg(e?.response?.data?.error ?? 'Ошибка переработки')
          }
          reset()
        }
        return
      }

      // Idle: try purchase scan first
      setPhase({ kind: 'processing' })
      setStatusMsg('Сканирование...')
      try {
        const data = await scanMutation.mutateAsync({ qr_code: code })
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
        const e = err as { response?: { data?: { code?: string } } }
        if (e?.response?.data?.code === 'already_scanned') {
          // Bottle was already purchased. Check if it's been recycled already.
          try {
            const verify = await api.get(`/bottles/verify/${code}/`).then(r => r.data)
            if (verify.is_recycled) {
              setErrorMsg(t('scan.already_recycled'))
              reset()
            } else {
              // Bottle purchased (by this or another user) — offer recycle flow
              setPhase({ kind: 'need_rp', bottleQR: code, bottleName: verify.sku?.name ?? code })
              setStatusMsg(null)
              hasScannedRef.current = false
            }
          } catch {
            setErrorMsg(t('scan.already_scanned'))
            reset()
          }
        } else if (e?.response?.status === 404) {
          setErrorMsg('QR-код не распознан')
          reset()
        } else {
          setErrorMsg('Ошибка. Попробуйте снова')
          reset()
        }
      }
    }
  }, [phase, scanMutation, recycleMutation, navigate, reset, t])

  // ── Camera ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (manualMode || phase.kind === 'processing') return
    const box = Math.max(180, scanSize - 32)
    scannerRef.current = new Html5QrcodeScanner(
      'qr-reader',
      { fps: 10, qrbox: { width: box, height: box }, aspectRatio: 1.0 },
      false,
    )
    scannerRef.current.render(
      (decodedText) => handleCode(decodedText),
      () => {},
    )
    return () => { scannerRef.current?.clear().catch(() => {}) }
  }, [manualMode, scanSize, phase.kind, handleCode])

  const isProcessing = phase.kind === 'processing' || scanMutation.isPending || recycleMutation.isPending

  // ── Corner bracket ─────────────────────────────────────────────────────────
  const Corner = ({ pos }: { pos: 'tl' | 'tr' | 'bl' | 'br' }) => {
    const top  = pos.startsWith('t')
    const left = pos.endsWith('l')
    const color = phase.kind === 'has_rp' ? '#00A651' : phase.kind === 'need_rp' ? '#FF6B35' : '#F40009'
    return (
      <motion.div
        className="absolute w-10 h-10"
        animate={{ opacity: 1 }}
        style={{
          top:    top  ? -2 : undefined,
          bottom: !top ? -2 : undefined,
          left:   left ? -2 : undefined,
          right:  !left ? -2 : undefined,
          borderTop:    top  ? `3px solid ${color}` : undefined,
          borderBottom: !top ? `3px solid ${color}` : undefined,
          borderLeft:   left ? `3px solid ${color}` : undefined,
          borderRight:  !left ? `3px solid ${color}` : undefined,
          borderRadius: top && left ? '8px 0 0 0' : top && !left ? '0 8px 0 0' : !top && left ? '0 0 0 8px' : '0 0 8px 0',
          filter: `drop-shadow(0 0 4px ${color}cc)`,
        }}
      />
    )
  }

  // ── Status banner for phases ───────────────────────────────────────────────
  const PhaseBanner = () => {
    if (phase.kind === 'need_rp') {
      return (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-4 mb-4 rounded-2xl p-4 flex items-start gap-3"
          style={{ background: 'rgba(255,107,53,0.15)', border: '1px solid rgba(255,107,53,0.3)' }}
        >
          <Recycle size={20} className="text-orange-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-orange-300 font-bold text-sm">Готово к переработке!</p>
            <p className="text-white/60 text-xs mt-0.5">Бутылка: <span className="font-mono text-orange-300">{phase.bottleName}</span></p>
            <p className="text-white/50 text-xs mt-1">Теперь отсканируйте QR-код точки переработки</p>
          </div>
          <button onClick={reset} className="ml-auto text-white/30 hover:text-white/60">
            <RotateCcw size={14} />
          </button>
        </motion.div>
      )
    }
    if (phase.kind === 'has_rp') {
      return (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-4 mb-4 rounded-2xl p-4 flex items-start gap-3"
          style={{ background: 'rgba(0,166,81,0.15)', border: '1px solid rgba(0,166,81,0.3)' }}
        >
          <MapPin size={20} className="text-green-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-green-300 font-bold text-sm">{phase.rpName}</p>
            <p className="text-white/50 text-xs mt-0.5">{phase.rpAddress}</p>
            <p className="text-white/50 text-xs mt-1">Отсканируйте QR-код вашей бутылки для переработки</p>
          </div>
          <button onClick={reset} className="ml-auto text-white/30 hover:text-white/60">
            <RotateCcw size={14} />
          </button>
        </motion.div>
      )
    }
    return null
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
            background: phase.kind === 'has_rp'
              ? 'radial-gradient(circle, rgba(0,166,81,0.1) 0%, transparent 70%)'
              : phase.kind === 'need_rp'
              ? 'radial-gradient(circle, rgba(255,107,53,0.1) 0%, transparent 70%)'
              : 'radial-gradient(circle, rgba(244,0,9,0.12) 0%, transparent 70%)',
          }}
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      {/* Header */}
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
        <motion.div
          animate={{ rotate: [0, 5, -5, 0] }}
          transition={{ duration: 4, repeat: Infinity }}
          className="ml-auto w-8 h-8 rounded-xl bg-brand-red/20 flex items-center justify-center"
        >
          <QrCode size={15} className="text-brand-red" />
        </motion.div>
      </motion.div>

      {/* Phase banner */}
      <PhaseBanner />

      {/* Camera area */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 relative z-10">
        <motion.p
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-white/45 text-sm mb-8 text-center font-medium"
        >
          {phase.kind === 'need_rp'
            ? 'Направьте камеру на QR-код точки переработки'
            : phase.kind === 'has_rp'
            ? 'Направьте камеру на QR-код бутылки'
            : t('scan.subtitle')}
        </motion.p>

        {/* Scanner wrapper */}
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, type: 'spring', damping: 16 }}
          className="relative"
        >
          {/* Outer glow ring */}
          <motion.div
            className="absolute pointer-events-none"
            style={{
              inset: -20,
              borderRadius: 40,
              background: phase.kind === 'has_rp'
                ? 'radial-gradient(circle, rgba(0,166,81,0.2) 0%, transparent 70%)'
                : phase.kind === 'need_rp'
                ? 'radial-gradient(circle, rgba(255,107,53,0.2) 0%, transparent 70%)'
                : 'radial-gradient(circle, rgba(244,0,9,0.22) 0%, transparent 70%)',
            }}
            animate={{ opacity: [0.6, 1, 0.6], scale: [0.97, 1.03, 0.97] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
          />

          {/* Scanning line — neon sweep */}
          {!isProcessing && (
            <motion.div
              className="absolute left-3 right-3 z-20 rounded-full"
              style={{
                height: 2,
                background: phase.kind === 'has_rp'
                  ? 'linear-gradient(90deg, transparent 0%, rgba(0,166,81,0.3) 15%, #00A651 50%, rgba(0,166,81,0.3) 85%, transparent 100%)'
                  : phase.kind === 'need_rp'
                  ? 'linear-gradient(90deg, transparent 0%, rgba(255,107,53,0.3) 15%, #FF6B35 50%, rgba(255,107,53,0.3) 85%, transparent 100%)'
                  : 'linear-gradient(90deg, transparent 0%, rgba(244,0,9,0.3) 15%, #F40009 50%, rgba(244,0,9,0.3) 85%, transparent 100%)',
                boxShadow: phase.kind === 'has_rp'
                  ? '0 0 12px rgba(0,166,81,0.8), 0 0 24px rgba(0,166,81,0.4)'
                  : '0 0 12px rgba(244,0,9,0.8), 0 0 24px rgba(244,0,9,0.4)',
              }}
              animate={{ top: ['8%', '88%', '8%'] }}
              transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
            />
          )}

          {/* Corner brackets */}
          <div className="absolute inset-0 z-20 pointer-events-none">
            <Corner pos="tl" />
            <Corner pos="tr" />
            <Corner pos="bl" />
            <Corner pos="br" />
          </div>

          {isProcessing ? (
            <div
              className="rounded-3xl flex items-center justify-center"
              style={{ width: scanSize, height: scanSize, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <div className="text-center">
                <div className="w-10 h-10 border-3 border-brand-red border-t-transparent rounded-full animate-spin mx-auto mb-3" style={{ borderWidth: 3 }} />
                <p className="text-white/50 text-xs">{statusMsg ?? 'Обработка...'}</p>
              </div>
            </div>
          ) : (
            <div
              id="qr-reader"
              className="rounded-3xl overflow-hidden"
              style={{ width: scanSize, height: scanSize }}
            />
          )}
        </motion.div>

        {/* Error / status */}
        <div className="mt-8 text-center min-h-12">
          <AnimatePresence mode="wait">
            {errorMsg ? (
              <motion.div
                key="error"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="px-5 py-3 rounded-2xl"
                style={{ background: 'rgba(244,0,9,0.15)', border: '1px solid rgba(244,0,9,0.3)' }}
              >
                <p className="text-red-400 text-sm font-medium">{errorMsg}</p>
              </motion.div>
            ) : (
              <motion.div
                key="ready"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-2 text-white/30 text-sm justify-center"
              >
                <motion.div
                  animate={{ opacity: [1, 0.3, 1], scale: [1, 1.3, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="w-2 h-2 rounded-full"
                  style={{
                    background: phase.kind === 'has_rp' ? '#00A651' : phase.kind === 'need_rp' ? '#FF6B35' : '#F40009',
                    boxShadow: `0 0 6px ${phase.kind === 'has_rp' ? 'rgba(0,166,81,0.6)' : 'rgba(244,0,9,0.6)'}`,
                  }}
                />
                Наведите камеру на QR-код
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Manual input / demo panel */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="px-6 pb-10 relative z-10 space-y-3"
      >
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
              <div className="flex gap-2 mb-3">
                <input
                  ref={inputRef}
                  autoFocus
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value.toUpperCase())}
                  onKeyDown={(e) => e.key === 'Enter' && handleCode(manualCode)}
                  placeholder={phase.kind === 'has_rp' ? 'BTL-DEMO-0001' : phase.kind === 'need_rp' ? 'RP-DEMO-001' : 'BTL-... или RP-...'}
                  className="flex-1 rounded-2xl px-4 py-3 text-white text-sm font-mono font-bold focus:outline-none"
                  style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(244,0,9,0.3)' }}
                />
                <button
                  onClick={() => handleCode(manualCode)}
                  disabled={!manualCode.trim() || isProcessing}
                  className="w-12 h-12 rounded-2xl bg-brand-red flex items-center justify-center flex-shrink-0 disabled:opacity-40"
                >
                  <ChevronRight size={20} className="text-white" />
                </button>
              </div>

              <p className="text-white/25 text-[10px] font-bold uppercase tracking-widest mb-2 pl-1">Демо-коды</p>
              <div className="grid grid-cols-2 gap-1.5">
                {DEMO_CODES.map(({ code, label, type }) => {
                  const isRP = type === 'recycling_point'
                  return (
                    <button
                      key={code}
                      onClick={() => handleCode(code)}
                      disabled={isProcessing}
                      className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-left transition-all hover:brightness-110 active:scale-95 disabled:opacity-40"
                      style={{
                        background: isRP ? 'rgba(0,166,81,0.12)' : 'rgba(244,0,9,0.12)',
                        border: `1px solid ${isRP ? 'rgba(0,166,81,0.2)' : 'rgba(244,0,9,0.2)'}`,
                      }}
                    >
                      <span className="text-base">{isRP ? '♻️' : '🍾'}</span>
                      <div className="min-w-0">
                        <p className="text-white/80 text-[11px] font-bold truncate">{label}</p>
                        <p className="text-white/30 text-[10px] font-mono truncate">{code}</p>
                      </div>
                    </button>
                  )
                })}
              </div>

              {/* Flow hint */}
              <div className="mt-3 rounded-xl px-3 py-2.5" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <p className="text-white/30 text-[10px] leading-relaxed">
                  <span className="text-brand-red font-bold">Покупка:</span> BTL-DEMO-0001<br />
                  <span className="text-orange-400 font-bold">Переработка:</span> BTL-DEMO-0001 → RP-DEMO-001<br />
                  <span className="text-green-400 font-bold">С точки:</span> RP-DEMO-001 → BTL-DEMO-0002
                </p>
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
