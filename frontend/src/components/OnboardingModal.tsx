import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { QrCode, Recycle, Gift, X, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'

const STEPS = [
  {
    icon: QrCode,
    color: '#F40009',
    bg: 'rgba(244,0,9,0.12)',
    title: 'Купи и сканируй',
    body: 'Покупай бутылки Coca-Cola и сканируй QR-код на этикетке. Получай +10 очков за каждую бутылку.',
    cta: null,
  },
  {
    icon: Recycle,
    color: '#00A651',
    bg: 'rgba(0,166,81,0.12)',
    title: 'Сдай на переработку',
    body: 'Найди пункт приёма на карте, сканируй QR-код точки и получай +20 очков. Спасай планету!',
    cta: null,
  },
  {
    icon: Gift,
    color: '#6C63FF',
    bg: 'rgba(108,99,255,0.12)',
    title: 'Получай призы',
    body: 'Обменивай очки на пополнение Alif Mobi, мерч Coca-Cola и эксклюзивные призы.',
    cta: '/scan',
  },
]

export function OnboardingModal() {
  const [visible, setVisible] = useState(false)
  const [step, setStep] = useState(0)

  useEffect(() => {
    if (!localStorage.getItem('botlback_onboarded')) {
      const timer = setTimeout(() => setVisible(true), 1200)
      return () => clearTimeout(timer)
    }
  }, [])

  const dismiss = () => {
    localStorage.setItem('botlback_onboarded', '1')
    setVisible(false)
  }

  const next = () => {
    if (step < STEPS.length - 1) {
      setStep((s) => s + 1)
    } else {
      dismiss()
    }
  }

  const current = STEPS[step]
  const Icon = current.icon

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}
          onClick={dismiss}
        >
          <motion.div
            initial={{ y: 60, opacity: 0, scale: 0.96 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 60, opacity: 0, scale: 0.96 }}
            transition={{ type: 'spring', damping: 22, stiffness: 280 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm bg-white rounded-3xl overflow-hidden shadow-2xl"
          >
            {/* Progress dots */}
            <div className="flex gap-1.5 justify-center pt-5">
              {STEPS.map((_, i) => (
                <motion.div
                  key={i}
                  animate={{ width: i === step ? 24 : 6, background: i === step ? current.color : '#E5E7EB' }}
                  transition={{ duration: 0.3 }}
                  className="h-1.5 rounded-full"
                />
              ))}
            </div>

            {/* Content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.25 }}
                className="px-7 py-8 text-center"
              >
                <div
                  className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6"
                  style={{ background: current.bg }}
                >
                  <Icon size={36} style={{ color: current.color }} />
                </div>
                <h3 className="text-2xl font-black text-gray-900 mb-3">{current.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{current.body}</p>
              </motion.div>
            </AnimatePresence>

            {/* Actions */}
            <div className="px-7 pb-7 flex gap-3">
              <button
                onClick={dismiss}
                className="flex items-center justify-center w-10 h-12 rounded-2xl border-2 border-gray-100 text-gray-400 hover:border-gray-200 transition-colors flex-shrink-0"
              >
                <X size={16} />
              </button>
              {step === STEPS.length - 1 && current.cta ? (
                <Link to={current.cta} onClick={dismiss} className="flex-1">
                  <button
                    className="w-full h-12 rounded-2xl font-black text-white flex items-center justify-center gap-2 shadow-lg"
                    style={{ background: current.color }}
                  >
                    Начать сканировать
                    <ArrowRight size={17} />
                  </button>
                </Link>
              ) : (
                <button
                  onClick={next}
                  className="flex-1 h-12 rounded-2xl font-black text-white flex items-center justify-center gap-2"
                  style={{ background: current.color }}
                >
                  {step < STEPS.length - 1 ? 'Далее' : 'Начать'}
                  <ArrowRight size={17} />
                </button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
