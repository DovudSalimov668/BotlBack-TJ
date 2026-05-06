import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, Users, Recycle, Leaf, Package, Activity } from 'lucide-react'
import { AreaChart, Area, ResponsiveContainer, Tooltip, XAxis } from 'recharts'
import { AnimatedCounter } from '@/components/AnimatedCounter'
import { useOverview, useTimeSeries } from '@/api/analytics'

function KPICard({
  title, value, subtitle, icon: Icon, accentClass, trend, index,
}: {
  title: string; value: number | string; subtitle?: string
  icon: React.ElementType; accentClass: string; trend?: number; index: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07 }}
      className="bg-white rounded-3xl p-5 shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between mb-4">
        <p className="text-gray-500 text-sm font-medium leading-tight">{title}</p>
        <div className={`w-9 h-9 rounded-2xl flex items-center justify-center flex-shrink-0 ${accentClass}`}>
          <Icon size={17} className="text-white" />
        </div>
      </div>
      <div className="text-3xl font-black text-brand-charcoal tracking-tight">
        {typeof value === 'number' ? <AnimatedCounter value={value} /> : value}
      </div>
      {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
      {trend !== undefined && (
        <div className={`flex items-center gap-1 mt-3 text-xs font-bold ${trend >= 0 ? 'text-brand-eco' : 'text-brand-red'}`}>
          {trend >= 0 ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
          {Math.abs(trend)}% vs вчера
        </div>
      )}
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

  const chartData = timeSeries?.map((d: { date: string; value: number }) => ({
    ...d,
    date: d.date.slice(5),
  }))

  return (
    <div className="p-6 space-y-5 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-2">
        <h1 className="text-2xl font-black text-brand-charcoal tracking-tight">{t('admin.overview')}</h1>
        <p className="text-gray-400 text-sm mt-0.5">CCI Таджикистан — реальное время</p>
      </motion.div>

      {/* Bento KPI grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard index={0} title={t('admin.bottles_today')} value={overview?.bottles_today ?? 0}
          icon={Package} accentClass="bg-brand-red" trend={trend} />
        <KPICard index={1} title={t('admin.active_users')} value={overview?.active_users ?? 0}
          subtitle="уникальных сегодня" icon={Users} accentClass="bg-brand-charcoal" />
        <KPICard index={2} title={t('admin.recycling_rate')} value={`${overview?.recycling_rate ?? 0}%`}
          subtitle="бутылок переработано" icon={Recycle} accentClass="bg-brand-eco" />
        <KPICard index={3} title={t('admin.co2_saved')} value={`${overview?.co2_saved_kg ?? 0} кг`}
          subtitle="CO₂ сегодня" icon={Leaf} accentClass="bg-emerald-400" />
      </div>

      {/* Chart + Feed row */}
      <div className="grid lg:grid-cols-3 gap-5">
        {/* Area chart — spans 2 cols */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2 bg-white rounded-3xl p-6 shadow-sm"
        >
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-black text-brand-charcoal">Сканирования</h3>
              <p className="text-gray-400 text-xs mt-0.5">За последние 30 дней</p>
            </div>
            <div className="flex items-center gap-1.5 bg-red-50 text-brand-red rounded-full px-3 py-1 text-xs font-bold">
              <Activity size={12} />
              Live
            </div>
          </div>
          {chartData?.length ? (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="redGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#F40009" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="#F40009" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} interval={4} />
                <Tooltip
                  contentStyle={{ background: '#1E1E1E', border: 'none', borderRadius: 12, fontSize: 12, color: '#fff' }}
                  formatter={(v: number) => [v, 'Сканирований']}
                  labelStyle={{ color: '#9CA3AF' }}
                  cursor={{ stroke: '#F40009', strokeWidth: 1, strokeDasharray: '4' }}
                />
                <Area
                  type="monotone" dataKey="value"
                  stroke="#F40009" strokeWidth={2.5}
                  fill="url(#redGrad)"
                  dot={false} activeDot={{ r: 5, fill: '#F40009', strokeWidth: 0 }}
                  animationDuration={1500}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-56 flex items-center justify-center">
              <div className="w-8 h-8 border-3 border-brand-red border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </motion.div>

        {/* Live feed */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-brand-dark rounded-3xl p-5 shadow-sm overflow-hidden"
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-2 bg-brand-eco rounded-full animate-pulse" />
            <h3 className="font-black text-white text-sm">{t('admin.live_feed')}</h3>
          </div>
          <div className="space-y-0 max-h-64 overflow-y-auto">
            {overview?.live_feed?.length ? overview.live_feed.map((item: { text: string; region: string }, i: number) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                className="py-3 border-b border-white/8 last:border-0"
              >
                <div className="flex items-start gap-2.5">
                  <div className="w-6 h-6 bg-brand-red/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Recycle size={12} className="text-brand-red" />
                  </div>
                  <div>
                    <p className="text-white/80 text-xs font-medium leading-snug">{item.text}</p>
                    <p className="text-white/30 text-xs mt-0.5">{item.region}</p>
                  </div>
                </div>
              </motion.div>
            )) : (
              <p className="text-white/30 text-sm text-center py-8">Загрузка...</p>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
