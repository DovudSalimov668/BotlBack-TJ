import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { Calendar, Target, TrendingUp } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useCampaigns } from '@/api/analytics'

export default function CampaignsPage() {
  const { t } = useTranslation()
  const { data: campaigns } = useCampaigns()

  const statusColors: Record<string, string> = {
    active: 'bg-green-100 text-green-700',
    ended: 'bg-gray-100 text-gray-600',
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-brand-charcoal">{t('admin.campaigns')}</h1>
          <p className="text-gray-500 text-sm mt-1">Маркетинговые кампании CCI Таджикистан</p>
        </div>
        <Button size="sm">+ Создать кампанию</Button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {campaigns?.map((c: {
          id: number; name: string; description: string; start_date: string; end_date: string;
          bottles_tracked: number; target_bottles: number; progress_pct: number; is_active: boolean
        }, i: number) => (
          <motion.div
            key={c.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className={`shadow-sm border-l-4 ${c.is_active ? 'border-l-brand-red' : 'border-l-gray-200'}`}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-base leading-tight">{c.name}</CardTitle>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ml-2 flex-shrink-0 ${c.is_active ? statusColors.active : statusColors.ended}`}>
                    {c.is_active ? 'Активна' : 'Завершена'}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {c.description && (
                  <p className="text-xs text-gray-500">{c.description}</p>
                )}
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Calendar size={12} />
                  {c.start_date} — {c.end_date}
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="flex items-center gap-1 text-gray-600">
                      <Target size={12} />
                      Прогресс
                    </span>
                    <span className="font-semibold text-brand-red">{c.progress_pct}%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-brand-red rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(c.progress_pct, 100)}%` }}
                      transition={{ duration: 1.2, ease: 'easeOut' }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>{c.bottles_tracked.toLocaleString('ru')} бутылок</span>
                    <span>цель: {c.target_bottles.toLocaleString('ru')}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-xs">
                  <TrendingUp size={12} className="text-green-500" />
                  <span className="text-gray-600">ROI estimate: </span>
                  <span className="font-semibold text-green-600">
                    {(c.bottles_tracked * 0.001).toFixed(0)} USD
                  </span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
