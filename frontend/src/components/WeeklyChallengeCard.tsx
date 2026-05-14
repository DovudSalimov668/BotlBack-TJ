import { motion } from 'framer-motion'
import { Recycle, QrCode, Flame, Leaf, Users, CheckCircle2, Trophy } from 'lucide-react'
import { useWeeklyChallenges } from '@/api/users'

type Challenge = {
  id: string
  title: string
  description: string
  icon: string
  target: number
  progress: number
  reward_pts: number
  completed: boolean
  type: string
}

const ICON_MAP: Record<string, React.ElementType> = {
  recycle: Recycle,
  qr: QrCode,
  flame: Flame,
  leaf: Leaf,
  users: Users,
}

const TYPE_COLOR: Record<string, string> = {
  weekly: '#F40009',
  ongoing: '#FF6B35',
  milestone: '#00A651',
  social: '#6C63FF',
}

export function WeeklyChallengeCard() {
  const { data: challenges, isLoading } = useWeeklyChallenges()

  if (isLoading) {
    return (
      <div className="bg-white rounded-3xl p-5 shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
        <div className="h-4 bg-gray-100 rounded-full w-32 mb-4 animate-pulse" />
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-50 rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  if (!challenges?.length) return null

  const list = challenges as Challenge[]
  const completed = list.filter((c) => c.completed).length

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35 }}
      className="bg-white rounded-3xl overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.04)]"
    >
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
        <div className="flex items-center gap-2">
          <Trophy size={14} className="text-brand-gold" />
          <h3 className="font-black text-brand-charcoal text-sm">Задания</h3>
        </div>
        <span className="text-[10px] font-bold text-gray-400 tracking-wider uppercase">
          {completed}/{list.length} выполнено
        </span>
      </div>

      <div className="divide-y divide-gray-50">
        {list.map((ch, i) => {
          const Icon = ICON_MAP[ch.icon] ?? QrCode
          const color = TYPE_COLOR[ch.type] ?? '#F40009'
          const pct = Math.round((ch.progress / ch.target) * 100)

          return (
            <motion.div
              key={ch.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + i * 0.06 }}
              className="flex items-center gap-4 px-5 py-4"
            >
              <div
                className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0"
                style={{ background: color + '18' }}
              >
                {ch.completed
                  ? <CheckCircle2 size={18} style={{ color }} />
                  : <Icon size={17} style={{ color }} />
                }
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <p className={`text-sm font-bold truncate ${ch.completed ? 'text-gray-400 line-through' : 'text-gray-800'}`}>
                    {ch.title}
                  </p>
                  <span className="text-[11px] font-black ml-2 flex-shrink-0" style={{ color }}>
                    +{ch.reward_pts} pts
                  </span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.8, delay: 0.2 + i * 0.08, ease: [0.16, 1, 0.3, 1] }}
                    className="h-full rounded-full"
                    style={{ background: ch.completed ? '#00A651' : color }}
                  />
                </div>
                <p className="text-[10px] text-gray-400 mt-1">
                  {ch.progress}/{ch.target}
                </p>
              </div>
            </motion.div>
          )
        })}
      </div>
    </motion.div>
  )
}
