import api from './client'
import type { ApiResponse, ProductsResponse, Product } from '@/types'

export interface ProductFilters {
  category?: string
  search?: string
  featured?: boolean
  minPrice?: number
  maxPrice?: number
  sort?: 'price_asc' | 'price_desc' | 'rating' | 'newest'
  page?: number
  limit?: number
}

export const getProducts = async (filters?: ProductFilters) => {
  const params = new URLSearchParams()
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, String(value))
      }
    })
  }
  const response = await api.get<ApiResponse<ProductsResponse>>(
    `/products${params.toString() ? `?${params.toString()}` : ''}`
  )
  return response.data
}

export const getProduct = async (id: string) => {
  const response = await api.get<ApiResponse<Product>>(`/products/${id}`)
  return response.data
}
