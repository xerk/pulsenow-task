import api from './client'
import type { ApiResponse, Review } from '@/types'

export const getReviews = async (productId: string) => {
  const response = await api.get<ApiResponse<Review[]>>(
    `/reviews?productId=${productId}`
  )
  return response.data
}

export const createReview = async (data: {
  productId: string
  rating: number
  title: string
  comment: string
}) => {
  const response = await api.post<ApiResponse<Review>>('/reviews', data)
  return response.data
}

export const updateReview = async (
  id: string,
  data: { rating?: number; title?: string; comment?: string }
) => {
  const response = await api.put<ApiResponse<Review>>(`/reviews/${id}`, data)
  return response.data
}

export const deleteReview = async (id: string) => {
  const response = await api.delete<ApiResponse<{ message: string }>>(
    `/reviews/${id}`
  )
  return response.data
}
