import { useState } from 'react'
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from 'framer-motion'

interface FlipCard3DProps {
  front: React.ReactNode
  back: React.ReactNode
  flipped: boolean
  onFlip: () => void
  className?: string
  /** gentle float when idle */
  float?: boolean
}

export function FlipCard3D({ front, back, flipped, onFlip, className = '', float = false }: FlipCard3DProps) {
  const ref = { current: null as HTMLDivElement | null }
  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const sx = useSpring(mx, { stiffness: 200, damping: 22 })
  const sy = useSpring(my, { stiffness: 200, damping: 22 })
  const tiltX = useTransform(sy, [-0.5, 0.5], [10, -10])
  const tiltY = useTransform(sx, [-0.5, 0.5], [-10, 10])

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (flipped) return
    const el = e.currentTarget.getBoundingClientRect()
    mx.set((e.clientX - el.left) / el.width - 0.5)
    my.set((e.clientY - el.top) / el.height - 0.5)
  }
  const handleMouseLeave = () => { mx.set(0); my.set(0) }

  return (
    /* perspective wrapper */
    <div style={{ perspective: 900 }} className={className}>
      <motion.div
        ref={(el) => { ref.current = el }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={onFlip}
        animate={float && !flipped
          ? { y: [0, -6, 0], rotateZ: [0, 0.6, 0, -0.6, 0] }
          : {}}
        transition={float && !flipped
          ? { duration: 3.6, repeat: Infinity, ease: 'easeInOut' }
          : {}}
        style={{
          rotateX: flipped ? 0 : tiltX,
          rotateY: flipped ? 180 : tiltY,
          transformStyle: 'preserve-3d',
          transition: flipped
            ? 'transform 0.55s cubic-bezier(0.4,0,0.2,1)'
            : undefined,
        }}
        className="relative w-full h-full cursor-pointer"
      >
        {/* ── FRONT ── */}
        <div style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
          className="absolute inset-0 w-full h-full rounded-3xl overflow-hidden">
          {front}
        </div>

        {/* ── BACK ── (rotated 180° so it faces away until flipped) */}
        <div
          style={{
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
          }}
          className="absolute inset-0 w-full h-full rounded-3xl overflow-hidden"
        >
          {back}
        </div>
      </motion.div>
    </div>
  )
}
