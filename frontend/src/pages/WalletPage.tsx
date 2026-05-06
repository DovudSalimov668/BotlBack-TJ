import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { Recycle, Leaf, Trophy, ArrowRight, ShoppingBag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
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

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="bg-gradient-to-br from-brand-red to-red-700 text-white px-6 pt-12 pb-16">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-red-200 text-sm mb-1">{t('wallet.balance')}</p>
          <div className="flex items-end gap-2">
            <AnimatedCounter value={points} className="text-6xl font-black" />
            <span className="text-2xl font-semibold text-red-200 mb-1">{t('wallet.points')}</span>
          </div>
          {stats?.rank && (
            <p className="text-red-200 text-sm mt-2">
              {t('wallet.rank')}: #{stats.rank} в {user?.region ? t(`regions.${user.region}`) : 'Душанбе'}
            </p>
          )}
        </motion.div>
      </div>

      <div className="px-6 -mt-8">
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { icon: Recycle, value: recycled, label: t('wallet.bottles_recycled'), color: 'text-green-500' },
            { icon: Leaf, value: co2, label: t('wallet.co2_saved'), color: 'text-emerald-500', suffix: ' кг' },
            { icon: Trophy, value: stats?.rank ?? 0, label: 'Ваш ранг', color: 'text-yellow-500', prefix: '#' },
          ].map(({ icon: Icon, value, label, color, suffix, prefix }, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="text-center shadow-sm">
                <CardContent className="pt-4 pb-3 px-3">
                  <Icon size={22} className={`${color} mx-auto mb-1`} />
                  <div className="text-xl font-black text-brand-charcoal">
                    {prefix}{typeof value === 'number' ? value.toLocaleString('ru') : value}{suffix}
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5 leading-tight">{label}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <Link to="/rewards">
          <Button className="w-full mb-6" size="lg">
            <ShoppingBag size={20} />
            {t('wallet.get_prize')}
            <ArrowRight size={18} className="ml-auto" />
          </Button>
        </Link>

        <Card>
          <CardContent className="p-4">
            <h3 className="font-bold text-gray-800 mb-3">{t('wallet.recent_activity')}</h3>
            {points === 0 ? (
              <p className="text-gray-400 text-sm text-center py-4">{t('wallet.empty')}</p>
            ) : (
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${i % 2 === 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                        {i % 2 === 0 ? <Recycle size={16} className="text-green-500" /> : <ShoppingBag size={16} className="text-brand-red" />}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-800">
                          {i % 2 === 0 ? t('wallet.recycle') : t('wallet.purchase')}
                        </p>
                        <p className="text-xs text-gray-400">Coca-Cola 0.5L</p>
                      </div>
                    </div>
                    <span className={`font-bold text-sm ${i % 2 === 0 ? 'text-green-500' : 'text-brand-red'}`}>
                      +{i % 2 === 0 ? 20 : 10}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
