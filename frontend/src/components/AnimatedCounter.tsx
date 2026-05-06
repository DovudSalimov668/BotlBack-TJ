import { useEffect, useRef, useState } from 'react'

interface Props {
  value: number
  duration?: number
  className?: string
  suffix?: string
}

export function AnimatedCounter({ value, duration = 1200, className, suffix }: Props) {
  const [display, setDisplay] = useState(0)
  const rafRef = useRef<number>()
  const startRef = useRef<number>()
  const startValRef = useRef(0)

  useEffect(() => {
    startValRef.current = display
    startRef.current = undefined
    if (rafRef.current) cancelAnimationFrame(rafRef.current)

    const animate = (ts: number) => {
      if (!startRef.current) startRef.current = ts
      const elapsed = ts - startRef.current
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplay(Math.round(startValRef.current + (value - startValRef.current) * eased))
      if (progress < 1) rafRef.current = requestAnimationFrame(animate)
    }
    rafRef.current = requestAnimationFrame(animate)
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [value])

  return (
    <span className={className}>
      {display.toLocaleString('ru')}{suffix}
    </span>
  )
}
