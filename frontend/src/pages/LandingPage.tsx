import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'
import { QrCode, Recycle, Gift, ArrowRight, ScanLine, Leaf, BarChart3, Sparkles, CheckCircle2, Star, Users } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { MagneticButton } from '@/components/MagneticButton'
import { Marquee } from '@/components/Marquee'
import { NumberRoll } from '@/components/NumberRoll'
import { CocaColaShowcase } from '@/components/CocaColaShowcase'

const stats = [
  { num: 511,  suffix: '+', label: 'участников' },
  { num: 30,   suffix: '',  label: 'точек приёма' },
  { num: 20,   suffix: '',  label: 'pts за возврат' },
]

const testimonials = [
  { name: 'Азиз К.', region: 'Душанбе', text: 'За месяц заработал 1200 очков — обменял на Alif Mobi!', rating: 5 },
  { name: 'Лола С.', region: 'Сугд',    text: 'Очень удобно. Сдала 47 бутылок — помогаю природе и зарабатываю.', rating: 5 },
  { name: 'Бахром М.', region: 'Хатлон', text: 'Сначала не верил, но баллы начисляются мгновенно. Рекомендую!', rating: 5 },
]


const steps = [
  { icon: QrCode,   num: '01', title: 'Купи',    sub: 'Сканируй QR при покупке', color: '#F40009' },
  { icon: ScanLine, num: '02', title: 'Сдай',    sub: 'Найди пункт приёма',      color: '#FF6B35' },
  { icon: Recycle,  num: '03', title: 'Получи',  sub: '+20 очков за переработку', color: '#00A651' },
  { icon: Gift,     num: '04', title: 'Обменяй', sub: 'Пополнение Alif Mobi',    color: '#6C63FF' },
]

const features = [
  'Совместим с iOS и Android',
  'Точки приёма по всему Таджикистану',
  'Мгновенное начисление баллов',
  'Призы от Coca-Cola İçecek',
]

const marqueeItems = [
  'World Without Waste',
  'Sustainable Tajikistan',
  'Recycle. Reward. Repeat',
  'Powered by Coca-Cola İçecek',
  'Hackathon Edition 2026',
]

