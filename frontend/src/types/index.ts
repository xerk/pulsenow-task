export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: 'buyer' | 'seller' | 'admin'
  phone?: string
  address?: Address
  createdAt: string
  isVerified: boolean
}

export interface Address {
  street: string
  city: string
  state: string
  zipCode: string
  country: string
}

export interface Product {
  id: string
  name: string
  slug: string
  description: string
  price: number
  compareAtPrice?: number
  categoryId: string
  sellerId: string
  images: string[]
  stock: number
  sku: string
  status: 'active' | 'inactive'
  featured: boolean
  rating: number
  reviewCount: number
  tags: string[]
  specifications: Record<string, string>
  createdAt: string
  updatedAt: string
  reviews?: Review[]
}

export interface Category {
  id: string
  name: string
  slug: string
  description: string
  image: string
  parentId: string | null
  createdAt: string
}

export interface CartItem {
  id: string
  userId: string
  productId: string
  quantity: number
  addedAt: string
  product?: Product
}

export interface LocalCartItem {
  productId: string
  quantity: number
  product: Product
}

export interface Order {
  id: string
  userId: string
  items: OrderItem[]
  subtotal: number
  tax: number
  shipping: number
  total: number
  status: 'pending' | 'processing' | 'shipped' | 'delivered'
  shippingAddress: Address
  paymentMethod: 'credit_card' | 'paypal'
  paymentStatus: 'pending' | 'paid'
  createdAt: string
  deliveredAt?: string
  shippedAt?: string
}

export interface OrderItem {
  productId: string
  quantity: number
  price: number
  name: string
}

export interface Review {
  id: string
  productId: string
  userId: string
  rating: number
  title: string
  comment: string
  verifiedPurchase: boolean
  createdAt: string
}

export interface ApiResponse<T> {
  success: boolean
  message?: string
  data: T
}

export interface PaginatedData<T> {
  items: T[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

export interface LoginResponse {
  token: string
  user: User
}

export interface ProductsResponse {
  products: Product[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

export interface CartResponse {
  items: CartItem[]
  subtotal: number
  itemCount: number
}
