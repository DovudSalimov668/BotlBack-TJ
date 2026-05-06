import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import { Gift, CheckCircle, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { usePrizes, useRedeem } from '@/api/rewards'
import { useAuthStore } from '@/store/authStore'
import { useMe } from '@/api/auth'

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
      setTimeout(() => { setSelectedPrize(null); setRedeemed(false) }, 2000)
    } catch (err) {
      console.error(err)
    }
  }

  const emojis = ['💳', '💰', '💎', '💧', '👜', '👕', '🧲', '🍵']

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="bg-gradient-to-br from-brand-red to-red-700 text-white px-6 pt-12 pb-8">
        <h1 className="text-2xl font-black">{t('rewards.title')}</h1>
        <p className="text-red-200 mt-1">
          {t('rewards.your_points')}: <strong className="text-white">{points}</strong> {t('wallet.points')}
        </p>
      </div>

      <div className="px-4 py-6">
        {isLoading ? (
          <div className="grid grid-cols-2 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-40 bg-gray-200 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {prizes?.map((prize: { id: number; name: string; points_cost: number; stock_quantity: number }, i: number) => {
              const canAfford = points >= prize.points_cost
              const inStock = prize.stock_quantity !== 0
              return (
                <motion.div
                  key={prize.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <Card className={`cursor-pointer transition-all ${!canAfford || !inStock ? 'opacity-60' : 'hover:shadow-md'}`}>
                    <CardContent className="p-4 text-center">
                      <div className="text-4xl mb-3">{emojis[i % emojis.length]}</div>
                      <p className="font-semibold text-sm text-gray-800 leading-tight mb-2">{prize.name}</p>
                      <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${canAfford ? 'bg-brand-red text-white' : 'bg-gray-200 text-gray-500'}`}>
                        {prize.points_cost} {t('rewards.points_required')}
                      </div>
                      {!inStock && (
                        <p className="text-xs text-gray-400 mt-1">{t('rewards.out_of_stock')}</p>
                      )}
                      {canAfford && inStock && (
                        <Button
                          size="sm"
                          className="w-full mt-3 text-xs"
                          onClick={() => setSelectedPrize(prize)}
                        >
                          {t('rewards.redeem')}
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>

      <AnimatePresence>
        {selectedPrize && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-end"
            onClick={() => !redeemed && setSelectedPrize(null)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="bg-white rounded-t-3xl p-6 w-full"
              onClick={(e) => e.stopPropagation()}
            >
              {redeemed ? (
                <div className="text-center py-4">
                  <CheckCircle size={60} className="text-green-500 mx-auto mb-3" />
                  <h3 className="text-xl font-bold text-gray-800">{t('rewards.redeem_success')}</h3>
                  <p className="text-gray-500 mt-1">{selectedPrize.name}</p>
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-gray-800">{t('rewards.confirm_redeem')}</h3>
                    <button onClick={() => setSelectedPrize(null)}><X size={20} className="text-gray-400" /></button>
                  </div>
                  <div className="bg-gray-50 rounded-2xl p-4 mb-6">
                    <p className="font-semibold text-gray-800">{selectedPrize.name}</p>
                    <p className="text-brand-red font-bold mt-1">{selectedPrize.points_cost} {t('rewards.points_required')}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      После обмена останется: {points - selectedPrize.points_cost} {t('wallet.points')}
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => setSelectedPrize(null)}
                    >
                      {t('rewards.cancel_btn')}
                    </Button>
                    <Button
                      className="flex-1"
                      onClick={handleRedeem}
                      disabled={redeem.isPending}
                    >
                      {redeem.isPending ? t('common.loading') : t('rewards.confirm_btn')}
                    </Button>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
