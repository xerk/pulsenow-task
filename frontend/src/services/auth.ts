import api from './client'
import type { ApiResponse, LoginResponse, User, Address } from '@/types'

export const login = async (email: string, password: string) => {
  const response = await api.post<ApiResponse<LoginResponse>>('/auth/login', {
    email,
    password,
  })
  return response.data
}

export const getProfile = async () => {
  const response = await api.get<ApiResponse<User>>('/auth/profile')
  return response.data
}

export interface UpdateProfileData {
  firstName?: string
  lastName?: string
  phone?: string
  address?: Address
}

export const updateProfile = async (data: UpdateProfileData) => {
  const response = await api.put<ApiResponse<User>>('/auth/profile', data)
  return response.data
}
