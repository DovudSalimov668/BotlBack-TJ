import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'
import { QrCode, Recycle, Gift, ArrowRight, ScanLine, Leaf, BarChart3, Sparkles } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { MagneticButton } from '@/components/MagneticButton'
import { Marquee } from '@/components/Marquee'
import { NumberRoll } from '@/components/NumberRoll'

const stats = [
  { num: 80, suffix: 'M', label: 'бутылок/год' },
  { num: 8,  suffix: 'K+', label: 'точек продаж' },
  { num: 20, suffix: '',   label: 'pts за возврат' },
]

const steps = [
  { icon: QrCode,   num: '01', title: 'Купи',     sub: 'Сканируй QR при покупке' },
  { icon: ScanLine, num: '02', title: 'Сдай',     sub: 'Найди пункт приёма' },
  { icon: Recycle,  num: '03', title: 'Получи',   sub: '+20 очков за переработку' },
  { icon: Gift,     num: '04', title: 'Обменяй',  sub: 'Пополнение Alif Mobi' },
]

const marqueeItems = [
  'World Without Waste',
  'Sustainable Tajikistan',
  'Recycle. Reward. Repeat',
  'Powered by Coca-Cola İçecek',
  'Hackathon Edition 2026',
]

/* ─── Floating 3D bottle illustration ─── */
function FloatingBottle() {
  return (
    <motion.div
      className="absolute right-[-20px] top-[10%] z-0"
      initial={{ opacity: 0, x: 60, rotate: -8 }}
      animate={{ opacity: 1, x: 0, rotate: 8 }}
      transition={{ duration: 1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
    >
      <motion.div
        animate={{ y: [0, -10, 0], rotate: [8, 6, 8] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        className="relative"
        style={{ filter: 'drop-shadow(0 30px 60px rgba(244,0,9,0.45))' }}
      >
        <svg width="180" height="280" viewBox="0 0 180 280" fill="none">
          <defs>
            <linearGradient id="bottleGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor="#FF1A24" />
              <stop offset="50%"  stopColor="#F40009" />
              <stop offset="100%" stopColor="#A30007" />
            </linearGradient>
            <linearGradient id="capGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"  stopColor="#FFFFFF" />
              <stop offset="100%" stopColor="#D0D0D0" />
            </linearGradient>
          </defs>
          {/* cap */}
          <rect x="68" y="10" width="44" height="22" rx="3" fill="url(#capGrad)" />
          {/* neck */}
          <path d="M75 32 H105 L102 60 H78 Z" fill="#F40009" />
          {/* body */}
          <path d="M58 60 Q90 50 122 60 L130 240 Q90 260 50 240 Z" fill="url(#bottleGrad)" />
          {/* highlight */}
          <path d="M72 80 Q70 160 78 230" stroke="rgba(255,255,255,0.45)" strokeWidth="3" strokeLinecap="round" fill="none" />
          {/* label */}
          <rect x="55" y="120" width="70" height="60" rx="3" fill="white" opacity="0.97" />
          <text x="90" y="148" textAnchor="middle" fontFamily="Inter, sans-serif" fontWeight="900" fontSize="13" fill="#F40009" letterSpacing="-0.5">Coca-Cola</text>
          <text x="90" y="165" textAnchor="middle" fontFamily="Inter, sans-serif" fontWeight="700" fontSize="9" fill="#666">RECYCLE</text>
          {/* QR dot grid */}
          <g transform="translate(78, 188)">
            {Array.from({ length: 16 }).map((_, i) => (
              <rect key={i} x={(i % 4) * 6} y={Math.floor(i / 4) * 6} width="4" height="4" fill={i % 3 === 0 ? '#0A0A0A' : '#F40009'} />
            ))}
          </g>
        </svg>
      </motion.div>
    </motion.div>
  )
}

export default function LandingPage() {
  const { t } = useTranslation()
  const { isAuthenticated } = useAuthStore()
  const heroRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] })
  const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '30%'])
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0])

  return (
    <div className="min-h-screen bg-white relative">
      {/* ── HERO ── aurora + parallax */}
      <div ref={heroRef} className="relative aurora overflow-hidden">
        <motion.div style={{ y: heroY, opacity: heroOpacity }} className="relative">
          {/* Nav */}
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex justify-between items-center px-6 pt-12 pb-2 relative z-10"
          >
            <div>
              <p className="text-white/50 text-[10px] font-bold tracking-[0.25em] uppercase">Coca-Cola İçecek</p>
              <h1 className="text-white text-xl font-black tracking-tight">BotlBack TJ</h1>
            </div>
            {!isAuthenticated ? (
              <Link to="/login">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="glass text-white text-sm font-semibold px-5 py-2 rounded-full transition-all"
                >
                  Войти
                </motion.button>
              </Link>
            ) : (
              <Link to="/wallet">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="glass text-white text-sm font-semibold px-5 py-2 rounded-full transition-all"
                >
                  Кошелёк
                </motion.button>
              </Link>
            )}
          </motion.div>

          {/* Hero copy */}
          <div className="relative z-10 px-6 pt-8 pb-16 min-h-[640px] flex flex-col justify-center">
            <FloatingBottle />

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="relative z-10"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 glass text-white/85 text-[11px] font-semibold px-3.5 py-1.5 rounded-full mb-6 tracking-wide"
              >
                <Sparkles size={12} className="text-brand-gold" />
                Hackathon Edition · Душанбе 2026
              </motion.div>

              {/* Massive kinetic display heading */}
              <h2 className="display text-white text-[64px] mb-2 leading-[0.88]">
                <motion.span
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.25, duration: 0.6 }}
                  className="block"
                >
                  Bottle.
                </motion.span>
                <motion.span
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4, duration: 0.6 }}
                  className="block gradient-text"
                  style={{ display: 'inline-block' }}
                >
                  Back.
                </motion.span>
                <motion.span
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.55, duration: 0.6 }}
                  className="block text-white/90"
                  style={{ WebkitTextStroke: '1.5px rgba(255,255,255,0.25)' }}
                >
                  Reward.
                </motion.span>
              </h2>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="text-white/55 text-sm mb-10 max-w-[260px] leading-relaxed font-medium"
              >
                Сканируй бутылки Coca-Cola, сдавай на переработку, получай баллы на Alif Mobi.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.85 }}
                className="flex items-center gap-3"
              >
                <Link to={isAuthenticated ? '/scan' : '/login'}>
                  <MagneticButton className="rounded-2xl">
                    <div className="bg-brand-red text-white px-7 py-4 text-base font-black rounded-2xl glow-red flex items-center gap-3">
                      <QrCode size={20} />
                      {t('landing.scan_btn')}
                      <motion.div
                        animate={{ x: [0, 4, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                      >
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
            </motion.div>
          </div>
        </motion.div>

        {/* Stats strip with rolling numbers */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
          className="relative z-10 grid grid-cols-3 gap-px mx-5 mb-6"
        >
          {stats.map(({ num, suffix, label }, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -2 }}
              className="glass text-center py-4 first:rounded-l-2xl last:rounded-r-2xl"
            >
              <p className="text-white text-2xl font-black tracking-tight flex items-center justify-center">
                <NumberRoll value={num} duration={1.2} />
                <span>{suffix}</span>
              </p>
              <p className="text-white/50 text-[11px] mt-0.5">{label}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Marquee strip — kinetic brand statement */}
        <div className="relative z-10 border-y border-white/10 py-3 bg-black/40">
          <Marquee
            items={marqueeItems}
            className="text-white/70 text-sm font-bold tracking-wide uppercase"
          />
        </div>

        {/* Curved bottom edge */}
        <div className="absolute bottom-0 left-0 right-0 h-8 bg-white rounded-t-[2rem] z-10" />
      </div>

      {/* ── HOW IT WORKS — bento grid ── */}
      <div className="px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-15%' }}
          className="flex items-center gap-3 mb-6"
        >
          <BarChart3 size={20} className="text-brand-red" />
          <h3 className="display text-2xl text-brand-charcoal">{t('landing.how_it_works')}</h3>
        </motion.div>

        <div className="grid grid-cols-2 gap-3">
          {steps.map(({ icon: Icon, num, title, sub }, i) => {
            const cardBg = i === 0 ? '#F40009' : i === 2 ? '#0A0A0A' : i === 3 ? '#FFF8E7' : '#F5F5F5'
            const isLight = i === 1 || i === 3
            const colSpan = i === 0 ? 'col-span-2' : ''
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 24, rotateX: -8 }}
                whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
                viewport={{ once: true, margin: '-10%' }}
                transition={{ delay: 0.06 + i * 0.08, type: 'spring', damping: 16 }}
                whileHover={{ y: -3, rotateX: 4, scale: 1.01 }}
                className={`relative overflow-hidden rounded-3xl p-5 ${colSpan}`}
                style={{ background: cardBg, transformStyle: 'preserve-3d', perspective: 800 }}
              >
                <span className={`absolute top-3 right-4 text-6xl font-black leading-none select-none ${isLight ? 'text-black/8' : 'text-white/12'}`}>
                  {num}
                </span>

                {/* shimmer on red card */}
                {i === 0 && (
                  <div className="absolute inset-0 pointer-events-none">
                    <motion.div
                      className="absolute inset-0"
                      style={{
                        background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.15) 50%, transparent 60%)',
                        backgroundSize: '200% 100%',
                      }}
                      animate={{ backgroundPosition: ['-100% 0', '200% 0'] }}
                      transition={{ duration: 2.4, repeat: Infinity, repeatDelay: 1.5 }}
                    />
                  </div>
                )}

                <div className={`relative z-10 w-11 h-11 rounded-2xl flex items-center justify-center mb-3 ${
                  i === 0 ? 'bg-white/20'
                  : i === 2 ? 'bg-white/10'
                  : i === 3 ? 'bg-brand-gold'
                  : 'bg-brand-red'}`}>
                  <Icon size={20} className={i === 3 && false ? '' : 'text-white'} />
                </div>
                <p className={`relative z-10 font-black text-lg leading-tight ${isLight ? 'text-brand-charcoal' : 'text-white'}`}>
                  {title}
                </p>
                <p className={`relative z-10 text-sm mt-0.5 ${i === 0 ? 'text-white/75' : i === 2 ? 'text-white/55' : 'text-gray-500'}`}>
                  {sub}
                </p>
              </motion.div>
            )
          })}
        </div>

        {/* Eco impact callout */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-10%' }}
          className="mt-6 rounded-3xl overflow-hidden relative"
          style={{ background: 'linear-gradient(135deg, #00A651 0%, #007a3c 100%)' }}
        >
          <div className="absolute inset-0 opacity-20" style={{
            background: 'radial-gradient(circle at 80% 20%, rgba(255,255,255,0.4), transparent 60%)',
          }} />
          <div className="relative p-6 flex items-center gap-5">
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0">
              <Leaf size={28} className="text-white" />
            </div>
            <div className="flex-1">
              <p className="text-white text-2xl font-black leading-none">
                <NumberRoll value={6500} duration={1.6} />
                <span className="text-white/70 text-sm font-bold ml-1">кг CO₂</span>
              </p>
              <p className="text-white/70 text-xs mt-1 font-medium">Сэкономлено сообществом</p>
            </div>
          </div>
        </motion.div>

        {!isAuthenticated && (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="mt-8 text-center"
          >
            <p className="text-gray-400 text-sm mb-4">{t('auth.no_account')}</p>
            <Link to="/login">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full max-w-xs border-2 border-brand-red text-brand-red font-bold py-3 px-6 rounded-2xl hover:bg-brand-red hover:text-white transition-all"
              >
                {t('auth.register')}
              </motion.button>
            </Link>
          </motion.div>
        )}

        <p className="text-center text-gray-300 text-xs mt-10">
          © 2026 Coca-Cola İçecek Tajikistan
        </p>
      </div>
    </div>
  )
}
