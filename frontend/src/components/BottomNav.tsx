import { Link, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { QrCode, Wallet, Gift, Trophy, MapPin } from 'lucide-react'
import { cn } from '@/lib/utils'

const tabs = [
  { path: '/scan', icon: QrCode, key: 'nav.scan' },
  { path: '/wallet', icon: Wallet, key: 'nav.wallet' },
  { path: '/rewards', icon: Gift, key: 'nav.rewards' },
  { path: '/leaderboard', icon: Trophy, key: 'nav.leaderboard' },
  { path: '/map', icon: MapPin, key: 'nav.map' },
]

export function BottomNav() {
  const { pathname } = useLocation()
  const { t } = useTranslation()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100 shadow-lg">
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {tabs.map(({ path, icon: Icon, key }) => {
          const active = pathname.startsWith(path)
          return (
            <Link
              key={path}
              to={path}
              className={cn(
                'flex flex-col items-center gap-0.5 py-2 px-3 text-xs transition-colors',
                active ? 'text-brand-red' : 'text-gray-400'
              )}
            >
              <Icon size={22} strokeWidth={active ? 2.5 : 1.5} />
              <span className="font-medium">{t(key)}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
