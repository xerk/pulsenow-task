import { useState, useRef } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useProduct } from '@/hooks/useProducts'
import { useCart } from '@/context/CartContext'
import { useCartAnimation } from '@/context/CartAnimationContext'
import { useAuth } from '@/context/AuthContext'
import { getReviews, createReview } from '@/services/api'
import { reviewSchema, type ReviewFormData } from '@/schemas/review'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import type { Review } from '@/types'
import axios from 'axios'
import {
  ArrowLeft,
  Minus,
  Plus,
  ShoppingCart,
  Star,
  Check,
  Package,
  Truck,
  Shield,
  User,
  CheckCircle,
  MessageSquare,
  Loader2,
  Send,
} from 'lucide-react'

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: product, isLoading, error } = useProduct(id || '')
  const { addItem, isInCart, getItemQuantity } = useCart()
  const { triggerAnimation } = useCartAnimation()
  const { isAuthenticated } = useAuth()
  const queryClient = useQueryClient()
  const addToCartButtonRef = useRef<HTMLButtonElement>(null)
  const [quantity, setQuantity] = useState(1)
  const [selectedImage, setSelectedImage] = useState(0)

  // Review form with Zod validation
  const reviewFormMethods = useForm<ReviewFormData>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      rating: 5,
      title: '',
      comment: '',
    },
    mode: 'onChange', // Real-time validation
  })

  const { register, handleSubmit, formState: { errors }, setValue, watch, reset } = reviewFormMethods
  const watchRating = watch('rating')

  // Fetch reviews
  const { data: reviews, isLoading: reviewsLoading } = useQuery({
    queryKey: ['reviews', id],
    queryFn: () => getReviews(id || ''),
    enabled: !!id,
    select: (data) => data.data,
  })

  // Create review mutation with proper error handling
  const createReviewMutation = useMutation({
    mutationFn: (data: { productId: string; rating: number; title: string; comment: string }) =>
      createReview(data),
    onSuccess: () => {
      toast.success('Review submitted successfully!')
      queryClient.invalidateQueries({ queryKey: ['reviews', id] })
      queryClient.invalidateQueries({ queryKey: ['product', id] })
      reset({ rating: 5, title: '', comment: '' })
    },
    onError: (error) => {
      // Extract error message from API response
      if (axios.isAxiosError(error) && error.response?.data?.message) {
        toast.error(error.response.data.message)
      } else if (error instanceof Error) {
        toast.error(error.message)
      } else {
        toast.error('Failed to submit review')
      }
    },
  })

  const onSubmitReview = (data: ReviewFormData) => {
    if (!id) return
    createReviewMutation.mutate({
      productId: id,
      ...data,
    })
  }

  const inCart = product ? isInCart(product.id) : false
  const cartQuantity = product ? getItemQuantity(product.id) : 0

  const handleAddToCart = () => {
    if (product) {
      // Trigger animation
      if (addToCartButtonRef.current) {
        const rect = addToCartButtonRef.current.getBoundingClientRect()
        triggerAnimation(
          { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 },
          product.images[selectedImage] || '/placeholder.svg'
        )
      }
      addItem(product, quantity)
      setQuantity(1)
    }
  }

  const handleBuyNow = () => {
    if (product) {
      addItem(product, quantity)
      navigate('/checkout')
    }
  }

  const incrementQuantity = () => {
    if (product && quantity < product.stock) {
      setQuantity((q) => q + 1)
    }
  }

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity((q) => q - 1)
    }
  }

  if (isLoading) {
    return <ProductDetailSkeleton />
  }

  if (error || !product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Link
          to="/products"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to products
        </Link>
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="mb-4 rounded-full bg-muted p-4">
            <Package className="h-8 w-8 text-muted-foreground" />
          </div>
          <p className="font-serif text-xl text-foreground">Product not found</p>
          <p className="mt-2 text-muted-foreground">
            The product you're looking for doesn't exist
          </p>
          <Link to="/products" className="mt-6">
            <Button>Browse Products</Button>
          </Link>
        </div>
      </div>
    )
  }

  const discount = product.compareAtPrice
    ? Math.round(
        ((product.compareAtPrice - product.price) / product.compareAtPrice) *
          100
      )
    : 0

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <Link
          to="/products"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to products
        </Link>

        <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
          {/* Images */}
          <div className="space-y-4 animate-fade-in">
            <div className="aspect-square overflow-hidden rounded-2xl bg-secondary">
              <img
                src={product.images[selectedImage] || '/placeholder.svg'}
                alt={product.name}
                className="h-full w-full object-cover"
              />
            </div>
            {product.images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg transition-all ${
                      selectedImage === index
                        ? 'ring-2 ring-accent ring-offset-2'
                        : 'opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div
            className="space-y-6 animate-fade-in"
            style={{ animationDelay: '100ms' }}
          >
            {/* Badges */}
            <div className="flex flex-wrap gap-2">
              {product.featured && (
                <Badge className="bg-accent text-accent-foreground border-0">
                  Featured
                </Badge>
              )}
              {discount > 0 && (
                <Badge className="bg-destructive text-destructive-foreground border-0">
                  {discount}% OFF
                </Badge>
              )}
              {product.stock <= 5 && product.stock > 0 && (
                <Badge
                  variant="outline"
                  className="text-destructive border-destructive/30"
                >
                  Only {product.stock} left
                </Badge>
              )}
            </div>

            {/* Title & Rating */}
            <div>
              <h1 className="font-serif text-3xl tracking-tight md:text-4xl">
                {product.name}
              </h1>
              <div className="mt-3 flex items-center gap-3">
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < Math.floor(product.rating)
                          ? 'fill-accent text-accent'
                          : 'fill-muted text-muted'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">
                  {product.rating} ({product.reviewCount} reviews)
                </span>
              </div>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3">
              <span className="font-serif text-4xl tracking-tight">
                ${product.price.toFixed(2)}
              </span>
              {product.compareAtPrice && (
                <span className="text-xl text-muted-foreground line-through">
                  ${product.compareAtPrice.toFixed(2)}
                </span>
              )}
            </div>

            {/* Description */}
            <p className="text-muted-foreground leading-relaxed">
              {product.description}
            </p>

            {/* Add to Cart */}
            {product.stock > 0 ? (
              <div className="space-y-4 pt-2">
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium">Quantity</span>
                  <div className="flex items-center gap-1 rounded-full border border-border p-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-full"
                      onClick={decrementQuantity}
                      disabled={quantity <= 1}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-10 text-center font-medium">
                      {quantity}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-full"
                      onClick={incrementQuantity}
                      disabled={quantity >= product.stock}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {product.stock} available
                  </span>
                </div>

                <div className="flex gap-3">
                  <Button
                    ref={addToCartButtonRef}
                    size="lg"
                    className="flex-1 h-12 rounded-full text-base shadow-sm"
                    onClick={handleAddToCart}
                    variant={inCart ? 'secondary' : 'outline'}
                  >
                    {inCart ? (
                      <>
                        <Check className="h-5 w-5 mr-2" />
                        In Cart ({cartQuantity})
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="h-5 w-5 mr-2" />
                        Add to Cart
                      </>
                    )}
                  </Button>
                  <Button
                    size="lg"
                    className="flex-1 h-12 rounded-full text-base shadow-sm"
                    onClick={handleBuyNow}
                  >
                    Buy Now
                  </Button>
                </div>
              </div>
            ) : (
              <div className="rounded-xl bg-muted/50 p-4 text-center">
                <p className="font-medium text-muted-foreground">Out of Stock</p>
              </div>
            )}

            {/* Features */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border">
              <div className="text-center">
                <Truck className="h-5 w-5 mx-auto text-muted-foreground mb-2" />
                <p className="text-xs text-muted-foreground">Free Shipping</p>
              </div>
              <div className="text-center">
                <Shield className="h-5 w-5 mx-auto text-muted-foreground mb-2" />
                <p className="text-xs text-muted-foreground">Secure Payment</p>
              </div>
              <div className="text-center">
                <Package className="h-5 w-5 mx-auto text-muted-foreground mb-2" />
                <p className="text-xs text-muted-foreground">Easy Returns</p>
              </div>
            </div>

            {/* Specifications */}
            {Object.keys(product.specifications).length > 0 && (
              <div className="pt-6 border-t border-border">
                <h3 className="font-serif text-lg mb-4">Specifications</h3>
                <dl className="grid gap-2">
                  {Object.entries(product.specifications).map(([key, value]) => (
                    <div
                      key={key}
                      className="flex justify-between py-2 border-b border-border/50 last:border-0"
                    >
                      <dt className="text-muted-foreground capitalize">{key}</dt>
                      <dd className="font-medium">{value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}

            {/* Tags */}
            {product.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-4">
                {product.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="rounded-full">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Reviews Section */}
        <section className="mt-16 pt-12 border-t border-border">
          <div className="flex items-center gap-3 mb-8">
            <MessageSquare className="h-6 w-6 text-accent" />
            <h2 className="font-serif text-2xl">Customer Reviews</h2>
            <span className="text-muted-foreground">
              ({product.reviewCount})
            </span>
          </div>

          {/* Reviews List */}
          {reviewsLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-32 w-full rounded-xl" />
              ))}
            </div>
          ) : reviews && reviews.length > 0 ? (
            <div className="space-y-4">
              {reviews.map((review, index) => (
                <ReviewCard key={review.id} review={review} index={index} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 rounded-xl bg-secondary/30">
              <MessageSquare className="h-8 w-8 mx-auto text-muted-foreground mb-3" />
              <p className="font-serif text-lg">No reviews yet</p>
              <p className="text-sm text-muted-foreground mt-1">
                Be the first to review this product
              </p>
            </div>
          )}

          {/* Review Form - Always visible for authenticated users */}
          {isAuthenticated ? (
            <div className="mt-8 rounded-xl border border-border bg-card p-6">
              <h3 className="font-serif text-lg mb-4">Write Your Review</h3>
              <form onSubmit={handleSubmit(onSubmitReview)} className="space-y-4">
                {/* Rating */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Rating</label>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setValue('rating', i + 1)}
                        className="p-1 transition-transform hover:scale-110"
                      >
                        <Star
                          className={`h-6 w-6 ${
                            i < watchRating
                              ? 'fill-accent text-accent'
                              : 'fill-muted text-muted'
                          }`}
                        />
                      </button>
                    ))}
                    <span className="ml-2 text-sm text-muted-foreground">
                      {watchRating} out of 5
                    </span>
                  </div>
                  {errors.rating && (
                    <p className="text-sm text-destructive">{errors.rating.message}</p>
                  )}
                </div>

                {/* Title */}
                <div className="space-y-2">
                  <label htmlFor="review-title" className="text-sm font-medium">
                    Review Title
                  </label>
                  <Input
                    id="review-title"
                    placeholder="Sum up your experience..."
                    {...register('title')}
                    className={`rounded-lg ${errors.title ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                  />
                  {errors.title && (
                    <p className="text-sm text-destructive">{errors.title.message}</p>
                  )}
                </div>

                {/* Comment */}
                <div className="space-y-2">
                  <label htmlFor="review-comment" className="text-sm font-medium">
                    Your Review
                  </label>
                  <textarea
                    id="review-comment"
                    placeholder="Share your thoughts about this product..."
                    {...register('comment')}
                    rows={4}
                    className={`w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 resize-none ${
                      errors.comment
                        ? 'border-destructive focus:ring-destructive'
                        : 'border-border focus:ring-accent'
                    }`}
                  />
                  {errors.comment && (
                    <p className="text-sm text-destructive">{errors.comment.message}</p>
                  )}
                </div>

                {/* Submit */}
                <div className="pt-2">
                  <Button
                    type="submit"
                    disabled={createReviewMutation.isPending}
                    className="rounded-full"
                  >
                    {createReviewMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Submit Review
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </div>
          ) : (
            <div className="mt-8 text-center py-8 rounded-xl border border-dashed border-border">
              <p className="text-muted-foreground mb-3">
                Sign in to write a review
              </p>
              <Link to="/login">
                <Button variant="outline" className="rounded-full">
                  Sign In
                </Button>
              </Link>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

function ReviewCard({ review, index }: { review: Review; index: number }) {
  return (
    <div
      className="rounded-xl border border-border bg-card p-5 animate-fade-in"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary">
            <User className="h-5 w-5 text-muted-foreground" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-medium">Customer</span>
              {review.verifiedPurchase && (
                <span className="flex items-center gap-1 text-xs text-green-600">
                  <CheckCircle className="h-3 w-3" />
                  Verified Purchase
                </span>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              {new Date(review.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={`h-4 w-4 ${
                i < review.rating
                  ? 'fill-accent text-accent'
                  : 'fill-muted text-muted'
              }`}
            />
          ))}
        </div>
      </div>

      {review.title && (
        <h4 className="mt-3 font-medium">{review.title}</h4>
      )}

      <p className="mt-2 text-muted-foreground leading-relaxed">
        {review.comment}
      </p>
    </div>
  )
}

function ProductDetailSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Skeleton className="h-6 w-32 mb-8" />
      <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
        <div className="space-y-4">
          <Skeleton className="aspect-square w-full rounded-2xl" />
          <div className="flex gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-20 rounded-lg flex-shrink-0" />
            ))}
          </div>
        </div>
        <div className="space-y-6">
          <div className="flex gap-2">
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="h-6 w-1/3" />
          <Skeleton className="h-12 w-40" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
          <Skeleton className="h-12 w-full rounded-full" />
        </div>
      </div>
    </div>
  )
}
