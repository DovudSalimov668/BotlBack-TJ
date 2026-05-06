import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { BottomNav } from '@/components/BottomNav'
import { Link } from 'react-router-dom'
import { User } from 'lucide-react'

export default function ConsumerLayout() {
  return (
    <div className="max-w-lg mx-auto relative">
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-gray-100 px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <span className="text-xl">🍾</span>
          <span className="font-black text-brand-red text-lg">BotlBack TJ</span>
        </Link>
        <Link to="/profile" className="p-1.5 rounded-full hover:bg-gray-100 transition-colors">
          <User size={22} className="text-gray-600" />
        </Link>
      </header>
      <main className="pb-20">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  )
}
