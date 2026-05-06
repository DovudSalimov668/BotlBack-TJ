import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const SPLASH_KEY = 'botlback_splash_seen_v1'

export function SplashScreen() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (sessionStorage.getItem(SPLASH_KEY)) return
    setShow(true)
    sessionStorage.setItem(SPLASH_KEY, '1')
    const t = setTimeout(() => setShow(false), 2200)
    return () => clearTimeout(t)
  }, [])

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.1 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-[10001] aurora flex items-center justify-center"
        >
          {/* Burst rings */}
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="absolute rounded-full pointer-events-none"
              initial={{ width: 80, height: 80, opacity: 0 }}
              animate={{ width: 600, height: 600, opacity: [0, 0.5, 0] }}
              transition={{ duration: 2, delay: 0.3 + i * 0.3, ease: 'easeOut' }}
              style={{ border: '2px solid rgba(244,0,9,0.5)' }}
            />
          ))}

          <div className="relative text-center">
            {/* Animated bottle SVG */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', damping: 12, stiffness: 100, delay: 0.1 }}
              style={{ filter: 'drop-shadow(0 20px 40px rgba(244,0,9,0.6))' }}
              className="mb-6 mx-auto w-fit"
            >
              <svg width="90" height="140" viewBox="0 0 90 140" fill="none">
                <defs>
                  <linearGradient id="splashBottle" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#FF1A24" />
                    <stop offset="100%" stopColor="#A30007" />
                  </linearGradient>
                </defs>
                <rect x="34" y="6" width="22" height="12" rx="2" fill="#fff" />
                <path d="M37 18 H53 L51 32 H39 Z" fill="#F40009" />
                <path d="M28 32 Q45 26 62 32 L66 120 Q45 130 24 120 Z" fill="url(#splashBottle)" />
                <rect x="28" y="62" width="34" height="34" rx="2" fill="white" opacity="0.95" />
                <text x="45" y="83" textAnchor="middle" fontFamily="Inter, sans-serif" fontWeight="900" fontSize="9" fill="#F40009">BB TJ</text>
              </svg>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="display text-white text-5xl"
            >
              <motion.span initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }} className="inline-block">Botl</motion.span>
              <motion.span initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.65 }} className="inline-block gradient-text">Back</motion.span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
              className="text-white/50 text-xs font-bold tracking-[0.3em] uppercase mt-2"
            >
              Coca-Cola İçecek · Tajikistan
            </motion.p>

            {/* Loading dots */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
              className="flex items-center justify-center gap-1.5 mt-8"
            >
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-2 h-2 rounded-full bg-white/60"
                  animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
                  transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.15 }}
                />
              ))}
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
