import api from './client'
import type { ApiResponse, Category, Product } from '@/types'

export const getCategories = async () => {
  const response = await api.get<ApiResponse<Category[]>>('/categories')
  return response.data
}

export interface CategoryWithProducts extends Category {
  subcategories: Category[]
  products: Product[]
}

export const getCategory = async (id: string) => {
  const response = await api.get<ApiResponse<CategoryWithProducts>>(
    `/categories/${id}`
  )
  return response.data
}
