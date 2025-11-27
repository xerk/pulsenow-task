import { useRef } from 'react'
import { Link } from 'react-router-dom'
import type { Product } from '@/types'
import { useCart } from '@/context/CartContext'
import { useCartAnimation } from '@/context/CartAnimationContext'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ShoppingCart, Star, Plus, Minus } from 'lucide-react'

interface ProductCardProps {
  product: Product
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem, removeItem, isInCart, getItemQuantity } = useCart()
  const { triggerAnimation } = useCartAnimation()
  const buttonRef = useRef<HTMLButtonElement>(null)
  const inCart = isInCart(product.id)
  const quantity = getItemQuantity(product.id)

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    // Get button position for animation
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect()
      triggerAnimation(
        { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 },
        product.images[0] || '/placeholder.svg'
      )
    }

    addItem(product)
  }

  const handleIncrement = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect()
      triggerAnimation(
        { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 },
        product.images[0] || '/placeholder.svg'
      )
    }

    addItem(product)
  }

  const handleDecrement = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    removeItem(product.id)
  }

  const discount = product.compareAtPrice
    ? Math.round(
        ((product.compareAtPrice - product.price) / product.compareAtPrice) *
          100
      )
    : 0

  return (
    <Link to={`/products/${product.id}`} className="group block">
      <article className="relative h-full overflow-hidden rounded-xl bg-card border border-transparent transition-all duration-300 hover:border-accent/30 hover:shadow-xl hover:shadow-accent/5">
        {/* Image Container */}
        <div className="relative aspect-[4/5] overflow-hidden bg-secondary">
          <img
            src={product.images[0] || '/placeholder.svg'}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          />

          {/* Overlay gradient on hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

          {/* Badges */}
          <div className="absolute left-3 top-3 flex flex-col gap-2">
            {product.featured && (
              <Badge className="bg-accent text-accent-foreground border-0 shadow-sm">
                Featured
              </Badge>
            )}
            {discount > 0 && (
              <Badge className="bg-destructive text-destructive-foreground border-0 shadow-sm">
                -{discount}%
              </Badge>
            )}
          </div>

          {/* Quick Add Button / Quantity Controls */}
          <div className="absolute bottom-3 right-3 translate-y-2 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
            {inCart ? (
              <div className="flex items-center gap-1 rounded-full bg-card/95 backdrop-blur-sm shadow-lg p-1 border border-border/50">
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 rounded-full hover:bg-secondary"
                  onClick={handleDecrement}
                >
                  <Minus className="h-3 w-3" />
                </Button>
                <span className="w-6 text-center text-sm font-semibold text-accent">
                  {quantity}
                </span>
                <Button
                  ref={buttonRef}
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 rounded-full hover:bg-secondary"
                  onClick={handleIncrement}
                  disabled={quantity >= product.stock}
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
            ) : (
              <Button
                ref={buttonRef}
                size="icon"
                className="h-10 w-10 rounded-full shadow-lg transition-all duration-300 bg-accent hover:bg-accent/90 text-accent-foreground hover:scale-110"
                onClick={handleAddToCart}
                disabled={product.stock === 0}
              >
                <Plus className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Out of Stock Overlay */}
          {product.stock === 0 && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm">
              <span className="text-sm font-medium tracking-wide uppercase text-muted-foreground">
                Out of Stock
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Rating */}
          <div className="mb-2 flex items-center gap-1.5">
            <div className="flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`h-3.5 w-3.5 ${
                    i < Math.floor(product.rating)
                      ? 'fill-amber-400 text-amber-400'
                      : 'fill-muted text-muted'
                  }`}
                />
              ))}
            </div>
            <span className="text-xs text-muted-foreground">
              ({product.reviewCount})
            </span>
          </div>

          {/* Name */}
          <h3 className="font-serif text-lg leading-tight tracking-tight text-foreground transition-colors duration-300 group-hover:text-accent">
            {product.name}
          </h3>

          {/* Description */}
          <p className="mt-1.5 text-sm text-muted-foreground line-clamp-2 leading-relaxed">
            {product.description}
          </p>

          {/* Price */}
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-xl font-semibold tracking-tight text-foreground">
              ${product.price.toFixed(2)}
            </span>
            {product.compareAtPrice && (
              <span className="text-sm text-muted-foreground line-through">
                ${product.compareAtPrice.toFixed(2)}
              </span>
            )}
          </div>

          {/* Mobile Add to Cart / Quantity Controls */}
          {inCart ? (
            <div className="mt-4 flex items-center justify-between lg:hidden">
              <div className="flex items-center gap-2 rounded-full border border-border p-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full"
                  onClick={handleDecrement}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-8 text-center font-medium">{quantity}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full"
                  onClick={handleIncrement}
                  disabled={quantity >= product.stock}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <span className="text-sm text-muted-foreground">In cart</span>
            </div>
          ) : (
            <Button
              size="sm"
              className="mt-4 w-full lg:hidden"
              onClick={handleAddToCart}
              disabled={product.stock === 0}
            >
              <ShoppingCart className="h-4 w-4 mr-1.5" />
              Add to Cart
            </Button>
          )}
        </div>
      </article>
    </Link>
  )
}
