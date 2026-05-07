import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { Crown, Zap, Trophy, TrendingUp, Star } from 'lucide-react'
import { useLeaderboard } from '@/api/users'
import { useAuthStore } from '@/store/authStore'
import { NumberRoll } from '@/components/NumberRoll'

const periods = [
  { key: 'today', label: 'leaderboard.today' },
  { key: 'week',  label: 'leaderboard.week'  },
  { key: 'month', label: 'leaderboard.month' },
  { key: 'all',   label: 'leaderboard.all_time' },
]
const regionOptions = [
  { key: '',         label: 'leaderboard.all_regions' },
  { key: 'dushanbe', label: 'regions.dushanbe' },
  { key: 'sughd',    label: 'regions.sughd'    },
  { key: 'khatlon',  label: 'regions.khatlon'  },
  { key: 'gbao',     label: 'regions.gbao'     },
  { key: 'rrs',      label: 'regions.rrs'      },
]

type Leader = { rank: number; name: string; region: string; points: number; bottles: number }

/* ─── Floating sparkle particle ─── */
function Sparkle({ x, y, size, delay, color = '#FFB800' }: { x: number; y: number; size: number; delay: number; color?: string }) {
  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{ left: `${x}%`, top: `${y}%`, width: size, height: size }}
      initial={{ opacity: 0, scale: 0, rotate: 0 }}
      animate={{
        opacity: [0, 1, 0.8, 0],
        scale: [0, 1, 0.8, 0],
        y: [0, -24, -48],
        rotate: [0, 180],
      }}
      transition={{
        duration: 2.4 + Math.random(),
        delay,
        repeat: Infinity,
        repeatDelay: 1.2 + Math.random() * 2,
        ease: 'easeOut',
      }}
    >
      <Star size={size} fill={color} stroke="none" style={{ filter: `drop-shadow(0 0 ${size}px ${color})` }} />
    </motion.div>
  )
}

/* ─── Crown glow ring for #1 ─── */
function GoldenHalo() {
  return (
    <>
      {/* Conic rotating halo */}
      <motion.div
        className="absolute -inset-3 rounded-full pointer-events-none"
        style={{
          background: 'conic-gradient(from 0deg, transparent 0deg, rgba(255,184,0,0.7) 30deg, transparent 60deg, transparent 300deg, rgba(255,184,0,0.5) 330deg, transparent 360deg)',
        }}
        animate={{ rotate: 360 }}
        transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
      />
      {/* Static glow ring */}
      <div
        className="absolute -inset-2 rounded-full pointer-events-none"
        style={{ boxShadow: '0 0 0 2px rgba(255,184,0,0.3), 0 0 30px rgba(255,184,0,0.4)' }}
      />
    </>
  )
}

