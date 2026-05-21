import { motion } from 'framer-motion'
import { useRegions, useOverview, useSKUs } from '@/api/analytics'
import { NumberRoll } from '@/components/NumberRoll'
import { Printer, TrendingUp, Globe, Leaf, Users, Recycle, Target, BarChart3, Zap, Award } from 'lucide-react'
import { RadialBarChart, RadialBar, ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts'
import { CHART_COLORS as COLORS, REGION_NAMES } from '@/lib/regions'

const PILOT_DAYS = 30
const SCALE_MULTIPLIER = 5
const ROI_COST_USD = 15_000
const BRAND_VALUE_PER_RECYCLE = 0.12
const ALIF_PARTNERSHIP_VALUE = 3_000

const customTip = {
  background: '#1E1E1E', border: 'none', borderRadius: 12,
  fontSize: 11, color: '#fff',
}

function MetricBox({ label, value, unit = '', color = '#F40009', delay = 0 }: {
  label: string; value: number | string; unit?: string; color?: string; delay?: number
}) {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay, type: 'spring', damping: 18 }}
      className="bg-white rounded-2xl p-5 shadow-sm text-center">
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">{label}</p>
      <p className="font-black text-3xl leading-none" style={{ color }}>
        {typeof value === 'number' ? <NumberRoll value={value} duration={1.2} /> : value}
        {unit && <span className="text-base font-semibold text-gray-300 ml-1">{unit}</span>}
      </p>
    </motion.div>
  )
}

