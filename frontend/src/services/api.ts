// Re-export all services for backward compatibility
// New code should import from specific service files

export * from './auth'
export * from './products'
export * from './cart'
export * from './orders'
export * from './categories'
export * from './reviews'

// Export the API client as default
export { default } from './client'
