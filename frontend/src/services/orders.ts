import api from './client'
import type { ApiResponse, Order } from '@/types'

export const getOrders = async () => {
  const response = await api.get<ApiResponse<Order[]>>('/orders')
  return response.data
}

export const getOrder = async (id: string) => {
  const response = await api.get<ApiResponse<Order>>(`/orders/${id}`)
  return response.data
}

export interface CreateOrderData {
  items: { productId: string; quantity: number }[]
  shippingAddress: {
    street: string
    city: string
    state: string
    zipCode: string
    country: string
  }
  paymentMethod: 'credit_card' | 'paypal'
}

export const createOrder = async (data: CreateOrderData) => {
  const response = await api.post<ApiResponse<Order>>('/orders', data)
  return response.data
}

export const updateOrderStatus = async (
  id: string,
  status: 'pending' | 'processing' | 'shipped' | 'delivered'
) => {
  const response = await api.put<ApiResponse<Order>>(`/orders/${id}/status`, {
    status,
  })
  return response.data
}