export default function LandingPage() {
  const { t } = useTranslation()
  const { isAuthenticated } = useAuthStore()
  const heroRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] })
  const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '25%'])
  const heroOpacity = useTransform(scrollYProgress, [0, 0.85], [1, 0])

  return (
    <div className="min-h-screen bg-white relative overflow-x-hidden">

      {/* ══════════ HERO ══════════ */}
      <div ref={heroRef} className="relative aurora overflow-hidden">
        <motion.div style={{ y: heroY, opacity: heroOpacity }}>

          {/* ── Topbar ── */}
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex justify-between items-center px-6 lg:px-16 pt-8 lg:pt-10 pb-2 relative z-10"
          >
            <div>
              <p className="text-white/45 text-[10px] font-bold tracking-[0.25em] uppercase">Coca-Cola İçecek</p>
              <h1 className="text-white text-xl lg:text-2xl font-black tracking-tight">BotlBack TJ</h1>
            </div>
            <div className="flex items-center gap-3">
              {!isAuthenticated ? (
                <>
                  <Link to="/login">
                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                      className="glass text-white text-sm font-semibold px-5 py-2 rounded-full transition-all">
                      Войти
                    </motion.button>
                  </Link>
                  <Link to="/login" className="hidden lg:block">
                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                      className="bg-white text-brand-red text-sm font-black px-5 py-2 rounded-full transition-all">
                      Зарегистрироваться
                    </motion.button>
                  </Link>
                </>
              ) : (
                <Link to="/wallet">
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    className="glass text-white text-sm font-semibold px-5 py-2 rounded-full transition-all">
                    Кошелёк
                  </motion.button>
                </Link>
              )}
            </div>
          </motion.div>

          {/* ── Hero body — two-column on desktop ── */}
          <div className="relative z-10 px-6 lg:px-16 pt-8 lg:pt-16 pb-16 lg:pb-24 min-h-[580px] lg:min-h-[640px]
                          flex flex-col lg:flex-row lg:items-center lg:gap-12">

            {/* Left: copy */}
            <div className="lg:flex-1 lg:max-w-xl relative z-10">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.15 }}
                className="inline-flex items-center gap-2 glass text-white/85 text-[11px] font-semibold px-3.5 py-1.5 rounded-full mb-6 tracking-wide"
              >
                <Sparkles size={12} className="text-brand-gold" />
                Hackathon Edition · Душанбе 2026
              </motion.div>

              <h2 className="display text-white text-[clamp(40px,8vw,88px)] mb-4 leading-[0.88]">
                <motion.span className="block" initial={{ opacity: 0, x: -24 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
                  Bottle.
                </motion.span>
                <motion.span className="block gradient-text" style={{ display: 'inline-block' }}
                  initial={{ opacity: 0, x: -24 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.35 }}>
                  Back.
                </motion.span>
                <motion.span className="block text-white/90" style={{ WebkitTextStroke: '1.5px rgba(255,255,255,0.22)' }}
                  initial={{ opacity: 0, x: -24 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}>
                  Reward.
                </motion.span>
              </h2>

              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.65 }}
                className="text-white/55 text-base lg:text-lg mb-10 max-w-sm leading-relaxed font-medium">
                Сканируй бутылки Coca-Cola, сдавай на переработку, получай баллы на Alif Mobi.
              </motion.p>

              {/* Feature list — desktop only */}
              <motion.ul className="hidden lg:flex flex-col gap-2 mb-10"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.75 }}>
                {features.map((f, i) => (
                  <motion.li key={i} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.75 + i * 0.08 }}
                    className="flex items-center gap-2 text-white/65 text-sm font-medium">
                    <CheckCircle2 size={14} className="text-brand-eco flex-shrink-0" />
                    {f}
                  </motion.li>
                ))}
              </motion.ul>

              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.85 }}
                className="flex items-center gap-3 flex-wrap">
                <Link to={isAuthenticated ? '/scan' : '/login'}>
                  <MagneticButton className="rounded-2xl">
                    <div className="bg-brand-red text-white px-7 py-4 text-base font-black rounded-2xl glow-red flex items-center gap-3">
                      <QrCode size={20} />
                      {t('landing.scan_btn')}
                      <motion.div animate={{ x: [0, 4, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>
                        <ArrowRight size={18} />
                      </motion.div>
                    </div>
                  </MagneticButton>
                </Link>
                <Link to="/leaderboard">
                  <button className="text-white/60 hover:text-white text-sm font-semibold px-3 py-2 transition-colors">
                    Рейтинг →
                  </button>
                </Link>
              </motion.div>
            </div>

            {/* Right: bottle — desktop */}
            <motion.div
              className="hidden lg:flex lg:flex-1 items-center justify-center relative"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.9, delay: 0.3 }}
            >
              <CocaColaShowcase size={300} rings />
            </motion.div>

            {/* Mobile: bottle below hero copy, centred */}
            <motion.div
              className="lg:hidden flex justify-center mt-8 pointer-events-none"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.5 }}
            >
              <CocaColaShowcase size={160} rings={false} />
            </motion.div>
          </div>
        </motion.div>

        {/* Stats strip */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.0 }}
          className="relative z-10 grid grid-cols-3 gap-px mx-5 lg:mx-16 mb-6">
          {stats.map(({ num, suffix, label }, i) => (
            <motion.div key={i} whileHover={{ y: -2 }}
              className="glass text-center py-4 first:rounded-l-2xl last:rounded-r-2xl">
              <p className="text-white text-2xl lg:text-3xl font-black tracking-tight flex items-center justify-center">
                <NumberRoll value={num} duration={1.2} /><span>{suffix}</span>
              </p>
              <p className="text-white/50 text-[11px] lg:text-xs mt-0.5">{label}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Marquee */}
        <div className="relative z-10 border-y border-white/10 py-3 bg-black/40">
          <Marquee items={marqueeItems} className="text-white/70 text-sm font-bold tracking-wide uppercase" />
        </div>

        {/* Curved bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-8 bg-white rounded-t-[2rem] z-10" />
      </div>

      {/* ══════════ HOW IT WORKS ══════════ */}
      <div className="px-6 lg:px-16 pt-12 pb-28 lg:py-20 max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-15%' }} className="flex items-center gap-3 mb-8">
          <BarChart3 size={20} className="text-brand-red" />
          <h3 className="display text-2xl lg:text-4xl text-brand-charcoal">{t('landing.how_it_works')}</h3>
        </motion.div>

        {/* 2 cols mobile / 4 cols desktop */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
          {steps.map(({ icon: Icon, num, title, sub, color }, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-10%' }}
              transition={{ delay: 0.05 + i * 0.08, type: 'spring', damping: 16 }}
              whileHover={{ y: -4, scale: 1.02 }}
              className="relative overflow-hidden rounded-3xl p-5 lg:p-6 bg-white border border-gray-100 shadow-sm"
            >
              <span className="absolute top-3 right-4 text-6xl font-black leading-none select-none text-black/5">
                {num}
              </span>
              <div className="relative z-10 w-11 h-11 lg:w-12 lg:h-12 rounded-2xl flex items-center justify-center mb-3 lg:mb-4"
                style={{ background: color + '18' }}>
                <Icon size={20} style={{ color }} />
              </div>
              <p className="relative z-10 font-black text-lg text-brand-charcoal leading-tight">{title}</p>
              <p className="relative z-10 text-sm text-gray-500 mt-0.5">{sub}</p>
              {/* color accent bar */}
              <div className="absolute bottom-0 left-5 right-5 h-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ background: color }} />
            </motion.div>
          ))}
        </div>

        {/* Eco impact */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-10%' }}
          className="mt-6 lg:mt-8 rounded-3xl overflow-hidden relative"
          style={{ background: 'linear-gradient(135deg, #00A651 0%, #007a3c 100%)' }}>
          <div className="absolute inset-0 opacity-20"
            style={{ background: 'radial-gradient(circle at 80% 20%, rgba(255,255,255,0.4), transparent 60%)' }} />
          <div className="relative p-6 lg:p-8 flex items-center gap-5 lg:gap-8">
            <div className="w-14 h-14 lg:w-18 lg:h-18 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0">
              <Leaf size={28} className="text-white" />
            </div>
            <div className="flex-1">
              <p className="text-white text-2xl lg:text-4xl font-black leading-none">
                <NumberRoll value={6500} duration={1.6} />
                <span className="text-white/70 text-sm lg:text-base font-bold ml-2">кг CO₂</span>
              </p>
              <p className="text-white/70 text-xs lg:text-sm mt-1 font-medium">Сэкономлено сообществом BotlBack</p>
            </div>
            {/* Desktop CTA inside eco band */}
            {!isAuthenticated && (
              <Link to="/login" className="hidden lg:block flex-shrink-0">
                <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                  className="bg-white text-brand-eco font-black py-3 px-6 rounded-2xl text-sm shadow-lg">
                  Присоединиться →
                </motion.button>
              </Link>
            )}
          </div>
        </motion.div>

        {/* Mobile CTA */}
        {!isAuthenticated && (
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            transition={{ delay: 0.3 }} className="mt-8 text-center lg:hidden">
            <p className="text-gray-400 text-sm mb-4">{t('auth.no_account')}</p>
            <Link to="/login">
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                className="w-full max-w-xs border-2 border-brand-red text-brand-red font-bold py-3 px-6 rounded-2xl hover:bg-brand-red hover:text-white transition-all">
                {t('auth.register')}
              </motion.button>
            </Link>
          </motion.div>
        )}

        {/* Testimonials */}
        <motion.div initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-10%' }}
          className="mt-10 lg:mt-16">
          <div className="flex items-center gap-3 mb-6">
            <Users size={20} className="text-brand-red" />
            <h3 className="display text-2xl lg:text-4xl text-brand-charcoal">Что говорят участники</h3>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {testimonials.map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, type: 'spring', damping: 18 }}
                whileHover={{ y: -3 }}
                className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100"
              >
                <div className="flex gap-0.5 mb-3">
                  {[...Array(t.rating)].map((_, s) => (
                    <Star key={s} size={13} className="text-brand-gold fill-brand-gold" />
                  ))}
                </div>
                <p className="text-gray-700 text-sm leading-relaxed mb-4">"{t.text}"</p>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-brand-red rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-black">{t.name[0]}</span>
                  </div>
                  <div>
                    <p className="text-gray-900 text-xs font-bold">{t.name}</p>
                    <p className="text-gray-400 text-[10px]">{t.region}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Social proof banner */}
        {!isAuthenticated && (
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="mt-8 rounded-3xl p-6 lg:p-8 text-center"
            style={{ background: 'linear-gradient(135deg, #F40009 0%, #FF6B35 100%)' }}
          >
            <p className="text-white text-xs font-bold tracking-widest uppercase mb-2 opacity-80">Присоединяйся сейчас</p>
            <h3 className="text-white font-black text-2xl lg:text-3xl mb-1">511+ человек уже участвуют</h3>
            <p className="text-white/70 text-sm mb-6">Начни зарабатывать очки с первой бутылки Coca-Cola</p>
            <Link to="/login">
              <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                className="bg-white text-brand-red font-black py-3.5 px-8 rounded-2xl text-sm shadow-xl inline-flex items-center gap-2">
                Зарегистрироваться бесплатно
                <ArrowRight size={16} />
              </motion.button>
            </Link>
          </motion.div>
        )}

        <p className="text-center text-gray-300 text-xs mt-10">© 2026 Coca-Cola İçecek Tajikistan</p>
      </div>
    </div>
  )
}
