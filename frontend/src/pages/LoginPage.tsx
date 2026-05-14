import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { Phone, Hash, ArrowLeft, ArrowRight } from 'lucide-react'
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

  const inputClass =
    'w-full bg-white/8 border border-white/15 rounded-2xl px-4 py-3.5 text-white placeholder-white/30 text-sm focus:outline-none focus:border-brand-red focus:bg-white/12 transition-all'

  return (
    <div className="min-h-screen aurora relative flex flex-col">
      {/* Back button */}
      <div className="p-6 relative z-10">
        <Link to="/">
          <button className="glass text-white/70 hover:text-white flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded-full transition-all">
            <ArrowLeft size={16} />
            {t('common.back')}
          </button>
        </Link>
      </div>

      {/* Branding */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 text-center px-6 mb-6"
      >
        <h1 className="display text-white text-4xl">BotlBack</h1>
        <p className="text-white/40 text-xs font-semibold tracking-widest uppercase mt-1">Coca-Cola İçecek • Tajikistan</p>
      </motion.div>

      {/* Glass card */}
      <div className="flex-1 flex flex-col justify-center px-6 pb-12 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="glass rounded-3xl p-7 shadow-2xl"
        >
          <div className="mb-7">
            <h2 className="text-white text-xl font-black tracking-tight">
              {mode === 'login' ? t('auth.welcome') : t('auth.create_account')}
            </h2>
            <p className="text-white/50 text-sm mt-1">
              {mode === 'login' ? t('auth.login_hint') : t('auth.register_hint')}
            </p>
          </div>

          {step === 'phone' ? (
            <form onSubmit={handlePhoneSubmit} className="space-y-4">
              {mode === 'register' && (
                <div>
                  <label className="text-white/60 text-xs font-semibold tracking-wide uppercase block mb-2">
                    {t('auth.name_label')}
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Азиз Каримов"
                    required
                    className={inputClass}
                  />
                </div>
              )}
              <div>
                <label className="text-white/60 text-xs font-semibold tracking-wide uppercase block mb-2">
                  {t('auth.phone')}
                </label>
                <div className="relative">
                  <Phone className="absolute left-4 top-3.5 text-white/30" size={17} />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+992 900 000 001"
                    required
                    className={`${inputClass} pl-11`}
                  />
                </div>
              </div>
              <Button
                type="submit"
                size="lg"
                className="w-full bg-brand-red hover:bg-red-600 text-white font-black rounded-2xl py-6 shadow-[0_0_24px_rgba(244,0,9,0.35)] gap-2 mt-2"
              >
                {t('auth.continue')}
                <ArrowRight size={18} />
              </Button>
            </form>
          ) : (
            <form onSubmit={handleOtpSubmit} className="space-y-4">
              <div>
                <label className="text-white/60 text-xs font-semibold tracking-wide uppercase block mb-2">
                  {t('auth.otp')}
                </label>
                <div className="relative">
                  <Hash className="absolute left-4 top-3.5 text-white/30" size={17} />
                  <input
                    type="number"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="1234"
                    required
                    className={`${inputClass} pl-11 text-2xl font-black tracking-[0.5em] text-center`}
                  />
                </div>
                <p className="text-white/30 text-xs mt-2 text-center">{t('auth.otp_hint')}</p>
              </div>
              {(login.isError || register.isError) && (
                <div className="bg-brand-red/20 border border-brand-red/30 rounded-xl px-4 py-3">
                  <p className="text-red-300 text-sm text-center">{t('auth.invalid_code')}</p>
                </div>
              )}
              <Button
                type="submit"
                size="lg"
                className="w-full bg-brand-red hover:bg-red-600 text-white font-black rounded-2xl py-6 shadow-[0_0_24px_rgba(244,0,9,0.35)] gap-2"
                disabled={login.isPending || register.isPending}
              >
                {login.isPending || register.isPending ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    {t('auth.login')}
                    <ArrowRight size={18} />
                  </>
                )}
              </Button>
              <button
                type="button"
                onClick={() => setStep('phone')}
                className="w-full text-sm text-white/40 hover:text-white/70 text-center transition-colors"
              >
                {t('common.back')}
              </button>
            </form>
          )}

          <div className="mt-6 pt-5 border-t border-white/10 text-center">
            <button
              onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setStep('phone') }}
              className="text-sm text-white/50 hover:text-white transition-colors"
            >
              {mode === 'login'
                ? t('auth.no_account') + ' '
                : t('auth.have_account') + ' '}
              <span className="text-brand-red font-bold">
                {mode === 'login' ? t('auth.register') : t('auth.login')}
              </span>
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
