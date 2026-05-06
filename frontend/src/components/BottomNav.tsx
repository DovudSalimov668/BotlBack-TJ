import { Link, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { QrCode, Wallet, Gift, Trophy, MapPin } from 'lucide-react'
import { cn } from '@/lib/utils'

const tabs = [
  { path: '/scan',        icon: QrCode,  key: 'nav.scan' },
  { path: '/wallet',      icon: Wallet,  key: 'nav.wallet' },
  { path: '/rewards',     icon: Gift,    key: 'nav.rewards' },
  { path: '/leaderboard', icon: Trophy,  key: 'nav.leaderboard' },
  { path: '/map',         icon: MapPin,  key: 'nav.map' },
]

export function BottomNav() {
  const { pathname } = useLocation()
  const { t } = useTranslation()

  return (
    <nav className="fixed bottom-4 left-4 right-4 z-50">
      <div
        className="flex items-center justify-around max-w-lg mx-auto rounded-[2rem] px-2 py-2 shadow-[0_8px_40px_rgba(0,0,0,0.18)]"
        style={{
          background: 'rgba(14, 14, 14, 0.88)',
          backdropFilter: 'blur(28px)',
          WebkitBackdropFilter: 'blur(28px)',
          border: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        {tabs.map(({ path, icon: Icon, key }) => {
          const active = pathname === path || (path !== '/' && pathname.startsWith(path))
          return (
            <Link
              key={path}
              to={path}
              className="relative flex flex-col items-center gap-0.5 py-1.5 px-4 rounded-2xl transition-all"
            >
              {active && (
                <span className="absolute inset-0 bg-brand-red rounded-2xl" style={{ zIndex: -1 }} />
              )}
              <Icon
                size={21}
                strokeWidth={active ? 2.5 : 1.8}
                className={cn('transition-colors', active ? 'text-white' : 'text-white/40')}
              />
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
