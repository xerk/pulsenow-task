import { useQuery } from '@tanstack/react-query'
import { getProducts, getProduct, type ProductFilters } from '@/services/api'

export function useProducts(filters?: ProductFilters) {
  return useQuery({
    queryKey: ['products', filters],
    queryFn: () => getProducts(filters),
    select: (data) => data.data,
  })
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: ['product', id],
    queryFn: () => getProduct(id),
    select: (data) => data.data,
    enabled: !!id,
  })
}
