import { useRef } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'

interface CocaColaShowcaseProps {
  /** Size of the bottle image in px (height). Default 260. */
  size?: number
  /** Show orbital ring decorations. Default true. */
  rings?: boolean
  className?: string
}

/**
 * Animated 3D Coca-Cola bottle using CSS perspective + Framer Motion.
 * Mouse/touch tracking creates an interactive parallax tilt.
 * No iframe, no external viewer — just the bottle.
 */
export function CocaColaShowcase({ size = 260, rings = true, className = '' }: CocaColaShowcaseProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  const rawX = useMotionValue(0)
  const rawY = useMotionValue(0)
  const springX = useSpring(rawX, { stiffness: 60, damping: 18 })
  const springY = useSpring(rawY, { stiffness: 60, damping: 18 })

  const rotateY = useTransform(springX, [-1, 1], [-22, 22])
  const rotateX = useTransform(springY, [-1, 1], [12, -12])

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return
    rawX.set(((e.clientX - rect.left) / rect.width - 0.5) * 2)
    rawY.set(((e.clientY - rect.top) / rect.height - 0.5) * 2)
  }

  const handlePointerLeave = () => {
    rawX.set(0)
    rawY.set(0)
  }

  const ringSize = size * 1.55
  const innerRing = size * 1.05

  return (
    <div
      ref={containerRef}
      className={`relative flex items-center justify-center select-none ${className}`}
      style={{ width: size, height: size * 1.4, perspective: 900 }}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
    >
      {/* Ambient glow under the bottle */}
      <motion.div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: size * 0.85,
          height: size * 0.25,
          bottom: '4%',
          left: '50%',
          x: '-50%',
          background: 'radial-gradient(ellipse, rgba(244,0,9,0.55) 0%, transparent 70%)',
          filter: 'blur(18px)',
        }}
        animate={{ opacity: [0.45, 0.75, 0.45], scaleX: [1, 1.08, 1] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Orbital rings */}
      {rings && [
        { sz: ringSize,  border: 'rgba(244,0,9,0.18)',  dir: 1,  dur: 20 },
        { sz: innerRing, border: 'rgba(255,184,0,0.12)', dir: -1, dur: 14 },
      ].map(({ sz, border, dir, dur }) => (
        <motion.div
          key={sz}
          className="absolute rounded-full pointer-events-none"
          style={{ width: sz, height: sz, top: '50%', left: '50%', x: '-50%', y: '-50%', border: `1px solid ${border}` }}
          animate={{ rotate: dir * 360 }}
          transition={{ duration: dur, repeat: Infinity, ease: 'linear' }}
        />
      ))}

      {/* Floating + tilt wrapper */}
      <motion.div
        style={{ rotateY, rotateX, transformStyle: 'preserve-3d' }}
        animate={{ y: [0, -14, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
      >
        {/* Left-face light sheen (fake 3-D depth) */}
        <motion.div
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{ rotateY: -25, translateZ: -4, background: 'rgba(244,0,9,0.18)', filter: 'blur(8px)', scaleX: 0.35 }}
        />

        {/* Bottle image */}
        <img
          src="/products/coca-cola.svg"
          alt="Coca-Cola bottle"
          style={{
            height: size,
            width: 'auto',
            filter: 'drop-shadow(0 24px 48px rgba(244,0,9,0.55)) drop-shadow(0 4px 12px rgba(0,0,0,0.4))',
            display: 'block',
          }}
          draggable={false}
        />
      </motion.div>
    </div>
  )
}
