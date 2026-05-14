import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Zap, Timer } from 'lucide-react'
import { Link } from 'react-router-dom'

const SESSION_KEY = 'botlback_banner_dismissed'

function useDaysLeft(endDate: Date) {
  const ms = endDate.getTime() - Date.now()
  return Math.max(0, Math.ceil(ms / 86_400_000))
}

export function CampaignBanner() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (!sessionStorage.getItem(SESSION_KEY)) setShow(true)
  }, [])

  const dismiss = () => {
    sessionStorage.setItem(SESSION_KEY, '1')
    setShow(false)
  }

  const endDate = new Date('2026-06-30T23:59:59')
  const daysLeft = useDaysLeft(endDate)

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="overflow-hidden"
        >
          <Link to="/rewards" onClick={dismiss}>
            <div className="flex items-center gap-3 px-4 py-2.5 text-white relative overflow-hidden"
              style={{ background: 'linear-gradient(90deg, #FF6B35 0%, #F40009 60%, #c2000b 100%)' }}>
              {/* shimmer */}
              <motion.div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.15) 50%, transparent 60%)',
                  backgroundSize: '300% 100%',
                }}
                animate={{ backgroundPosition: ['-100% 0', '300% 0'] }}
                transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 3 }}
              />
              <Zap size={14} className="text-brand-gold flex-shrink-0" />
              <p className="flex-1 text-xs font-bold leading-tight">
                Летний марафон: <span className="font-black">2× баллы</span> за каждую сданную бутылку
              </p>
              <div className="flex items-center gap-1 bg-black/20 rounded-full px-2 py-0.5 flex-shrink-0">
                <Timer size={10} />
                <span className="text-[10px] font-black">{daysLeft}д</span>
              </div>
              <button
                onClick={(e) => { e.preventDefault(); dismiss() }}
                className="w-5 h-5 rounded-full bg-black/20 flex items-center justify-center flex-shrink-0 hover:bg-black/40 transition-colors"
              >
                <X size={10} />
              </button>
            </div>
          </Link>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
