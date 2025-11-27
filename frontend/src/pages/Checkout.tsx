import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useCart } from '@/context/CartContext'
import { useAuth } from '@/context/AuthContext'
import { createOrder, type CreateOrderData } from '@/services/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { PageHeader } from '@/components/layout/PageHeader'
import { toast } from 'sonner'
import {
  ShoppingBag,
  CreditCard,
  MapPin,
  Loader2,
  Check,
  ArrowLeft,
  LogIn,
} from 'lucide-react'
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
} from '@/components/ui/empty'

export default function Checkout() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { items, subtotal, clearCart } = useCart()
  const { user, isAuthenticated } = useAuth()

  const [shippingAddress, setShippingAddress] = useState({
    street: user?.address?.street || '',
    city: user?.address?.city || '',
    state: user?.address?.state || '',
    zipCode: user?.address?.zipCode || '',
    country: user?.address?.country || '',
  })
  const [paymentMethod, setPaymentMethod] = useState<'credit_card' | 'paypal'>('credit_card')

  const shipping = 0 // Free shipping
  const tax = subtotal * 0.1 // 10% tax
  const total = subtotal + shipping + tax

  const createOrderMutation = useMutation({
    mutationFn: (data: CreateOrderData) => createOrder(data),
    onSuccess: () => {
      toast.success('Order placed successfully!')
      clearCart()
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      navigate('/orders')
    },
    onError: () => {
      toast.error('Failed to place order. Please try again.')
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!shippingAddress.street || !shippingAddress.city || !shippingAddress.state || !shippingAddress.zipCode || !shippingAddress.country) {
      toast.error('Please fill in all shipping address fields')
      return
    }

    if (items.length === 0) {
      toast.error('Your cart is empty')
      return
    }

    createOrderMutation.mutate({
      items: items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
      })),
      shippingAddress,
      paymentMethod,
    })
  }

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-16">
        <Empty className="py-12">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <LogIn className="h-6 w-6" />
            </EmptyMedia>
            <EmptyTitle className="font-serif">Sign in to checkout</EmptyTitle>
            <EmptyDescription>
              You need to be logged in to place an order
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Link to="/login">
              <Button className="rounded-full">Sign In</Button>
            </Link>
          </EmptyContent>
        </Empty>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <Empty className="py-12">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <ShoppingBag className="h-6 w-6" />
            </EmptyMedia>
            <EmptyTitle className="font-serif">Your cart is empty</EmptyTitle>
            <EmptyDescription>
              Add some products to checkout
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Link to="/products">
              <Button className="rounded-full">Browse Products</Button>
            </Link>
          </EmptyContent>
        </Empty>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <PageHeader
        align="left"
        topContent={
          <Link
            to="/products"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Continue Shopping
          </Link>
        }
        badge={
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10">
            <ShoppingBag className="h-6 w-6 text-accent" />
          </div>
        }
        title="Checkout"
      />

      {/* Content */}
      <section className="container mx-auto px-4 py-8 md:py-12">
        <form onSubmit={handleSubmit}>
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Left Column - Forms */}
            <div className="lg:col-span-2 space-y-8">
              {/* Shipping Address */}
              <div className="rounded-2xl border border-border bg-card p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/10">
                    <MapPin className="h-5 w-5 text-accent" />
                  </div>
                  <h2 className="font-serif text-xl">Shipping Address</h2>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="street">Street Address</Label>
                    <Input
                      id="street"
                      placeholder="123 Main St"
                      value={shippingAddress.street}
                      onChange={(e) =>
                        setShippingAddress((prev) => ({ ...prev, street: e.target.value }))
                      }
                      className="rounded-lg"
                      required
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        placeholder="New York"
                        value={shippingAddress.city}
                        onChange={(e) =>
                          setShippingAddress((prev) => ({ ...prev, city: e.target.value }))
                        }
                        className="rounded-lg"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="state">State</Label>
                      <Input
                        id="state"
                        placeholder="NY"
                        value={shippingAddress.state}
                        onChange={(e) =>
                          setShippingAddress((prev) => ({ ...prev, state: e.target.value }))
                        }
                        className="rounded-lg"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="zipCode">ZIP Code</Label>
                      <Input
                        id="zipCode"
                        placeholder="10001"
                        value={shippingAddress.zipCode}
                        onChange={(e) =>
                          setShippingAddress((prev) => ({ ...prev, zipCode: e.target.value }))
                        }
                        className="rounded-lg"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="country">Country</Label>
                      <Input
                        id="country"
                        placeholder="United States"
                        value={shippingAddress.country}
                        onChange={(e) =>
                          setShippingAddress((prev) => ({ ...prev, country: e.target.value }))
                        }
                        className="rounded-lg"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="rounded-2xl border border-border bg-card p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/10">
                    <CreditCard className="h-5 w-5 text-accent" />
                  </div>
                  <h2 className="font-serif text-xl">Payment Method</h2>
                </div>

                <div className="space-y-2">
                  <Label>Select Payment Method</Label>
                  <Select
                    value={paymentMethod}
                    onValueChange={(value: 'credit_card' | 'paypal') => setPaymentMethod(value)}
                  >
                    <SelectTrigger className="rounded-lg">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="credit_card">Credit Card</SelectItem>
                      <SelectItem value="paypal">PayPal</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-2">
                    This is a demo - no actual payment will be processed
                  </p>
                </div>
              </div>
            </div>

            {/* Right Column - Order Summary */}
            <div className="lg:col-span-1">
              <div className="rounded-2xl border border-border bg-card p-6 sticky top-24">
                <h2 className="font-serif text-xl mb-6">Order Summary</h2>

                {/* Items */}
                <div className="space-y-4 mb-6">
                  {items.map((item) => (
                    <div key={item.productId} className="flex gap-3">
                      <div className="h-16 w-16 rounded-lg bg-secondary overflow-hidden flex-shrink-0">
                        <img
                          src={item.product.images[0] || '/placeholder.svg'}
                          alt={item.product.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm line-clamp-1">
                          {item.product.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Qty: {item.quantity}
                        </p>
                        <p className="text-sm font-medium">
                          ${(item.product.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Totals */}
                <div className="space-y-3 border-t border-border pt-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className="text-green-600">Free</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tax (10%)</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-serif text-xl pt-3 border-t border-border">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>

                {/* Place Order Button */}
                <Button
                  type="submit"
                  size="lg"
                  className="w-full mt-6 rounded-full"
                  disabled={createOrderMutation.isPending}
                >
                  {createOrderMutation.isPending ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Check className="h-5 w-5 mr-2" />
                      Place Order
                    </>
                  )}
                </Button>

                <p className="text-xs text-center text-muted-foreground mt-4">
                  By placing your order, you agree to our terms and conditions
                </p>
              </div>
            </div>
          </div>
        </form>
      </section>
    </div>
  )
}
