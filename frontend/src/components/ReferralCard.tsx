import { useState } from 'react'
import { motion } from 'framer-motion'
import { Copy, Check, Users, Gift } from 'lucide-react'
import { useMyReferral } from '@/api/users'

export function ReferralCard() {
  const { data } = useMyReferral()
  const [copied, setCopied] = useState(false)

  if (!data?.code) return null

  const copy = async () => {
    await navigator.clipboard.writeText(data.code).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const share = async () => {
    const text = `Присоединяйся к BotlBack TJ — сдавай бутылки Coca-Cola и зарабатывай призы! Используй мой код: ${data.code} и получи бонус ${50} очков! 🌱`
    if (navigator.share) {
      await navigator.share({ title: 'BotlBack TJ', text }).catch(() => {})
    } else {
      await navigator.clipboard.writeText(text).catch(() => {})
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="rounded-3xl overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #6C63FF 0%, #4F46E5 100%)',
      }}
    >
      <div className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Users size={14} className="text-white/70" />
              <p className="text-white/70 text-[11px] font-bold tracking-widest uppercase">Пригласи друга</p>
            </div>
            <p className="text-white font-black text-lg leading-tight">
              +50 очков вам обоим
            </p>
          </div>
          <div className="w-10 h-10 bg-white/15 rounded-2xl flex items-center justify-center">
            <Gift size={18} className="text-white" />
          </div>
        </div>

        {/* Code display */}
        <div className="flex items-center gap-2 mb-4">
          <div className="flex-1 bg-white/15 rounded-2xl px-4 py-3 flex items-center justify-between">
            <span className="text-white font-black text-xl tracking-[0.2em]">{data.code}</span>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={copy}
              className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center"
            >
              {copied
                ? <Check size={14} className="text-green-300" />
                : <Copy size={14} className="text-white/70" />
              }
            </motion.button>
          </div>
        </div>

        {/* Stats row */}
        <div className="flex items-center justify-between">
          <div className="text-center">
            <p className="text-white font-black text-lg">{data.uses}</p>
            <p className="text-white/50 text-[10px] font-semibold">приглашено</p>
          </div>
          <div className="h-8 w-px bg-white/15" />
          <div className="text-center">
            <p className="text-white font-black text-lg">{data.bonus_earned}</p>
            <p className="text-white/50 text-[10px] font-semibold">очков заработано</p>
          </div>
          <div className="h-8 w-px bg-white/15" />
          <motion.button
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: 1.03 }}
            onClick={share}
            className="bg-white text-indigo-600 font-black text-sm px-4 py-2 rounded-2xl shadow-lg"
          >
            Поделиться
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
}
