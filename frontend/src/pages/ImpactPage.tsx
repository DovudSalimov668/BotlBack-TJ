import { motion } from 'framer-motion'
import { Leaf, Share2, TreePine, Car, Zap, Recycle, Globe, ArrowRight, Droplets } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useMe } from '@/api/auth'
import { useAuthStore } from '@/store/authStore'
import { NumberRoll } from '@/components/NumberRoll'

function co2ToTrees(kg: number) { return +(kg / 21 * 12).toFixed(1) }
function co2ToKm(kg: number) { return Math.round(kg * 4.8) }
function co2ToPhoneCharges(kg: number) { return Math.round(kg * 122) }

const COMMUNITY_RECYCLED = 2340
const COMMUNITY_CO2 = +(COMMUNITY_RECYCLED * 0.082).toFixed(1)
const COMMUNITY_TREES = co2ToTrees(COMMUNITY_CO2)

export default function ImpactPage() {
  const { data: me } = useMe()
  const { user } = useAuthStore()
  const bottles = me?.bottles_recycled ?? user?.bottles_recycled ?? 0
  const co2 = +(bottles * 0.082).toFixed(2)
  const trees = co2ToTrees(co2)
  const km = co2ToKm(co2)
  const charges = co2ToPhoneCharges(co2)
  const totalPoints = me?.total_points ?? user?.total_points ?? 0
  const communityPct = Math.round((bottles / Math.max(COMMUNITY_RECYCLED, 1)) * 100)

  const share = async () => {
    const text = `🌱 Я сдал(а) ${bottles} бутылок Coca-Cola на переработку!\n\n♻️ Спас(ла) ${co2} кг CO₂\n🌳 Это как посадить ${trees} дерева\n\nПрисоединяйся: botlback.tj`
    if (navigator.share) {
      await navigator.share({ title: 'Мой эко-вклад — BotlBack TJ', text }).catch(() => {})
    } else {
      await navigator.clipboard.writeText(text).catch(() => {})
    }
  }

  return (
    <div className="min-h-screen bg-[#F8F8F8] pb-28 lg:pb-8">

      {/* Hero */}
      <div className="relative overflow-hidden px-6 pt-10 pb-28"
        style={{ background: 'linear-gradient(150deg, #00A651 0%, #007a3c 60%, #005a2c 100%)' }}>
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at 30% 0%, rgba(255,255,255,0.12), transparent 60%)' }} />

        {/* Floating leaf decorations */}
        {[...Array(6)].map((_, i) => (
          <motion.div key={i} className="absolute pointer-events-none opacity-10"
            style={{ left: `${10 + i * 15}%`, top: `${20 + (i % 3) * 25}%` }}
            animate={{ y: [0, -12, 0], rotate: [0, 15, 0] }}
            transition={{ duration: 3 + i * 0.5, repeat: Infinity, delay: i * 0.4 }}>
            <Leaf size={24 + i * 4} className="text-white" />
          </motion.div>
        ))}

        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/15 text-white/85 text-[10px] font-bold px-3 py-1.5 rounded-full mb-5 tracking-widest uppercase">
            <Globe size={11} />
            Мой эко-вклад
          </div>
          <h1 className="text-white font-black text-4xl lg:text-5xl leading-tight mb-2">
            Ты меняешь мир<br />к лучшему 🌍
          </h1>
          <p className="text-white/60 text-sm max-w-xs mt-3 leading-relaxed">
            Каждая сданная тобой бутылка — это реальный вклад в будущее Таджикистана
          </p>
        </motion.div>
      </div>

      {/* Main stats card — overlapping hero */}
      <div className="px-5 lg:px-8 -mt-20 relative z-10 max-w-2xl mx-auto space-y-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-white rounded-3xl p-6 shadow-[0_8px_40px_rgba(0,0,0,0.12)]">
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="text-[10px] font-bold text-gray-400 tracking-widest uppercase">Ты переработал(а)</p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-5xl font-black text-brand-charcoal">
                  <NumberRoll value={bottles} duration={1.4} />
                </span>
                <span className="text-gray-400 font-semibold text-lg">бут.</span>
              </div>
            </div>
            <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center">
              <Recycle size={28} className="text-brand-eco" />
            </div>
          </div>
          <div className="h-px bg-gray-100 mb-5" />

          {/* CO2 big number */}
          <div className="text-center py-4">
            <p className="text-[10px] font-bold text-gray-400 tracking-widest uppercase mb-2">CO₂ сэкономлено</p>
            <div className="flex items-baseline justify-center gap-1">
              <span className="text-6xl font-black" style={{ color: '#00A651' }}>
                <NumberRoll value={Math.round(co2 * 10) / 10} duration={1.6} />
              </span>
              <span className="text-2xl font-bold text-gray-300 ml-1">кг</span>
            </div>
            <p className="text-gray-400 text-xs mt-2">из 1000 кг цели сообщества</p>
            <div className="mt-3 h-2 bg-gray-100 rounded-full overflow-hidden">
              <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(100, (co2 / 1000) * 100)}%` }}
                transition={{ duration: 1.4, delay: 0.5, ease: [0.16,1,0.3,1] }}
                className="h-full rounded-full bg-brand-eco" />
            </div>
          </div>
        </motion.div>

        {/* Equivalency cards */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: TreePine,  value: trees,   label: 'деревьев',    unit: 'эквивалент', color: '#00A651', bg: 'rgba(0,166,81,0.08)' },
            { icon: Car,       value: km,      label: 'км',          unit: 'как не ехать', color: '#FF6B35', bg: 'rgba(255,107,53,0.08)' },
            { icon: Zap,       value: charges, label: 'зарядок',     unit: 'смартфона', color: '#6C63FF', bg: 'rgba(108,99,255,0.08)' },
          ].map(({ icon: Icon, value, label, unit, color, bg }, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.08 }}
              className="bg-white rounded-3xl p-4 text-center shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center mx-auto mb-2" style={{ background: bg }}>
                <Icon size={18} style={{ color }} />
              </div>
              <p className="font-black text-xl text-brand-charcoal leading-none">
                <NumberRoll value={value} duration={1.2} />
              </p>
              <p className="text-[10px] text-gray-500 font-semibold mt-0.5">{label}</p>
              <p className="text-[9px] text-gray-300 mt-0.5">{unit}</p>
            </motion.div>
          ))}
        </div>

        {/* Community comparison */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
          className="bg-white rounded-3xl p-5 shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-blue-50 rounded-xl flex items-center justify-center">
              <Globe size={16} className="text-blue-500" />
            </div>
            <div>
              <p className="font-black text-sm text-brand-charcoal">Вклад в сообщество</p>
              <p className="text-[10px] text-gray-400">511 участников BotlBack TJ</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3 text-center">
            {[
              { value: COMMUNITY_RECYCLED, label: 'бутылок сдано', suffix: '' },
              { value: Math.round(COMMUNITY_CO2), label: 'кг CO₂', suffix: '' },
              { value: Math.round(COMMUNITY_TREES), label: 'деревьев', suffix: '' },
            ].map(({ value, label }, i) => (
              <div key={i}>
                <p className="font-black text-lg text-brand-charcoal"><NumberRoll value={value} duration={1.2} /></p>
                <p className="text-[10px] text-gray-400">{label}</p>
              </div>
            ))}
          </div>
          {communityPct > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-50 text-center">
              <p className="text-sm text-gray-600">
                Твой вклад: <span className="font-black text-brand-eco">{communityPct}%</span> от всего сообщества
              </p>
            </div>
          )}
        </motion.div>

        {/* Fun fact */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="rounded-3xl p-5 flex items-center gap-4"
          style={{ background: 'linear-gradient(135deg, #1E1E1E, #2d0004)' }}>
          <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center flex-shrink-0">
            <Droplets size={22} className="text-blue-300" />
          </div>
          <div>
            <p className="text-white font-black text-sm">Знаешь ли ты?</p>
            <p className="text-white/55 text-xs mt-1 leading-relaxed">
              1 пластиковая бутылка разлагается <strong className="text-white/80">450 лет</strong>. Ты помог(ла) прервать этот цикл!
            </p>
          </div>
        </motion.div>

        {/* CTA buttons */}
        <div className="grid grid-cols-2 gap-3 pb-4">
          <motion.button whileTap={{ scale: 0.96 }} onClick={share}
            className="flex items-center justify-center gap-2 py-4 rounded-2xl font-black text-white text-sm"
            style={{ background: 'linear-gradient(135deg, #00A651, #007a3c)' }}>
            <Share2 size={16} />
            Поделиться
          </motion.button>
          <Link to="/scan">
            <motion.button whileTap={{ scale: 0.96 }}
              className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-black text-brand-red text-sm bg-white border-2 border-red-100">
              Сдать ещё
              <ArrowRight size={16} />
            </motion.button>
          </Link>
        </div>

        {/* Points earned reminder */}
        {totalPoints > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
            className="text-center pb-2">
            <p className="text-gray-400 text-sm">
              У тебя <span className="font-black text-brand-red">{totalPoints} очков</span> — обменяй на призы!
            </p>
            <Link to="/rewards" className="text-brand-red text-sm font-bold underline underline-offset-2 mt-1 inline-block">
              Смотреть призы →
            </Link>
          </motion.div>
        )}
      </div>
    </div>
  )
}
