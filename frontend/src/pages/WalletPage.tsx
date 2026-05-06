import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Recycle, Leaf, Trophy, ArrowRight, QrCode, Zap, Sparkles, TrendingUp, Award } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { NumberRoll } from '@/components/NumberRoll'
import { StreakBadge } from '@/components/StreakBadge'
import { AnimatedBottle } from '@/components/AnimatedBottle'
import { ShareButton } from '@/components/ShareButton'
import { PullToRefresh } from '@/components/PullToRefresh'
import { ListItemSkeleton } from '@/components/Skeleton'
import { TierUpModal } from '@/components/TierUpModal'
import { useAuthStore } from '@/store/authStore'
import { useUserStats, useScanHistory } from '@/api/users'
import { useMe } from '@/api/auth'

type ScanItem = { id: number; scan_type: 'purchase' | 'recycle'; points_awarded: number; sku: string; region: string; created_at: string }

function timeAgo(iso: string): string {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000
  if (diff < 60) return 'только что'
  if (diff < 3600) return `${Math.floor(diff / 60)} мин назад`
  if (diff < 86400) return `${Math.floor(diff / 3600)} ч назад`
  return `${Math.floor(diff / 86400)} дн назад`
}

export default function WalletPage() {
  const { t } = useTranslation()
  const { user } = useAuthStore()
  const { data: stats } = useUserStats()
  const { data: me } = useMe()
  const { data: scanHistory, isLoading: scanLoading } = useScanHistory()
  const qc = useQueryClient()
  const meData = me as { total_points?: number; bottles_recycled?: number; co2_saved_kg?: number; streak_days?: number } | undefined

  const points = meData?.total_points ?? user?.total_points ?? 0
  const recycled = meData?.bottles_recycled ?? user?.bottles_recycled ?? 0
  const co2 = Math.round((meData?.co2_saved_kg ?? user?.co2_saved_kg ?? 0) * 10) / 10
  const streakDays = meData?.streak_days ?? 0

  const tier = points >= 1000
    ? { label: 'Platinum', color: '#A78BFA', next: 2000, prev: 1000 }
    : points >= 500
    ? { label: 'Gold',     color: '#FFB800', next: 1000, prev: 500 }
    : points >= 200
    ? { label: 'Silver',   color: '#9CA3AF', next: 500,  prev: 200 }
    : { label: 'Bronze',   color: '#CD7F32', next: 200,  prev: 0 }

  const tierProgress = Math.min(100, ((points - tier.prev) / (tier.next - tier.prev)) * 100)

  // Tier-up detection
  const [tierUp, setTierUp] = useState<string | null>(null)
  useEffect(() => {
    const seenKey = 'botlback_seen_tier'
    const seen = localStorage.getItem(seenKey)
    if (seen !== tier.label && tier.label !== 'Bronze') {
      setTierUp(tier.label)
      localStorage.setItem(seenKey, tier.label)
    } else if (!seen) {
      localStorage.setItem(seenKey, tier.label)
    }
  }, [tier.label])

  const onRefresh = async () => {
    await Promise.all([
      qc.invalidateQueries({ queryKey: ['me'] }),
      qc.invalidateQueries({ queryKey: ['stats'] }),
      qc.invalidateQueries({ queryKey: ['scan-history'] }),
    ])
  }

  return (
    <div className="min-h-screen bg-[#F8F8F8] pb-28">
      <TierUpModal tier={tierUp} onClose={() => setTierUp(null)} />
      <PullToRefresh onRefresh={onRefresh}>
      {/* ── Hero card ── aurora red */}
      <div className="relative aurora overflow-hidden px-6 pt-12 pb-28">
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10"
        >
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="text-white/55 text-[10px] font-bold tracking-[0.25em] uppercase">Баланс</p>
              <p className="text-white text-base font-bold mt-1">
                {user?.name?.split(' ')[0] ?? 'Пользователь'}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <ShareButton
                title="Мой кошелёк BotlBack"
                text={`У меня ${points} pts в BotlBack TJ! 🌱 Уровень ${tier.label}`}
                className="w-10 h-10 glass rounded-full flex items-center justify-center text-white"
              />
              {/* Tier badge — conic gold ring */}
              <motion.div
                initial={{ scale: 0, rotate: -45 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', damping: 14, delay: 0.2 }}
                className="relative"
              >
                <div className="w-14 h-14 rounded-full p-[2px]" style={{ background: `linear-gradient(135deg, ${tier.color}, ${tier.color}88)` }}>
                  <div className="w-full h-full rounded-full bg-black/80 flex items-center justify-center backdrop-blur">
                    <Trophy size={20} style={{ color: tier.color }} />
                  </div>
                </div>
                <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 text-[9px] font-black text-white bg-black/80 px-2 py-0.5 rounded-full whitespace-nowrap" style={{ color: tier.color }}>
                  {tier.label}
                </span>
              </motion.div>
            </div>
          </div>

          {/* Streak badge */}
          {streakDays > 0 && (
            <motion.div
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.35 }}
              className="mb-4"
            >
              <StreakBadge days={streakDays} size="md" />
            </motion.div>
          )}

          {/* Massive rolling counter */}
          <div className="flex items-end gap-3 mb-1">
            <NumberRoll
              value={points}
              duration={1.6}
              className="text-[88px] font-black text-white tracking-tighter leading-[0.85]"
            />
            <span className="text-white/45 text-xl font-medium mb-3">pts</span>
          </div>

          {/* Tier progress bar */}
          <div className="mt-6 mb-2">
            <div className="flex items-center justify-between text-[11px] mb-2">
              <span className="text-white/55 font-semibold">До {tier.next === 2000 ? 'следующего' : tier.next === 1000 ? 'Platinum' : tier.next === 500 ? 'Gold' : 'Silver'}</span>
              <span className="text-white font-bold">{Math.max(0, tier.next - points)} pts</span>
            </div>
            <div className="h-1.5 bg-white/15 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${tierProgress}%` }}
                transition={{ duration: 1.4, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="h-full rounded-full"
                style={{ background: `linear-gradient(90deg, #FFB800, ${tier.color})` }}
              />
            </div>
          </div>

          {stats?.rank && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex items-center gap-2 mt-4"
            >
              <Sparkles size={11} className="text-brand-gold" />
              <p className="text-white/50 text-[11px] font-medium">
                #{stats.rank} в рейтинге • {user?.region ? t(`regions.${user.region}`) : 'Душанбе'}
              </p>
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* ── Bento stats ── */}
      <div className="px-5 -mt-16 relative z-10 space-y-3">
        {/* 3-col stats row */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: Recycle, value: recycled, label: 'Сдано', unit: 'бут.', accent: '#00A651', tint: 'rgba(0,166,81,0.08)' },
            { icon: Leaf, value: co2, label: 'CO₂', unit: 'кг', accent: '#10B981', tint: 'rgba(16,185,129,0.08)' },
            { icon: Trophy, value: stats?.rank ?? 0, label: 'Ранг', unit: '', accent: '#FFB800', tint: 'rgba(255,184,0,0.10)', prefix: '#' },
          ].map(({ icon: Icon, value, label, unit, accent, tint, prefix = '' }, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.08, type: 'spring', damping: 18 }}
              whileHover={{ y: -3 }}
              className="bg-white rounded-3xl p-4 text-center shadow-[0_4px_20px_rgba(0,0,0,0.04)] relative overflow-hidden"
            >
              <div className="absolute inset-0" style={{ background: tint }} />
              <div className="relative">
                <Icon size={20} className="mx-auto mb-2" style={{ color: accent }} />
                <p className="text-brand-charcoal font-black text-lg leading-none flex items-baseline justify-center">
                  {prefix && <span>{prefix}</span>}
                  <NumberRoll value={typeof value === 'number' ? Math.round(value) : 0} duration={1.2} />
                  {unit && <span className="text-xs font-semibold text-gray-400 ml-0.5">{unit}</span>}
                </p>
                <p className="text-gray-500 text-[11px] mt-1 font-semibold">{label}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Animated bottle progress card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-white rounded-3xl p-5 shadow-[0_4px_20px_rgba(0,0,0,0.04)] flex items-center gap-5 overflow-hidden relative"
        >
          <div className="absolute -right-10 -top-10 w-32 h-32 rounded-full opacity-30"
            style={{ background: `radial-gradient(circle, ${tier.color}, transparent 70%)` }} />
          <AnimatedBottle fill={tierProgress} width={70} height={110} />
          <div className="flex-1 min-w-0 relative">
            <p className="text-[10px] font-bold tracking-widest uppercase text-gray-400">Прогресс</p>
            <p className="display text-brand-charcoal text-2xl mt-0.5">
              {tier.label} → {tier.next === 2000 ? 'Diamond' : tier.next === 1000 ? 'Platinum' : tier.next === 500 ? 'Gold' : 'Silver'}
            </p>
            <p className="text-gray-500 text-xs mt-1.5">
              Ещё <span className="font-black text-brand-red">{Math.max(0, tier.next - points)} pts</span> до следующего уровня
            </p>
          </div>
        </motion.div>

        {/* Achievements + Leaderboard quick links */}
        <div className="grid grid-cols-2 gap-3">
          <Link to="/achievements">
            <motion.div
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="bg-gradient-to-br from-brand-gold/15 to-amber-50 rounded-3xl p-4 flex items-center gap-3 h-full"
            >
              <div className="w-10 h-10 bg-brand-gold/20 rounded-2xl flex items-center justify-center">
                <Award size={18} className="text-brand-gold" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-black text-brand-charcoal text-sm leading-tight">Достижения</p>
                <p className="text-gray-500 text-xs">Коллекция</p>
              </div>
              <ArrowRight size={14} className="text-gray-400" />
            </motion.div>
          </Link>
          <Link to="/leaderboard">
            <motion.div
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="bg-gradient-to-br from-red-50 to-orange-50 rounded-3xl p-4 flex items-center gap-3 h-full"
            >
              <div className="w-10 h-10 bg-brand-red/15 rounded-2xl flex items-center justify-center">
                <Trophy size={18} className="text-brand-red" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-black text-brand-charcoal text-sm leading-tight">Рейтинг</p>
                <p className="text-gray-500 text-xs">#{stats?.rank ?? '?'}</p>
              </div>
              <ArrowRight size={14} className="text-gray-400" />
            </motion.div>
          </Link>
        </div>

        {/* CTA row */}
        <div className="grid grid-cols-2 gap-3">
          <Link to="/rewards" className="col-span-1">
            <motion.div
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="bg-brand-red rounded-3xl p-5 flex flex-col h-full min-h-[110px] relative overflow-hidden"
            >
              {/* shimmer */}
              <motion.div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.18) 50%, transparent 60%)',
                  backgroundSize: '200% 100%',
                }}
                animate={{ backgroundPosition: ['-100% 0', '200% 0'] }}
                transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 1.5 }}
              />
              <Zap size={22} className="text-white mb-auto relative z-10" />
              <div className="mt-3 relative z-10">
                <p className="text-white font-black text-base leading-tight">Обменять баллы</p>
                <p className="text-white/65 text-xs mt-0.5">8 призов</p>
              </div>
              <ArrowRight size={16} className="text-white/60 mt-2 self-end relative z-10" />
            </motion.div>
          </Link>
          <Link to="/scan" className="col-span-1">
            <motion.div
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="bg-brand-dark rounded-3xl p-5 flex flex-col h-full min-h-[110px] relative overflow-hidden"
            >
              {/* gradient blob */}
              <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full opacity-20"
                style={{ background: 'radial-gradient(circle, #F40009, transparent 70%)' }} />
              <QrCode size={22} className="text-white mb-auto relative z-10" />
              <div className="mt-3 relative z-10">
                <p className="text-white font-black text-base leading-tight">Сканировать</p>
                <p className="text-white/40 text-xs mt-0.5">+10 / +20 pts</p>
              </div>
              <ArrowRight size={16} className="text-white/40 mt-2 self-end relative z-10" />
            </motion.div>
          </Link>
        </div>

        {/* Activity feed */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-3xl overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.04)]"
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
            <div className="flex items-center gap-2">
              <TrendingUp size={14} className="text-brand-red" />
              <h3 className="font-black text-brand-charcoal text-sm">{t('wallet.recent_activity')}</h3>
            </div>
            <span className="text-[10px] text-gray-400 font-semibold tracking-wider uppercase">Live</span>
          </div>
          {scanLoading ? (
            <div className="divide-y divide-gray-50">
              {[...Array(4)].map((_, i) => <ListItemSkeleton key={i} />)}
            </div>
          ) : !scanHistory?.length ? (
            <p className="text-gray-400 text-sm text-center py-10">{t('wallet.empty')}</p>
          ) : (
            <div className="divide-y divide-gray-50">
              {(scanHistory as ScanItem[]).slice(0, 8).map((scan, i) => {
                const isRecycle = scan.scan_type === 'recycle'
                return (
                  <motion.div
                    key={scan.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + i * 0.05 }}
                    className="flex items-center gap-4 px-5 py-3.5"
                  >
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 ${isRecycle ? 'bg-green-100' : 'bg-red-50'}`}>
                      {isRecycle
                        ? <Recycle size={17} className="text-brand-eco" />
                        : <QrCode size={17} className="text-brand-red" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate">
                        {isRecycle ? t('wallet.recycle') : t('wallet.purchase')}
                      </p>
                      <p className="text-xs text-gray-400 truncate">{scan.sku} · {timeAgo(scan.created_at)}</p>
                    </div>
                    <span className={`font-black text-sm flex-shrink-0 ${isRecycle ? 'text-brand-eco' : 'text-brand-red'}`}>
                      +{scan.points_awarded}
                    </span>
                  </motion.div>
                )
              })}
            </div>
          )}
        </motion.div>

      </div>
      </PullToRefresh>
    </div>
  )
}
