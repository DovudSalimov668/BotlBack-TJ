import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet'
import { MapPin, Navigation, X, Recycle, ChevronUp, Search } from 'lucide-react'
import { useRecyclingPoints } from '@/api/recycling'
import 'leaflet/dist/leaflet.css'

type RecyclingPoint = {
  id: number
  name: string
  name_tg: string
  address: string
  latitude: number
  longitude: number
  region: string
  qr_code: string
}

const regionColors: Record<string, string> = {
  dushanbe: '#F40009',
  sughd:    '#FF6B35',
  khatlon:  '#FFB800',
  gbao:     '#00A651',
  rrs:      '#0066CC',
}

function FlyToPoint({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap()
  map.flyTo([lat, lng], 15, { duration: 1.2 })
  return null
}

export default function MapPage() {
  const { t } = useTranslation()
  const { data: points, isLoading } = useRecyclingPoints()
  const [selected, setSelected] = useState<RecyclingPoint | null>(null)
  const [flyTarget, setFlyTarget] = useState<{ lat: number; lng: number } | null>(null)
  const [panelOpen, setPanelOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [regionFilter, setRegionFilter] = useState<string | null>(null)

  const filteredPoints = useMemo(() => {
    let arr = (points as RecyclingPoint[] | undefined) ?? []
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      arr = arr.filter((p) =>
        p.name.toLowerCase().includes(q) ||
        p.address.toLowerCase().includes(q) ||
        p.region.toLowerCase().includes(q),
      )
    }
    if (regionFilter) arr = arr.filter((p) => p.region === regionFilter)
    return arr
  }, [points, search, regionFilter])

  const handleSelectPoint = (rp: RecyclingPoint) => {
    setSelected(rp)
    setFlyTarget({ lat: rp.latitude, lng: rp.longitude })
    setPanelOpen(false)
  }

  const handleGeolocate = () => {
    navigator.geolocation?.getCurrentPosition((pos) => {
      setFlyTarget({ lat: pos.coords.latitude, lng: pos.coords.longitude })
    })
  }

  const byRegion = filteredPoints.reduce<Record<string, RecyclingPoint[]>>((acc, p) => {
    acc[p.region] = acc[p.region] ? [...acc[p.region], p] : [p]
    return acc
  }, {})

  return (
    <div className="flex flex-col" style={{ height: '100dvh' }}>
      {/* ── Header ── */}
      <div className="bg-brand-dark text-white px-5 pt-10 pb-4 flex-shrink-0 relative z-10">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-white/40 text-[10px] font-semibold tracking-widest uppercase">Переработка</p>
            <h1 className="text-xl font-black tracking-tight mt-0.5">{t('map.title')}</h1>
          </div>
          <button
            onClick={() => setPanelOpen(true)}
            className="flex items-center gap-1.5 bg-white/10 hover:bg-white/15 text-white/80 text-xs font-semibold px-4 py-2 rounded-full transition-all"
          >
            <MapPin size={13} className="text-brand-red" />
            {points?.length ?? 0} точек
          </button>
        </div>
      </div>

      {/* ── Map ── */}
      <div className="flex-1 relative">
        {isLoading ? (
          <div className="flex items-center justify-center h-full bg-brand-dark">
            <div className="text-center">
              <div className="w-10 h-10 border-4 border-brand-red border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-white/40 text-sm">{t('map.loading')}</p>
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
              attribution='&copy; <a href="https://carto.com/">CARTO</a>'
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              subdomains="abcd"
              maxZoom={19}
            />

            {flyTarget && <FlyToPoint lat={flyTarget.lat} lng={flyTarget.lng} />}

            {(points as RecyclingPoint[] | undefined)?.map((rp) => {
              const color = regionColors[rp.region] ?? '#F40009'
              const isActive = selected?.id === rp.id
              return (
                <CircleMarker
                  key={rp.id}
                  center={[rp.latitude, rp.longitude]}
                  radius={isActive ? 14 : 9}
                  fillColor={color}
                  fillOpacity={isActive ? 1 : 0.8}
                  color={isActive ? '#ffffff' : color}
                  weight={isActive ? 3 : 1.5}
                  eventHandlers={{ click: () => handleSelectPoint(rp) }}
                >
                  <Popup className="custom-popup">
                    <div className="p-1 min-w-[200px]">
                      <div className="flex items-start gap-2 mb-2">
                        <div className="w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center mt-0.5" style={{ background: color }}>
                          <Recycle size={12} className="text-white" />
                        </div>
                        <p className="font-bold text-sm text-gray-900 leading-tight">{rp.name}</p>
                      </div>
                      {rp.address && <p className="text-xs text-gray-500 ml-8">{rp.address}</p>}
                      <div className="mt-2 ml-8">
                        <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs font-bold">
                          ✓ Активен
                        </span>
                      </div>
                    </div>
                  </Popup>
                </CircleMarker>
              )
            })}
          </MapContainer>
        )}

        {/* Locate button */}
        <button
          onClick={handleGeolocate}
          className="absolute bottom-28 right-4 z-[1000] w-12 h-12 bg-brand-dark rounded-2xl flex items-center justify-center shadow-xl border border-white/10 hover:bg-white/10 transition-all"
        >
          <Navigation size={20} className="text-white" />
        </button>

        {/* List button */}
        <button
          onClick={() => setPanelOpen(true)}
          className="absolute bottom-28 left-4 z-[1000] flex items-center gap-2 bg-brand-dark rounded-2xl px-4 py-3 shadow-xl border border-white/10 hover:bg-white/10 transition-all"
        >
          <ChevronUp size={16} className="text-white/60" />
          <span className="text-white text-xs font-bold">Список точек</span>
        </button>

        {/* Selected point info card */}
        <AnimatePresence>
          {selected && (
            <motion.div
              initial={{ y: 80, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 80, opacity: 0 }}
              transition={{ type: 'spring', damping: 20, stiffness: 300 }}
              className="absolute bottom-20 left-4 right-4 z-[1000]"
            >
              <div
                className="rounded-3xl p-4 shadow-2xl"
                style={{ background: 'rgba(14,14,14,0.92)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.1)' }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-2xl flex-shrink-0 flex items-center justify-center" style={{ background: regionColors[selected.region] ?? '#F40009' }}>
                      <Recycle size={18} className="text-white" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-white font-black text-sm truncate">{selected.name}</p>
                      <p className="text-white/40 text-xs mt-0.5 truncate">{selected.address}</p>
                    </div>
                  </div>
                  <button onClick={() => setSelected(null)} className="text-white/30 hover:text-white flex-shrink-0">
                    <X size={18} />
                  </button>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-brand-eco/20 text-brand-eco">+20 очков</span>
                  <span className="text-xs text-white/30 capitalize">{selected.region}</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Bottom sheet panel ── */}
      <AnimatePresence>
        {panelOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-[1100]"
              onClick={() => setPanelOpen(false)}
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 26, stiffness: 340 }}
              className="fixed bottom-0 left-0 right-0 z-[1200] max-h-[75dvh] flex flex-col rounded-t-3xl overflow-hidden"
              style={{ background: '#111', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              <div className="flex items-center justify-between px-6 pt-4 pb-3 flex-shrink-0">
                <div>
                  <h3 className="text-white font-black text-base">Пункты приёма</h3>
                  <p className="text-white/40 text-xs mt-0.5">
                    {filteredPoints.length} {filteredPoints.length === (points?.length ?? 0) ? 'точек' : `из ${points?.length ?? 0}`}
                  </p>
                </div>
                <button onClick={() => setPanelOpen(false)} className="text-white/30 hover:text-white">
                  <X size={20} />
                </button>
              </div>

              {/* Search input */}
              <div className="px-6 pb-3 flex-shrink-0">
                <div className="relative">
                  <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Поиск по названию, адресу..."
                    className="w-full bg-white/8 border border-white/10 rounded-2xl pl-10 pr-10 py-2.5 text-white placeholder-white/30 text-sm focus:outline-none focus:bg-white/12 focus:border-brand-red transition-all"
                  />
                  {search && (
                    <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white">
                      <X size={14} />
                    </button>
                  )}
                </div>
              </div>

              {/* Region filter pills */}
              <div className="px-6 pb-3 flex gap-1.5 overflow-x-auto flex-shrink-0 hide-scroll">
                <button
                  onClick={() => setRegionFilter(null)}
                  className={`whitespace-nowrap px-3 py-1 rounded-full text-[11px] font-bold transition-all ${regionFilter === null ? 'bg-white text-black' : 'bg-white/10 text-white/55'}`}
                >
                  Все
                </button>
                {Object.keys(regionColors).map((r) => (
                  <button
                    key={r}
                    onClick={() => setRegionFilter(regionFilter === r ? null : r)}
                    className={`whitespace-nowrap px-3 py-1 rounded-full text-[11px] font-bold transition-all flex items-center gap-1.5 ${regionFilter === r ? 'text-white' : 'bg-white/10 text-white/55'}`}
                    style={regionFilter === r ? { background: regionColors[r] } : {}}
                  >
                    <div className="w-1.5 h-1.5 rounded-full" style={{ background: regionFilter === r ? '#fff' : regionColors[r] }} />
                    {t(`regions.${r}`)}
                  </button>
                ))}
              </div>

              <div className="overflow-y-auto flex-1 pb-8 border-t border-white/8">
                {filteredPoints.length === 0 && (
                  <div className="py-12 text-center">
                    <Search size={28} className="text-white/20 mx-auto mb-2" />
                    <p className="text-white/40 text-sm">Ничего не найдено</p>
                  </div>
                )}
                {Object.entries(byRegion ?? {}).map(([region, rps]) => (
                  <div key={region}>
                    <div className="flex items-center gap-2 px-6 py-3 sticky top-0 bg-[#111]">
                      <div className="w-2 h-2 rounded-full" style={{ background: regionColors[region] ?? '#F40009' }} />
                      <span className="text-white/40 text-xs font-bold uppercase tracking-widest capitalize">{region}</span>
                    </div>
                    {rps.map((rp, i) => (
                      <motion.button
                        key={rp.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.03 }}
                        onClick={() => handleSelectPoint(rp)}
                        className="w-full flex items-center gap-4 px-6 py-3 hover:bg-white/5 transition-colors text-left"
                      >
                        <div className="w-8 h-8 rounded-xl flex-shrink-0 flex items-center justify-center" style={{ background: `${regionColors[region]}22` }}>
                          <Recycle size={14} style={{ color: regionColors[region] ?? '#F40009' }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white/90 text-sm font-semibold truncate">{rp.name}</p>
                          <p className="text-white/30 text-xs truncate">{rp.address}</p>
                        </div>
                        <span className="text-brand-eco text-xs font-bold flex-shrink-0">+20</span>
                      </motion.button>
                    ))}
                  </div>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
