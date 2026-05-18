import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, Target, TrendingUp, Plus, Pencil, Trash2, X, Rocket } from 'lucide-react'
import { RadialBarChart, RadialBar, PolarAngleAxis, ResponsiveContainer } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useCampaigns, useCreateCampaign, useUpdateCampaign, useDeleteCampaign } from '@/api/analytics'

interface Campaign {
  id: number
  name: string
  description: string
  start_date: string
  end_date: string
  bottles_tracked: number
  target_bottles: number
  progress_pct: number
  is_active: boolean
}

const EMPTY = {
  name: '',
  description: '',
  start_date: new Date().toISOString().slice(0, 10),
  end_date: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
  target_bottles: 10000,
}

function CampaignModal({
  campaign,
  onClose,
}: {
  campaign: Partial<Campaign> & { id?: number }
  onClose: () => void
}) {
  const [form, setForm] = useState({ ...campaign })
  const create = useCreateCampaign()
  const update = useUpdateCampaign()
  const isNew = !form.id

  const set = (k: keyof typeof form, v: unknown) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isNew) {
      await create.mutateAsync(form as Record<string, unknown>)
    } else {
      await update.mutateAsync(form as { id: number } & Record<string, unknown>)
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
          <h2 className="font-black text-gray-900">{isNew ? 'Новая кампания' : 'Редактировать'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">Название кампании</label>
            <input
              className={inputClass} required
              value={form.name ?? ''} onChange={e => set('name', e.target.value)}
              placeholder="Наврӯз 2026"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">Описание</label>
            <textarea
              className={`${inputClass} resize-none`} rows={2}
              value={form.description ?? ''} onChange={e => set('description', e.target.value)}
              placeholder="Краткое описание цели кампании..."
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">Начало</label>
              <input type="date" className={inputClass}
                value={form.start_date ?? ''} onChange={e => set('start_date', e.target.value)} required />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">Конец</label>
              <input type="date" className={inputClass}
                value={form.end_date ?? ''} onChange={e => set('end_date', e.target.value)} required />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">Целевых бутылок</label>
            <input
              type="number" min={1} className={inputClass}
              value={form.target_bottles ?? ''} onChange={e => set('target_bottles', Number(e.target.value))} required
            />
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

function CampaignCard({ c, onEdit, onDelete }: { c: Campaign; onEdit: () => void; onDelete: () => void }) {
  const chartData = [{ value: Math.min(c.progress_pct, 100) }]
  const daysLeft = Math.max(0, Math.ceil(
    (new Date(c.end_date).getTime() - Date.now()) / 86400000
  ))
  const isOverdue = !c.is_active && new Date(c.end_date) < new Date()

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <Card className={`shadow-sm border-l-4 ${c.is_active ? 'border-l-brand-red' : 'border-l-gray-200'} hover:shadow-md transition-shadow`}>
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <CardTitle className="text-base leading-tight truncate">{c.name}</CardTitle>
              {c.description && (
                <p className="text-xs text-gray-400 mt-1 line-clamp-2">{c.description}</p>
              )}
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              <Badge
                variant={c.is_active ? 'default' : 'outline'}
                className={`text-xs ${c.is_active ? 'bg-green-600 text-white' : isOverdue ? 'text-gray-400' : ''}`}
              >
                {c.is_active ? 'Активна' : isOverdue ? 'Завершена' : 'Неактивна'}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Radial progress + stats */}
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 flex-shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart innerRadius={26} outerRadius={38} data={chartData} startAngle={90} endAngle={-270}>
                  <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
                  <RadialBar
                    dataKey="value"
                    angleAxisId={0}
                    fill={c.progress_pct >= 100 ? '#00A651' : '#F40009'}
                    cornerRadius={4}
                    background={{ fill: '#f3f4f6' }}
                  />
                  <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle"
                    className="font-black" fill={c.progress_pct >= 100 ? '#00A651' : '#F40009'}
                    fontSize={14} fontWeight={900}>
                    {c.progress_pct}%
                  </text>
                </RadialBarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-gray-500 flex items-center gap-1"><Target size={11} />Отслежено</span>
                <span className="font-bold text-gray-800">{c.bottles_tracked.toLocaleString('ru')}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Цель</span>
                <span className="text-gray-600">{c.target_bottles.toLocaleString('ru')}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-500 flex items-center gap-1"><TrendingUp size={11} />ROI ~</span>
                <span className="font-semibold text-green-600">${(c.bottles_tracked * 0.001).toFixed(0)}</span>
              </div>
            </div>
          </div>

          {/* Date + days left */}
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span className="flex items-center gap-1">
              <Calendar size={11} />
              {c.start_date} — {c.end_date}
            </span>
            {c.is_active && daysLeft > 0 && (
              <span className="text-brand-red font-semibold">{daysLeft} дн.</span>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            <Button size="sm" variant="outline" className="flex-1 h-7 text-xs gap-1" onClick={onEdit}>
              <Pencil size={11} />
              Редактировать
            </Button>
            <button
              onClick={onDelete}
              className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export default function CampaignsPage() {
  const { data: campaigns, isLoading } = useCampaigns()
  const deleteCampaign = useDeleteCampaign()
  const [editing, setEditing] = useState<(Partial<Campaign> & { id?: number }) | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null)

  const active = (campaigns as Campaign[] | undefined)?.filter(c => c.is_active) ?? []
  const past = (campaigns as Campaign[] | undefined)?.filter(c => !c.is_active) ?? []

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-black text-brand-charcoal">Кампании</h1>
          <p className="text-gray-500 text-sm mt-1">Маркетинговые кампании CCI Таджикистан</p>
        </div>
        <Button className="bg-brand-red hover:bg-red-600 text-white gap-2" onClick={() => setEditing(EMPTY)}>
          <Plus size={16} />
          Новая кампания
        </Button>
      </div>

      {/* Summary strip */}
      {!!campaigns?.length && (
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Всего кампаний', value: campaigns.length },
            { label: 'Активных', value: active.length },
            {
              label: 'Бутылок отслежено',
              value: (campaigns as Campaign[]).reduce((s, c) => s + c.bottles_tracked, 0).toLocaleString('ru'),
            },
          ].map(({ label, value }) => (
            <Card key={label} className="shadow-sm">
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-black text-brand-red">{value}</p>
                <p className="text-xs text-gray-500 mt-0.5">{label}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {isLoading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-64 bg-gray-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : (
        <>
          {active.length > 0 && (
            <div>
              <h2 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                <Rocket size={14} className="text-brand-red" />
                Активные
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {active.map(c => (
                  <CampaignCard key={c.id} c={c}
                    onEdit={() => setEditing(c)}
                    onDelete={() => setConfirmDelete(c.id)}
                  />
                ))}
              </div>
            </div>
          )}

          {past.length > 0 && (
            <div>
              <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-3">Завершённые</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 opacity-70">
                {past.map(c => (
                  <CampaignCard key={c.id} c={c}
                    onEdit={() => setEditing(c)}
                    onDelete={() => setConfirmDelete(c.id)}
                  />
                ))}
              </div>
            </div>
          )}

          {!campaigns?.length && (
            <Card>
              <CardContent className="py-20 text-center">
                <Rocket size={40} className="text-gray-200 mx-auto mb-3" />
                <p className="text-gray-400">Нет кампаний. Создайте первую!</p>
              </CardContent>
            </Card>
          )}
        </>
      )}

      <AnimatePresence>
        {editing && <CampaignModal campaign={editing} onClose={() => setEditing(null)} />}
      </AnimatePresence>

      <AnimatePresence>
        {confirmDelete !== null && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 shadow-2xl w-full max-w-sm text-center"
            >
              <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 size={24} className="text-red-600" />
              </div>
              <h3 className="font-black text-gray-900 mb-2">Удалить кампанию?</h3>
              <p className="text-gray-500 text-sm mb-6">Данные кампании будут удалены безвозвратно.</p>
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => setConfirmDelete(null)}>Отмена</Button>
                <Button
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                  disabled={deleteCampaign.isPending}
                  onClick={async () => {
                    await deleteCampaign.mutateAsync(confirmDelete)
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
