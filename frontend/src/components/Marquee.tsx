interface MarqueeProps {
  items: string[]
  className?: string
  separator?: React.ReactNode
}

/**
 * Infinite horizontal marquee using CSS animation. Items duplicated
 * so the loop is seamless.
 */
export function Marquee({ items, className = '', separator }: MarqueeProps) {
  const sep = separator ?? <span className="text-brand-red mx-6" aria-hidden>★</span>

  const Track = () => (
    <div className="flex items-center shrink-0 px-4">
      {items.map((it, i) => (
        <span key={i} className="flex items-center shrink-0">
          <span>{it}</span>
          {sep}
        </span>
      ))}
    </div>
  )

  return (
    <div className={`overflow-hidden ${className}`}>
      <div className="marquee">
        <Track />
        <Track />
      </div>
    </div>
  )
}
