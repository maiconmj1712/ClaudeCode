import { cn, formatCurrency, formatCurrencyCompact } from '@/lib/utils'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface StatCardProps {
  label: string
  value: string | number
  isCurrency?: boolean
  compact?: boolean
  trend?: number
  trendLabel?: string
  icon?: React.ReactNode
  iconBg?: string
  className?: string
  loading?: boolean
}

export function StatCard({
  label,
  value,
  isCurrency,
  compact,
  trend,
  trendLabel = 'vs. mês anterior',
  icon,
  iconBg = 'bg-primary/10',
  className,
  loading,
}: StatCardProps) {
  const displayValue = loading
    ? null
    : isCurrency
    ? compact
      ? formatCurrencyCompact(Number(value))
      : formatCurrency(Number(value))
    : value

  const trendPositive = trend !== undefined && trend > 0
  const trendNegative = trend !== undefined && trend < 0
  const trendNeutral  = trend !== undefined && trend === 0

  return (
    <div className={cn('stat-card', className)}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <p className="stat-card-label">{label}</p>
          {loading ? (
            <div className="skeleton h-9 w-32 mt-2 rounded-md" />
          ) : (
            <p className="stat-card-value mt-1">{displayValue}</p>
          )}
          {trend !== undefined && (
            <div className="flex items-center gap-1.5 mt-2">
              {loading ? (
                <div className="skeleton h-4 w-24 rounded" />
              ) : (
                <>
                  {trendPositive && (
                    <span className="stat-card-trend-up">
                      <TrendingUp className="h-3.5 w-3.5" />
                      +{trend.toFixed(1)}%
                    </span>
                  )}
                  {trendNegative && (
                    <span className="stat-card-trend-down">
                      <TrendingDown className="h-3.5 w-3.5" />
                      {trend.toFixed(1)}%
                    </span>
                  )}
                  {trendNeutral && (
                    <span className="flex items-center gap-1 text-muted-foreground text-sm font-semibold">
                      <Minus className="h-3.5 w-3.5" />
                      0%
                    </span>
                  )}
                  <span className="text-xs text-muted-foreground">{trendLabel}</span>
                </>
              )}
            </div>
          )}
        </div>
        {icon && (
          <div className={cn(
            'flex h-12 w-12 items-center justify-center rounded-xl flex-shrink-0',
            iconBg
          )}>
            {icon}
          </div>
        )}
      </div>
    </div>
  )
}
