import { useState } from 'react'
import { useNavigate, useLocation, Link, Navigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { Phone, Hash, ArrowLeft, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useLogin, useRegister } from '@/api/auth'
import { useAuthStore } from '@/store/authStore'
import { logger } from '@/lib/logger'

export default function LoginPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const { isAuthenticated } = useAuthStore()

  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [phone, setPhone] = useState('+992')
  const [name, setName] = useState('')
  const [otp, setOtp] = useState('')
  const [step, setStep] = useState<'phone' | 'otp'>('phone')

  const login = useLogin()
  const register = useRegister()

  // Already logged in — send to the page they came from, or wallet
  if (isAuthenticated) {
    const from = (location.state as { from?: string })?.from ?? '/wallet'
    return <Navigate to={from} replace />
  }

  const redirectAfterAuth = () => {
    const from = (location.state as { from?: string })?.from ?? '/wallet'
    navigate(from, { replace: true })
  }

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (mode === 'register') {
      // Registration does not use OTP — complete immediately
      try {
        await register.mutateAsync({ phone, name })
        redirectAfterAuth()
      } catch (err: unknown) {
        logger.error('Register failed', err)
      }
    } else {
      setStep('otp')
    }
  }

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await login.mutateAsync({ phone, otp })
      redirectAfterAuth()
    } catch (err: unknown) {
      logger.error('Login failed', err)
    }
  }

  const inputClass =
    'w-full bg-black/30 border border-white/15 rounded-2xl px-4 py-3.5 text-white placeholder-white/30 text-base focus:outline-none focus:border-brand-red focus:bg-black/40 transition-all caret-white'

  return (
    <div className="min-h-screen aurora relative flex flex-col">
      {/* Back button */}
      <div className="px-6 pb-6 relative z-10" style={{ paddingTop: 'max(1.5rem, env(safe-area-inset-top))' }}>
        <Link to="/">
          <button className="glass text-white/70 hover:text-white flex items-center gap-1.5 text-sm font-medium px-4 py-3 rounded-full transition-all">
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
        <div className="max-w-sm mx-auto w-full">
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="rounded-3xl p-7 shadow-2xl"
          style={{ background: 'rgba(15,5,8,0.65)', backdropFilter: 'blur(28px)', WebkitBackdropFilter: 'blur(28px)', border: '1px solid rgba(255,255,255,0.10)' }}
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
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" size={17} />
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
                  <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" size={17} />
                  <input
                    type="tel"
                    inputMode="numeric"
                    pattern="[0-9]*"
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
              onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setStep('phone'); setOtp('') }}
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
    </div>
  )
}
