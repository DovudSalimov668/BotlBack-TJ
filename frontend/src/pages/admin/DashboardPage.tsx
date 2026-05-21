import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import { TrendingUp, TrendingDown, Users, Recycle, Leaf, Package, Zap, BarChart3, Globe, Clock } from 'lucide-react'
import {
  AreaChart, Area, ResponsiveContainer, Tooltip, XAxis, YAxis,
  BarChart, Bar, CartesianGrid, Cell,
} from 'recharts'
import { NumberRoll } from '@/components/NumberRoll'
import { CHART_COLORS } from '@/lib/regions'
import { useOverview, useTimeSeries, useRegions, useLiveFeed } from '@/api/analytics'
import { useState, useEffect, useRef } from 'react'

/* ─── Ticking live bottle counter ─── */

/* ─── Ticking live bottle counter ─── */
function useLiveCounter(base: number) {
  const [count, setCount] = useState(base)
  useEffect(() => {
    const t = setInterval(() => {
      if (Math.random() > 0.6) setCount((c) => c + Math.ceil(Math.random() * 3))
    }, 3500)
    return () => clearInterval(t)
  }, [base])
  return count
}

type KPICardProps = {
  title: string
  value: number | string
  subtitle?: string
  icon: React.ElementType
  accentColor: string
  tint: string
  trend?: number
  index: number
  live?: boolean
}

