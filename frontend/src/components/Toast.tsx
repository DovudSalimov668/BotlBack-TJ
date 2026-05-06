import { create } from 'zustand'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, XCircle, Info, AlertTriangle } from 'lucide-react'
import { useEffect } from 'react'

type ToastKind = 'success' | 'error' | 'info' | 'warning'
type ToastItem = { id: number; kind: ToastKind; title: string; description?: string }

interface ToastState {
  items: ToastItem[]
  push: (kind: ToastKind, title: string, description?: string) => void
  dismiss: (id: number) => void
}

const useToastStore = create<ToastState>((set) => ({
  items: [],
  push: (kind, title, description) => {
    const id = Date.now() + Math.random()
    set((s) => ({ items: [...s.items, { id, kind, title, description }] }))
    setTimeout(() => set((s) => ({ items: s.items.filter((i) => i.id !== id) })), 4000)
  },
  dismiss: (id) => set((s) => ({ items: s.items.filter((i) => i.id !== id) })),
}))

export const toast = {
  success: (t: string, d?: string) => useToastStore.getState().push('success', t, d),
  error:   (t: string, d?: string) => useToastStore.getState().push('error', t, d),
  info:    (t: string, d?: string) => useToastStore.getState().push('info', t, d),
  warning: (t: string, d?: string) => useToastStore.getState().push('warning', t, d),
}

const META: Record<ToastKind, { icon: React.ElementType; bg: string; iconColor: string }> = {
  success: { icon: CheckCircle2,   bg: 'bg-brand-eco',    iconColor: 'text-white' },
  error:   { icon: XCircle,        bg: 'bg-brand-red',    iconColor: 'text-white' },
  info:    { icon: Info,           bg: 'bg-brand-charcoal', iconColor: 'text-white' },
  warning: { icon: AlertTriangle,  bg: 'bg-brand-gold',   iconColor: 'text-brand-dark' },
}

export function Toaster() {
  const items = useToastStore((s) => s.items)
  const dismiss = useToastStore((s) => s.dismiss)

  useEffect(() => {
    // expose globally for non-component callers
    ;(window as unknown as { toast: typeof toast }).toast = toast
  }, [])

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[10000] pointer-events-none flex flex-col gap-2 w-full max-w-sm px-4">
      <AnimatePresence>
        {items.map((it) => {
          const meta = META[it.kind]
          const Icon = meta.icon
          return (
            <motion.div
              key={it.id}
              initial={{ opacity: 0, y: -16, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -16, scale: 0.96 }}
              transition={{ type: 'spring', damping: 18, stiffness: 240 }}
              onClick={() => dismiss(it.id)}
              className="pointer-events-auto cursor-pointer"
            >
              <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] flex items-stretch overflow-hidden">
                <div className={`${meta.bg} flex items-center justify-center px-3.5`}>
                  <Icon size={18} className={meta.iconColor} />
                </div>
                <div className="flex-1 px-4 py-3 min-w-0">
                  <p className="font-black text-brand-charcoal text-sm leading-snug">{it.title}</p>
                  {it.description && <p className="text-gray-500 text-xs mt-0.5">{it.description}</p>}
                </div>
              </div>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}
