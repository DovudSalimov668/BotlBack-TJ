import { useState } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle2, XCircle, Clock, Filter } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAdminRedemptions, useUpdateRedemption } from '@/api/admin'

const STATUS_OPTIONS = [
  { value: '', label: 'Все' },
  { value: 'pending', label: 'Ожидает' },
  { value: 'fulfilled', label: 'Выдан' },
  { value: 'cancelled', label: 'Отменён' },
]

const STATUS_BADGE: Record<string, { label: string; icon: React.ReactNode; className: string }> = {
  pending: {
    label: 'Ожидает',
    icon: <Clock size={12} />,
    className: 'bg-yellow-100 text-yellow-700',
  },
  fulfilled: {
    label: 'Выдан',
    icon: <CheckCircle2 size={12} />,
    className: 'bg-green-100 text-green-700',
  },
  cancelled: {
    label: 'Отменён',
    icon: <XCircle size={12} />,
    className: 'bg-gray-100 text-gray-500',
  },
}

export default function AdminRedemptionsPage() {
  const [statusFilter, setStatusFilter] = useState('')
  const { data: redemptions, isLoading } = useAdminRedemptions(statusFilter)
  const update = useUpdateRedemption()

  const handleAction = (id: number, newStatus: string) => {
    update.mutate({ id, status: newStatus })
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-black text-brand-charcoal">Обмены призов</h1>
          <p className="text-gray-500 text-sm mt-1">{redemptions?.length ?? 0} запросов</p>
        </div>

        {/* Status filter */}
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-2xl p-1.5">
          <Filter size={14} className="text-gray-400 ml-1" />
          {STATUS_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => setStatusFilter(opt.value)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                statusFilter === opt.value
                  ? 'bg-brand-red text-white shadow'
                  : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-16 bg-gray-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : redemptions?.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center text-gray-400">
            Нет обменов по выбранному фильтру
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">ID</th>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">Пользователь</th>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">Приз</th>
                  <th className="text-right px-4 py-3 text-gray-500 font-medium">Баллы</th>
                  <th className="text-center px-4 py-3 text-gray-500 font-medium">Статус</th>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">Дата</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {redemptions?.map((r, i) => {
                  const badge = STATUS_BADGE[r.status] ?? STATUS_BADGE.pending
                  return (
                    <motion.tr
                      key={r.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.015 }}
                      className="hover:bg-gray-50"
                    >
                      <td className="px-4 py-3 text-gray-400 font-mono text-xs">#{r.id}</td>
                      <td className="px-4 py-3">
                        <p className="font-semibold text-gray-800">{r.user_name}</p>
                        <p className="text-xs text-gray-400">{r.user_phone}</p>
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-700">{r.prize_name}</td>
                      <td className="px-4 py-3 text-right font-bold text-brand-red">{r.points_spent}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${badge.className}`}>
                          {badge.icon}
                          {badge.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-400 text-xs">
                        {new Date(r.redeemed_at).toLocaleDateString('ru', { day: '2-digit', month: 'short', year: '2-digit' })}
                      </td>
                      <td className="px-4 py-3">
                        {r.status === 'pending' && (
                          <div className="flex gap-1.5">
                            <Button
                              size="sm"
                              className="bg-green-600 hover:bg-green-700 text-white text-xs h-7 px-2.5"
                              onClick={() => handleAction(r.id, 'fulfilled')}
                              disabled={update.isPending}
                            >
                              Выдать
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-xs h-7 px-2.5 text-red-600 border-red-200 hover:bg-red-50"
                              onClick={() => handleAction(r.id, 'cancelled')}
                              disabled={update.isPending}
                            >
                              Отменить
                            </Button>
                          </div>
                        )}
                        {r.status === 'fulfilled' && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-xs h-7 text-gray-400"
                            onClick={() => handleAction(r.id, 'pending')}
                            disabled={update.isPending}
                          >
                            ↩ Вернуть
                          </Button>
                        )}
                      </td>
                    </motion.tr>
                  )
                })}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
