import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, X, Gift, Zap, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { TiltCard } from '@/components/TiltCard'
import { usePrizes, useRedeem } from '@/api/rewards'
import { useAuthStore } from '@/store/authStore'
import { useMe } from '@/api/auth'

const prizeIcons = ['💳', '💰', '💎', '💧', '👜', '👕', '🧲', '🍵']
const prizeAccents = [
  'from-red-500 to-rose-600',
  'from-orange-500 to-amber-600',
  'from-blue-500 to-indigo-600',
  'from-cyan-500 to-blue-600',
  'from-purple-500 to-violet-600',
  'from-brand-red to-red-700',
  'from-green-500 to-emerald-600',
  'from-brand-gold to-orange-500',
]

export default function RewardsPage() {
  const { t } = useTranslation()
  const { user } = useAuthStore()
  const { data: me } = useMe()
  const { data: prizes, isLoading } = usePrizes()
  const redeem = useRedeem()
  const [selectedPrize, setSelectedPrize] = useState<{ id: number; name: string; points_cost: number } | null>(null)
  const [redeemed, setRedeemed] = useState(false)

  const meData = me as { total_points?: number } | undefined
  const points = meData?.total_points ?? user?.total_points ?? 0

  const handleRedeem = async () => {
    if (!selectedPrize) return
    try {
      await redeem.mutateAsync(selectedPrize.id)
      setRedeemed(true)
      setTimeout(() => { setSelectedPrize(null); setRedeemed(false) }, 2200)
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="min-h-screen bg-[#F8F8F8] pb-28">
      {/* ── Header ── */}
      <div className="relative mesh-hero noise overflow-hidden px-6 pt-12 pb-10">
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-white/40 text-[10px] font-semibold tracking-widest uppercase mb-1">Магазин призов</p>
          <h1 className="display text-white text-4xl mb-1">{t('rewards.title')}</h1>
          <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-1.5 mt-2">
            <Zap size={13} className="text-brand-gold" />
            <span className="text-white/80 text-sm font-bold">{points} pts</span>
            <span className="text-white/30 text-xs">доступно</span>
          </div>
        </motion.div>
      </div>

      {/* ── Prize grid ── */}
      <div className="px-4 py-6">
        {isLoading ? (
          <div className="grid grid-cols-2 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-48 bg-gray-200 rounded-3xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {prizes?.map((prize: { id: number; name: string; points_cost: number; stock_quantity: number }, i: number) => {
              const canAfford = points >= prize.points_cost
              const inStock   = prize.stock_quantity !== 0
              const locked    = !canAfford || !inStock
              return (
                <motion.div
                  key={prize.id}
                  initial={{ opacity: 0, y: 24, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ delay: i * 0.06, type: 'spring', damping: 18 }}
                >
                  <TiltCard
                    intensity={locked ? 4 : 10}
                    className={`relative rounded-3xl overflow-hidden cursor-pointer select-none ${locked ? 'opacity-70' : ''}`}
                    onClick={() => canAfford && inStock && setSelectedPrize(prize)}
                  >
                    {/* Card face */}
                    <div className={`bg-gradient-to-br ${prizeAccents[i % prizeAccents.length]} p-5 pb-4`}>
                      {/* Lock badge */}
                      {locked && (
                        <div className="absolute top-3 right-3 w-6 h-6 bg-black/30 rounded-full flex items-center justify-center">
                          <Lock size={11} className="text-white/70" />
                        </div>
                      )}

                      <div className="text-4xl mb-3" style={{ transform: 'translateZ(20px)' }}>
                        {prizeIcons[i % prizeIcons.length]}
                      </div>

                      <p className="text-white font-black text-sm leading-tight mb-3" style={{ transform: 'translateZ(16px)' }}>
                        {prize.name}
                      </p>

                      <div
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black ${canAfford ? 'bg-white/25 text-white' : 'bg-black/20 text-white/60'}`}
                        style={{ transform: 'translateZ(12px)' }}
                      >
                        <Zap size={10} />
                        {prize.points_cost} pts
                      </div>
                    </div>

                    {canAfford && inStock && (
                      <div className="bg-white px-4 py-2.5 flex items-center justify-between">
                        <span className="text-brand-charcoal text-xs font-bold">Обменять</span>
                        <Gift size={14} className="text-brand-red" />
                      </div>
                    )}
                    {!inStock && (
                      <div className="bg-gray-100 px-4 py-2.5">
                        <span className="text-gray-400 text-xs font-semibold">{t('rewards.out_of_stock')}</span>
                      </div>
                    )}
                    {inStock && !canAfford && (
                      <div className="bg-gray-50 px-4 py-2.5 flex items-center gap-1.5">
                        <Lock size={11} className="text-gray-400" />
                        <span className="text-gray-400 text-xs font-semibold">Нужно ещё {prize.points_cost - points} pts</span>
                      </div>
                    )}
                  </TiltCard>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>

      {/* ── Confirm bottom sheet ── */}
      <AnimatePresence>
        {selectedPrize && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm"
              onClick={() => !redeemed && setSelectedPrize(null)}
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 26, stiffness: 340 }}
              className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl p-6 max-w-lg mx-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {redeemed ? (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-center py-6"
                >
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 size={44} className="text-brand-eco" />
                  </div>
                  <h3 className="text-xl font-black text-brand-charcoal">{t('rewards.redeem_success')}</h3>
                  <p className="text-gray-500 mt-2 text-sm">{selectedPrize.name}</p>
                </motion.div>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="text-lg font-black text-brand-charcoal">{t('rewards.confirm_redeem')}</h3>
                    <button
                      onClick={() => setSelectedPrize(null)}
                      className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center"
                    >
                      <X size={16} className="text-gray-500" />
                    </button>
                  </div>
                  <div className="bg-[#F8F8F8] rounded-2xl p-4 mb-6">
                    <p className="font-black text-brand-charcoal">{selectedPrize.name}</p>
                    <div className="flex items-center gap-1.5 mt-2">
                      <Zap size={13} className="text-brand-red" />
                      <span className="text-brand-red font-bold">{selectedPrize.points_cost} pts</span>
                    </div>
                    <p className="text-gray-400 text-sm mt-2">
                      Останется: <strong className="text-brand-charcoal">{points - selectedPrize.points_cost}</strong> pts
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      className="flex-1 rounded-2xl border-2 font-bold"
                      onClick={() => setSelectedPrize(null)}
                    >
                      {t('rewards.cancel_btn')}
                    </Button>
                    <Button
                      className="flex-1 bg-brand-red hover:bg-red-600 text-white font-black rounded-2xl"
                      onClick={handleRedeem}
                      disabled={redeem.isPending}
                    >
                      {redeem.isPending
                        ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        : t('rewards.confirm_btn')}
                    </Button>
                  </div>
                </>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
