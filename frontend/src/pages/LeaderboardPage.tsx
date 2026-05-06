import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { Crown } from 'lucide-react'
import { useLeaderboard } from '@/api/users'
import { useAuthStore } from '@/store/authStore'

const periods = [
  { key: 'today', label: 'leaderboard.today' },
  { key: 'week',  label: 'leaderboard.week'  },
  { key: 'month', label: 'leaderboard.month' },
  { key: 'all',   label: 'leaderboard.all_time' },
]
const regionOptions = [
  { key: '',          label: 'leaderboard.all_regions' },
  { key: 'dushanbe',  label: 'regions.dushanbe' },
  { key: 'sughd',     label: 'regions.sughd'    },
  { key: 'khatlon',   label: 'regions.khatlon'  },
  { key: 'gbao',      label: 'regions.gbao'     },
  { key: 'rrs',       label: 'regions.rrs'      },
]

const podiumColors = [
  { bg: 'bg-brand-gold',    text: 'text-brand-dark', ring: 'ring-brand-gold'    },
  { bg: 'bg-gray-300',      text: 'text-gray-700',   ring: 'ring-gray-300'      },
  { bg: 'bg-amber-600',     text: 'text-white',      ring: 'ring-amber-600'     },
]

export default function LeaderboardPage() {
  const { t } = useTranslation()
  const { user } = useAuthStore()
  const [period, setPeriod] = useState('all')
  const [region, setRegion] = useState('')
  const { data: leaders, isLoading } = useLeaderboard(region, period)

  const top3 = leaders?.slice(0, 3) ?? []
  const rest  = leaders?.slice(3) ?? []

  return (
    <div className="min-h-screen bg-[#F8F8F8] pb-28">
      {/* ── Header ── */}
      <div className="bg-brand-dark relative overflow-hidden px-6 pt-12 pb-6">
        <div className="absolute inset-0 opacity-20"
          style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(244,0,9,0.8) 0%, transparent 65%)' }}
        />
        <h1 className="display text-white text-3xl relative z-10 mb-5">{t('leaderboard.title')}</h1>

        {/* Period pills */}
        <div className="flex gap-2 overflow-x-auto pb-1 relative z-10">
          {periods.map((p) => (
            <button
              key={p.key}
              onClick={() => setPeriod(p.key)}
              className={`whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                period === p.key
                  ? 'bg-brand-red text-white shadow-[0_0_16px_rgba(244,0,9,0.4)]'
                  : 'bg-white/10 text-white/50 hover:bg-white/15'
              }`}
            >
              {t(p.label)}
            </button>
          ))}
        </div>
      </div>

      {/* Region filter */}
      <div className="px-6 py-3 flex gap-2 overflow-x-auto">
        {regionOptions.map((r) => (
          <button
            key={r.key}
            onClick={() => setRegion(r.key)}
            className={`whitespace-nowrap px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all ${
              region === r.key
                ? 'bg-brand-charcoal text-white border-brand-charcoal'
                : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
            }`}
          >
            {t(r.label)}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-brand-red border-t-transparent rounded-full animate-spin" />
        </div>
      ) : !leaders?.length ? (
        <p className="py-16 text-center text-gray-400">{t('common.no_data')}</p>
      ) : (
        <div className="px-6 space-y-4">
          {/* ── Podium top 3 ── */}
          {top3.length >= 3 && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-3 gap-2 pt-2 items-end"
            >
              {/* 2nd */}
              <div className="flex flex-col items-center gap-2 pb-2">
                <div className={`w-14 h-14 rounded-full ring-4 ${podiumColors[1].ring} flex items-center justify-center bg-gray-100`}>
                  <span className="font-black text-gray-600 text-lg">{top3[1]?.name?.charAt(0)}</span>
                </div>
                <p className="text-xs font-bold text-gray-700 text-center truncate w-full px-1">{top3[1]?.name}</p>
                <p className="text-brand-red font-black text-sm">{top3[1]?.points?.toLocaleString('ru')}</p>
                <div className="bg-gray-200 rounded-t-2xl w-full h-16 flex items-center justify-center">
                  <span className="text-gray-500 font-black text-xl">2</span>
                </div>
              </div>
              {/* 1st */}
              <div className="flex flex-col items-center gap-2">
                <Crown size={20} className="text-brand-gold" />
                <div className={`w-16 h-16 rounded-full ring-4 ${podiumColors[0].ring} flex items-center justify-center bg-yellow-50`}>
                  <span className="font-black text-brand-dark text-xl">{top3[0]?.name?.charAt(0)}</span>
                </div>
                <p className="text-xs font-bold text-gray-800 text-center truncate w-full px-1">{top3[0]?.name}</p>
                <p className="text-brand-red font-black">{top3[0]?.points?.toLocaleString('ru')}</p>
                <div className="bg-brand-red rounded-t-2xl w-full h-24 flex items-center justify-center">
                  <span className="text-white font-black text-2xl">1</span>
                </div>
              </div>
              {/* 3rd */}
              <div className="flex flex-col items-center gap-2 pb-2">
                <div className={`w-14 h-14 rounded-full ring-4 ${podiumColors[2].ring} flex items-center justify-center bg-amber-50`}>
                  <span className="font-black text-amber-700 text-lg">{top3[2]?.name?.charAt(0)}</span>
                </div>
                <p className="text-xs font-bold text-gray-700 text-center truncate w-full px-1">{top3[2]?.name}</p>
                <p className="text-brand-red font-black text-sm">{top3[2]?.points?.toLocaleString('ru')}</p>
                <div className="bg-amber-600 rounded-t-2xl w-full h-12 flex items-center justify-center">
                  <span className="text-white font-black text-lg">3</span>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── Rest of the list ── */}
          <div className="bg-white rounded-3xl overflow-hidden shadow-sm">
            {rest.map((leader: { rank: number; name: string; region: string; points: number; bottles: number }, i: number) => {
              const isMe = user?.name && leader.name.startsWith(user.name.split(' ')[0])
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.02 }}
                  className={`flex items-center gap-4 px-5 py-3.5 border-b border-gray-50 last:border-0 ${isMe ? 'bg-red-50' : ''}`}
                >
                  <span className="w-7 text-center text-sm font-bold text-gray-400">#{leader.rank}</span>
                  <div className="w-9 h-9 bg-gray-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-black text-gray-500">{leader.name.charAt(0)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`font-bold text-sm truncate ${isMe ? 'text-brand-red' : 'text-brand-charcoal'}`}>
                      {leader.name}
                    </p>
                    <p className="text-xs text-gray-400">{t(`regions.${leader.region}`)}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-black text-brand-red text-sm">{leader.points.toLocaleString('ru')}</p>
                    <p className="text-xs text-gray-400">{leader.bottles} бут.</p>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
