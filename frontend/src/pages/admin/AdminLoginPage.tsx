import { useState } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { BarChart3, User, Lock, ArrowRight, AlertCircle } from 'lucide-react'
import { useAdminLogin } from '@/api/auth'
import { useAuthStore } from '@/store/authStore'

export default function AdminLoginPage() {
  const navigate = useNavigate()
  const { user } = useAuthStore()

  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const adminLogin = useAdminLogin()

  if (user?.is_staff) {
    return <Navigate to="/admin" replace />
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      const data = await adminLogin.mutateAsync({ phone, password })
      if (!data.user?.is_staff) {
        setError('Доступ разрешён только администраторам')
        return
      }
      navigate('/admin', { replace: true })
    } catch {
      setError('Неверный логин или пароль')
    }
  }

  const inputClass =
    'w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/25 text-sm focus:outline-none focus:border-brand-red focus:bg-white/8 transition-all'

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#0A0A0A' }}>
      {/* Subtle radial bg */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: 'radial-gradient(ellipse at 30% 40%, rgba(244,0,9,0.12) 0%, transparent 60%), radial-gradient(ellipse at 75% 70%, rgba(180,0,6,0.08) 0%, transparent 55%)',
      }} />

      <div className="relative w-full max-w-sm mx-4">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-brand-red rounded-2xl mb-4 shadow-[0_0_32px_rgba(244,0,9,0.4)]">
            <BarChart3 size={26} className="text-white" />
          </div>
          <h1 className="text-white text-2xl font-black tracking-tight">BotlBack TJ</h1>
          <p className="text-white/30 text-xs font-semibold tracking-widest uppercase mt-1">Admin Panel</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl p-7" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <h2 className="text-white text-lg font-black mb-1">Вход для администратора</h2>
          <p className="text-white/35 text-xs mb-6">Введите учётные данные от панели управления</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-white/40 text-[10px] font-bold tracking-widest uppercase block mb-1.5">
                Логин
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/25 pointer-events-none" size={15} />
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="admin"
                  required
                  autoComplete="username"
                  className={`${inputClass} pl-10`}
                />
              </div>
            </div>

            <div>
              <label className="text-white/40 text-[10px] font-bold tracking-widest uppercase block mb-1.5">
                Пароль
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/25 pointer-events-none" size={15} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  className={`${inputClass} pl-10`}
                />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 bg-red-950/40 border border-red-500/20 rounded-xl px-4 py-3">
                <AlertCircle size={14} className="text-red-400 flex-shrink-0" />
                <p className="text-red-300 text-xs">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={adminLogin.isPending}
              className="w-full flex items-center justify-center gap-2 bg-brand-red hover:bg-red-600 disabled:opacity-60 text-white font-black text-sm rounded-xl py-3.5 transition-colors shadow-[0_0_20px_rgba(244,0,9,0.3)] mt-2"
            >
              {adminLogin.isPending ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  Войти в панель
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-white/15 text-[10px] mt-6">
          CCI Tajikistan · BotlBack Brand Dashboard
        </p>
      </div>
    </div>
  )
}
