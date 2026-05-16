import { motion } from 'framer-motion'
import { Flame } from 'lucide-react'
import { useTranslation } from 'react-i18next'

interface StreakBadgeProps {
  days: number
  className?: string
  size?: 'sm' | 'md'
}

export function StreakBadge({ days, className = '', size = 'md' }: StreakBadgeProps) {
  const { t } = useTranslation()
  const active = days > 0
  const dim = size === 'sm' ? 14 : 16
  const dayLabel = days === 1 ? t('streak.day_one') : days < 5 ? t('streak.day_few') : t('streak.day_many')

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-black text-xs ${className}`}
      style={
        active
          ? { background: 'linear-gradient(135deg, #FF6B35, #F40009)', color: '#fff', boxShadow: '0 4px 16px rgba(244,0,9,0.4)' }
          : { background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.5)' }
      }
    >
      <motion.span
        animate={active ? { y: [0, -2, 0], rotate: [-5, 5, -5] } : {}}
        transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
      >
        <Flame size={dim} fill={active ? '#FFB800' : 'transparent'} strokeWidth={active ? 1 : 2} />
      </motion.span>
      <span className="tabular">{days}</span>
      <span className="opacity-70 font-semibold">{dayLabel}</span>
    </motion.div>
  )
}
