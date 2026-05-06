import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { Recycle, Leaf, Trophy, ArrowRight, QrCode, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AnimatedCounter } from '@/components/AnimatedCounter'
import { useAuthStore } from '@/store/authStore'
import { useUserStats } from '@/api/users'
import { useMe } from '@/api/auth'

export default function WalletPage() {
  const { t } = useTranslation()
  const { user } = useAuthStore()
  const { data: stats } = useUserStats()
  const { data: me } = useMe()
  const meData = me as { total_points?: number; bottles_recycled?: number; co2_saved_kg?: number } | undefined

  const points = meData?.total_points ?? user?.total_points ?? 0
  const recycled = meData?.bottles_recycled ?? user?.bottles_recycled ?? 0
  const co2 = meData?.co2_saved_kg ?? user?.co2_saved_kg ?? 0

  const tier = points >= 500 ? { label: 'Золото', color: 'text-brand-gold' }
    : points >= 200 ? { label: 'Серебро', color: 'text-gray-400' }
    : { label: 'Бронза', color: 'text-amber-600' }

  return (
    <div className="min-h-screen bg-[#F8F8F8] pb-28">
      {/* ── Hero card ── */}
      <div className="relative mesh-red noise overflow-hidden px-6 pt-12 pb-24">
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center justify-between mb-8">
            <div>
              <p className="text-white/60 text-xs font-semibold tracking-widest uppercase">Баланс</p>
              <p className="text-white/80 text-sm font-medium mt-0.5">
                {user?.name?.split(' ')[0] ?? 'Пользователь'}
              </p>
            </div>
            <div className={`glass text-xs font-black px-3 py-1.5 rounded-full ${tier.color}`}>
              {tier.label}
            </div>
          </div>

          <div className="flex items-end gap-3">
            <AnimatedCounter value={points} className="text-7xl font-black text-white tracking-tight leading-none" />
            <span className="text-white/50 text-2xl font-medium mb-2">pts</span>
          </div>

          {stats?.rank && (
            <p className="text-white/40 text-xs mt-3 font-medium">
              #{stats.rank} в рейтинге • {user?.region ? t(`regions.${user.region}`) : 'Душанбе'}
            </p>
          )}
        </motion.div>
      </div>

      {/* ── Bento stats ── */}
      <div className="px-6 -mt-14 relative z-10 space-y-4">
        {/* 3-col stats row */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: Recycle, value: recycled, label: 'Сдано', unit: 'бут.', color: 'text-brand-eco', bg: 'bg-green-50' },
            { icon: Leaf, value: co2, label: 'CO₂', unit: 'кг', color: 'text-emerald-500', bg: 'bg-emerald-50' },
            { icon: Trophy, value: stats?.rank ?? 0, label: 'Ранг', unit: '', color: 'text-brand-gold', bg: 'bg-yellow-50', prefix: '#' },
          ].map(({ icon: Icon, value, label, unit, color, bg, prefix = '' }, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className={`${bg} rounded-3xl p-4 text-center shadow-sm`}
            >
              <Icon size={20} className={`${color} mx-auto mb-2`} />
              <p className="text-brand-charcoal font-black text-lg leading-none">
                {prefix}{typeof value === 'number' ? value.toLocaleString('ru') : value}
                {unit && <span className="text-xs font-semibold text-gray-400 ml-0.5">{unit}</span>}
              </p>
              <p className="text-gray-500 text-xs mt-1">{label}</p>
            </motion.div>
          ))}
        </div>

        {/* CTA row */}
        <div className="grid grid-cols-2 gap-3">
          <Link to="/rewards" className="col-span-1">
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="bg-brand-red rounded-3xl p-5 flex flex-col h-full min-h-[100px]"
            >
              <Zap size={22} className="text-white mb-auto" />
              <div className="mt-3">
                <p className="text-white font-black text-base leading-tight">Обменять баллы</p>
                <p className="text-white/60 text-xs mt-0.5">8 призов</p>
              </div>
              <ArrowRight size={16} className="text-white/60 mt-2 self-end" />
            </motion.div>
          </Link>
          <Link to="/scan" className="col-span-1">
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="bg-brand-dark rounded-3xl p-5 flex flex-col h-full min-h-[100px]"
            >
              <QrCode size={22} className="text-white mb-auto" />
              <div className="mt-3">
                <p className="text-white font-black text-base leading-tight">Сканировать</p>
                <p className="text-white/40 text-xs mt-0.5">+10 / +20 pts</p>
              </div>
              <ArrowRight size={16} className="text-white/40 mt-2 self-end" />
            </motion.div>
          </Link>
        </div>

        {/* Activity feed */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-3xl overflow-hidden shadow-sm"
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
            <h3 className="font-black text-brand-charcoal text-sm">{t('wallet.recent_activity')}</h3>
          </div>
          {points === 0 ? (
            <p className="text-gray-400 text-sm text-center py-10">{t('wallet.empty')}</p>
          ) : (
            <div className="divide-y divide-gray-50">
              {[...Array(5)].map((_, i) => {
                const isRecycle = i % 2 === 0
                return (
                  <div key={i} className="flex items-center gap-4 px-5 py-3.5">
                    <div className={`w-9 h-9 rounded-2xl flex items-center justify-center flex-shrink-0 ${isRecycle ? 'bg-green-100' : 'bg-red-50'}`}>
                      {isRecycle
                        ? <Recycle size={17} className="text-brand-eco" />
                        : <QrCode size={17} className="text-brand-red" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate">
                        {isRecycle ? t('wallet.recycle') : t('wallet.purchase')}
                      </p>
                      <p className="text-xs text-gray-400">Coca-Cola 0.5L</p>
                    </div>
                    <span className={`font-black text-sm flex-shrink-0 ${isRecycle ? 'text-brand-eco' : 'text-brand-red'}`}>
                      +{isRecycle ? 20 : 10}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </motion.div>

        <Link to="/leaderboard">
          <Button variant="outline" className="w-full rounded-2xl border-2 border-gray-200 text-gray-600 font-bold hover:border-brand-red hover:text-brand-red transition-all">
            <Trophy size={17} className="mr-2" />
            Таблица лидеров
          </Button>
        </Link>
      </div>
    </div>
  )
}
