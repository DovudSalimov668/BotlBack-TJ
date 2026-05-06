import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import { useTimeSeries, useSKUs } from '@/api/analytics'
import { TrendingUp, BarChart3, Package } from 'lucide-react'

const periods = [
  { key: '7d',  label: '7 дней'  },
  { key: '30d', label: '30 дней' },
  { key: '90d', label: '90 дней' },
]
const metrics = [
  { key: 'scans',     label: 'Все сканы',   color: '#F40009' },
  { key: 'purchased', label: 'Покупки',     color: '#FF6B35' },
  { key: 'recycled',  label: 'Переработка', color: '#00A651' },
]

const tipStyle = {
  background: '#1E1E1E', border: 'none', borderRadius: 14,
  fontSize: 12, color: '#fff', boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
}

function Panel({ children, title, subtitle, right }: { children: React.ReactNode; title: string; subtitle?: string; right?: React.ReactNode }) {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-3xl p-6 shadow-sm">
      <div className="flex items-start justify-between mb-5">
        <div>
          <h3 className="font-black text-brand-charcoal">{title}</h3>
          {subtitle && <p className="text-gray-400 text-xs mt-0.5">{subtitle}</p>}
        </div>
        {right}
      </div>
      {children}
    </motion.div>
  )
}

function Spinner() {
  return (
    <div className="flex items-center justify-center h-64">
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.9, repeat: Infinity, ease: 'linear' }} className="w-8 h-8 border-[3px] border-brand-red border-t-transparent rounded-full" />
    </div>
  )
}

export default function TimeSeriesPage() {
  const [period, setPeriod] = useState('30d')
  const [metric, setMetric] = useState('scans')
  const activeMeta = metrics.find((m) => m.key === metric)!

  const { data: mainData }     = useTimeSeries(metric, period)
  const { data: recycledData } = useTimeSeries('recycled', period)
  const { data: skus }         = useSKUs()

  const combined = mainData?.map((d: { date: string; value: number }, i: number) => ({
    date: d.date.slice(5),
    [metric]: d.value,
    recycled: recycledData?.[i]?.value ?? 0,
  }))

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-brand-red rounded-xl flex items-center justify-center">
            <TrendingUp size={16} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-brand-charcoal">Динамика</h1>
            <p className="text-gray-400 text-xs mt-0.5">Сканирования и переработка</p>
          </div>
        </div>
        {/* Period toggle */}
        <div className="flex gap-1.5 bg-gray-100 rounded-2xl p-1">
          {periods.map((p) => (
            <motion.button key={p.key} whileTap={{ scale: 0.95 }} onClick={() => setPeriod(p.key)}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${period === p.key ? 'bg-white text-brand-charcoal shadow-sm' : 'text-gray-500'}`}>
              {p.label}
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Metric pills */}
      <div className="flex gap-2">
        {metrics.map((m) => (
          <motion.button
            key={m.key}
            whileTap={{ scale: 0.95 }}
            onClick={() => setMetric(m.key)}
            className="flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold border-2 transition-all"
            style={metric === m.key
              ? { background: m.color, borderColor: m.color, color: '#fff' }
              : { background: '#fff', borderColor: '#E5E7EB', color: '#6B7280' }}
          >
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: metric === m.key ? '#fff' : m.color }} />
            {m.label}
          </motion.button>
        ))}
      </div>

      {/* Area chart */}
      <Panel
        title="Сканирования и переработка"
        subtitle={`Период: ${periods.find((p) => p.key === period)?.label}`}
        right={
          <div className="flex items-center gap-4 text-xs font-semibold">
            <span className="flex items-center gap-1.5" style={{ color: activeMeta.color }}>
              <span className="w-4 h-0.5 rounded inline-block" style={{ background: activeMeta.color }} />
              {activeMeta.label}
            </span>
            <span className="flex items-center gap-1.5 text-brand-eco">
              <span className="w-4 h-0.5 rounded bg-brand-eco inline-block" />
              Переработка
            </span>
          </div>
        }
      >
        {combined?.length ? (
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={combined} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="gA" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={activeMeta.color} stopOpacity={0.25} />
                  <stop offset="95%" stopColor={activeMeta.color} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gB" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00A651" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#00A651" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F5F5F5" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} interval={period === '90d' ? 9 : period === '30d' ? 4 : 1} />
              <YAxis tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} width={32} />
              <Tooltip contentStyle={tipStyle} cursor={{ stroke: activeMeta.color, strokeWidth: 1, strokeDasharray: '3' }} />
              <Area type="monotone" dataKey={metric} name={activeMeta.label} stroke={activeMeta.color} fill="url(#gA)" strokeWidth={2.5} dot={false} activeDot={{ r: 4, strokeWidth: 0 }} animationDuration={1200} />
              <Area type="monotone" dataKey="recycled" name="Переработано" stroke="#00A651" fill="url(#gB)" strokeWidth={2} dot={false} activeDot={{ r: 4, strokeWidth: 0 }} animationDuration={1200} />
            </AreaChart>
          </ResponsiveContainer>
        ) : <Spinner />}
      </Panel>

      {/* SKU bar chart */}
      <Panel
        title="Переработка по SKU"
        subtitle="Куплено vs переработано"
        right={<div className="w-8 h-8 bg-orange-50 rounded-xl flex items-center justify-center"><Package size={16} className="text-orange-500" /></div>}
      >
        {skus?.length ? (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={skus} margin={{ top: 0, right: 0, left: -20, bottom: 0 }} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F5F5F5" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 9, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} width={32} />
              <Tooltip contentStyle={tipStyle} cursor={{ fill: 'rgba(244,0,9,0.04)' }} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, paddingTop: 12 }} />
              <Bar dataKey="scanned"  name="Куплено"      fill="#fca5a5" radius={[6, 6, 0, 0]} animationDuration={1000} />
              <Bar dataKey="recycled" name="Переработано" fill="#F40009"  radius={[6, 6, 0, 0]} animationDuration={1000} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-48 flex items-center justify-center">
            <BarChart3 size={32} className="text-gray-200" />
          </div>
        )}
      </Panel>
    </div>
  )
}
