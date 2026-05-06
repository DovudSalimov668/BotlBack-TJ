import { Navigate, Outlet } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Link, useLocation } from 'react-router-dom'
import { LayoutDashboard, MapPin, TrendingUp, Megaphone, Store, LogOut } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { cn } from '@/lib/utils'

const navItems = [
  { path: '/admin', icon: LayoutDashboard, label: 'Обзор', exact: true },
  { path: '/admin/geographic', icon: MapPin, label: 'География' },
  { path: '/admin/timeseries', icon: TrendingUp, label: 'Динамика' },
  { path: '/admin/campaigns', icon: Megaphone, label: 'Кампании' },
  { path: '/admin/outlets', icon: Store, label: 'Точки' },
]

export default function AdminLayout() {
  const { user, logout } = useAuthStore()
  const { pathname } = useLocation()

  if (!user?.is_staff) {
    return <Navigate to="/login" replace />
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="w-56 bg-brand-charcoal text-white flex flex-col fixed h-full z-40 hidden lg:flex">
        <div className="p-6 border-b border-white/10">
          <h1 className="text-lg font-black">BotlBack TJ</h1>
          <p className="text-gray-400 text-xs mt-1">Brand Dashboard</p>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(({ path, icon: Icon, label, exact }) => {
            const active = exact ? pathname === path : pathname.startsWith(path)
            return (
              <Link
                key={path}
                to={path}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
                  active ? 'bg-brand-red text-white' : 'text-gray-400 hover:bg-white/10 hover:text-white'
                )}
              >
                <Icon size={18} />
                {label}
              </Link>
            )
          })}
        </nav>
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-brand-red rounded-full flex items-center justify-center text-xs font-bold">
              {user?.name?.charAt(0) ?? 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium truncate">{user?.name ?? 'Admin'}</p>
              <p className="text-xs text-gray-500">Brand Manager</p>
            </div>
          </div>
          <button
            onClick={() => logout()}
            className="flex items-center gap-2 text-xs text-gray-400 hover:text-white transition-colors"
          >
            <LogOut size={14} />
            Выйти
          </button>
        </div>
      </aside>

      <div className="flex-1 lg:ml-56">
        <div className="lg:hidden bg-brand-charcoal text-white p-4 flex gap-3 overflow-x-auto">
          {navItems.map(({ path, icon: Icon, label, exact }) => {
            const active = exact ? pathname === path : pathname.startsWith(path)
            return (
              <Link
                key={path}
                to={path}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap',
                  active ? 'bg-brand-red' : 'bg-white/10'
                )}
              >
                <Icon size={14} />
                {label}
              </Link>
            )
          })}
        </div>
        <main className="min-h-screen">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
