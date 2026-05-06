import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { MapPin, ArrowUpDown } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useMapData } from '@/api/analytics'

type SortKey = 'name' | 'scan_count' | 'region'

export default function OutletsPage() {
  const { t } = useTranslation()
  const { data: points } = useMapData()
  const [sortKey, setSortKey] = useState<SortKey>('scan_count')
  const [sortAsc, setSortAsc] = useState(false)

  const sorted = [...(points ?? [])].sort((a, b) => {
    const av = a[sortKey] ?? 0
    const bv = b[sortKey] ?? 0
    if (typeof av === 'string') return sortAsc ? av.localeCompare(bv as string) : (bv as string).localeCompare(av)
    return sortAsc ? (av as number) - (bv as number) : (bv as number) - (av as number)
  })

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc(!sortAsc)
    else { setSortKey(key); setSortAsc(false) }
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-black text-brand-charcoal">{t('admin.outlets')}</h1>
        <p className="text-gray-500 text-sm mt-1">{points?.length ?? 0} точек по всему Таджикистану</p>
      </div>

      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-4 py-3 text-gray-500 font-medium">
                  <button className="flex items-center gap-1" onClick={() => toggleSort('name')}>
                    Название <ArrowUpDown size={12} />
                  </button>
                </th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">
                  <button className="flex items-center gap-1" onClick={() => toggleSort('region')}>
                    Регион <ArrowUpDown size={12} />
                  </button>
                </th>
                <th className="text-right px-4 py-3 text-gray-500 font-medium">
                  <button className="flex items-center gap-1 ml-auto" onClick={() => toggleSort('scan_count')}>
                    Сканирований <ArrowUpDown size={12} />
                  </button>
                </th>
                <th className="text-center px-4 py-3 text-gray-500 font-medium">Статус</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {sorted.map((point: {
                id: number; name: string; region: string; scan_count: number; is_active: boolean; lat: number; lon: number
              }, i: number) => (
                <motion.tr
                  key={point.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.02 }}
                  className="hover:bg-gray-50"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <MapPin size={14} className="text-brand-red flex-shrink-0" />
                      <span className="font-medium text-gray-800">{point.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{t(`regions.${point.region}`)}</td>
                  <td className="px-4 py-3 text-right font-bold text-brand-red">{point.scan_count.toLocaleString('ru')}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${point.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {point.is_active ? '✓ Активен' : 'Неактивен'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Button size="sm" variant="ghost" className="text-xs">
                      Отправить реп
                    </Button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  )
}
