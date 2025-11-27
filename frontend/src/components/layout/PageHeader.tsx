import { cn } from '@/lib/utils'

interface PageHeaderProps {
  badge?: React.ReactNode
  title: React.ReactNode
  description?: React.ReactNode
  children?: React.ReactNode
  className?: string
  align?: 'center' | 'left'
  /** Content to show above the main header content (e.g., back links) */
  topContent?: React.ReactNode
}

export function PageHeader({
  badge,
  title,
  description,
  children,
  className,
  align = 'center',
  topContent,
}: PageHeaderProps) {
  const isCenter = align === 'center'

  return (
    <section
      className={cn(
        'relative overflow-hidden border-b border-border',
        className
      )}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-secondary/60 via-secondary/30 to-background">
        <div className="absolute inset-0 opacity-40">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-[size:14px_24px]" />
        </div>
      </div>

      {/* Light Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-accent/[0.07] via-transparent to-primary/[0.05]" />
      <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent" />

      {/* Gradient Orbs */}
      <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-accent/15 blur-[120px]" />
      <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-primary/10 blur-[120px]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-64 w-64 rounded-full bg-accent/5 blur-[80px]" />

      {/* Radial gradient overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-accent/8 via-transparent to-transparent" />

      {/* Content */}
      <div className={cn(
        'container relative mx-auto px-4',
        isCenter ? 'py-12 md:py-16' : 'py-12'
      )}>
        {topContent && <div className="mb-6">{topContent}</div>}
        <div className={cn(
          'animate-fade-in',
          isCenter && 'mx-auto max-w-2xl text-center'
        )}>
          {isCenter && badge && <div className="mb-4">{badge}</div>}
          {!isCenter && badge ? (
            // Left-aligned with inline badge/title
            <div className="flex items-center gap-3">
              {badge}
              <h1 className="font-serif text-3xl tracking-tight">{title}</h1>
            </div>
          ) : (
            <h1 className={cn(
              'font-serif tracking-tight',
              isCenter ? 'text-3xl md:text-4xl lg:text-5xl' : 'text-3xl'
            )}>
              {title}
            </h1>
          )}
          {description && (
            <p className={cn(
              'mt-3 text-muted-foreground',
              isCenter && 'md:text-lg'
            )}>
              {description}
            </p>
          )}
          {children && <div className="mt-6">{children}</div>}
        </div>
      </div>
    </section>
  )
}

interface PageHeaderBadgeProps {
  icon?: React.ReactNode
  children: React.ReactNode
}

export function PageHeaderBadge({ icon, children }: PageHeaderBadgeProps) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full bg-accent/10 px-4 py-1.5 text-sm text-accent">
      {icon}
      <span>{children}</span>
    </div>
  )
}
