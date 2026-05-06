import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { Trophy, Medal } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { useLeaderboard } from '@/api/users'
import { useAuthStore } from '@/store/authStore'

const periods = [
  { key: 'today', label: 'leaderboard.today' },
  { key: 'week', label: 'leaderboard.week' },
  { key: 'month', label: 'leaderboard.month' },
  { key: 'all', label: 'leaderboard.all_time' },
]
const regionOptions = [
  { key: '', label: 'leaderboard.all_regions' },
  { key: 'dushanbe', label: 'regions.dushanbe' },
  { key: 'sughd', label: 'regions.sughd' },
  { key: 'khatlon', label: 'regions.khatlon' },
  { key: 'gbao', label: 'regions.gbao' },
  { key: 'rrs', label: 'regions.rrs' },
]

export default function LeaderboardPage() {
  const { t } = useTranslation()
  const { user } = useAuthStore()
  const [period, setPeriod] = useState('all')
  const [region, setRegion] = useState('')
  const { data: leaders, isLoading } = useLeaderboard(region, period)

  const medalColors = ['text-yellow-500', 'text-gray-400', 'text-amber-600']

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="bg-gradient-to-br from-brand-red to-red-700 text-white px-6 pt-12 pb-6">
        <h1 className="text-2xl font-black mb-4">{t('leaderboard.title')}</h1>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {periods.map((p) => (
            <button
              key={p.key}
              onClick={() => setPeriod(p.key)}
              className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${period === p.key ? 'bg-white text-brand-red' : 'bg-white/20 text-white'}`}
            >
              {t(p.label)}
            </button>
          ))}
        </div>
      </div>

      <div className="px-6 py-4">
        <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
          {regionOptions.map((r) => (
            <button
              key={r.key}
              onClick={() => setRegion(r.key)}
              className={`whitespace-nowrap px-3 py-1 rounded-full text-xs font-medium border transition-all ${region === r.key ? 'bg-brand-red text-white border-brand-red' : 'bg-white text-gray-600 border-gray-200'}`}
            >
              {t(r.label)}
            </button>
          ))}
        </div>

        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-8 text-center">
                <div className="w-8 h-8 border-4 border-brand-red border-t-transparent rounded-full animate-spin mx-auto" />
              </div>
            ) : !leaders?.length ? (
              <p className="p-8 text-center text-gray-400">{t('common.no_data')}</p>
            ) : (
              <div className="divide-y divide-gray-50">
                {leaders.map((leader: { rank: number; name: string; region: string; points: number; bottles: number }, i: number) => {
                  const isMe = user?.name && leader.name.startsWith(user.name.split(' ')[0])
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.02 }}
                      className={`flex items-center gap-4 px-4 py-3 ${isMe ? 'bg-red-50' : ''}`}
                    >
                      <div className="w-8 text-center">
                        {leader.rank <= 3 ? (
                          <Medal size={20} className={medalColors[leader.rank - 1]} />
                        ) : (
                          <span className="text-sm font-bold text-gray-400">#{leader.rank}</span>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className={`font-semibold text-sm ${isMe ? 'text-brand-red' : 'text-gray-800'}`}>{leader.name}</p>
                        <p className="text-xs text-gray-400">{t(`regions.${leader.region}`)}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-brand-red">{leader.points.toLocaleString('ru')}</p>
                        <p className="text-xs text-gray-400">{leader.bottles} бут.</p>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
