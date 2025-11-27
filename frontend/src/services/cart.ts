import api from './client'
import type { ApiResponse, CartResponse } from '@/types'

export const getCart = async () => {
  const response = await api.get<ApiResponse<CartResponse>>('/cart')
  return response.data
}

export const addToCart = async (productId: string, quantity: number = 1) => {
  const response = await api.post<ApiResponse<CartResponse>>('/cart', {
    productId,
    quantity,
  })
  return response.data
}

export const updateCartItem = async (productId: string, quantity: number) => {
  const response = await api.put<ApiResponse<CartResponse>>(
    `/cart/${productId}`,
    { quantity }
  )
  return response.data
}

export const removeFromCart = async (productId: string) => {
  const response = await api.delete<ApiResponse<CartResponse>>(
    `/cart/${productId}`
  )
  return response.data
}

export const clearCart = async () => {
  const response = await api.delete<ApiResponse<{ message: string }>>('/cart')
  return response.data
}
