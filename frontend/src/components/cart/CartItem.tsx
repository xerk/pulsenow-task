import type { LocalCartItem } from '@/types'
import { useCart } from '@/context/CartContext'
import { Button } from '@/components/ui/button'
import { Minus, Plus, X } from 'lucide-react'
import { Link } from 'react-router-dom'

interface CartItemProps {
  item: LocalCartItem
}

export default function CartItem({ item }: CartItemProps) {
  const { updateQuantity, removeItem } = useCart()
  const { product, quantity } = item

  const incrementQuantity = () => {
    if (quantity < product.stock) {
      updateQuantity(product.id, quantity + 1)
    }
  }

  const decrementQuantity = () => {
    if (quantity > 1) {
      updateQuantity(product.id, quantity - 1)
    }
  }

  const handleRemove = () => {
    removeItem(product.id)
  }

  return (
    <div className="group flex gap-4 py-4 border-b border-border/50 last:border-0">
      {/* Image */}
      <Link
        to={`/products/${product.id}`}
        className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-secondary"
      >
        <img
          src={product.images[0] || '/placeholder.svg'}
          alt={product.name}
          className="h-full w-full object-cover transition-transform group-hover:scale-105"
        />
      </Link>

      {/* Content */}
      <div className="flex flex-1 flex-col min-w-0">
        <div className="flex items-start justify-between gap-2">
          <Link
            to={`/products/${product.id}`}
            className="font-medium leading-tight hover:text-accent transition-colors line-clamp-2"
          >
            {product.name}
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 -mt-0.5 -mr-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
            onClick={handleRemove}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <span className="text-sm text-muted-foreground mt-0.5">
          ${product.price.toFixed(2)} each
        </span>

        <div className="mt-auto flex items-center justify-between pt-2">
          {/* Quantity Controls */}
          <div className="flex items-center gap-0.5 rounded-full border border-border p-0.5">
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 rounded-full"
              onClick={decrementQuantity}
              disabled={quantity <= 1}
            >
              <Minus className="h-3 w-3" />
            </Button>
            <span className="w-6 text-center text-sm font-medium">
              {quantity}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 rounded-full"
              onClick={incrementQuantity}
              disabled={quantity >= product.stock}
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>

          {/* Line Total */}
          <span className="font-semibold">
            ${(product.price * quantity).toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  )
}
