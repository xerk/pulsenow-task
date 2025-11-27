import { useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { useAuth } from '@/context/AuthContext'
import { loginSchema, type LoginFormData } from '@/schemas/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, Sparkles, ArrowLeft, Mail, Lock, ShoppingBag, Truck, Shield } from 'lucide-react'
import axios from 'axios'

export default function Login() {
  const [isLoading, setIsLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const from = location.state?.from?.pathname || '/products'

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
    mode: 'onChange',
  })

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true)

    try {
      await login(data.email, data.password)
      toast.success('Welcome back!')
      navigate(from, { replace: true })
    } catch (error) {
      // Extract error message from API response
      if (axios.isAxiosError(error) && error.response?.data?.message) {
        toast.error(error.response.data.message)
      } else if (error instanceof Error) {
        toast.error(error.message)
      } else {
        toast.error('Invalid email or password')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex relative">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-[55%] xl:w-[60%] bg-secondary/50 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-40">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-[size:14px_24px]" />
        </div>

        {/* Gradient Orbs */}
        <div className="absolute -top-40 -left-40 h-80 w-80 rounded-full bg-accent/20 blur-[100px]" />
        <div className="absolute -bottom-40 -right-40 h-80 w-80 rounded-full bg-primary/10 blur-[100px]" />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          {/* Logo */}
          <Link to="/products" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 backdrop-blur-sm">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <span className="text-xl font-semibold text-foreground">Luxe Market</span>
          </Link>

          {/* Features */}
          <div className="space-y-8">
            <div>
              <h1 className="text-4xl font-bold tracking-tight text-foreground">
                Shop with
                <br />
                <span className="text-accent">confidence</span>
              </h1>
              <p className="mt-4 text-lg text-muted-foreground max-w-md">
                Discover our curated collection of premium products, handpicked for quality and style.
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent/10">
                  <ShoppingBag className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <h3 className="font-medium text-foreground">Curated Selection</h3>
                  <p className="text-sm text-muted-foreground">Hand-picked products from top brands worldwide</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent/10">
                  <Truck className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <h3 className="font-medium text-foreground">Fast Delivery</h3>
                  <p className="text-sm text-muted-foreground">Free shipping on orders over $50</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent/10">
                  <Shield className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <h3 className="font-medium text-foreground">Secure Shopping</h3>
                  <p className="text-sm text-muted-foreground">Your data is protected with enterprise-grade security</p>
                </div>
              </div>
            </div>
          </div>

          {/* Testimonial */}
          <div className="max-w-md">
            <blockquote className="border-l-2 border-accent/50 pl-4">
              <p className="text-muted-foreground italic">
                "The quality of products exceeded my expectations. Fast shipping and excellent customer service!"
              </p>
              <footer className="mt-3 flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-accent/20 flex items-center justify-center text-sm font-medium text-accent">
                  JD
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Jane Doe</p>
                  <p className="text-xs text-muted-foreground">Verified Customer</p>
                </div>
              </footer>
            </blockquote>
          </div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="relative flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div className="animate-fade-in">
            <Link
              to="/products"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground mb-8"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to products
            </Link>

            <div className="flex items-center gap-3 mb-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Sparkles className="h-5 w-5" />
              </div>
            </div>

            <h1 className="mt-4 font-serif text-3xl tracking-tight">
              Welcome back
            </h1>
            <p className="mt-2 text-muted-foreground">
              Sign in to your account to continue shopping
            </p>
          </div>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="mt-8 space-y-5 animate-fade-in"
            style={{ animationDelay: '100ms' }}
          >
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Email address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  {...register('email')}
                  disabled={isLoading}
                  className={`h-11 pl-10 rounded-lg ${errors.email ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                />
              </div>
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  {...register('password')}
                  disabled={isLoading}
                  className={`h-11 pl-10 rounded-lg ${errors.password ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                />
              </div>
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password.message}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full h-11 rounded-lg text-base shadow-sm"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign in'
              )}
            </Button>
          </form>

          <div
            className="mt-8 rounded-xl bg-secondary/50 p-5 animate-fade-in"
            style={{ animationDelay: '200ms' }}
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-foreground">
                Test Credentials
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-7 text-xs rounded-full"
                onClick={() => {
                  setValue('email', 'john.doe@example.com', { shouldValidate: true })
                  setValue('password', 'password123', { shouldValidate: true })
                  toast.success('Test credentials filled!')
                }}
              >
                Use These
              </Button>
            </div>
            <div className="space-y-1.5 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Email</span>
                <code className="rounded bg-background px-2 py-0.5 text-xs">
                  john.doe@example.com
                </code>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Password</span>
                <code className="rounded bg-background px-2 py-0.5 text-xs">
                  password123
                </code>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
