import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { LogOut, Globe, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useAuthStore } from '@/store/authStore'
import { useNavigate } from 'react-router-dom'

const regions = ['dushanbe', 'sughd', 'khatlon', 'gbao', 'rrs']

export default function ProfilePage() {
  const { t, i18n } = useTranslation()
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const toggleLanguage = () => {
    const newLang = i18n.language === 'ru' ? 'tg' : 'ru'
    i18n.changeLanguage(newLang)
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="bg-gradient-to-br from-brand-red to-red-700 text-white px-6 pt-12 pb-8">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-2xl font-black">
            {user?.name?.charAt(0) ?? '?'}
          </div>
          <div>
            <h1 className="text-xl font-black">{user?.name ?? 'Гость'}</h1>
            <p className="text-red-200 text-sm">{user?.phone}</p>
          </div>
        </div>
      </div>

      <div className="px-6 py-6 space-y-4">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Card>
            <CardContent className="p-4">
              <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                <Globe size={18} className="text-brand-red" />
                {t('profile.language')}
              </h3>
              <div className="flex gap-2">
                {['ru', 'tg'].map((lang) => (
                  <button
                    key={lang}
                    onClick={() => i18n.changeLanguage(lang)}
                    className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all ${i18n.language === lang ? 'bg-brand-red text-white' : 'bg-gray-100 text-gray-600'}`}
                  >
                    {lang === 'ru' ? t('profile.russian') : t('profile.tajik')}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card>
            <CardContent className="p-4">
              <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                <MapPin size={18} className="text-brand-red" />
                {t('profile.region')}
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {regions.map((r) => (
                  <button
                    key={r}
                    className={`py-2 rounded-xl text-sm font-medium transition-all ${user?.region === r ? 'bg-brand-red text-white' : 'bg-gray-100 text-gray-600'}`}
                  >
                    {t(`regions.${r}`)}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <Button variant="outline" className="w-full border-red-200 text-brand-red" onClick={handleLogout}>
          <LogOut size={18} />
          {t('auth.logout')}
        </Button>
      </div>
    </div>
  )
}
