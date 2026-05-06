import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, Users, Recycle, Leaf, Package, Activity, Zap, BarChart3 } from 'lucide-react'
import {
  AreaChart, Area, ResponsiveContainer, Tooltip, XAxis, YAxis,
  BarChart, Bar, CartesianGrid, Cell,
} from 'recharts'
import { NumberRoll } from '@/components/NumberRoll'
import { useOverview, useTimeSeries, useRegions } from '@/api/analytics'

type KPICardProps = {
  title: string
  value: number | string
  subtitle?: string
  icon: React.ElementType
  accentColor: string
  tint: string
  trend?: number
  index: number
}

function KPICard({ title, value, subtitle, icon: Icon, accentColor, tint, trend, index }: KPICardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07, type: 'spring', damping: 18 }}
      whileHover={{ y: -3, scale: 1.01 }}
      className="bg-white rounded-3xl p-5 shadow-sm relative overflow-hidden"
    >
      <div className="absolute inset-0 opacity-60" style={{ background: tint }} />
      <div className="relative">
        <div className="flex items-start justify-between mb-4">
          <p className="text-gray-500 text-xs font-bold uppercase tracking-wider leading-tight">{title}</p>
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: accentColor + '22' }}>
            <Icon size={18} style={{ color: accentColor }} />
          </div>
        </div>
        <div className="text-3xl font-black text-brand-charcoal tracking-tight leading-none">
          {typeof value === 'number'
            ? <NumberRoll value={value} duration={1.2} />
            : value}
        </div>
        {subtitle && <p className="text-xs text-gray-400 mt-1.5 font-medium">{subtitle}</p>}
        {trend !== undefined && (
          <div className={`flex items-center gap-1 mt-3 text-xs font-black ${trend >= 0 ? 'text-brand-eco' : 'text-brand-red'}`}>
            {trend >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {Math.abs(trend)}% vs вчера
          </div>
        )}
      </div>
    </motion.div>
  )
}

const customTooltipStyle = {
  background: '#1E1E1E',
  border: 'none',
  borderRadius: 14,
  fontSize: 12,
  color: '#fff',
  boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
}

