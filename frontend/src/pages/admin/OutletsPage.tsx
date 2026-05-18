import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MapPin, Plus, Pencil, Trash2, X, ArrowUpDown } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  useAdminOutlets, useCreateOutlet, useUpdateOutlet, useDeleteOutlet,
  type AdminOutlet,
} from '@/api/admin'

const REGIONS = [
  { value: 'dushanbe', label: 'Душанбе' },
  { value: 'sughd', label: 'Согд' },
  { value: 'khatlon', label: 'Хатлон' },
  { value: 'gbao', label: 'ГБАО' },
  { value: 'rrs', label: 'РРС' },
]

const REGION_LABEL: Record<string, string> = {
  dushanbe: 'Душанбе', sughd: 'Согд', khatlon: 'Хатлон', gbao: 'ГБАО', rrs: 'РРС',
}

const EMPTY: Partial<AdminOutlet> = {
  name: '', name_tg: '', address: '', latitude: 38.5598, longitude: 68.7738,
  region: 'dushanbe', qr_code: '', is_active: true,
}

function OutletModal({
  outlet,
  onClose,
}: {
  outlet: Partial<AdminOutlet> & { id?: number }
  onClose: () => void
}) {
  const [form, setForm] = useState({ ...outlet })
  const create = useCreateOutlet()
  const update = useUpdateOutlet()
  const isNew = !form.id

  const set = (k: keyof typeof form, v: unknown) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isNew) {
      await create.mutateAsync(form)
    } else {
      await update.mutateAsync(form as AdminOutlet)
    }
    onClose()
  }

  const inputClass =
    'w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-brand-red transition-colors'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-y-auto max-h-[90vh]"
      >
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100">
          <h2 className="font-black text-gray-900">{isNew ? 'Новая точка' : 'Редактировать точку'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">Название (RU)</label>
              <input className={inputClass} value={form.name ?? ''} onChange={e => set('name', e.target.value)} required />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">Название (TG)</label>
              <input className={inputClass} value={form.name_tg ?? ''} onChange={e => set('name_tg', e.target.value)} />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">Адрес</label>
            <input className={inputClass} value={form.address ?? ''} onChange={e => set('address', e.target.value)} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">Широта</label>
              <input
                type="number" step="any" className={inputClass}
                value={form.latitude ?? ''} onChange={e => set('latitude', parseFloat(e.target.value))} required
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">Долгота</label>
              <input
                type="number" step="any" className={inputClass}
                value={form.longitude ?? ''} onChange={e => set('longitude', parseFloat(e.target.value))} required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">Регион</label>
              <select
                className={inputClass}
                value={form.region ?? 'dushanbe'}
                onChange={e => set('region', e.target.value)}
              >
                {REGIONS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">QR-код точки</label>
              <input
                className={inputClass} value={form.qr_code ?? ''}
                onChange={e => set('qr_code', e.target.value)} required
                placeholder="RP-DSH-001"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox" id="outlet_active" checked={!!form.is_active}
              onChange={e => set('is_active', e.target.checked)}
              className="w-4 h-4 accent-brand-red"
            />
            <label htmlFor="outlet_active" className="text-sm text-gray-700">Активна</label>
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>Отмена</Button>
            <Button
              type="submit" className="flex-1 bg-brand-red hover:bg-red-600 text-white"
              disabled={create.isPending || update.isPending}
            >
              {(create.isPending || update.isPending) ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : isNew ? 'Создать' : 'Сохранить'}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

type SortKey = 'name' | 'region' | 'is_active'

export default function OutletsPage() {
  const { data: outlets, isLoading } = useAdminOutlets()
  const deleteOutlet = useDeleteOutlet()
  const [editing, setEditing] = useState<(Partial<AdminOutlet> & { id?: number }) | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null)
  const [sortKey, setSortKey] = useState<SortKey>('name')
  const [sortAsc, setSortAsc] = useState(true)

  const sorted = [...(outlets ?? [])].sort((a, b) => {
    const av = a[sortKey] ?? ''
    const bv = b[sortKey] ?? ''
    if (typeof av === 'boolean') return sortAsc ? (av ? 1 : -1) : (bv ? 1 : -1)
    return sortAsc ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av))
  })

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc(!sortAsc)
    else { setSortKey(key); setSortAsc(true) }
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-black text-brand-charcoal">Точки сбора</h1>
          <p className="text-gray-500 text-sm mt-1">{outlets?.length ?? 0} точек по всему Таджикистану</p>
        </div>
        <Button
          className="bg-brand-red hover:bg-red-600 text-white gap-2"
          onClick={() => setEditing(EMPTY)}
        >
          <Plus size={16} />
          Добавить точку
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-14 bg-gray-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : (
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
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">QR-код</th>
                  <th className="text-center px-4 py-3 text-gray-500 font-medium">
                    <button className="flex items-center gap-1 mx-auto" onClick={() => toggleSort('is_active')}>
                      Статус <ArrowUpDown size={12} />
                    </button>
                  </th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {sorted.map((point, i) => (
                  <motion.tr
                    key={point.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.015 }}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <MapPin size={14} className="text-brand-red flex-shrink-0" />
                        <div>
                          <span className="font-medium text-gray-800">{point.name}</span>
                          {point.address && <p className="text-xs text-gray-400">{point.address}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{REGION_LABEL[point.region] ?? point.region}</td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-400">{point.qr_code}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        point.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {point.is_active ? '✓ Активна' : 'Неактивна'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button
                          onClick={() => setEditing(point)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-brand-red hover:bg-red-50 transition-colors"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => setConfirmDelete(point.id)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      <AnimatePresence>
        {editing && <OutletModal outlet={editing} onClose={() => setEditing(null)} />}
      </AnimatePresence>

      <AnimatePresence>
        {confirmDelete !== null && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 shadow-2xl w-full max-w-sm text-center"
            >
              <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 size={24} className="text-red-600" />
              </div>
              <h3 className="font-black text-gray-900 mb-2">Удалить точку?</h3>
              <p className="text-gray-500 text-sm mb-6">Это действие нельзя отменить.</p>
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => setConfirmDelete(null)}>Отмена</Button>
                <Button
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                  disabled={deleteOutlet.isPending}
                  onClick={async () => {
                    await deleteOutlet.mutateAsync(confirmDelete)
                    setConfirmDelete(null)
                  }}
                >
                  Удалить
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
