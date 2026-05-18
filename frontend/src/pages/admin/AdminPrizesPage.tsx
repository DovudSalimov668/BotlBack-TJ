import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Pencil, Trash2, Gift, X, PackageCheck } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  useAdminPrizes, useCreatePrize, useUpdatePrize, useDeletePrize,
  type AdminPrize,
} from '@/api/admin'

const EMPTY: Partial<AdminPrize> = {
  name: '', name_tg: '', points_cost: 100, image_url: '', stock_quantity: 10, is_active: true,
}

function PrizeModal({
  prize,
  onClose,
}: {
  prize: Partial<AdminPrize> & { id?: number }
  onClose: () => void
}) {
  const [form, setForm] = useState({ ...prize })
  const create = useCreatePrize()
  const update = useUpdatePrize()

  const isNew = !form.id

  const set = (k: keyof typeof form, v: unknown) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isNew) {
      await create.mutateAsync(form)
    } else {
      await update.mutateAsync(form as AdminPrize)
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
        className="bg-white rounded-3xl shadow-2xl w-full max-w-md"
      >
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100">
          <h2 className="font-black text-gray-900">{isNew ? 'Новый приз' : 'Редактировать приз'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">Название (RU)</label>
            <input className={inputClass} value={form.name ?? ''} onChange={e => set('name', e.target.value)} required />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">Название (TG)</label>
            <input className={inputClass} value={form.name_tg ?? ''} onChange={e => set('name_tg', e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">Стоимость (pts)</label>
              <input
                type="number" min={1} className={inputClass}
                value={form.points_cost ?? ''} onChange={e => set('points_cost', Number(e.target.value))} required
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">Остаток</label>
              <input
                type="number" min={0} className={inputClass}
                value={form.stock_quantity ?? ''} onChange={e => set('stock_quantity', Number(e.target.value))} required
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">URL изображения</label>
            <input className={inputClass} value={form.image_url ?? ''} onChange={e => set('image_url', e.target.value)} placeholder="https://..." />
          </div>
          <div className="flex items-center gap-3">
            <input
              type="checkbox" id="is_active" checked={!!form.is_active}
              onChange={e => set('is_active', e.target.checked)}
              className="w-4 h-4 accent-brand-red"
            />
            <label htmlFor="is_active" className="text-sm text-gray-700">Активен (виден пользователям)</label>
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

export default function AdminPrizesPage() {
  const { data: prizes, isLoading } = useAdminPrizes()
  const deletePrize = useDeletePrize()
  const [editing, setEditing] = useState<(Partial<AdminPrize> & { id?: number }) | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null)

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-brand-charcoal">Призы</h1>
          <p className="text-gray-500 text-sm mt-1">{prizes?.length ?? 0} призов в каталоге</p>
        </div>
        <Button
          className="bg-brand-red hover:bg-red-600 text-white gap-2"
          onClick={() => setEditing(EMPTY)}
        >
          <Plus size={16} />
          Новый приз
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-44 bg-gray-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {prizes?.map((prize, i) => (
            <motion.div
              key={prize.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className={`relative ${!prize.is_active ? 'opacity-60' : ''}`}>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="w-12 h-12 bg-brand-red/10 rounded-2xl flex items-center justify-center flex-shrink-0">
                      {prize.image_url ? (
                        <img src={prize.image_url} alt={prize.name} className="w-10 h-10 object-contain rounded-xl" />
                      ) : (
                        <Gift size={22} className="text-brand-red" />
                      )}
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => setEditing(prize)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-brand-red hover:bg-red-50 transition-colors"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => setConfirmDelete(prize.id)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  <h3 className="font-bold text-gray-900 leading-tight">{prize.name}</h3>
                  {prize.name_tg && <p className="text-xs text-gray-400 mt-0.5">{prize.name_tg}</p>}
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-brand-red font-black text-lg">{prize.points_cost} pts</span>
                    <div className="flex items-center gap-2">
                      <Badge variant={prize.stock_quantity === 0 ? 'destructive' : 'secondary'} className="text-xs">
                        <PackageCheck size={11} className="mr-1" />
                        {prize.stock_quantity}
                      </Badge>
                      <Badge variant={prize.is_active ? 'default' : 'outline'} className="text-xs">
                        {prize.is_active ? 'Активен' : 'Скрыт'}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Modals */}
      <AnimatePresence>
        {editing && <PrizeModal prize={editing} onClose={() => setEditing(null)} />}
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
              <h3 className="font-black text-gray-900 mb-2">Удалить приз?</h3>
              <p className="text-gray-500 text-sm mb-6">Это действие нельзя отменить.</p>
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => setConfirmDelete(null)}>Отмена</Button>
                <Button
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                  disabled={deletePrize.isPending}
                  onClick={async () => {
                    await deletePrize.mutateAsync(confirmDelete)
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
