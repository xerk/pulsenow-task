import { useState } from 'react'
import { useCart } from '@/context/CartContext'
import { useCartAnimation } from '@/context/CartAnimationContext'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
  SheetFooter,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
} from '@/components/ui/empty'
import { ShoppingCart, ShoppingBag, Trash2, ArrowRight, Sparkles } from 'lucide-react'
import CartItem from './CartItem'
import { useNavigate } from 'react-router-dom'

export default function CartSheet() {
  const [open, setOpen] = useState(false)
  const { items, itemCount, subtotal, clearCart } = useCart()
  const { cartIconRef, isBouncing } = useCartAnimation()
  const navigate = useNavigate()

  const handleCheckout = () => {
    setOpen(false)
    navigate('/checkout')
  }

  const handleContinueShopping = () => {
    setOpen(false)
    navigate('/products')
  }

  const handleStartShopping = () => {
    setOpen(false)
    navigate('/products')
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          ref={cartIconRef}
          variant="ghost"
          size="icon"
          className={`relative rounded-full hover:bg-secondary ${isBouncing ? 'animate-cart-bounce' : ''}`}
        >
          <ShoppingCart className="h-5 w-5" />
          {itemCount > 0 && (
            <Badge className={`absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-[10px] font-semibold bg-accent text-accent-foreground border-0 ${isBouncing ? 'animate-cart-bounce' : ''}`}>
              {itemCount > 99 ? '99+' : itemCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="flex w-full flex-col p-0 sm:max-w-md">
        {/* Header */}
        <SheetHeader className="px-6 pt-6 pb-4">
          <SheetTitle className="flex items-center gap-3 font-serif text-xl">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent/10">
              <ShoppingBag className="h-5 w-5 text-accent" />
            </div>
            <div>
              <span>Your Cart</span>
              {itemCount > 0 && (
                <Badge variant="secondary" className="ml-2 rounded-full font-normal">
                  {itemCount} {itemCount === 1 ? 'item' : 'items'}
                </Badge>
              )}
            </div>
          </SheetTitle>
          <SheetDescription className="sr-only">
            {itemCount === 0
              ? 'Your cart is empty'
              : `${itemCount} item${itemCount > 1 ? 's' : ''} in your cart`}
          </SheetDescription>
        </SheetHeader>

        <Separator />

        {items.length === 0 ? (
          <Empty className="flex-1 px-6">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <ShoppingCart className="h-6 w-6" />
              </EmptyMedia>
              <EmptyTitle className="font-serif">Your cart is empty</EmptyTitle>
              <EmptyDescription>
                Looks like you haven't added anything to your cart yet
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button className="rounded-full px-6" onClick={handleStartShopping}>
                Start Shopping
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </EmptyContent>
          </Empty>
        ) : (
          <>
            {/* Cart Items */}
            <ScrollArea className="flex-1 px-6">
              <div className="py-4">
                {items.map((item, index) => (
                  <div
                    key={item.productId}
                    className="animate-fade-in"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <CartItem item={item} />
                  </div>
                ))}
              </div>
            </ScrollArea>

            {/* Footer */}
            <SheetFooter className="flex-col gap-4 border-t border-border bg-secondary/30 px-6 py-5 sm:flex-col">
              {/* Free shipping notice */}
              <div className="flex items-center gap-2 rounded-lg bg-accent/10 px-3 py-2 text-sm">
                <Sparkles className="h-4 w-4 text-accent" />
                <span className="text-accent-foreground">
                  Free shipping on orders over $50
                </span>
              </div>

              {/* Subtotal */}
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-serif text-2xl tracking-tight">
                  ${subtotal.toFixed(2)}
                </span>
              </div>

              <p className="text-xs text-muted-foreground">
                Shipping and taxes calculated at checkout
              </p>

              {/* Actions */}
              <div className="flex flex-col gap-2 pt-2">
                <Button
                  className="w-full h-12 rounded-full text-base font-medium"
                  onClick={handleCheckout}
                >
                  Checkout
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    className="flex-1 h-10 rounded-full"
                    onClick={handleContinueShopping}
                  >
                    Continue Shopping
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={clearCart}
                    className="h-10 w-10 rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
