import { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { RefreshCw } from 'lucide-react'

interface PullToRefreshProps {
  onRefresh: () => Promise<unknown> | void
  children: React.ReactNode
  threshold?: number
}

export function PullToRefresh({ onRefresh, children, threshold = 70 }: PullToRefreshProps) {
  const startY = useRef<number | null>(null)
  const [pull, setPull] = useState(0)
  const [refreshing, setRefreshing] = useState(false)

  const onTouchStart = (e: React.TouchEvent) => {
    if (window.scrollY > 0) return
    startY.current = e.touches[0].clientY
  }

  const onTouchMove = (e: React.TouchEvent) => {
    if (startY.current === null || refreshing) return
    const dy = e.touches[0].clientY - startY.current
    if (dy > 0) {
      setPull(Math.min(dy * 0.5, 110))
    }
  }

  const onTouchEnd = async () => {
    if (refreshing) return
    if (pull >= threshold) {
      setRefreshing(true)
      try {
        await onRefresh()
      } finally {
        setRefreshing(false)
        setPull(0)
      }
    } else {
      setPull(0)
    }
    startY.current = null
  }

  const progress = Math.min(pull / threshold, 1)

  return (
    <div onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd} className="touch-pan-y">
      {(pull > 0 || refreshing) && (
        <div
          className="flex items-center justify-center text-brand-red"
          style={{ height: refreshing ? 60 : pull, transition: refreshing ? 'height 0.2s ease' : 'none' }}
        >
          <motion.div
            animate={refreshing ? { rotate: 360 } : { rotate: progress * 270 }}
            transition={refreshing ? { duration: 0.8, repeat: Infinity, ease: 'linear' } : { type: 'spring', damping: 20 }}
            style={{ opacity: refreshing ? 1 : progress }}
          >
            <RefreshCw size={20} strokeWidth={2.5} />
          </motion.div>
        </div>
      )}
      {children}
    </div>
  )
}
