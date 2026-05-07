import { Outlet, useLocation, Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { QrCode, Wallet, Gift, Trophy, MapPin, User, Recycle } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '@/store/authStore'
import { cn } from '@/lib/utils'

const navItems = [
  { path: '/scan',        icon: QrCode,  key: 'nav.scan'         },
  { path: '/wallet',      icon: Wallet,  key: 'nav.wallet'       },
  { path: '/rewards',     icon: Gift,    key: 'nav.rewards'      },
  { path: '/leaderboard', icon: Trophy,  key: 'nav.leaderboard'  },
  { path: '/map',         icon: MapPin,  key: 'nav.map'          },
]

const pageVariants = {
  initial: { opacity: 0, y: 14, scale: 0.98 },
  animate: { opacity: 1, y: 0,  scale: 1     },
  exit:    { opacity: 0, y: -8, scale: 0.99  },
}

const pageTransition = {
  type: 'tween',
  ease: [0.25, 0.46, 0.45, 0.94],
  duration: 0.28,
}

/* ── Desktop sidebar ── */
function DesktopSidebar({ pathname }: { pathname: string }) {
  const { t } = useTranslation()
  const { user } = useAuthStore()

  const initials = user?.name
    ? user.name.split(' ').map((p: string) => p[0]).join('').slice(0, 2).toUpperCase()
    : '?'

  return (
    <aside className="hidden lg:flex flex-col w-64 fixed left-0 top-0 h-full z-40"
      style={{ background: '#0A0A0A', borderRight: '1px solid rgba(255,255,255,0.06)' }}>

      {/* Logo */}
      <div className="px-6 py-7 border-b border-white/6">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-9 h-9 bg-brand-red rounded-xl flex items-center justify-center flex-shrink-0">
            <Recycle size={17} className="text-white" />
          </div>
          <div>
            <h1 className="text-white text-sm font-black tracking-tight leading-none">BotlBack TJ</h1>
            <p className="text-white/30 text-[10px] mt-0.5">Coca-Cola İçecek</p>
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map(({ path, icon: Icon, key }) => {
          const active = pathname === path || (path !== '/' && pathname.startsWith(path))
          return (
            <Link key={path} to={path}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all',
                active
                  ? 'bg-brand-red text-white shadow-[0_4px_20px_rgba(244,0,9,0.3)]'
                  : 'text-white/35 hover:bg-white/6 hover:text-white'
              )}>
              <Icon size={17} strokeWidth={active ? 2.5 : 1.8} />
              {t(key)}
            </Link>
          )
        })}
      </nav>

      {/* User */}
      {user && (
        <div className="p-4 border-t border-white/6">
          <Link to="/profile" className="flex items-center gap-3 px-2 py-2 rounded-2xl hover:bg-white/6 transition-colors group">
            <div className="w-9 h-9 bg-brand-red rounded-2xl flex items-center justify-center text-white text-sm font-black flex-shrink-0">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-xs font-bold truncate">{user.name}</p>
              <p className="text-white/30 text-[10px]">Мой профиль</p>
            </div>
            <User size={13} className="text-white/20 group-hover:text-white/50 transition-colors flex-shrink-0" />
          </Link>
        </div>
      )}
    </aside>
  )
}

/* ── Mobile bottom nav ── */
function MobileBottomNav({ pathname }: { pathname: string }) {
  const { t } = useTranslation()
  return (
    <nav className="lg:hidden fixed bottom-4 left-4 right-4 z-50">
      <div className="flex items-center justify-around max-w-lg mx-auto rounded-[2rem] px-2 py-2
                      shadow-[0_8px_40px_rgba(0,0,0,0.18)]"
        style={{
          background: 'rgba(14,14,14,0.88)',
          backdropFilter: 'blur(28px)',
          WebkitBackdropFilter: 'blur(28px)',
          border: '1px solid rgba(255,255,255,0.08)',
        }}>
        {navItems.map(({ path, icon: Icon, key }) => {
          const active = pathname === path || (path !== '/' && pathname.startsWith(path))
          return (
            <Link key={path} to={path}
              className="relative flex flex-col items-center gap-0.5 py-1.5 px-4 rounded-2xl transition-all">
              {active && <span className="absolute inset-0 bg-brand-red rounded-2xl" style={{ zIndex: -1 }} />}
              <Icon size={21} strokeWidth={active ? 2.5 : 1.8}
                className={cn('transition-colors', active ? 'text-white' : 'text-white/40')} />
              <span className={cn('text-[10px] font-semibold transition-colors', active ? 'text-white' : 'text-white/30')}>
                {t(key)}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

export default function ConsumerLayout() {
  const location = useLocation()
  const { pathname } = location
  const isFullscreen = pathname.startsWith('/scan')

  return (
    <div className="flex min-h-screen bg-[#F4F4F4]">
      {/* Desktop sidebar — hidden on scan pages */}
      {!isFullscreen && <DesktopSidebar pathname={pathname} />}

      {/* Main column */}
      <div className={cn('flex-1 flex flex-col', !isFullscreen && 'lg:ml-64')}>

        {/* Mobile header — not shown on scan pages */}
        {!isFullscreen && (
          <header className="lg:hidden sticky top-0 z-30 px-5 py-3 flex items-center justify-between"
            style={{
              background: 'rgba(255,255,255,0.88)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              borderBottom: '1px solid rgba(0,0,0,0.06)',
            }}>
            <Link to="/" className="flex items-center gap-2">
              <div className="w-7 h-7 bg-brand-red rounded-lg flex items-center justify-center">
                <span className="text-white text-xs font-black">B</span>
              </div>
              <span className="font-black text-brand-charcoal text-base tracking-tight">BotlBack TJ</span>
            </Link>
            <Link to="/profile"
              className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors">
              <User size={17} className="text-gray-600" />
            </Link>
          </header>
        )}

        {/* Desktop top-bar — breadcrumb / page title */}
        {!isFullscreen && (
          <div className="hidden lg:flex items-center justify-between px-8 py-4 border-b border-gray-200 bg-white sticky top-0 z-30">
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <span className="font-medium">BotlBack TJ</span>
              <span>/</span>
              <span className="text-brand-charcoal font-semibold capitalize">
                {pathname.split('/').filter(Boolean)[0] ?? 'Главная'}
              </span>
            </div>
            <Link to="/profile"
              className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition-colors">
              <div className="w-7 h-7 bg-brand-red rounded-full flex items-center justify-center">
                <User size={13} className="text-white" />
              </div>
              Профиль
            </Link>
          </div>
        )}

        {/* Page content */}
        <main className={cn('flex-1', !isFullscreen && 'pb-24 lg:pb-8')}>
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={pageTransition}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Mobile bottom nav */}
      {!isFullscreen && <MobileBottomNav pathname={pathname} />}
    </div>
  )
}
