import { Outlet, useLocation, Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { User } from 'lucide-react'
import { BottomNav } from '@/components/BottomNav'

const pageVariants = {
  initial: { opacity: 0, y: 14, scale: 0.98 },
  animate: { opacity: 1, y: 0,  scale: 1     },
  exit:    { opacity: 0, y: -8, scale: 0.99  },
}

const pageTransition = {
  type: 'tween',
  ease: [0.25, 0.46, 0.45, 0.94],
  duration: 0.28,
}

export default function ConsumerLayout() {
  const location = useLocation()
  const isFullscreen = location.pathname.startsWith('/scan')

  return (
    <div className="max-w-lg mx-auto relative min-h-screen">
      {!isFullscreen && (
        <header
          className="sticky top-0 z-30 px-5 py-3 flex items-center justify-between"
          style={{
            background: 'rgba(255,255,255,0.85)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderBottom: '1px solid rgba(0,0,0,0.06)',
          }}
        >
          <Link to="/" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-brand-red rounded-lg flex items-center justify-center">
              <span className="text-white text-xs font-black">B</span>
            </div>
            <span className="font-black text-brand-charcoal text-base tracking-tight">BotlBack TJ</span>
          </Link>
          <Link
            to="/profile"
            className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors"
          >
            <User size={17} className="text-gray-600" />
          </Link>
        </header>
      )}

      <main className={isFullscreen ? '' : 'pb-24'}>
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={pageTransition}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      {!isFullscreen && <BottomNav />}
    </div>
  )
}
