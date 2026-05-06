import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { QrCode, Recycle, Gift, ArrowRight, ScanLine, Leaf, BarChart3 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/store/authStore'

const stats = [
  { value: '80M', label: 'бутылок/год' },
  { value: '8K+', label: 'точек продаж' },
  { value: '+20', label: 'очков за возврат' },
]

const steps = [
  { icon: QrCode,  num: '01', title: 'Купи', sub: 'Сканируй QR при покупке', accent: 'bg-brand-red' },
  { icon: ScanLine, num: '02', title: 'Сдай', sub: 'Найди пункт приёма', accent: 'bg-brand-charcoal' },
  { icon: Recycle,  num: '03', title: 'Получи', sub: '+20 очков за переработку', accent: 'bg-brand-eco' },
  { icon: Gift,     num: '04', title: 'Обменяй', sub: 'Пополнение Alif Mobi', accent: 'bg-brand-gold' },
]

export default function LandingPage() {
  const { t } = useTranslation()
  const { isAuthenticated } = useAuthStore()

  return (
    <div className="min-h-screen bg-white">
      {/* ── HERO ── */}
      <div className="relative mesh-hero noise overflow-hidden">
        {/* Nav */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex justify-between items-center px-6 pt-12 pb-2 relative z-10"
        >
          <div>
            <p className="text-white/50 text-xs font-semibold tracking-widest uppercase">Coca-Cola İçecek</p>
            <h1 className="text-white text-xl font-black tracking-tight">BotlBack TJ</h1>
          </div>
          {!isAuthenticated ? (
            <Link to="/login">
              <button className="glass text-white text-sm font-semibold px-5 py-2 rounded-full hover:bg-white/20 transition-all">
                Войти
              </button>
            </Link>
          ) : (
            <Link to="/wallet">
              <button className="glass text-white text-sm font-semibold px-5 py-2 rounded-full hover:bg-white/20 transition-all">
                Кошелёк
              </button>
            </Link>
          )}
        </motion.div>

        {/* Hero copy */}
        <div className="relative z-10 px-6 pt-10 pb-14 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.1 }}
          >
            <div className="inline-flex items-center gap-2 glass text-white/80 text-xs font-semibold px-4 py-1.5 rounded-full mb-6 tracking-wide">
              <Leaf size={13} className="text-brand-eco" />
              World Without Waste • Таджикистан
            </div>

            <h2 className="display text-white text-5xl mb-4 leading-none">
              Переработай.<br />
              <span className="text-brand-red" style={{ WebkitTextStroke: '1px rgba(255,255,255,0.3)' }}>Получи бонус.</span>
            </h2>

            <p className="text-white/60 text-sm mb-10 max-w-xs mx-auto leading-relaxed">
              Сканируй бутылки Coca-Cola, сдавай на переработку и получай баллы на Alif Mobi
            </p>

            <Link to={isAuthenticated ? '/scan' : '/login'}>
              <motion.div whileTap={{ scale: 0.96 }} whileHover={{ scale: 1.02 }}>
                <Button
                  size="lg"
                  className="bg-brand-red hover:bg-red-700 text-white px-10 py-6 text-base font-black rounded-2xl shadow-[0_0_40px_rgba(244,0,9,0.4)] gap-3"
                >
                  <QrCode size={22} />
                  {t('landing.scan_btn')}
                  <ArrowRight size={18} />
                </Button>
              </motion.div>
            </Link>
          </motion.div>
        </div>

        {/* Stats strip */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="relative z-10 grid grid-cols-3 gap-px mx-6 mb-8"
        >
          {stats.map(({ value, label }, i) => (
            <div key={i} className="glass text-center py-4 first:rounded-l-2xl last:rounded-r-2xl">
              <p className="text-white text-2xl font-black tracking-tight">{value}</p>
              <p className="text-white/50 text-xs mt-0.5">{label}</p>
            </div>
          ))}
        </motion.div>

        {/* Curved bottom edge */}
        <div className="absolute bottom-0 left-0 right-0 h-8 bg-white rounded-t-[2rem]" />
      </div>

      {/* ── HOW IT WORKS — bento grid ── */}
      <div className="px-6 py-10">
        <div className="flex items-center gap-3 mb-6">
          <BarChart3 size={20} className="text-brand-red" />
          <h3 className="text-lg font-black text-brand-charcoal tracking-tight">{t('landing.how_it_works')}</h3>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {steps.map(({ icon: Icon, num, title, sub, accent }, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.08 }}
              whileHover={{ y: -2 }}
              className={`relative overflow-hidden rounded-3xl p-5 ${i === 0 ? 'col-span-2' : ''}`}
              style={{ background: i === 0 ? '#F40009' : i === 2 ? '#0A0A0A' : i === 3 ? '#FFF8E7' : '#F5F5F5' }}
            >
              <span className="absolute top-4 right-4 text-5xl font-black opacity-10 leading-none select-none">
                {num}
              </span>
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center mb-3 ${i === 0 ? 'bg-white/20' : i === 2 ? 'bg-white/10' : `${accent}`}`}>
                <Icon size={20} className={i === 0 || i === 2 ? 'text-white' : i === 3 ? 'text-brand-gold' : 'text-white'} />
              </div>
              <p className={`font-black text-lg leading-tight ${i === 0 || i === 2 ? 'text-white' : 'text-brand-charcoal'}`}>
                {title}
              </p>
              <p className={`text-sm mt-0.5 ${i === 0 ? 'text-white/70' : i === 2 ? 'text-white/60' : 'text-gray-500'}`}>
                {sub}
              </p>
            </motion.div>
          ))}
        </div>

        {!isAuthenticated && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-8 text-center"
          >
            <p className="text-gray-400 text-sm mb-4">{t('auth.no_account')}</p>
            <Link to="/login">
              <Button variant="outline" className="w-full max-w-xs border-2 border-brand-red text-brand-red hover:bg-brand-red hover:text-white font-bold rounded-2xl">
                {t('auth.register')}
              </Button>
            </Link>
          </motion.div>
        )}
      </div>
    </div>
  )
}