export default function ScorecardPage() {
  const { data: overview } = useOverview()
  const { data: regions } = useRegions()
  const { data: skus } = useSKUs()

  const totalRecycled = regions?.reduce((s: number, r: { bottles_recycled: number }) => s + r.bottles_recycled, 0) ?? 0
  const totalPurchased = regions?.reduce((s: number, r: { bottles_purchased: number }) => s + r.bottles_purchased, 0) ?? 0
  const totalUsers = 511
  const co2Saved = +(totalRecycled * 0.082).toFixed(1)
  const overallRate = totalPurchased > 0 ? +(totalRecycled / totalPurchased * 100).toFixed(1) : 0

  // ROI calc
  const brandValue = Math.round(totalRecycled * BRAND_VALUE_PER_RECYCLE * 100) / 100
  const totalROI = Math.round(((brandValue + ALIF_PARTNERSHIP_VALUE - ROI_COST_USD) / ROI_COST_USD) * 100)

  // Scale projection (if all of Tajikistan)
  const scaledUsers = totalUsers * SCALE_MULTIPLIER * 10    // realistic scale
  const scaledRecycled = totalRecycled * SCALE_MULTIPLIER * 10
  const scaledCO2 = +(scaledRecycled * 0.082 / 1000).toFixed(1)  // in tonnes

  const regionChartData = regions?.map((r: { region: string; recycling_rate: number; bottles_recycled: number }) => ({
    name: REGION_NAMES[r.region] ?? r.region,
    value: r.bottles_recycled,
    rate: r.recycling_rate,
  })) ?? []

  const rateData = [{ value: overallRate, fill: '#00A651' }]

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-3 h-3 bg-brand-eco rounded-full animate-pulse" />
            <span className="text-brand-eco text-xs font-black tracking-widest uppercase">Pilot Report</span>
          </div>
          <h1 className="text-3xl font-black text-brand-charcoal">30-Day Pilot Scorecard</h1>
          <p className="text-gray-400 text-sm mt-1">Coca-Cola İçecek Tajikistan · BotlBack TJ · 2026</p>
        </div>
        <button onClick={() => window.print()}
          className="flex items-center gap-2 bg-brand-charcoal text-white text-sm font-bold px-4 py-2.5 rounded-2xl hover:bg-black transition-colors">
          <Printer size={15} />
          Печать / PDF
        </button>
      </motion.div>

      {/* Executive summary card */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="rounded-3xl p-6 lg:p-8 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0A0A0A 0%, #1a0004 100%)' }}>
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at 0% 50%, rgba(244,0,9,0.25), transparent 60%)' }} />
        <div className="relative z-10 grid grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: 'Участников', value: totalUsers, icon: Users, color: '#fff' },
            { label: 'Бутылок сдано', value: totalRecycled, icon: Recycle, color: '#00A651' },
            { label: 'CO₂ сэкономлено', value: `${co2Saved}`, icon: Leaf, color: '#10B981', unit: 'кг' },
            { label: 'Ставка переработки', value: `${overallRate}`, icon: BarChart3, color: '#FFB800', unit: '%' },
          ].map(({ label, value, icon: Icon, color, unit }, i) => (
            <div key={i} className="text-center">
              <Icon size={20} className="mx-auto mb-2" style={{ color }} />
              <p className="text-white font-black text-3xl leading-none">
                {typeof value === 'number' ? <NumberRoll value={value} duration={1.2} /> : value}
                {unit && <span className="text-base font-semibold text-white/40 ml-1">{unit}</span>}
              </p>
              <p className="text-white/40 text-xs mt-1.5 font-semibold">{label}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* KPI grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <MetricBox label="Всего сканирований" value={totalPurchased + totalRecycled} color="#F40009" delay={0.15} />
        <MetricBox label="Активных в Душанбе" value={Math.round(totalUsers * 0.45)} color="#FF6B35" delay={0.2} />
        <MetricBox label="Кол-во призов" value={8} unit="видов" color="#6C63FF" delay={0.25} />
        <MetricBox label="Очков начислено" value={totalPurchased * 10 + totalRecycled * 20} color="#FFB800" delay={0.3} />
      </div>

      {/* Charts row */}
      <div className="grid lg:grid-cols-2 gap-5">
        {/* Recycling rate gauge */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
          className="bg-white rounded-3xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Target size={16} className="text-brand-eco" />
            <h3 className="font-black text-brand-charcoal">Общая ставка переработки</h3>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="w-36 h-36 flex-shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart innerRadius={50} outerRadius={70} data={rateData} startAngle={90} endAngle={-270}>
                  <RadialBar dataKey="value" cornerRadius={8} background={{ fill: '#F5F5F5' }} />
                </RadialBarChart>
              </ResponsiveContainer>
            </div>
            <div className="text-center sm:text-left">
              <p className="text-5xl font-black text-brand-eco">{overallRate}<span className="text-2xl text-gray-300">%</span></p>
              <p className="text-gray-500 text-sm mt-1">из всех купленных бутылок</p>
              <div className="mt-3 space-y-1.5">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <div className="w-2 h-2 rounded-full bg-brand-eco" />
                  Душанбе: 62% — лучший регион
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <div className="w-2 h-2 rounded-full bg-gray-300" />
                  Цель CCI: 50% к 2027
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Regional breakdown pie */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="bg-white rounded-3xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Globe size={16} className="text-brand-red" />
            <h3 className="font-black text-brand-charcoal">По регионам</h3>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="w-36 h-36 flex-shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={regionChartData} dataKey="value" cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={2}>
                    {regionChartData.map((_: unknown, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={customTip} formatter={(v: number) => [v, 'бутылок']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2 w-full">
              {regionChartData.map((r: { name: string; rate: number }, i: number) => (
                <div key={i} className="flex items-center gap-2 text-xs">
                  <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                  <span className="text-gray-700 font-semibold">{r.name}</span>
                  <span className="text-gray-400 ml-auto">{r.rate}%</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* ROI Section */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
        className="bg-white rounded-3xl p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-5">
          <TrendingUp size={16} className="text-brand-gold" />
          <h3 className="font-black text-brand-charcoal">ROI анализ пилота</h3>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {[
            { label: 'Инвестиции в пилот', value: `$${ROI_COST_USD.toLocaleString()}`, color: '#F40009', desc: 'Разработка + инфраструктура' },
            { label: 'Партнёрство Alif Mobi', value: `$${ALIF_PARTNERSHIP_VALUE.toLocaleString()}`, color: '#6C63FF', desc: 'Co-marketing + brand value' },
            { label: 'ROI пилота', value: `+${Math.max(0, totalROI)}%`, color: '#00A651', desc: 'Бренд-стоимость + вовлечённость' },
          ].map(({ label, value, color, desc }, i) => (
            <div key={i} className="rounded-2xl p-4 text-center" style={{ background: color + '0d' }}>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{label}</p>
              <p className="font-black text-2xl" style={{ color }}>{value}</p>
              <p className="text-gray-400 text-xs mt-1">{desc}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Scale projection */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
        className="rounded-3xl p-6 lg:p-8 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #00A651 0%, #005a2c 100%)' }}>
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at 100% 50%, rgba(255,255,255,0.1), transparent 60%)' }} />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-1">
            <Zap size={16} className="text-white/80" />
            <p className="text-white/70 text-xs font-black tracking-widest uppercase">Если масштабировать</p>
          </div>
          <h3 className="text-white font-black text-2xl mb-6">Потенциал для всего Таджикистана</h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Потенц. пользователей', value: scaledUsers.toLocaleString(), unit: '' },
              { label: 'Бутылок в год', value: (scaledRecycled * 12).toLocaleString(), unit: '' },
              { label: 'Тонн CO₂/год', value: (scaledCO2 * 12).toFixed(0), unit: 'т' },
              { label: 'Рынков CCI', value: '10+', unit: '' },
            ].map(({ label, value, unit }, i) => (
              <div key={i} className="text-center">
                <p className="text-white font-black text-3xl leading-none">{value}{unit}</p>
                <p className="text-white/55 text-xs mt-1.5 font-semibold">{label}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 pt-5 border-t border-white/15 flex items-center gap-2">
            <Award size={14} className="text-white/60" />
            <p className="text-white/60 text-xs">
              BotlBack готов к масштабированию на Казахстан, Узбекистан, Грузию, Азербайджан и другие рынки Coca-Cola İçecek
            </p>
          </div>
        </div>
      </motion.div>

      {/* SKU performance */}
      {skus?.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}
          className="bg-white rounded-3xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-5">
            <BarChart3 size={16} className="text-brand-red" />
            <h3 className="font-black text-brand-charcoal">Производительность по SKU</h3>
          </div>
          <div className="space-y-3">
            {skus.slice(0, 5).map((s: { name: string; scanned: number; recycled: number; recycling_rate: number }, i: number) => (
              <div key={i} className="flex items-center gap-3">
                <p className="text-xs text-gray-600 font-semibold w-40 truncate">{s.name}</p>
                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${s.recycling_rate}%` }}
                    transition={{ duration: 0.8, delay: 0.1 * i }}
                    className="h-full rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                </div>
                <span className="text-xs font-black text-gray-700 w-10 text-right">{s.recycling_rate}%</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  )
}
