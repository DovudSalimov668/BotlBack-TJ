import { useTranslation } from 'react-i18next'
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AnimatedCounter } from '@/components/AnimatedCounter'
import { useRegions, useMapData } from '@/api/analytics'
import 'leaflet/dist/leaflet.css'

export default function GeographicPage() {
  const { t } = useTranslation()
  const { data: regions } = useRegions()
  const { data: mapPoints } = useMapData()

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-black text-brand-charcoal">{t('admin.geographic')}</h1>
        <p className="text-gray-500 text-sm mt-1">Распределение по регионам Таджикистана</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="overflow-hidden">
            <div style={{ height: 480 }}>
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
                {mapPoints?.map((point: { id: number; name: string; lat: number; lon: number; scan_count: number; region: string }) => (
                  <CircleMarker
                    key={point.id}
                    center={[point.lat, point.lon]}
                    radius={Math.max(6, Math.sqrt(point.scan_count + 1) * 3)}
                    fillColor="#F40009"
                    fillOpacity={0.75}
                    color="#c00005"
                    weight={2}
                  >
                    <Popup>
                      <strong>{point.name}</strong><br />
                      Сканирований: {point.scan_count}<br />
                      Регион: {t(`regions.${point.region}`)}
                    </Popup>
                  </CircleMarker>
                ))}
              </MapContainer>
            </div>
          </Card>
        </div>

        <div className="space-y-3">
          {regions?.map((r: { region: string; bottles_purchased: number; bottles_recycled: number; recycling_rate: number; users: number }) => (
            <Card key={r.region} className="shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-gray-800">{t(`regions.${r.region}`)}</h3>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    r.recycling_rate >= 50 ? 'bg-green-100 text-green-700' :
                    r.recycling_rate >= 30 ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {r.recycling_rate}%
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <AnimatedCounter value={r.bottles_purchased} className="text-lg font-black text-brand-charcoal block" />
                    <p className="text-xs text-gray-400">куплено</p>
                  </div>
                  <div>
                    <AnimatedCounter value={r.bottles_recycled} className="text-lg font-black text-green-600 block" />
                    <p className="text-xs text-gray-400">перераб.</p>
                  </div>
                  <div>
                    <AnimatedCounter value={r.users} className="text-lg font-black text-blue-600 block" />
                    <p className="text-xs text-gray-400">польз.</p>
                  </div>
                </div>
                <div className="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-brand-red rounded-full transition-all duration-1000"
                    style={{ width: `${r.recycling_rate}%` }}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
