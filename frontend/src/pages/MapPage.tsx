import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet'
import { MapPin, Navigation } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useRecyclingPoints } from '@/api/recycling'
import 'leaflet/dist/leaflet.css'

export default function MapPage() {
  const { t } = useTranslation()
  const { data: points, isLoading } = useRecyclingPoints()

  const handleGeolocate = () => {
    navigator.geolocation?.getCurrentPosition((pos) => {
      console.log('User at', pos.coords.latitude, pos.coords.longitude)
    })
  }

  return (
    <div className="flex flex-col" style={{ height: '100dvh' }}>
      <div className="bg-gradient-to-br from-brand-red to-red-700 text-white px-6 pt-12 pb-4 flex-shrink-0">
        <h1 className="text-2xl font-black">{t('map.title')}</h1>
        <p className="text-red-200 text-sm mt-1">{points?.length ?? 0} точек в Таджикистане</p>
      </div>

      <div className="flex-1 relative">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-10 h-10 border-4 border-brand-red border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-gray-500 text-sm">{t('map.loading')}</p>
            </div>
          </div>
        ) : (
          <MapContainer
            center={[38.8, 70.5]}
            zoom={7}
            className="h-full w-full"
            zoomControl={false}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {points?.map((rp: { id: number; name: string; name_tg: string; address: string; latitude: number; longitude: number; region: string }) => (
              <CircleMarker
                key={rp.id}
                center={[rp.latitude, rp.longitude]}
                radius={10}
                fillColor="#F40009"
                fillOpacity={0.85}
                color="#c00005"
                weight={2}
              >
                <Popup>
                  <div className="min-w-[180px]">
                    <p className="font-bold text-sm text-brand-charcoal">{rp.name}</p>
                    {rp.address && <p className="text-xs text-gray-500 mt-1">{rp.address}</p>}
                    <div className="mt-2 inline-flex items-center gap-1 bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs font-medium">
                      ✓ {t('map.active')}
                    </div>
                  </div>
                </Popup>
              </CircleMarker>
            ))}
          </MapContainer>
        )}

        <Button
          className="absolute bottom-8 right-4 z-[1000] shadow-lg rounded-full"
          size="icon"
          onClick={handleGeolocate}
        >
          <Navigation size={20} />
        </Button>
      </div>
    </div>
  )
}
