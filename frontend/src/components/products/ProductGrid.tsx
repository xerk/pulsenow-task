import type { Product } from '@/types'
import ProductCard from './ProductCard'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from '@/components/ui/empty'
import { Package } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ProductGridProps {
  products?: Product[]
  isLoading?: boolean
  columns?: 3 | 4
}

export default function ProductGrid({ products, isLoading, columns = 4 }: ProductGridProps) {
  const gridClass = columns === 3
    ? 'grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3'
    : 'grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'

  if (isLoading) {
    return (
      <div className={gridClass}>
        {Array.from({ length: 8 }).map((_, i) => (
          <ProductCardSkeleton key={i} index={i} />
        ))}
      </div>
    )
  }

  if (!products || products.length === 0) {
    return (
      <Empty className="py-16">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Package className="h-6 w-6" />
          </EmptyMedia>
          <EmptyTitle className="font-serif">No products found</EmptyTitle>
          <EmptyDescription>
            Try adjusting your search or filter criteria
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  return (
    <div className={cn(gridClass, 'stagger-children')}>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}

function ProductCardSkeleton({ index }: { index: number }) {
  return (
    <div
      className="overflow-hidden rounded-xl bg-card animate-fade-in"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <Skeleton className="aspect-[4/5] w-full" />
      <div className="p-4 space-y-3">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-6 w-20 mt-2" />
      </div>
    </div>
  )
}
