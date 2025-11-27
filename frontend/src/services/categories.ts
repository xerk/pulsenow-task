import api from './client'
import type { ApiResponse, Category } from '@/types'

export const getCategories = async () => {
  const response = await api.get<ApiResponse<{ categories: Category[] }>>(
    '/categories'
  )
  return response.data
}

export const getCategory = async (id: string) => {
  const response = await api.get<ApiResponse<Category>>(`/categories/${id}`)
  return response.data
}
