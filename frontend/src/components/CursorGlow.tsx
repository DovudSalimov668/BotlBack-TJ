import { useEffect, useRef } from 'react'

/**
 * Subtle cursor follower — only renders on devices with a fine pointer.
 * Two layered dots: a small inner red dot and a larger soft red glow.
 */
export function CursorGlow() {
  const dotRef = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia('(pointer: fine)').matches) return

    let mx = 0, my = 0, rx = 0, ry = 0
    let raf = 0

    const tick = () => {
      rx += (mx - rx) * 0.18
      ry += (my - ry) * 0.18
      if (dotRef.current) dotRef.current.style.transform = `translate3d(${mx - 4}px, ${my - 4}px, 0)`
      if (ringRef.current) ringRef.current.style.transform = `translate3d(${rx - 24}px, ${ry - 24}px, 0)`
      raf = requestAnimationFrame(tick)
    }

    const onMove = (e: MouseEvent) => { mx = e.clientX; my = e.clientY }
    window.addEventListener('mousemove', onMove)
    raf = requestAnimationFrame(tick)
    return () => { window.removeEventListener('mousemove', onMove); cancelAnimationFrame(raf) }
  }, [])

  return (
    <>
      <div
        ref={ringRef}
        className="desktop-only fixed top-0 left-0 w-12 h-12 rounded-full pointer-events-none z-[9999]"
        style={{
          background: 'radial-gradient(circle, rgba(244,0,9,0.25) 0%, transparent 70%)',
          mixBlendMode: 'screen',
        }}
      />
      <div
        ref={dotRef}
        className="desktop-only fixed top-0 left-0 w-2 h-2 rounded-full pointer-events-none z-[9999]"
        style={{ background: '#F40009', boxShadow: '0 0 12px rgba(244,0,9,0.8)' }}
      />
    </>
  )
}
