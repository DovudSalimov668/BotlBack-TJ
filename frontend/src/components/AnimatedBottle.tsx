import { motion } from 'framer-motion'

interface AnimatedBottleProps {
  /** 0–100 fill percentage */
  fill: number
  className?: string
  width?: number
  height?: number
}

/**
 * SVG bottle that fills with red liquid based on the `fill` prop.
 * Wave animation runs along the surface of the liquid.
 */
export function AnimatedBottle({ fill, className = '', width = 80, height = 130 }: AnimatedBottleProps) {
  const clamped = Math.max(0, Math.min(100, fill))
  const liquidTop = 32 + (1 - clamped / 100) * 88 // 32 (top of body) to 120 (bottom)

  return (
    <div className={`relative ${className}`} style={{ width, height }}>
      <svg viewBox="0 0 90 140" width={width} height={height} className="absolute inset-0">
        <defs>
          <linearGradient id="liquid-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"  stopColor="#FF1A24" />
            <stop offset="100%" stopColor="#A30007" />
          </linearGradient>
          <clipPath id="bottle-clip">
            <path d="M28 32 Q45 26 62 32 L66 120 Q45 130 24 120 Z" />
          </clipPath>
        </defs>

        {/* Bottle outline (back) */}
        <rect x="34" y="6"  width="22" height="12" rx="2" fill="#E5E7EB" />
        <path d="M37 18 H53 L51 32 H39 Z" fill="#FCA5A5" />
        <path d="M28 32 Q45 26 62 32 L66 120 Q45 130 24 120 Z" fill="rgba(0,0,0,0.05)" stroke="rgba(0,0,0,0.08)" strokeWidth="1" />

        {/* Liquid */}
        <g clipPath="url(#bottle-clip)">
          <motion.rect
            x="20" width="55"
            initial={{ y: 130 }}
            animate={{ y: liquidTop }}
            transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1] }}
            height="100"
            fill="url(#liquid-grad)"
          />
          {/* Wavy surface */}
          <motion.path
            initial={{ y: 130 - liquidTop }}
            animate={{ y: 0 }}
            transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1] }}
            d=""
          >
            <motion.animate
              attributeName="d"
              values={`M20 ${liquidTop} Q35 ${liquidTop - 3} 50 ${liquidTop} T80 ${liquidTop} L80 130 L20 130 Z;
                       M20 ${liquidTop} Q35 ${liquidTop + 3} 50 ${liquidTop} T80 ${liquidTop} L80 130 L20 130 Z;
                       M20 ${liquidTop} Q35 ${liquidTop - 3} 50 ${liquidTop} T80 ${liquidTop} L80 130 L20 130 Z`}
              dur="3s"
              repeatCount="indefinite"
            />
          </motion.path>

          {/* Bubbles */}
          {[0, 1, 2].map((i) => (
            <motion.circle
              key={i}
              cx={35 + i * 8}
              r={1.5}
              fill="rgba(255,255,255,0.5)"
              initial={{ cy: 130, opacity: 0 }}
              animate={{ cy: liquidTop + 2, opacity: [0, 0.8, 0] }}
              transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.7, ease: 'easeOut' }}
            />
          ))}
        </g>

        {/* Bottle body outline (front) */}
        <path d="M28 32 Q45 26 62 32 L66 120 Q45 130 24 120 Z" fill="none" stroke="rgba(0,0,0,0.15)" strokeWidth="1.5" />

        {/* Highlight */}
        <path d="M32 50 Q30 90 36 120" stroke="rgba(255,255,255,0.5)" strokeWidth="2" strokeLinecap="round" fill="none" />

        {/* Label */}
        <rect x="28" y="62" width="34" height="34" rx="2" fill="white" opacity="0.95" />
        <text x="45" y="80" textAnchor="middle" fontFamily="Inter, sans-serif" fontWeight="900" fontSize="9" fill="#F40009">BB TJ</text>
        <text x="45" y="92" textAnchor="middle" fontFamily="Inter, sans-serif" fontWeight="700" fontSize="6" fill="#666">{Math.round(clamped)}%</text>
      </svg>
    </div>
  )
}
