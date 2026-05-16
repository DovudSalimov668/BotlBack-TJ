import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Home } from 'lucide-react'

export default function NotFoundPage() {
  const { t } = useTranslation()
  return (
    <div className="min-h-screen aurora flex flex-col items-center justify-center p-8 text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', damping: 18 }}
      >
        <p className="text-white/20 font-black" style={{ fontSize: 'clamp(5rem,20vw,9rem)', lineHeight: 1 }}>404</p>
        <h1 className="text-white text-2xl font-black mt-4 mb-2">{t('not_found.title')}</h1>
        <p className="text-white/50 text-sm mb-8">{t('not_found.body')}</p>
        <Link to="/">
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            className="glass text-white font-black px-6 py-3 rounded-2xl flex items-center gap-2 mx-auto"
          >
            <Home size={16} />
            {t('not_found.go_home')}
          </motion.button>
        </Link>
      </motion.div>
    </div>
  )
}