export default function AdminDashboardPage() {
  const { t } = useTranslation()
  const { data: overview } = useOverview()
  const { data: timeSeries } = useTimeSeries('scans', '30d')
  const { data: regions } = useRegions()

  const trend = overview
    ? overview.bottles_yesterday > 0
      ? Math.round(((overview.bottles_today - overview.bottles_yesterday) / overview.bottles_yesterday) * 100)
      : 0
    : 0

  const chartData = timeSeries?.map((d: { date: string; value: number }) => ({
    date: d.date.slice(5),
    value: d.value,
  }))

  const regionData = regions?.map((r: { region: string; recycling_rate: number; bottles_recycled: number }) => ({
    name: t(`regions.${r.region}`),
    rate: Math.round(r.recycling_rate * 10) / 10,
    recycled: r.bottles_recycled,
  }))

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="flex items-center gap-3 mb-1">
          <div className="w-8 h-8 bg-brand-red rounded-xl flex items-center justify-center">
            <BarChart3 size={16} className="text-white" />
          </div>
          <h1 className="text-2xl font-black text-brand-charcoal tracking-tight">{t('admin.overview')}</h1>
        </div>
        <p className="text-gray-400 text-sm ml-11">CCI Таджикистан · Real-time</p>
      </motion.div>

      {/* KPI grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard index={0} title={t('admin.bottles_today')} value={overview?.bottles_today ?? 0}
          icon={Package} accentColor="#F40009" tint="radial-gradient(circle at 100% 0%, rgba(244,0,9,0.06), transparent 70%)"
          trend={trend} />
        <KPICard index={1} title={t('admin.active_users')} value={overview?.active_users ?? 0}
          subtitle="уникальных сегодня" icon={Users} accentColor="#1E1E1E" tint="radial-gradient(circle at 100% 0%, rgba(30,30,30,0.04), transparent 70%)" />
        <KPICard index={2} title={t('admin.recycling_rate')} value={`${overview?.recycling_rate ?? 0}%`}
          subtitle="бутылок переработано" icon={Recycle} accentColor="#00A651" tint="radial-gradient(circle at 100% 0%, rgba(0,166,81,0.06), transparent 70%)" />
        <KPICard index={3} title={t('admin.co2_saved')} value={`${overview?.co2_saved_kg ?? 0} кг`}
          subtitle="CO₂ сегодня" icon={Leaf} accentColor="#10B981" tint="radial-gradient(circle at 100% 0%, rgba(16,185,129,0.06), transparent 70%)" />
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
            <div className="flex items-center gap-1.5 bg-red-50 text-brand-red rounded-full px-3 py-1.5 text-[11px] font-bold">
              <motion.div animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.5, repeat: Infinity }} className="w-1.5 h-1.5 bg-brand-red rounded-full" />
              Live
            </div>
          </div>
          {chartData?.length ? (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="redGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#F40009" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="#F40009" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} interval={4} />
                <YAxis tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} width={30} />
                <Tooltip contentStyle={customTooltipStyle} formatter={(v: number) => [v, 'Сканирований']} labelStyle={{ color: '#9CA3AF' }} cursor={{ stroke: '#F40009', strokeWidth: 1, strokeDasharray: '3' }} />
                <Area type="monotone" dataKey="value" stroke="#F40009" strokeWidth={2.5} fill="url(#redGrad)" dot={false} activeDot={{ r: 5, fill: '#F40009', strokeWidth: 0 }} animationDuration={1500} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-56 flex items-center justify-center">
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.9, repeat: Infinity, ease: 'linear' }} className="w-8 h-8 border-[3px] border-brand-red border-t-transparent rounded-full" />
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
            <motion.div animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.5, repeat: Infinity }} className="w-2 h-2 bg-brand-eco rounded-full" />
            <h3 className="font-black text-white text-sm">{t('admin.live_feed')}</h3>
          </div>
          <div className="space-y-0 max-h-64 overflow-y-auto">
            {overview?.live_feed?.length ? overview.live_feed.map((item: { text: string; region: string; type?: string }, i: number) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 14 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                className="py-3 border-b border-white/8 last:border-0"
              >
                <div className="flex items-start gap-2.5">
                  <div className={`w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${item.type === 'recycle' ? 'bg-brand-eco/20' : 'bg-brand-red/20'}`}>
                    {item.type === 'recycle'
                      ? <Recycle size={13} className="text-brand-eco" />
                      : <Zap size={13} className="text-brand-red" />}
                  </div>
                  <div>
                    <p className="text-white/85 text-xs font-semibold leading-snug">{item.text}</p>
                    <p className="text-white/30 text-[10px] mt-0.5">{item.region}</p>
                  </div>
                </div>
              </motion.div>
            )) : (
              <div className="py-8 text-center">
                <Activity size={24} className="text-white/20 mx-auto mb-2" />
                <p className="text-white/30 text-xs">Загрузка активности...</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Region recycling rates bar chart */}
      {regionData?.length ? (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-3xl p-6 shadow-sm"
        >
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-black text-brand-charcoal">Переработка по регионам</h3>
              <p className="text-gray-400 text-xs mt-0.5">% от купленных бутылок</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={regionData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F5F5F5" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} unit="%" width={36} />
              <Tooltip
                contentStyle={customTooltipStyle}
                formatter={(v: number) => [`${v}%`, 'Переработка']}
                cursor={{ fill: 'rgba(244,0,9,0.04)' }}
              />
              <Bar dataKey="rate" name="%" radius={[8, 8, 0, 0]} animationDuration={1200}>
                {regionData.map((_: unknown, i: number) => (
                  <Cell key={i} fill={['#F40009', '#FF6B35', '#FFB800', '#00A651', '#6C63FF'][i % 5]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      ) : null}
    </div>
  )
}
