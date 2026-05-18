import { cn } from '@/lib/utils'

type BadgeVariant = 'default' | 'secondary' | 'destructive' | 'outline'

const variantClasses: Record<BadgeVariant, string> = {
  default:     'bg-brand-charcoal text-white border-transparent',
  secondary:   'bg-gray-100 text-gray-700 border-transparent',
  destructive: 'bg-red-100 text-red-700 border-transparent',
  outline:     'bg-transparent text-gray-600 border-gray-300',
}

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant
}

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border transition-colors',
        variantClasses[variant],
        className
      )}
      {...props}
    />
  )
}
