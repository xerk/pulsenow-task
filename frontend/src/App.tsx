import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from '@/context/AuthContext'
import { CartProvider } from '@/context/CartContext'
import { CartAnimationProvider } from '@/context/CartAnimationContext'
import { Toaster } from '@/components/ui/sonner'
import Navbar from '@/components/layout/Navbar'
import ProtectedRoute from '@/components/layout/ProtectedRoute'
import Login from '@/pages/Login'
import Products from '@/pages/Products'
import ProductDetail from '@/pages/ProductDetail'
import Profile from '@/pages/Profile'
import Orders from '@/pages/Orders'
import Checkout from '@/pages/Checkout'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
})

function AppLayout() {
  const location = useLocation()
  const hideNavbar = location.pathname === '/login'

  return (
    <AuthProvider>
      <CartProvider>
        <CartAnimationProvider>
          <div className="min-h-screen bg-background">
            {!hideNavbar && <Navbar />}
            <main>
              <Routes>
                <Route path="/" element={<Navigate to="/products" replace />} />
                <Route path="/login" element={<Login />} />
                <Route path="/products" element={<Products />} />
                <Route path="/products/:id" element={<ProductDetail />} />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/orders"
                  element={
                    <ProtectedRoute>
                      <Orders />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/checkout"
                  element={
                    <ProtectedRoute>
                      <Checkout />
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </main>
          </div>
          <Toaster position="bottom-right" />
        </CartAnimationProvider>
      </CartProvider>
    </AuthProvider>
  )
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppLayout />
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App