function KPICard({ title, value, subtitle, icon: Icon, accentColor, tint, trend, index, live }: KPICardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07, type: 'spring', damping: 18 }}
      whileHover={{ y: -4, scale: 1.02 }}
      className="bg-white rounded-3xl p-5 shadow-sm relative overflow-hidden group cursor-default"
    >
      {/* Animated tint bg */}
      <div className="absolute inset-0 opacity-60 transition-opacity group-hover:opacity-80" style={{ background: tint }} />
      {/* Top accent bar */}
      <div className="absolute top-0 left-5 right-5 h-[2px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: accentColor }} />
      <div className="relative">
        <div className="flex items-start justify-between mb-4">
          <p className="text-gray-500 text-xs font-bold uppercase tracking-wider leading-tight pr-2">{title}</p>
          <div className="flex items-center gap-2">
            {live && (
              <div className="flex items-center gap-1 bg-red-50 rounded-full px-2 py-0.5">
                <motion.div animate={{ opacity: [1, 0.2, 1] }} transition={{ duration: 1.2, repeat: Infinity }} className="w-1.5 h-1.5 bg-brand-red rounded-full" />
                <span className="text-[9px] font-black text-brand-red uppercase tracking-wider">Live</span>
              </div>
            )}
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: accentColor + '18' }}>
              <Icon size={18} style={{ color: accentColor }} />
            </div>
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
  const { data: liveFeedData } = useLiveFeed()

  const trend = overview
    ? overview.bottles_yesterday > 0
      ? Math.round(((overview.bottles_today - overview.bottles_yesterday) / overview.bottles_yesterday) * 100)
      : 0
    : 0

  const liveBottles = useLiveCounter(overview?.bottles_today ?? 0)

  // Merge API live feed with seeded overview feed
  const rawFeed: Array<{ id: number | string; type: string; text: string; region: string; time?: string; ts?: string }> =
    liveFeedData?.length
      ? liveFeedData
      : (overview?.live_feed ?? [])

  const feed = rawFeed.map((e) => ({
    ...e,
    ts: e.ts ?? (e.time ? new Date(e.time).toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : ''),
  }))

  const chartData = timeSeries?.map((d: { date: string; value: number }) => ({
    date: d.date.slice(5),
    value: d.value,
  }))

  const regionData = regions?.map((r: { region: string; recycling_rate: number; bottles_recycled: number }) => ({
    name: t(`regions.${r.region}`),
    rate: Math.round(r.recycling_rate * 10) / 10,
    recycled: r.bottles_recycled,
  }))

  /* ── Current time ── */
  const [now, setNow] = useState(new Date())
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* ── Dramatic header ── */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative rounded-3xl overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0A0A0A 0%, #1a0004 50%, #0A0A0A 100%)' }}
      >
        {/* Aurora-ish bg */}
        <div className="absolute inset-0 pointer-events-none" style={{
          background: 'radial-gradient(ellipse at 20% 50%, rgba(244,0,9,0.3) 0%, transparent 60%), radial-gradient(ellipse at 80% 50%, rgba(180,0,6,0.2) 0%, transparent 60%)',
        }} />
        {/* Scan line */}
        <motion.div
          className="absolute inset-x-0 h-px opacity-25"
          style={{ background: 'linear-gradient(90deg, transparent, #F40009, transparent)' }}
          animate={{ top: ['0%', '100%', '0%'] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
        />

        <div className="relative z-10 flex items-center justify-between px-8 py-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 bg-brand-eco rounded-full">
                <motion.div animate={{ scale: [1, 1.8, 1], opacity: [0.7, 0, 0.7] }} transition={{ duration: 2, repeat: Infinity }} className="w-full h-full rounded-full bg-brand-eco" />
              </div>
              <span className="text-brand-eco text-[10px] font-black tracking-[0.25em] uppercase">Система активна</span>
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight">{t('admin.overview')}</h1>
            <p className="text-white/40 text-sm mt-0.5">CCI Tajikistan · Аналитика реального времени</p>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2 text-white/50 text-xs">
              <Clock size={12} />
              <span className="font-mono tabular">{now.toLocaleTimeString('ru')}</span>
            </div>
            <div className="flex items-center gap-2 mt-1 text-white/30 text-[10px]">
              <Globe size={10} />
              <span>Душанбе UTC+5</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* KPI grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard index={0} title={t('admin.bottles_today')} value={liveBottles}
          icon={Package} accentColor="#F40009"
          tint="radial-gradient(circle at 100% 0%, rgba(244,0,9,0.07), transparent 70%)"
          trend={trend} live />
        <KPICard index={1} title={t('admin.active_users')} value={overview?.active_users ?? 0}
          subtitle="уникальных сегодня" icon={Users} accentColor="#1E1E1E"
          tint="radial-gradient(circle at 100% 0%, rgba(30,30,30,0.04), transparent 70%)" />
        <KPICard index={2} title={t('admin.recycling_rate')} value={`${overview?.recycling_rate ?? 0}%`}
          subtitle="от купленных бутылок" icon={Recycle} accentColor="#00A651"
          tint="radial-gradient(circle at 100% 0%, rgba(0,166,81,0.07), transparent 70%)" />
        <KPICard index={3} title={t('admin.co2_saved')} value={`${overview?.co2_saved_kg ?? 0} кг`}
          subtitle="CO₂ сегодня" icon={Leaf} accentColor="#10B981"
          tint="radial-gradient(circle at 100% 0%, rgba(16,185,129,0.07), transparent 70%)" />
      </div>

      {/* Chart + Live feed */}
      <div className="grid lg:grid-cols-3 gap-5">
        {/* Area chart */}
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
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 bg-red-50 text-brand-red rounded-full px-3 py-1.5 text-[11px] font-bold">
                <motion.div animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.5, repeat: Infinity }} className="w-1.5 h-1.5 bg-brand-red rounded-full" />
                Live
              </div>
            </div>
          </div>
          {chartData?.length ? (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={chartData} margin={{ top: 4, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="redGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#F40009" stopOpacity={0.3} />
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

        {/* Live event feed */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="rounded-3xl overflow-hidden shadow-sm flex flex-col"
          style={{ background: '#0A0A0A' }}
        >
          <div className="flex items-center gap-2 px-5 py-4 border-b border-white/5">
            <motion.div animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.5, repeat: Infinity }} className="w-2 h-2 bg-brand-eco rounded-full" />
            <h3 className="font-black text-white text-sm">Активность</h3>
            <span className="ml-auto text-white/20 text-[10px] font-mono">{feed.length} событий</span>
          </div>
          <div className="flex-1 overflow-y-auto max-h-72 px-3 py-2">
            <AnimatePresence initial={false}>
              {feed.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, height: 0, y: -8 }}
                  animate={{ opacity: 1, height: 'auto', y: 0 }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.28, ease: 'easeOut' }}
                  className="py-2.5 border-b border-white/5 last:border-0"
                >
                  <div className="flex items-start gap-2.5">
                    <div className={`w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${item.type === 'recycle' ? 'bg-brand-eco/15' : 'bg-brand-red/15'}`}>
                      {item.type === 'recycle'
                        ? <Recycle size={12} className="text-brand-eco" />
                        : <Zap size={12} className="text-brand-red" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white/85 text-[11px] font-semibold leading-snug">{item.text}</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-white/25 text-[9px]">{item.region}</span>
                        <span className="text-white/15 text-[9px]">·</span>
                        <span className="text-white/20 text-[9px] font-mono">{item.ts}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>

      {/* Region recycling rates */}
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
            <div className="w-8 h-8 bg-green-50 rounded-xl flex items-center justify-center">
              <BarChart3 size={16} className="text-brand-eco" />
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
                  <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      ) : null}
    </div>
  )
}
