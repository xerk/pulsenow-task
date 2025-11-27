import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { getOrders } from '@/services/api'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import type { Order } from '@/types'
import {
  Package,
  Clock,
  Truck,
  CheckCircle,
  ShoppingBag,
  ArrowRight,
  Calendar,
  CreditCard,
} from 'lucide-react'
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
} from '@/components/ui/empty'
import { ErrorState } from '@/components/ui/error-state'
import { PageHeader, PageHeaderBadge } from '@/components/layout/PageHeader'

export default function Orders() {
  const {
    data,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['orders'],
    queryFn: getOrders,
    select: (data) =>
      [...data.data].sort((a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ),
  })

  if (isLoading) {
    return <OrdersSkeleton />
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <PageHeader
        badge={
          <PageHeaderBadge icon={<ShoppingBag className="h-4 w-4" />}>
            Order History
          </PageHeaderBadge>
        }
        title="Your Orders"
        description="Track and manage your purchase history"
      />

      {/* Orders List */}
      <section className="container mx-auto px-4 py-8 md:py-12">
        <div className="mx-auto max-w-3xl">
          {error ? (
            <ErrorState
              error={error}
              onRetry={() => window.location.reload()}
              className="py-16"
            />
          ) : !data || data.length === 0 ? (
            <Empty className="py-16 animate-fade-in">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <Package className="h-6 w-6" />
                </EmptyMedia>
                <EmptyTitle className="font-serif">No orders yet</EmptyTitle>
                <EmptyDescription>
                  Start shopping to see your orders here
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <Link to="/products">
                  <Button className="rounded-full">
                    Browse Products
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </EmptyContent>
            </Empty>
          ) : (
            <div className="space-y-4">
              {data.map((order, index) => (
                <OrderCard key={order.id} order={order} index={index} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

function OrderCard({ order, index }: { order: Order; index: number }) {
  const statusConfig = {
    pending: {
      icon: Clock,
      label: 'Pending',
      color: 'bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400',
      dotColor: 'bg-amber-500',
    },
    processing: {
      icon: Package,
      label: 'Processing',
      color: 'bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400',
      dotColor: 'bg-blue-500',
    },
    shipped: {
      icon: Truck,
      label: 'Shipped',
      color: 'bg-violet-50 text-violet-600 dark:bg-violet-950/50 dark:text-violet-400',
      dotColor: 'bg-violet-500',
    },
    delivered: {
      icon: CheckCircle,
      label: 'Delivered',
      color: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400',
      dotColor: 'bg-emerald-500',
    },
  }

  const status = statusConfig[order.status] || statusConfig.pending
  const StatusIcon = status.icon

  return (
    <div
      className="group rounded-2xl border border-border bg-card overflow-hidden transition-all duration-300 hover:border-accent/50 hover:shadow-xl hover:shadow-accent/5 animate-fade-in"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border bg-gradient-to-r from-secondary/50 to-secondary/30 p-4 md:p-5">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 text-accent transition-transform duration-300 group-hover:scale-110">
            <Package className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Order</p>
            <p className="font-mono text-sm font-semibold">#{order.id.slice(-8)}</p>
          </div>
          <div className="hidden sm:block h-8 w-px bg-border" />
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            {new Date(order.createdAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })}
          </div>
        </div>
        <Badge className={`${status.color} border-0 gap-2 px-3 py-1.5 font-medium`}>
          <span className={`h-2 w-2 rounded-full ${status.dotColor} animate-pulse`} />
          {status.label}
        </Badge>
      </div>

      {/* Items */}
      <div className="p-4 md:p-5">
        <div className="space-y-3">
          {order.items.map((item, i) => (
            <div
              key={i}
              className="flex items-center justify-between p-3 rounded-xl bg-secondary/30 transition-colors hover:bg-secondary/50"
            >
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-accent/20 to-accent/5 text-accent font-semibold">
                    {item.quantity}x
                  </div>
                </div>
                <div>
                  <p className="font-medium line-clamp-1">{item.name}</p>
                  <p className="text-sm text-muted-foreground">
                    ${item.price.toFixed(2)} each
                  </p>
                </div>
              </div>
              <p className="font-semibold text-lg">
                ${(item.price * item.quantity).toFixed(2)}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border bg-gradient-to-r from-secondary/30 to-secondary/50 p-4 md:p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-background">
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Payment</p>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium capitalize">
                {order.paymentMethod.replace('_', ' ')}
              </span>
              <span
                className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                  order.paymentStatus === 'paid'
                    ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400'
                    : 'bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400'
                }`}
              >
                {order.paymentStatus}
              </span>
            </div>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Total</p>
          <p className="font-serif text-2xl tracking-tight text-accent">
            ${order.total.toFixed(2)}
          </p>
        </div>
      </div>
    </div>
  )
}

function OrdersSkeleton() {
  return (
    <div className="min-h-screen">
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-gradient-to-br from-secondary/60 via-secondary/30 to-background">
          <div className="absolute inset-0 opacity-40">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-[size:14px_24px]" />
          </div>
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-accent/[0.07] via-transparent to-primary/[0.05]" />
        <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-accent/15 blur-[120px]" />
        <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-primary/10 blur-[120px]" />
        <div className="container relative mx-auto px-4 py-12 md:py-16">
          <div className="mx-auto max-w-2xl text-center">
            <Skeleton className="mx-auto h-8 w-32 rounded-full" />
            <Skeleton className="mx-auto mt-4 h-10 w-48" />
            <Skeleton className="mx-auto mt-3 h-5 w-64" />
          </div>
        </div>
      </section>
      <section className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-3xl space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton
              key={i}
              className="h-64 w-full rounded-2xl"
              style={{ animationDelay: `${i * 100}ms` }}
            />
          ))}
        </div>
      </section>
    </div>
  )
}
