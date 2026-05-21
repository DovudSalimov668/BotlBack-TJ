import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, UserCog, Coins, ShieldCheck, Trash2, X, ChevronDown, Flame } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAdminUsers, useUpdateAdminUser, useDeleteAdminUser, type AdminUser } from '@/api/admin'
import { REGIONS as REGION_KEYS, REGION_NAMES } from '@/lib/regions'

const REGIONS = [
  { value: '', label: 'Все регионы' },
  ...REGION_KEYS.map((r) => ({ value: r, label: REGION_NAMES[r] })),
]

function AdjustPointsModal({ user, onClose }: { user: AdminUser; onClose: () => void }) {
  const [delta, setDelta] = useState(0)
  const [reason, setReason] = useState('')
  const update = useUpdateAdminUser()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await update.mutateAsync({ id: user.id, points_delta: delta })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-sm"
      >
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100">
          <div>
            <h2 className="font-black text-gray-900">Изменить баллы</h2>
            <p className="text-xs text-gray-400 mt-0.5">{user.name || user.phone}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="bg-gray-50 rounded-2xl p-4 text-center">
            <p className="text-xs text-gray-500 mb-1">Текущий баланс</p>
            <p className="text-3xl font-black text-brand-red">{user.total_points}</p>
            <p className="text-xs text-gray-400">баллов</p>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">
              Изменение (+ добавить / − снять)
            </label>
            <input
              type="number"
              value={delta}
              onChange={e => setDelta(Number(e.target.value))}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-brand-red text-center text-xl font-black"
            />
          </div>
          {delta !== 0 && (
            <div className="bg-blue-50 rounded-xl px-4 py-2 text-sm text-center text-blue-700">
              Итого: <strong>{user.total_points + delta}</strong> баллов
            </div>
          )}
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">Причина (необязательно)</label>
            <input
              type="text"
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder="Бонус за промо-акцию..."
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-brand-red"
            />
          </div>
          <div className="flex gap-3">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>Отмена</Button>
            <Button
              type="submit"
              className="flex-1 bg-brand-red hover:bg-red-600 text-white"
              disabled={update.isPending || delta === 0}
            >
              {update.isPending ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : 'Применить'}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

export default function AdminUsersPage() {
  const [search, setSearch] = useState('')
  const [region, setRegion] = useState('')
  const [adjustUser, setAdjustUser] = useState<AdminUser | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<AdminUser | null>(null)

  const { data: users, isLoading } = useAdminUsers(search || undefined, region || undefined)
  const updateUser = useUpdateAdminUser()
  const deleteUser = useDeleteAdminUser()

  const toggleStaff = (user: AdminUser) => {
    updateUser.mutate({ id: user.id, is_staff: !user.is_staff })
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-black text-brand-charcoal">Пользователи</h1>
          <p className="text-gray-500 text-sm mt-1">{users?.length ?? 0} найдено</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search size={15} className="absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Имя или телефон..."
            className="w-full border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-brand-red transition-colors"
          />
        </div>
        <div className="relative">
          <select
            value={region}
            onChange={e => setRegion(e.target.value)}
            className="appearance-none border border-gray-200 rounded-xl pl-4 pr-8 py-2.5 text-sm focus:outline-none focus:border-brand-red bg-white"
          >
            {REGIONS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
          </select>
          <ChevronDown size={14} className="absolute right-2.5 top-3 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="h-16 bg-gray-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-0 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">Пользователь</th>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">Регион</th>
                  <th className="text-right px-4 py-3 text-gray-500 font-medium">Баллы</th>
                  <th className="text-right px-4 py-3 text-gray-500 font-medium">Бутылки</th>
                  <th className="text-right px-4 py-3 text-gray-500 font-medium">Серия</th>
                  <th className="text-center px-4 py-3 text-gray-500 font-medium">Роль</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {users?.map((user, i) => (
                  <motion.tr
                    key={user.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.01 }}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-brand-red/10 rounded-xl flex items-center justify-center text-brand-red font-black text-xs flex-shrink-0">
                          {(user.name || user.phone).charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800">{user.name || '—'}</p>
                          <p className="text-xs text-gray-400">{user.phone}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-500 capitalize">{user.region || '—'}</td>
                    <td className="px-4 py-3 text-right font-bold text-brand-red">{user.total_points}</td>
                    <td className="px-4 py-3 text-right text-gray-600">{user.bottles_recycled}</td>
                    <td className="px-4 py-3 text-right text-gray-600">
                      {user.streak_days > 0
                        ? <span className="inline-flex items-center gap-1"><Flame size={12} className="text-orange-500" />{user.streak_days}</span>
                        : '—'}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Badge
                        variant={user.is_staff ? 'default' : 'outline'}
                        className={`cursor-pointer text-xs ${user.is_staff ? 'bg-purple-600 text-white' : ''}`}
                        onClick={() => toggleStaff(user)}
                      >
                        {user.is_staff ? 'Админ' : 'Юзер'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setAdjustUser(user)}
                          title="Изменить баллы"
                          className="p-1.5 rounded-lg text-gray-400 hover:text-brand-red hover:bg-red-50 transition-colors"
                        >
                          <Coins size={14} />
                        </button>
                        <button
                          onClick={() => toggleStaff(user)}
                          title={user.is_staff ? 'Снять права' : 'Дать права'}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-purple-600 hover:bg-purple-50 transition-colors"
                        >
                          <ShieldCheck size={14} />
                        </button>
                        {!user.is_staff && (
                          <button
                            onClick={() => setConfirmDelete(user)}
                            title="Удалить"
                            className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
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
        {adjustUser && <AdjustPointsModal user={adjustUser} onClose={() => setAdjustUser(null)} />}
      </AnimatePresence>

      <AnimatePresence>
        {confirmDelete && (
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
              <h3 className="font-black text-gray-900 mb-1">Удалить пользователя?</h3>
              <p className="text-gray-500 text-sm mb-2">{confirmDelete.name || confirmDelete.phone}</p>
              <p className="text-red-500 text-xs mb-6">Все данные будут удалены безвозвратно.</p>
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => setConfirmDelete(null)}>Отмена</Button>
                <Button
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                  disabled={deleteUser.isPending}
                  onClick={async () => {
                    await deleteUser.mutateAsync(confirmDelete.id)
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
