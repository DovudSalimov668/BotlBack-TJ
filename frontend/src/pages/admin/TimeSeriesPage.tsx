import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useTimeSeries, useSKUs } from '@/api/analytics'

const periods = ['7d', '30d', '90d']
const metrics = [
  { key: 'scans', label: 'Все сканы' },
  { key: 'purchased', label: 'Покупки' },
  { key: 'recycled', label: 'Переработка' },
]

export default function TimeSeriesPage() {
  const { t } = useTranslation()
  const [period, setPeriod] = useState('30d')
  const [metric, setMetric] = useState('scans')

  const { data: mainData } = useTimeSeries(metric, period)
  const { data: recycledData } = useTimeSeries('recycled', period)
  const { data: purchasedData } = useTimeSeries('purchased', period)
  const { data: skus } = useSKUs()

  const combinedData = mainData?.map((d: { date: string; value: number }, i: number) => ({
    date: d.date.slice(5),
    scans: d.value,
    recycled: recycledData?.[i]?.value ?? 0,
  }))

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-brand-charcoal">{t('admin.timeseries')}</h1>
          <p className="text-gray-500 text-sm mt-1">Динамика за выбранный период</p>
        </div>
        <div className="flex gap-2">
          {periods.map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold border transition-all ${period === p ? 'bg-brand-red text-white border-brand-red' : 'bg-white text-gray-600 border-gray-200'}`}
            >
              {t(`admin.days${p.replace('d', '')}`)}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-2 mb-2">
        {metrics.map((m) => (
          <button
            key={m.key}
            onClick={() => setMetric(m.key)}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${metric === m.key ? 'bg-brand-charcoal text-white' : 'bg-gray-100 text-gray-600'}`}
          >
            {m.label}
          </button>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Сканирования и переработка</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={combinedData}>
              <defs>
                <linearGradient id="gradScans" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F40009" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#F40009" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradRecycled" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey="scans" name="Сканирований" stroke="#F40009" fill="url(#gradScans)" strokeWidth={2} animationDuration={1500} />
              <Area type="monotone" dataKey="recycled" name="Переработано" stroke="#22c55e" fill="url(#gradRecycled)" strokeWidth={2} animationDuration={1500} />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Переработка по SKU</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={skus ?? []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="recycled" name="Переработано" fill="#F40009" radius={[6, 6, 0, 0]} animationDuration={1200} />
              <Bar dataKey="scanned" name="Куплено" fill="#fca5a5" radius={[6, 6, 0, 0]} animationDuration={1200} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
