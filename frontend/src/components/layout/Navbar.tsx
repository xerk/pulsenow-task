import { Link, useLocation } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/context/AuthContext'
import { getCategories } from '@/services/api'
import { Button } from '@/components/ui/button'
import CartSheet from '@/components/cart/CartSheet'
import {
  LogIn,
  LogOut,
  User,
  Sparkles,
  Package,
  ChevronDown,
  LayoutGrid,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useState, useRef, useEffect } from 'react'

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth()
  const location = useLocation()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showCollections, setShowCollections] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const collectionsRef = useRef<HTMLDivElement>(null)

  // Fetch categories
  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
    select: (data) => data.data.filter((c) => !c.parentId), // Only parent categories
  })

  const isActive = (path: string) => {
    return (
      location.pathname === path || location.pathname.startsWith(path + '/')
    )
  }

  // Close menus on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false)
      }
      if (collectionsRef.current && !collectionsRef.current.contains(event.target as Node)) {
        setShowCollections(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-lg supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo & Nav */}
        <div className="flex items-center gap-8">
          <Link
            to="/"
            className="group flex items-center gap-2.5 transition-opacity hover:opacity-80"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary transition-transform group-hover:scale-105">
              <Sparkles className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="hidden font-serif text-xl tracking-tight sm:inline">
              Luxe Market
            </span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            <Link to="/products">
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  'rounded-full px-4 transition-all',
                  isActive('/products')
                    ? 'bg-secondary font-medium'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                Products
              </Button>
            </Link>

            {/* Collections Dropdown */}
            <div className="relative" ref={collectionsRef}>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowCollections(!showCollections)}
                className={cn(
                  'rounded-full px-4 transition-all',
                  showCollections
                    ? 'bg-secondary font-medium'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <LayoutGrid className="h-4 w-4 mr-1.5" />
                Collections
                <ChevronDown
                  className={cn(
                    'h-4 w-4 ml-1 transition-transform',
                    showCollections && 'rotate-180'
                  )}
                />
              </Button>

              {showCollections && (
                <div className="absolute left-0 top-full mt-2 w-56 rounded-xl border border-border bg-card p-1.5 shadow-lg animate-scale-in">
                  {categories?.map((category) => (
                    <Link
                      key={category.id}
                      to={`/products?category=${category.id}`}
                      onClick={() => setShowCollections(false)}
                      className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors hover:bg-secondary"
                    >
                      <img
                        src={category.image}
                        alt={category.name}
                        className="h-8 w-8 rounded-lg object-cover"
                      />
                      <div>
                        <p className="font-medium">{category.name}</p>
                        <p className="text-xs text-muted-foreground line-clamp-1">
                          {category.description}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {isAuthenticated && (
              <Link to="/orders">
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    'rounded-full px-4 transition-all',
                    isActive('/orders')
                      ? 'bg-secondary font-medium'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  <Package className="h-4 w-4 mr-1.5" />
                  Orders
                </Button>
              </Link>
            )}
          </nav>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <CartSheet />

          {isAuthenticated ? (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 rounded-full bg-secondary px-3 py-1.5 transition-colors hover:bg-secondary/80"
              >
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-accent/20 text-accent">
                  <User className="h-3.5 w-3.5" />
                </div>
                <span className="hidden text-sm font-medium sm:inline">
                  {user?.firstName}
                </span>
                <ChevronDown
                  className={cn(
                    'h-4 w-4 text-muted-foreground transition-transform',
                    showUserMenu && 'rotate-180'
                  )}
                />
              </button>

              {/* Dropdown Menu */}
              {showUserMenu && (
                <div className="absolute right-0 top-full mt-2 w-48 rounded-xl border border-border bg-card p-1.5 shadow-lg animate-scale-in">
                  <Link
                    to="/profile"
                    onClick={() => setShowUserMenu(false)}
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-secondary"
                  >
                    <User className="h-4 w-4 text-muted-foreground" />
                    My Profile
                  </Link>
                  <Link
                    to="/orders"
                    onClick={() => setShowUserMenu(false)}
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-secondary"
                  >
                    <Package className="h-4 w-4 text-muted-foreground" />
                    Order History
                  </Link>
                  <div className="my-1 border-t border-border" />
                  <button
                    onClick={() => {
                      setShowUserMenu(false)
                      logout()
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-destructive transition-colors hover:bg-destructive/10"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login">
              <Button size="sm" className="rounded-full shadow-sm">
                <LogIn className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Sign In</span>
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
