import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { QrCode, Recycle, Gift, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/store/authStore'

export default function LandingPage() {
  const { t } = useTranslation()
  const { isAuthenticated } = useAuthStore()

  return (
    <div className="min-h-screen bg-white">
      <div className="bg-gradient-to-br from-brand-red via-red-600 to-red-800 text-white px-6 pt-16 pb-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex justify-between items-center mb-10"
        >
          <div>
            <h1 className="text-3xl font-black tracking-tight">BotlBack TJ</h1>
            <p className="text-red-200 text-sm mt-1">Coca-Cola Tajikistan</p>
          </div>
          {!isAuthenticated ? (
            <Link to="/login">
              <Button variant="outline" size="sm" className="border-white text-white hover:bg-white/20 hover:text-white">
                {t('auth.login')}
              </Button>
            </Link>
          ) : (
            <Link to="/wallet">
              <Button variant="outline" size="sm" className="border-white text-white hover:bg-white/20 hover:text-white">
                {t('nav.wallet')}
              </Button>
            </Link>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-center"
        >
          <div className="text-6xl mb-4">🍾</div>
          <h2 className="text-2xl font-bold mb-3 leading-tight">{t('landing.hero')}</h2>
          <p className="text-red-100 text-sm mb-8">{t('landing.subtitle')}</p>

          <Link to={isAuthenticated ? '/scan' : '/login'}>
            <motion.div whileTap={{ scale: 0.95 }}>
              <Button size="lg" className="bg-white text-brand-red hover:bg-gray-100 w-full max-w-xs text-lg font-black shadow-2xl">
                <QrCode size={22} />
                {t('landing.scan_btn')}
              </Button>
            </motion.div>
          </Link>
        </motion.div>
      </div>

      <div className="px-6 py-10">
        <h3 className="text-lg font-bold text-brand-charcoal mb-6 text-center">{t('landing.how_it_works')}</h3>
        <div className="space-y-4">
          {[
            { icon: '🛒', text: t('landing.step1'), color: 'bg-red-50' },
            { icon: '📱', text: t('landing.step2'), color: 'bg-orange-50' },
            { icon: '♻️', text: t('landing.step3'), color: 'bg-green-50' },
            { icon: '🎁', text: t('landing.step4'), color: 'bg-blue-50' },
          ].map(({ icon, text, color }, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + i * 0.1 }}
              className={`flex items-center gap-4 p-4 rounded-2xl ${color}`}
            >
              <span className="text-3xl">{icon}</span>
              <span className="font-medium text-gray-700">{text}</span>
              <ChevronRight className="ml-auto text-gray-400" size={16} />
            </motion.div>
          ))}
        </div>

        {!isAuthenticated && (
          <div className="mt-8 text-center">
            <p className="text-gray-500 text-sm mb-3">{t('auth.no_account')}</p>
            <Link to="/login">
              <Button variant="outline" className="w-full max-w-xs">
                {t('auth.register')}
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
