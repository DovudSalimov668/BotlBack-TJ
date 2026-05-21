import { Navigate, Outlet } from 'react-router-dom'
import { Link, useLocation } from 'react-router-dom'
import { LayoutDashboard, MapPin, TrendingUp, Megaphone, Store, LogOut, BarChart3, QrCode, Award, Users, Gift, ShoppingBag } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { cn } from '@/lib/utils'

const navItems = [
  { path: '/admin',                icon: LayoutDashboard, label: 'Обзор',      exact: true },
  { path: '/admin/scorecard',      icon: Award,           label: 'Пилот'                   },
  { path: '/admin/geographic',     icon: MapPin,          label: 'География'               },
  { path: '/admin/timeseries',     icon: TrendingUp,      label: 'Динамика'                },
  { path: '/admin/campaigns',      icon: Megaphone,       label: 'Кампании'                },
  { path: '/admin/outlets',        icon: Store,           label: 'Точки'                   },
  { path: '/admin/qrcodes',        icon: QrCode,          label: 'QR-коды'                 },
  { path: '/admin/prizes',         icon: Gift,            label: 'Призы'                   },
  { path: '/admin/redemptions',    icon: ShoppingBag,     label: 'Обмены'                  },
  { path: '/admin/users',          icon: Users,           label: 'Юзеры'                   },
]

export default function AdminLayout() {
  const { user, logout } = useAuthStore()
  const { pathname } = useLocation()

  if (!user?.is_staff) {
    return <Navigate to="/admin/login" replace />
  }

  return (
    <div className="flex min-h-screen bg-[#F4F4F4]">
      {/* ── Sidebar ── */}
      <aside className="w-60 bg-brand-dark flex flex-col fixed h-full z-40 hidden lg:flex">
        {/* Logo */}
        <div className="px-6 py-7 border-b border-white/8">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 bg-brand-red rounded-xl flex items-center justify-center flex-shrink-0">
              <BarChart3 size={16} className="text-white" />
            </div>
            <div>
              <h1 className="text-white text-sm font-black tracking-tight leading-none">BotlBack TJ</h1>
              <p className="text-white/30 text-[10px] mt-0.5 leading-none">Brand Dashboard</p>
            </div>
          </div>
          <div className="bg-white/5 rounded-xl px-3 py-2 mt-2">
            <p className="text-white/30 text-[10px] font-semibold tracking-widest uppercase">CCI Tajikistan</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(({ path, icon: Icon, label, exact }) => {
            const active = exact ? pathname === path : pathname.startsWith(path)
            return (
              <Link
                key={path}
                to={path}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all',
                  active
                    ? 'bg-brand-red text-white shadow-[0_4px_16px_rgba(244,0,9,0.3)]'
                    : 'text-white/40 hover:bg-white/8 hover:text-white'
                )}
              >
                <Icon size={17} strokeWidth={active ? 2.5 : 1.8} />
                {label}
              </Link>
            )
          })}
        </nav>

        {/* User */}
        <div className="p-4 border-t border-white/8">
          <div className="flex items-center gap-3 mb-4 px-1">
            <div className="w-9 h-9 bg-brand-red rounded-2xl flex items-center justify-center text-white text-sm font-black flex-shrink-0">
              {user?.name?.charAt(0) ?? 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-xs font-bold truncate">{user?.name ?? 'Admin'}</p>
              <p className="text-white/30 text-[10px]">Brand Manager</p>
            </div>
          </div>
          <button
            onClick={() => logout()}
            className="flex items-center gap-2 text-xs text-white/30 hover:text-white transition-colors w-full px-1 py-1"
          >
            <LogOut size={13} />
            Выйти из системы
          </button>
        </div>
      </aside>

      {/* ── Mobile top bar ── */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-brand-dark border-b border-white/8"
        style={{ paddingTop: 'max(0.5rem, env(safe-area-inset-top))' }}>
        <div className="flex items-center gap-2 px-4 py-3 overflow-x-auto">
          <span className="text-white font-black text-sm mr-2 shrink-0">BotlBack</span>
          {navItems.map(({ path, icon: Icon, label, exact }) => {
            const active = exact ? pathname === path : pathname.startsWith(path)
            return (
              <Link
                key={path}
                to={path}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all',
                  active ? 'bg-brand-red text-white' : 'bg-white/8 text-white/50'
                )}
              >
                <Icon size={13} />
                {label}
              </Link>
            )
          })}
        </div>
      </div>

      {/* ── Main content ── */}
      <div className="flex-1 lg:ml-60">
        <main className="min-h-screen pt-0 lg:pt-0">
          <div className="lg:hidden" style={{ height: 'calc(3.5rem + env(safe-area-inset-top))' }} />
          <Outlet />
        </main>
      </div>
    </div>
  )
}
