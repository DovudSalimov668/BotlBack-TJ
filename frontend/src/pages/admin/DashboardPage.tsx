import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, Users, Recycle, Leaf, Package } from 'lucide-react'
import { LineChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AnimatedCounter } from '@/components/AnimatedCounter'
import { useOverview, useTimeSeries } from '@/api/analytics'

function KPICard({
  title, value, subtitle, icon: Icon, color, trend,
}: {
  title: string; value: number | string; subtitle?: string; icon: React.ElementType; color: string; trend?: number
}) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="shadow-sm hover:shadow-md transition-shadow">
        <CardContent className="p-5">
          <div className="flex items-start justify-between mb-3">
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <div className={`p-2 rounded-xl ${color}`}>
              <Icon size={18} className="text-white" />
            </div>
          </div>
          <div className="text-3xl font-black text-brand-charcoal mb-1">
            {typeof value === 'number' ? (
              <AnimatedCounter value={value} />
            ) : value}
          </div>
          {subtitle && <p className="text-xs text-gray-400">{subtitle}</p>}
          {trend !== undefined && (
            <div className={`flex items-center gap-1 mt-2 text-xs font-semibold ${trend >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {trend >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
              {Math.abs(trend)}% vs вчера
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}

export default function AdminDashboardPage() {
  const { t } = useTranslation()
  const { data: overview } = useOverview()
  const { data: timeSeries } = useTimeSeries('scans', '30d')

  const trend = overview
    ? overview.bottles_today > overview.bottles_yesterday
      ? Math.round(((overview.bottles_today - overview.bottles_yesterday) / (overview.bottles_yesterday || 1)) * 100)
      : -Math.round(((overview.bottles_yesterday - overview.bottles_today) / (overview.bottles_yesterday || 1)) * 100)
    : 0

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-black text-brand-charcoal">{t('admin.overview')}</h1>
        <p className="text-gray-500 text-sm mt-1">Дашборд CCI Таджикистан — реальное время</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title={t('admin.bottles_today')}
          value={overview?.bottles_today ?? 0}
          icon={Package}
          color="bg-brand-red"
          trend={trend}
        />
        <KPICard
          title={t('admin.active_users')}
          value={overview?.active_users ?? 0}
          subtitle="уникальных сегодня"
          icon={Users}
          color="bg-blue-500"
        />
        <KPICard
          title={t('admin.recycling_rate')}
          value={`${overview?.recycling_rate ?? 0}%`}
          subtitle="бутылок переработано"
          icon={Recycle}
          color="bg-green-500"
        />
        <KPICard
          title={t('admin.co2_saved')}
          value={`${overview?.co2_saved_kg ?? 0} кг`}
          subtitle="CO₂ сегодня"
          icon={Leaf}
          color="bg-emerald-500"
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Сканирования за 30 дней</CardTitle>
            </CardHeader>
            <CardContent>
              {timeSeries?.length ? (
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={timeSeries}>
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={(d) => d.slice(5)} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip
                      formatter={(v: number) => [v, 'Сканирований']}
                      labelFormatter={(l) => `Дата: ${l}`}
                    />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="#F40009"
                      strokeWidth={2.5}
                      dot={false}
                      activeDot={{ r: 5, fill: '#F40009' }}
                      isAnimationActive={true}
                      animationDuration={1500}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-64 flex items-center justify-center">
                  <div className="w-8 h-8 border-4 border-brand-red border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{t('admin.live_feed')}</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-gray-50 max-h-72 overflow-y-auto">
              {overview?.live_feed?.map((item: { text: string; region: string; time: string }, i: number) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="px-4 py-3"
                >
                  <p className="text-xs font-medium text-gray-800">{item.text}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{item.region} • только что</p>
                </motion.div>
              )) ?? (
                <p className="p-4 text-sm text-gray-400 text-center">Загрузка...</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
