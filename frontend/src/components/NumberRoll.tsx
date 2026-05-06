import { useEffect, useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'

interface NumberRollProps {
  value: number
  className?: string
  duration?: number
  prefix?: string
  suffix?: string
}

/**
 * Slot-machine-style digit roller. Each digit independently animates
 * to its target position using a translateY column of 0–9.
 */
export function NumberRoll({ value, className = '', duration = 1.4, prefix = '', suffix = '' }: NumberRollProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: '-20% 0px' })
  const [displayValue, setDisplayValue] = useState(0)

  useEffect(() => {
    if (!inView) return
    setDisplayValue(value)
  }, [inView, value])

  const digits = Math.max(1, String(Math.abs(displayValue || value)).length)
  const padded = String(displayValue).padStart(digits, '0')

  return (
    <span ref={ref} className={`inline-flex items-baseline tabular ${className}`}>
      {prefix && <span>{prefix}</span>}
      {padded.split('').map((d, i) => (
        <Digit key={i} digit={Number(d)} duration={duration} delay={i * 0.06} />
      ))}
      {suffix && <span>{suffix}</span>}
    </span>
  )
}

function Digit({ digit, duration, delay }: { digit: number; duration: number; delay: number }) {
  return (
    <span className="relative inline-block overflow-hidden" style={{ height: '1em', width: '0.62em' }}>
      <motion.span
        className="absolute inset-0 flex flex-col items-center"
        initial={{ y: 0 }}
        animate={{ y: `-${digit * 100}%` }}
        transition={{ duration, delay, ease: [0.16, 1, 0.3, 1] }}
      >
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
          <span key={n} className="leading-none" style={{ height: '1em', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
            {n}
          </span>
        ))}
      </motion.span>
    </span>
  )
}
