import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Share2, Check } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from './Toast'

interface ShareButtonProps {
  title: string
  text: string
  url?: string
  className?: string
  size?: number
}

export function ShareButton({ title, text, url, className = '', size = 16 }: ShareButtonProps) {
  const { t } = useTranslation()
  const [shared, setShared] = useState(false)

  const handleShare = async () => {
    const shareUrl = url ?? (typeof window !== 'undefined' ? window.location.href : '')
    try {
      if (navigator.share) {
        await navigator.share({ title, text, url: shareUrl })
        setShared(true)
        toast.success(t('share.shared'))
      } else {
        await navigator.clipboard.writeText(`${text}\n${shareUrl}`)
        setShared(true)
        toast.success(t('share.copied'))
      }
      setTimeout(() => setShared(false), 2000)
    } catch (err) {
      const e = err as { name?: string }
      if (e?.name !== 'AbortError') toast.error(t('share.error'))
    }
  }

  return (
    <motion.button
      whileTap={{ scale: 0.92 }}
      whileHover={{ scale: 1.05 }}
      onClick={handleShare}
      className={className}
    >
      <AnimatePresence mode="wait">
        {shared ? (
          <motion.span key="check" initial={{ scale: 0, rotate: -90 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0 }}>
            <Check size={size} />
          </motion.span>
        ) : (
          <motion.span key="share" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
            <Share2 size={size} />
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  )
}
