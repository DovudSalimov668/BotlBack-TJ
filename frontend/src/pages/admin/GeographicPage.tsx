import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AnimatedCounter } from '@/components/AnimatedCounter'
import { useRegions, useMapData, useSKUs } from '@/api/analytics'
import 'leaflet/dist/leaflet.css'

const REGION_COLORS: Record<string, string> = {
  dushanbe: '#F40009',
  sughd: '#FF6B35',
  khatlon: '#6C63FF',
  gbao: '#00A651',
  rrs: '#0EA5E9',
}

export default function GeographicPage() {
  const { t } = useTranslation()
  const { data: regions } = useRegions()
  const { data: mapPoints } = useMapData()
  const { data: skus } = useSKUs()
  const [activeRegion, setActiveRegion] = useState<string | null>(null)

  const filteredPoints = activeRegion
    ? (mapPoints ?? []).filter((p: { region: string }) => p.region === activeRegion)
    : (mapPoints ?? [])

  const maxCount = Math.max(...(filteredPoints.map((p: { scan_count: number }) => p.scan_count) ?? [1]), 1)

  const chartData = regions?.map((r: { region: string; bottles_purchased: number; bottles_recycled: number; recycling_rate: number }) => ({
    name: t(`regions.${r.region}`),
    purchased: r.bottles_purchased,
    recycled: r.bottles_recycled,
    rate: r.recycling_rate,
    color: REGION_COLORS[r.region] ?? '#aaa',
  }))

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-black text-brand-charcoal">{t('admin.geographic')}</h1>
        <p className="text-gray-500 text-sm mt-1">Распределение активности по регионам Таджикистана</p>
      </div>

      {/* Region filter pills */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setActiveRegion(null)}
          className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
            !activeRegion ? 'bg-brand-red text-white shadow' : 'bg-white border border-gray-200 text-gray-600 hover:border-brand-red'
          }`}
        >
          Все регионы
        </button>
        {regions?.map((r: { region: string }) => (
          <button
            key={r.region}
            onClick={() => setActiveRegion(r.region === activeRegion ? null : r.region)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
              activeRegion === r.region ? 'text-white shadow' : 'bg-white border border-gray-200 text-gray-600 hover:border-brand-red'
            }`}
            style={activeRegion === r.region ? { background: REGION_COLORS[r.region] } : {}}
          >
            {t(`regions.${r.region}`)}
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Map */}
        <div className="lg:col-span-2">
          <Card className="overflow-hidden">
            <div style={{ height: 440 }}>
              <MapContainer
                center={[38.8, 71.0]}
                zoom={7}
                className="h-full w-full"
                zoomControl={true}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {filteredPoints.map((point: { id: number; name: string; lat: number; lon: number; scan_count: number; region: string }) => {
                  const intensity = point.scan_count / maxCount
                  const radius = Math.max(7, Math.sqrt(point.scan_count + 1) * 3.5)
                  const color = REGION_COLORS[point.region] ?? '#F40009'
                  return (
                    <CircleMarker
                      key={point.id}
                      center={[point.lat, point.lon]}
                      radius={radius}
                      fillColor={color}
                      fillOpacity={0.4 + intensity * 0.5}
                      color={color}
                      weight={2}
                    >
                      <Popup>
                        <div className="text-sm">
                          <strong>{point.name}</strong><br />
                          <span className="text-gray-500">Регион: {t(`regions.${point.region}`)}</span><br />
                          <span className="font-bold text-red-600">Скан: {point.scan_count}</span>
                        </div>
                      </Popup>
                    </CircleMarker>
                  )
                })}
              </MapContainer>
            </div>
          </Card>
        </div>

        {/* Region sidebar */}
        <div className="space-y-3">
          {regions?.map((r: { region: string; bottles_purchased: number; bottles_recycled: number; recycling_rate: number; users: number }, i: number) => (
            <motion.div
              key={r.region}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.07 }}
            >
              <Card
                className={`shadow-sm cursor-pointer transition-all ${activeRegion === r.region ? 'ring-2 ring-offset-1' : 'hover:shadow-md'}`}
                style={activeRegion === r.region ? { '--tw-ring-color': REGION_COLORS[r.region] } as React.CSSProperties : {}}
                onClick={() => setActiveRegion(r.region === activeRegion ? null : r.region)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ background: REGION_COLORS[r.region] }} />
                      <h3 className="font-bold text-gray-800 text-sm">{t(`regions.${r.region}`)}</h3>
                    </div>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      r.recycling_rate >= 50 ? 'bg-green-100 text-green-700' :
                      r.recycling_rate >= 30 ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {r.recycling_rate}%
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-1 text-center">
                    <div>
                      <AnimatedCounter value={r.bottles_purchased} className="text-base font-black text-brand-charcoal block" />
                      <p className="text-[10px] text-gray-400">куплено</p>
                    </div>
                    <div>
                      <AnimatedCounter value={r.bottles_recycled} className="text-base font-black text-green-600 block" />
                      <p className="text-[10px] text-gray-400">перераб.</p>
                    </div>
                    <div>
                      <AnimatedCounter value={r.users} className="text-base font-black text-blue-600 block" />
                      <p className="text-[10px] text-gray-400">польз.</p>
                    </div>
                  </div>
                  <div className="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full rounded-full transition-all duration-1000"
                      style={{ background: REGION_COLORS[r.region], width: `${r.recycling_rate}%` }}
                    />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Comparison bar chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Куплено vs Переработано по регионам</CardTitle>
        </CardHeader>
        <CardContent>
          <div style={{ height: 240 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="purchased" name="Куплено" radius={[4, 4, 0, 0]} fill="#e5e7eb">
                  {chartData?.map((entry: { color: string }, index: number) => (
                    <Cell key={index} fill={`${entry.color}40`} />
                  ))}
                </Bar>
                <Bar dataKey="recycled" name="Переработано" radius={[4, 4, 0, 0]}>
                  {chartData?.map((entry: { color: string }, index: number) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* SKU breakdown table */}
      {skus && skus.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Эффективность по SKU</CardTitle>
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">Продукт</th>
                  <th className="text-right px-4 py-3 text-gray-500 font-medium">Куплено</th>
                  <th className="text-right px-4 py-3 text-gray-500 font-medium">Переработано</th>
                  <th className="text-right px-4 py-3 text-gray-500 font-medium">Recycling Rate</th>
                  <th className="px-4 py-3 w-32" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {[...skus].sort((a: { recycling_rate: number }, b: { recycling_rate: number }) => b.recycling_rate - a.recycling_rate).map((sku: {
                  id: number; name: string; brand: string; scanned: number; recycled: number; recycling_rate: number
                }, i: number) => (
                  <motion.tr
                    key={sku.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.04 }}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-semibold text-gray-800">{sku.name}</p>
                        <p className="text-xs text-gray-400">{sku.brand}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right text-gray-600">{sku.scanned.toLocaleString('ru')}</td>
                    <td className="px-4 py-3 text-right font-semibold text-green-600">{sku.recycled.toLocaleString('ru')}</td>
                    <td className="px-4 py-3 text-right">
                      <span className={`font-bold ${sku.recycling_rate >= 50 ? 'text-green-600' : sku.recycling_rate >= 30 ? 'text-yellow-600' : 'text-red-500'}`}>
                        {sku.recycling_rate}%
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-brand-red rounded-full"
                          style={{ width: `${sku.recycling_rate}%` }}
                        />
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
