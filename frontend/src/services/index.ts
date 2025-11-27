// Re-export all services for convenience
export * from './auth'
export * from './products'
export * from './cart'
export * from './orders'
export * from './categories'
export * from './reviews'

// Export the API client as default
export { default as api } from './client'
