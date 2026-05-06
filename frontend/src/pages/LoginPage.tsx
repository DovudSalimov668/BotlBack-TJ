import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { Phone, Hash, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useLogin, useRegister } from '@/api/auth'

export default function LoginPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [phone, setPhone] = useState('+992')
  const [name, setName] = useState('')
  const [otp, setOtp] = useState('')
  const [step, setStep] = useState<'phone' | 'otp'>('phone')

  const login = useLogin()
  const register = useRegister()

  const handlePhoneSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setStep('otp')
  }

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (mode === 'register') {
        await register.mutateAsync({ phone, name })
      } else {
        await login.mutateAsync({ phone, otp })
      }
      navigate('/wallet')
    } catch (err: unknown) {
      console.error(err)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-red to-red-800 flex flex-col">
      <div className="p-6">
        <Link to="/">
          <button className="text-white/80 hover:text-white flex items-center gap-1">
            <ArrowLeft size={20} />
          </button>
        </Link>
      </div>

      <div className="flex-1 flex flex-col justify-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl p-8 shadow-2xl"
        >
          <div className="text-center mb-8">
            <div className="text-4xl mb-3">🍾</div>
            <h1 className="text-2xl font-black text-brand-charcoal">BotlBack TJ</h1>
            <p className="text-gray-500 text-sm mt-1">
              {mode === 'login' ? t('auth.login') : t('auth.register')}
            </p>
          </div>

          {step === 'phone' ? (
            <form onSubmit={handlePhoneSubmit} className="space-y-4">
              {mode === 'register' && (
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">{t('auth.name')}</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Азиз Каримов"
                    required
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-red"
                  />
                </div>
              )}
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">{t('auth.phone')}</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3.5 text-gray-400" size={18} />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder={t('auth.phone_placeholder')}
                    required
                    className="w-full border-2 border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-brand-red"
                  />
                </div>
              </div>
              <Button type="submit" className="w-full" size="lg">
                Продолжить
              </Button>
            </form>
          ) : (
            <form onSubmit={handleOtpSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">{t('auth.otp')}</label>
                <div className="relative">
                  <Hash className="absolute left-3 top-3.5 text-gray-400" size={18} />
                  <input
                    type="number"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="1234"
                    required
                    className="w-full border-2 border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-brand-red"
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1">{t('auth.otp_hint')}</p>
              </div>
              {(login.isError || register.isError) && (
                <p className="text-red-500 text-sm text-center">Ошибка входа. Проверьте данные.</p>
              )}
              <Button type="submit" className="w-full" size="lg" disabled={login.isPending || register.isPending}>
                {login.isPending || register.isPending ? t('common.loading') : t('auth.login')}
              </Button>
              <button type="button" onClick={() => setStep('phone')} className="w-full text-sm text-gray-500 text-center">
                {t('common.back')}
              </button>
            </form>
          )}

          <div className="mt-6 text-center">
            <button
              onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setStep('phone') }}
              className="text-sm text-brand-red font-medium"
            >
              {mode === 'login' ? t('auth.no_account') + ' ' + t('auth.register') : t('auth.have_account') + ' ' + t('auth.login')}
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
