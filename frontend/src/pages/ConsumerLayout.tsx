import { Outlet, useLocation, Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { QrCode, Wallet, Gift, Leaf, MapPin, User, Recycle, Trophy, LogIn, PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import { cn } from '@/lib/utils'
import { OnboardingModal } from '@/components/OnboardingModal'
import { CampaignBanner } from '@/components/CampaignBanner'

const navItems = [
  { path: '/scan',        icon: QrCode,  key: 'nav.scan',    auth: true  },
  { path: '/wallet',      icon: Wallet,  key: 'nav.wallet',  auth: true  },
  { path: '/rewards',     icon: Gift,    key: 'nav.rewards', auth: true  },
  { path: '/impact',      icon: Leaf,    key: 'nav.impact',  auth: true  },
  { path: '/map',         icon: MapPin,  key: 'nav.map',     auth: false },
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
function DesktopSidebar({ pathname, collapsed, onToggle }: { pathname: string; collapsed: boolean; onToggle: () => void }) {
  const { t } = useTranslation()
  const { user } = useAuthStore()

  const initials = user?.name
    ? user.name.split(' ').map((p: string) => p[0]).join('').slice(0, 2).toUpperCase()
    : '?'

  return (
    <motion.aside
      className="hidden lg:flex flex-col fixed left-0 top-0 h-full z-40 overflow-hidden"
      animate={{ width: collapsed ? 64 : 256 }}
      transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
      style={{ background: '#0A0A0A', borderRight: '1px solid rgba(255,255,255,0.06)' }}
    >
      {/* Logo + toggle */}
      <div className="px-3 py-5 border-b border-white/6 flex items-center justify-between gap-2 flex-shrink-0">
        {!collapsed && (
          <Link to="/" className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 bg-brand-red rounded-xl flex items-center justify-center flex-shrink-0">
              <Recycle size={17} className="text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="text-white text-sm font-black tracking-tight leading-none">BotlBack TJ</h1>
              <p className="text-white/30 text-[10px] mt-0.5">Coca-Cola İçecek</p>
            </div>
          </Link>
        )}
        {collapsed && (
          <div className="w-9 h-9 bg-brand-red rounded-xl flex items-center justify-center flex-shrink-0 mx-auto">
            <Recycle size={17} className="text-white" />
          </div>
        )}
        <button
          onClick={onToggle}
          className={cn('text-white/30 hover:text-white transition-colors flex-shrink-0', collapsed && 'hidden')}
          title="Свернуть меню"
        >
          <PanelLeftClose size={16} />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-2 space-y-0.5 overflow-hidden">
        {[...navItems, { path: '/leaderboard', icon: Trophy, key: 'nav.leaderboard', auth: false }]
          .filter(item => !item.auth || !!user)
          .map(({ path, icon: Icon, key }) => {
            const active = pathname === path || (path !== '/' && pathname.startsWith(path))
            return (
              <Link key={path} to={path}
                title={collapsed ? t(key) : undefined}
                className={cn(
                  'flex items-center gap-3 px-3 py-3 rounded-2xl text-sm font-semibold transition-all whitespace-nowrap overflow-hidden',
                  collapsed ? 'justify-center' : '',
                  active
                    ? 'bg-brand-red text-white shadow-[0_4px_20px_rgba(244,0,9,0.3)]'
                    : 'text-white/35 hover:bg-white/6 hover:text-white'
                )}>
                <Icon size={17} strokeWidth={active ? 2.5 : 1.8} className="flex-shrink-0" />
                {!collapsed && t(key)}
              </Link>
            )
          })}

        {/* Expand button when collapsed */}
        {collapsed && (
          <button
            onClick={onToggle}
            title="Развернуть меню"
            className="w-full flex items-center justify-center px-3 py-3 rounded-2xl text-white/20 hover:text-white hover:bg-white/6 transition-all"
          >
            <PanelLeftOpen size={17} />
          </button>
        )}
      </nav>

      {/* User or Login */}
      <div className="p-2 border-t border-white/6 flex-shrink-0">
        {user ? (
          <Link to="/profile"
            title={collapsed ? user.name : undefined}
            className={cn('flex items-center gap-3 px-3 py-2.5 rounded-2xl hover:bg-white/6 transition-colors group overflow-hidden', collapsed && 'justify-center')}>
            <div className="w-9 h-9 bg-brand-red rounded-2xl flex items-center justify-center text-white text-sm font-black flex-shrink-0">
              {initials}
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-white text-xs font-bold truncate">{user.name}</p>
                <p className="text-white/30 text-[10px]">{t('profile.my_profile')}</p>
              </div>
            )}
          </Link>
        ) : (
          <Link to="/login"
            title={collapsed ? t('auth.login') : undefined}
            className={cn('flex items-center gap-3 px-3 py-3 rounded-2xl bg-brand-red text-white text-sm font-black transition-all hover:bg-red-600 overflow-hidden', collapsed && 'justify-center')}>
            <LogIn size={17} className="flex-shrink-0" />
            {!collapsed && t('auth.login')}
          </Link>
        )}
      </div>
    </motion.aside>
  )
}

/* ── Mobile bottom nav ── */
function MobileBottomNav({ pathname }: { pathname: string }) {
  const { t } = useTranslation()
  const { user } = useAuthStore()

  const visibleItems = user
    ? navItems
    : [...navItems.filter(i => !i.auth), { path: '/login', icon: LogIn, key: 'auth.login', auth: false }]

  return (
    <nav className="lg:hidden fixed left-2 right-2 z-50 bottom-safe-4">
      <div className="flex items-center justify-around max-w-lg mx-auto rounded-[2rem] px-1 py-1.5
                      shadow-[0_8px_40px_rgba(0,0,0,0.18)]"
        style={{
          background: 'rgba(14,14,14,0.92)',
          backdropFilter: 'blur(28px)',
          WebkitBackdropFilter: 'blur(28px)',
          border: '1px solid rgba(255,255,255,0.08)',
        }}>
        {visibleItems.map(({ path, icon: Icon, key }) => {
          const active = pathname === path || (path !== '/' && pathname.startsWith(path))
          const isLogin = path === '/login'
          return (
            <Link key={path} to={path}
              className="relative flex flex-col items-center gap-0.5 py-2.5 flex-1 rounded-2xl transition-all min-w-0">
              {(active || isLogin) && <span className={cn('absolute inset-0 rounded-2xl', isLogin && !active ? 'bg-brand-red/80' : 'bg-brand-red')} style={{ zIndex: -1 }} />}
              <Icon size={19} strokeWidth={active || isLogin ? 2.5 : 1.8}
                className={cn('transition-colors flex-shrink-0', active || isLogin ? 'text-white' : 'text-white/40')} />
              <span className={cn('text-[9px] font-semibold transition-colors truncate w-full text-center leading-none', active || isLogin ? 'text-white' : 'text-white/30')}>
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
  const { t } = useTranslation()
  const { user } = useAuthStore()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const isFullscreen = pathname.startsWith('/scan')
  const hideChrome = isFullscreen || pathname === '/map'

  const sidebarWidth = sidebarCollapsed ? 64 : 256

  return (
    <div className="flex min-h-screen bg-[#F8F8F8]">
      {/* Desktop sidebar — hidden on scan/map pages */}
      {!hideChrome && <DesktopSidebar pathname={pathname} collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(v => !v)} />}

      {/* Main column — animated left margin tracks sidebar width */}
      <motion.div
        className="flex-1 flex flex-col min-w-0"
        animate={{ marginLeft: hideChrome ? 0 : sidebarWidth }}
        transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
      >

        {/* Mobile header — not shown on scan/map pages */}
        {!hideChrome && (
          <header className="lg:hidden sticky top-0 z-30 px-5 py-3 flex items-center justify-between"
            style={{
              background: 'rgba(248,248,248,0.92)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
            }}>
            <Link to="/" className="flex items-center gap-2">
              <div className="w-7 h-7 bg-brand-red rounded-lg flex items-center justify-center">
                <span className="text-white text-xs font-black">B</span>
              </div>
              <span className="font-black text-brand-charcoal text-base tracking-tight">BotlBack TJ</span>
            </Link>
            {user ? (
              <Link to="/profile"
                className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors">
                <User size={17} className="text-gray-600" />
              </Link>
            ) : (
              <Link to="/login"
                className="flex items-center gap-1.5 bg-brand-red text-white text-xs font-black px-3 py-2 rounded-xl transition-colors hover:bg-red-600">
                <LogIn size={13} />
                Войти
              </Link>
            )}
          </header>
        )}

        {/* Desktop top-bar — only shown when sidebar is collapsed */}
        {!hideChrome && sidebarCollapsed && (
          <div className="hidden lg:flex items-center justify-between px-6 py-3 sticky top-0 z-30"
            style={{ background: 'rgba(248,248,248,0.92)', backdropFilter: 'blur(20px)' }}>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span className="font-semibold text-brand-charcoal capitalize">
                {pathname.split('/').filter(Boolean)[0] ?? 'BotlBack TJ'}
              </span>
            </div>
            {user && (
              <Link to="/profile"
                className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition-colors">
                <div className="w-7 h-7 bg-brand-red rounded-full flex items-center justify-center">
                  <User size={13} className="text-white" />
                </div>
              </Link>
            )}
          </div>
        )}

        {/* Campaign banner */}
        {!hideChrome && <CampaignBanner />}

        {/* Page content — full width, each page controls its own max-width */}
        <main className={cn('flex-1', !hideChrome && 'pb-nav lg:pb-8')}>
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={pageTransition}
              className="w-full"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>

        <OnboardingModal />

        {/* Mobile bottom nav */}
        {!isFullscreen && <MobileBottomNav pathname={pathname} />}
      </motion.div>
    </div>
  )
}