/* ─── Tilt-on-hover avatar bubble ─── */
function Avatar3D({ letter, color, size = 'md', crown = false, first = false }: {
  letter: string; color: string; size?: 'sm' | 'md' | 'lg'; crown?: boolean; first?: boolean
}) {
  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const sx = useSpring(mx, { stiffness: 200, damping: 22 })
  const sy = useSpring(my, { stiffness: 200, damping: 22 })
  const rotX = useTransform(sy, [-0.5, 0.5], [12, -12])
  const rotY = useTransform(sx, [-0.5, 0.5], [-12, 12])

  const dim = size === 'lg' ? 72 : size === 'md' ? 60 : 44
  const fontSize = size === 'lg' ? 'text-2xl' : size === 'md' ? 'text-xl' : 'text-base'

  return (
    <div style={{ perspective: 600 }} className="relative flex-shrink-0">
      {/* #1 sparkle field */}
      {first && (
        <div className="absolute -inset-8 pointer-events-none">
          {[
            { x: 10, y: 20, s: 8,  d: 0.0  },
            { x: 80, y: 10, s: 6,  d: 0.5  },
            { x: 90, y: 75, s: 7,  d: 1.1  },
            { x: 5,  y: 80, s: 6,  d: 1.7  },
            { x: 50, y: 5,  s: 10, d: 0.9  },
            { x: 40, y: 90, s: 6,  d: 0.3  },
            { x: 70, y: 40, s: 8,  d: 1.5  },
            { x: 20, y: 55, s: 5,  d: 2.0  },
          ].map((p, i) => (
            <Sparkle key={i} x={p.x} y={p.y} size={p.s} delay={p.d} color="#FFB800" />
          ))}
        </div>
      )}

      {crown && (
        <motion.div
          animate={{ y: [0, -4, 0], rotate: [-5, 5, -5] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -top-7 left-1/2 -translate-x-1/2 z-10"
        >
          <Crown size={22} fill="#FFB800" stroke="none" style={{ filter: 'drop-shadow(0 0 8px rgba(255,184,0,0.8))' }} />
        </motion.div>
      )}

      <motion.div
        style={{
          rotateX: rotX, rotateY: rotY, transformStyle: 'preserve-3d',
          width: dim, height: dim,
          background: first
            ? `conic-gradient(from 180deg, #FFB800, #FFD75A, #FFB800, #C28800, #FFB800)`
            : `linear-gradient(135deg, ${color}dd, ${color}88)`,
          boxShadow: first
            ? `0 0 0 3px rgba(255,184,0,0.4), 0 12px 40px rgba(255,184,0,0.5), inset 0 1px 0 rgba(255,255,255,0.5)`
            : `0 8px 24px ${color}55, inset 0 1px 0 rgba(255,255,255,0.3)`,
          position: 'relative',
        }}
        onMouseMove={(e) => {
          const el = e.currentTarget.getBoundingClientRect()
          mx.set((e.clientX - el.left) / el.width - 0.5)
          my.set((e.clientY - el.top) / el.height - 0.5)
        }}
        onMouseLeave={() => { mx.set(0); my.set(0) }}
        className="rounded-full flex items-center justify-center cursor-default select-none"
      >
        {first && <GoldenHalo />}
        <span className={`${fontSize} font-black relative z-10`} style={{ color: first ? '#5C3A00' : 'white', textShadow: first ? 'none' : '0 2px 8px rgba(0,0,0,0.3)' }}>
          {letter}
        </span>
      </motion.div>
    </div>
  )
}

/* ─── Podium column ─── */
function PodiumColumn({ leader, rank, height, color, delay }: { leader: Leader; rank: number; height: number; color: string; delay: number }) {
  const isFirst = rank === 1
  return (
    <div className="flex flex-col items-center gap-2">
      {/* Extra glow ring for #1 */}
      {isFirst && (
        <>
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="absolute rounded-full pointer-events-none"
              initial={{ width: 72, height: 72, opacity: 0 }}
              animate={{ width: 200, height: 200, opacity: [0, 0.3, 0] }}
              transition={{ duration: 2.8, delay: i * 0.6, repeat: Infinity, ease: 'easeOut' }}
              style={{ border: '1px solid rgba(255,184,0,0.6)', top: -40, left: '50%', x: '-50%' }}
            />
          ))}
        </>
      )}

      <Avatar3D letter={leader.name.charAt(0)} color={color} size={isFirst ? 'lg' : 'md'} crown={isFirst} first={isFirst} />
      <p className="text-white/90 text-[11px] font-bold text-center truncate w-20 px-1">{leader.name}</p>
      <div className="flex items-center gap-0.5">
        <Zap size={10} className={isFirst ? 'text-brand-gold' : 'text-white/50'} />
        <span className={`font-black text-xs ${isFirst ? 'text-brand-gold' : 'text-white/70'}`}>{leader.points.toLocaleString('ru')}</span>
      </div>

      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height, opacity: 1 }}
        transition={{ duration: 0.9, delay, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full rounded-t-2xl flex items-start justify-center pt-3 overflow-hidden"
        style={{
          background: isFirst
            ? 'linear-gradient(180deg, rgba(255,184,0,0.9), rgba(180,130,0,0.7))'
            : `linear-gradient(180deg, ${color}ee, ${color}88)`,
          boxShadow: isFirst ? '0 -8px 30px rgba(255,184,0,0.3)' : 'none',
        }}
      >
        <div className="absolute inset-x-0 top-0 h-[1px]" style={{ background: isFirst ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.5)' }} />
        <span className="text-white font-black text-2xl opacity-80">{rank}</span>
        <motion.div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.15) 50%, transparent 60%)', backgroundSize: '200% 100%' }}
          animate={{ backgroundPosition: ['-100% 0', '200% 0'] }}
          transition={{ duration: 2, repeat: Infinity, repeatDelay: 1.5 }}
        />
      </motion.div>
    </div>
  )
}

