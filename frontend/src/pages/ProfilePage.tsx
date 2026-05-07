import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { LogOut, Globe, MapPin, ChevronRight, Shield, Recycle, Zap, Leaf } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useNavigate } from 'react-router-dom'
import { useMe } from '@/api/auth'
import { useUpdateProfile, useUserStats } from '@/api/users'
import { NumberRoll } from '@/components/NumberRoll'

const regions = ['dushanbe', 'sughd', 'khatlon', 'gbao', 'rrs']

export default function ProfilePage() {
  const { t, i18n } = useTranslation()
  const { user, logout, setUser } = useAuthStore()
  const navigate = useNavigate()
  const { data: me } = useMe()
  const { data: stats } = useUserStats()
  const updateProfile = useUpdateProfile()
  const [pendingRegion, setPendingRegion] = useState<string | null>(null)

  const handleLogout = () => { logout(); navigate('/') }

  const meUser = me as { name?: string; phone?: string; region?: string; total_points?: number; bottles_recycled?: number; co2_saved_kg?: number } | undefined
  const currentRegion = pendingRegion ?? meUser?.region ?? user?.region ?? 'dushanbe'
  const points = meUser?.total_points ?? user?.total_points ?? 0
  const recycled = meUser?.bottles_recycled ?? user?.bottles_recycled ?? 0
  const co2 = Math.round(((meUser?.co2_saved_kg ?? user?.co2_saved_kg ?? 0)) * 10) / 10
  const rank = (stats as { rank?: number } | undefined)?.rank ?? 0

  const initials = (meUser?.name ?? user?.name)
    ? (meUser?.name ?? user?.name)!.split(' ').map((p: string) => p[0]).join('').slice(0, 2).toUpperCase()
    : '?'

  const handleLanguage = (code: string) => {
    i18n.changeLanguage(code)
    updateProfile.mutate({ language: code })
  }

  const handleRegion = (r: string) => {
    if (updateProfile.isPending) return
    setPendingRegion(r)
    updateProfile.mutate({ region: r }, {
      onSuccess: (data: unknown) => { setUser(data as Parameters<typeof setUser>[0]); setPendingRegion(null) },
      onError: () => setPendingRegion(null),
    })
  }

  return (
    <div className="min-h-screen bg-[#F8F8F8] pb-28 lg:pb-8">
      {/* ── Hero ── */}
      <div className="relative aurora overflow-hidden px-6 lg:px-12 pt-12 pb-8">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10"
        >
          <div className="flex items-center gap-4 mb-8">
            <motion.div
              initial={{ scale: 0, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', damping: 14, delay: 0.1 }}
              className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center shadow-lg flex-shrink-0 relative"
            >
              <span className="text-brand-red text-xl font-black">{initials}</span>
              <div className="absolute -bottom-1.5 -right-1.5 w-6 h-6 bg-brand-eco rounded-full flex items-center justify-center border-2 border-white">
                <Shield size={10} className="text-white" />
              </div>
            </motion.div>
            <div>
              <h1 className="text-white font-black text-xl leading-tight">{meUser?.name ?? user?.name ?? 'Гость'}</h1>
              <p className="text-white/50 text-sm mt-0.5">{meUser?.phone ?? user?.phone}</p>
              <p className="text-brand-eco text-[10px] font-bold tracking-wider mt-1.5 uppercase">Верифицирован</p>
            </div>
          </div>

          {/* Stats strip */}
          <div className="grid grid-cols-4 lg:grid-cols-4 gap-2 lg:gap-3">
            {[
              { icon: Zap,     value: points,   label: 'pts',    color: '#FFB800', prefix: '' },
              { icon: Recycle, value: recycled,  label: 'бут.',   color: '#00A651', prefix: '' },
              { icon: Leaf,    value: co2,       label: 'кг CO₂', color: '#10B981', prefix: '' },
              { icon: Shield,  value: rank,      label: 'ранг',   color: '#6C63FF', prefix: '#' },
            ].map(({ icon: Icon, value, label, color, prefix }, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 + i * 0.07 }}
                className="glass rounded-2xl p-3 text-center"
              >
                <Icon size={14} className="mx-auto mb-1.5" style={{ color }} />
                <p className="text-white font-black text-base leading-none flex items-baseline justify-center gap-0.5">
                  {prefix && <span className="text-white/60 text-[10px]">{prefix}</span>}
                  <NumberRoll value={typeof value === 'number' ? Math.round(value) : 0} duration={1.2} />
                </p>
                <p className="text-white/40 text-[10px] mt-0.5 font-semibold">{label}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      <div className="px-5 lg:px-8 py-5 space-y-4 lg:max-w-3xl lg:mx-auto">
        {/* Language */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-3xl p-5 shadow-sm"
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-blue-50 rounded-xl flex items-center justify-center">
              <Globe size={16} className="text-blue-500" />
            </div>
            <h3 className="font-black text-brand-charcoal text-sm">{t('profile.language')}</h3>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {[
              { code: 'ru', label: t('profile.russian'), sublabel: 'Русский' },
              { code: 'tg', label: t('profile.tajik'),   sublabel: 'Тоҷикӣ'  },
            ].map(({ code, label, sublabel }) => (
              <motion.button
                key={code}
                whileTap={{ scale: 0.97 }}
                onClick={() => handleLanguage(code)}
                className={`py-3 px-4 rounded-2xl text-sm font-bold transition-all text-left ${
                  i18n.language === code
                    ? 'bg-brand-charcoal text-white shadow-sm'
                    : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                }`}
              >
                <div>{label}</div>
                <div className={`text-xs font-normal mt-0.5 ${i18n.language === code ? 'text-white/50' : 'text-gray-400'}`}>{sublabel}</div>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Region */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-white rounded-3xl p-5 shadow-sm"
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-red-50 rounded-xl flex items-center justify-center">
              <MapPin size={16} className="text-brand-red" />
            </div>
            <h3 className="font-black text-brand-charcoal text-sm">{t('profile.region')}</h3>
            {updateProfile.isPending && pendingRegion && (
              <div className="ml-auto w-4 h-4 border-2 border-brand-red border-t-transparent rounded-full animate-spin" />
            )}
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-2">
            {regions.map((r) => {
              const isActive = currentRegion === r
              return (
                <motion.button
                  key={r}
                  whileTap={{ scale: 0.97 }}
                  disabled={updateProfile.isPending}
                  onClick={() => handleRegion(r)}
                  className={`py-2.5 px-4 rounded-2xl text-sm font-semibold transition-all text-left ${
                    isActive
                      ? 'bg-brand-red text-white shadow-[0_4px_16px_rgba(244,0,9,0.25)]'
                      : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                  }`}
                >
                  {t(`regions.${r}`)}
                </motion.button>
              )
            })}
          </div>
        </motion.div>

        {/* About */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-3xl overflow-hidden shadow-sm"
        >
          {[
            { label: 'О приложении',        sub: 'BotlBack TJ v1.0' },
            { label: 'Политика конфиденциальности', sub: 'Coca-Cola İçecek' },
          ].map(({ label, sub }, i) => (
            <button
              key={i}
              className="w-full flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors text-left border-b border-gray-50 last:border-0"
            >
              <div className="flex-1">
                <p className="text-sm font-semibold text-brand-charcoal">{label}</p>
                <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
              </div>
              <ChevronRight size={16} className="text-gray-300" />
            </button>
          ))}
        </motion.div>

        {/* Logout */}
        <motion.button
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 py-4 bg-red-50 hover:bg-red-100 text-brand-red font-black rounded-3xl transition-all"
        >
          <LogOut size={18} />
          {t('auth.logout')}
        </motion.button>
      </div>
    </div>
  )
}
