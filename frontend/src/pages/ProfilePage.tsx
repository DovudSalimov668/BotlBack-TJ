import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { LogOut, Globe, MapPin, ChevronRight, Shield } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useNavigate } from 'react-router-dom'

const regions = ['dushanbe', 'sughd', 'khatlon', 'gbao', 'rrs']

export default function ProfilePage() {
  const { t, i18n } = useTranslation()
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = () => { logout(); navigate('/') }

  const initials = user?.name
    ? user.name.split(' ').map((p) => p[0]).join('').slice(0, 2).toUpperCase()
    : '?'

  return (
    <div className="min-h-screen bg-[#F8F8F8] pb-28">
      {/* ── Hero ── */}
      <div className="relative mesh-hero noise overflow-hidden px-6 pt-12 pb-10">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4"
        >
          <motion.div
            initial={{ scale: 0, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', damping: 14, delay: 0.1 }}
            className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center shadow-lg flex-shrink-0"
          >
            <span className="text-brand-red text-xl font-black">{initials}</span>
          </motion.div>
          <div>
            <h1 className="text-white font-black text-xl leading-tight">{user?.name ?? 'Гость'}</h1>
            <p className="text-white/50 text-sm mt-0.5">{user?.phone}</p>
            <div className="flex items-center gap-1.5 mt-1.5">
              <Shield size={11} className="text-brand-eco" />
              <span className="text-white/50 text-xs">Верифицирован</span>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="px-5 py-5 space-y-4">
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
              <button
                key={code}
                onClick={() => i18n.changeLanguage(code)}
                className={`py-3 px-4 rounded-2xl text-sm font-bold transition-all text-left ${
                  i18n.language === code
                    ? 'bg-brand-charcoal text-white shadow-sm'
                    : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                }`}
              >
                <div>{label}</div>
                <div className={`text-xs font-normal mt-0.5 ${i18n.language === code ? 'text-white/50' : 'text-gray-400'}`}>{sublabel}</div>
              </button>
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
          </div>
          <div className="grid grid-cols-2 gap-2">
            {regions.map((r) => (
              <button
                key={r}
                className={`py-2.5 px-4 rounded-2xl text-sm font-semibold transition-all text-left ${
                  user?.region === r
                    ? 'bg-brand-red text-white'
                    : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                }`}
              >
                {t(`regions.${r}`)}
              </button>
            ))}
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