const PODIUM_COLORS = ['#F40009', '#9CA3AF', '#CD7F32']
const PODIUM_ORDER  = [1, 0, 2]
const PODIUM_HEIGHTS = [80, 130, 60]

export default function LeaderboardPage() {
  const { t } = useTranslation()
  const { user } = useAuthStore()
  const [period, setPeriod]   = useState('all')
  const [region, setRegion]   = useState('')
  const { data: leaders, isLoading } = useLeaderboard(region, period)

  const top3 = leaders?.slice(0, 3) ?? []
  const rest  = leaders?.slice(3)   ?? []

  return (
    <div className="min-h-screen bg-[#F8F8F8] pb-28">
      {/* ── Header ── */}
      <div className="relative aurora overflow-hidden px-6 pt-12 pb-4">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="relative z-10">
          <div className="flex items-center gap-3 mb-5">
            <motion.div
              animate={{ rotate: [0, -5, 5, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              className="w-11 h-11 bg-brand-gold/20 rounded-2xl flex items-center justify-center"
            >
              <Trophy size={22} fill="#FFB800" stroke="none" style={{ filter: 'drop-shadow(0 0 8px rgba(255,184,0,0.6))' }} />
            </motion.div>
            <div>
              <p className="text-white/40 text-[10px] font-bold tracking-widest uppercase">Рейтинг</p>
              <h1 className="display text-white text-3xl leading-none">{t('leaderboard.title')}</h1>
            </div>
          </div>

          {/* Period pills */}
          <div className="flex gap-2 overflow-x-auto pb-1 hide-scroll">
            {periods.map((p) => (
              <motion.button
                key={p.key}
                whileTap={{ scale: 0.95 }}
                onClick={() => setPeriod(p.key)}
                className={`whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                  period === p.key
                    ? 'bg-brand-red text-white shadow-[0_0_20px_rgba(244,0,9,0.5)]'
                    : 'bg-white/10 text-white/55 hover:bg-white/18'
                }`}
              >
                {t(p.label)}
              </motion.button>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Region filter */}
      <div className="px-5 py-3 flex gap-2 overflow-x-auto hide-scroll">
        {regionOptions.map((r) => (
          <motion.button
            key={r.key}
            whileTap={{ scale: 0.95 }}
            onClick={() => setRegion(r.key)}
            className={`whitespace-nowrap px-3.5 py-1.5 rounded-full text-[11px] font-bold border transition-all ${
              region === r.key
                ? 'bg-brand-charcoal text-white border-brand-charcoal'
                : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
            }`}
          >
            {t(r.label)}
          </motion.button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
            className="w-10 h-10 border-[3px] border-brand-red border-t-transparent rounded-full"
          />
        </div>
      ) : !leaders?.length ? (
        <p className="py-16 text-center text-gray-400">{t('common.no_data')}</p>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={`${period}-${region}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="px-5 space-y-4"
          >
            {/* ── 3D Podium ── */}
            {top3.length >= 3 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="relative rounded-3xl overflow-hidden"
                style={{ background: 'linear-gradient(180deg, #050505 0%, #111 100%)' }}
              >
                {/* Animated star field */}
                {Array.from({ length: 20 }).map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute rounded-full pointer-events-none"
                    style={{
                      width: 1 + (i % 2),
                      height: 1 + (i % 2),
                      left: `${(i * 13 + 5) % 100}%`,
                      top: `${(i * 17 + 7) % 60}%`,
                      background: 'white',
                    }}
                    animate={{ opacity: [0.1, 0.7, 0.1] }}
                    transition={{ duration: 2 + (i % 4), delay: i * 0.25, repeat: Infinity }}
                  />
                ))}

                {/* Red bottom glow */}
                <div className="absolute inset-0 pointer-events-none" style={{
                  background: 'radial-gradient(ellipse at 50% 110%, rgba(244,0,9,0.45) 0%, transparent 60%)',
                }} />
                {/* Gold center glow for #1 */}
                <div className="absolute inset-0 pointer-events-none" style={{
                  background: 'radial-gradient(ellipse at 50% 25%, rgba(255,184,0,0.12) 0%, transparent 50%)',
                }} />

                <div className="relative pt-10 pb-0 px-4">
                  <p className="text-white/20 text-[10px] font-black tracking-[0.35em] uppercase text-center mb-8">Лучшие участники</p>

                  <div className="grid grid-cols-3 gap-2 items-end relative" style={{ minHeight: 240 }}>
                    {PODIUM_ORDER.map((rankIdx, col) => {
                      const leader = top3[rankIdx]
                      if (!leader) return <div key={col} />
                      return (
                        <PodiumColumn
                          key={rankIdx}
                          leader={leader}
                          rank={rankIdx + 1}
                          height={PODIUM_HEIGHTS[rankIdx]}
                          color={PODIUM_COLORS[rankIdx]}
                          delay={0.1 + col * 0.12}
                        />
                      )
                    })}
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── Rank list ── */}
            <div className="bg-white rounded-3xl overflow-hidden shadow-sm">
              <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-50">
                <TrendingUp size={14} className="text-brand-red" />
                <h3 className="font-black text-brand-charcoal text-sm">Полный рейтинг</h3>
                <span className="ml-auto text-gray-300 text-xs">{leaders?.length} участников</span>
              </div>
              {rest.map((leader: Leader, i: number) => {
                const isMe = user?.name && leader.name.startsWith(user.name.split(' ')[0])
                const rankColors = ['text-brand-gold', 'text-gray-400', 'text-amber-600']
                return (
                  <motion.div
                    key={`${leader.rank}-${leader.name}`}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.03 + i * 0.02, type: 'spring', damping: 20 }}
                    className={`flex items-center gap-4 px-5 py-3 border-b border-gray-50 last:border-0 ${isMe ? 'bg-red-50' : 'hover:bg-gray-50'} transition-colors`}
                  >
                    <span className={`w-6 text-center text-sm font-black tabular ${leader.rank <= 3 ? rankColors[leader.rank - 1] : 'text-gray-300'}`}>
                      {leader.rank}
                    </span>

                    <Avatar3D letter={leader.name.charAt(0)} color={isMe ? '#F40009' : '#6B7280'} size="sm" />

                    <div className="flex-1 min-w-0">
                      <p className={`font-bold text-sm truncate ${isMe ? 'text-brand-red' : 'text-brand-charcoal'}`}>
                        {leader.name}
                        {isMe && <span className="ml-1.5 text-[9px] bg-brand-red text-white rounded-full px-1.5 py-0.5 font-black align-middle">ВЫ</span>}
                      </p>
                      <p className="text-xs text-gray-400">{t(`regions.${leader.region}`)}</p>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <div className="flex items-center gap-1 justify-end">
                        <Zap size={10} className="text-brand-gold" />
                        <span className="font-black text-brand-charcoal text-sm tabular">
                          {leader.points.toLocaleString('ru')}
                        </span>
                      </div>
                      <p className="text-[10px] text-gray-400">{leader.bottles} бут.</p>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  )
}
