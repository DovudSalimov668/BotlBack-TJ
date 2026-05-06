import { useEffect } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import confetti from 'canvas-confetti'
import { Button } from '@/components/ui/button'
import { CheckCircle, XCircle } from 'lucide-react'

export default function ScanResultPage() {
  const { t } = useTranslation()
  const { state } = useLocation()
  const navigate = useNavigate()
  const result = state as { points?: number; total?: number; sku?: string; type?: string; error?: string } | null

  useEffect(() => {
    if (!result?.error) {
      confetti({
        particleCount: 150,
        spread: 90,
        colors: ['#F40009', '#ffffff', '#FFD700', '#ff6b6b'],
        origin: { y: 0.6 },
      })
    }
  }, [])

  if (result?.error) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }}>
          <XCircle size={80} className="text-orange-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">{result.error}</h2>
          <p className="text-gray-500 mb-8">Эта бутылка уже была зарегистрирована ранее</p>
          <div className="flex gap-3 justify-center">
            <Link to="/scan"><Button>{t('scan.scan_another')}</Button></Link>
            <Link to="/wallet"><Button variant="outline">{t('nav.wallet')}</Button></Link>
          </div>
        </motion.div>
      </div>
    )
  }

  const isRecycle = result?.type === 'recycle'

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-red to-red-700 flex flex-col items-center justify-center p-6 text-white text-center">
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', damping: 15 }}
        className="w-full max-w-sm"
      >
        <CheckCircle size={80} className="mx-auto mb-4 text-white" />

        <h2 className="text-2xl font-bold mb-2">{t('scan.success')}</h2>
        {result?.sku && <p className="text-red-200 mb-6">{result.sku}</p>}

        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, type: 'spring' }}
          className="bg-white/20 rounded-3xl p-8 mb-6"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-7xl font-black"
          >
            +{result?.points}
          </motion.div>
          <p className="text-xl font-semibold mt-2">
            {isRecycle ? t('scan.recycle_bonus') : t('scan.purchase_bonus')}
          </p>
          {result?.total !== undefined && (
            <p className="text-red-200 mt-3 text-sm">
              {t('scan.total')}: <strong className="text-white">{result.total}</strong>
            </p>
          )}
        </motion.div>

        {isRecycle && (
          <div className="bg-white/10 rounded-2xl p-4 mb-6">
            <p className="text-sm">♻️ {t('scan.co2_saved')}</p>
          </div>
        )}

        <div className="flex gap-3">
          <Link to="/scan" className="flex-1">
            <Button className="w-full bg-white text-brand-red hover:bg-gray-100">
              {t('scan.scan_another')}
            </Button>
          </Link>
          <Link to="/wallet" className="flex-1">
            <Button className="w-full bg-white/20 hover:bg-white/30 border border-white/30">
              {t('nav.wallet')}
            </Button>
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
