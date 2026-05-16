import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { AlertCircle } from 'lucide-react'

interface Props { message?: string; onRetry?: () => void }

export function ErrorMessage({ message, onRetry }: Props) {
  const { t } = useTranslation()
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center py-14 text-center px-6"
    >
      <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mb-4">
        <AlertCircle size={26} className="text-brand-red" />
      </div>
      <p className="text-gray-700 font-bold text-sm mb-1">{t('common.something_wrong')}</p>
      <p className="text-gray-400 text-xs mb-5">{message ?? t('common.error')}</p>
      <button
        onClick={onRetry ?? (() => window.location.reload())}
        className="bg-brand-red text-white font-black text-sm px-5 py-2.5 rounded-2xl hover:opacity-90 transition-opacity"
      >
        {t('common.retry')}
      </button>
    </motion.div>
  )
}
