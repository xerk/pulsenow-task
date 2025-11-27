import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import type { UpdateProfileData } from '@/services/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { PageHeader } from '@/components/layout/PageHeader'
import { toast } from 'sonner'
import {
  User,
  Mail,
  Phone,
  MapPin,
  Shield,
  Calendar,
  Loader2,
  Check,
} from 'lucide-react'

export default function Profile() {
  const { user, isLoading: authLoading, updateUser } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
  })

  // Sync form data when user changes
  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phone: user.phone || '',
        street: user.address?.street || '',
        city: user.address?.city || '',
        state: user.address?.state || '',
        zipCode: user.address?.zipCode || '',
        country: user.address?.country || '',
      })
    }
  }, [user])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      const data: UpdateProfileData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        address: {
          street: formData.street,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
          country: formData.country,
        },
      }

      await updateUser(data)
      toast.success('Profile updated successfully')
      setIsEditing(false)
    } catch {
      toast.error('Failed to update profile')
    } finally {
      setIsSaving(false)
    }
  }

  if (authLoading) {
    return <ProfileSkeleton />
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <PageHeader
        badge={
          <div className="mb-2 flex h-20 w-20 items-center justify-center rounded-full bg-accent/20 text-accent ring-4 ring-background shadow-lg mx-auto">
            <User className="h-10 w-10" />
          </div>
        }
        title={`${user.firstName} ${user.lastName}`}
        description={user.email}
      >
        <div className="flex items-center justify-center gap-2 -mt-2">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${
              user.isVerified
                ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400'
                : 'bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400'
            }`}
          >
            <Shield className="h-3 w-3" />
            {user.isVerified ? 'Verified' : 'Unverified'}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-xs font-medium capitalize">
            {user.role}
          </span>
        </div>
      </PageHeader>

      {/* Content */}
      <section className="container mx-auto px-4 py-8 md:py-12">
        <div className="mx-auto max-w-2xl">
          <div
            className="rounded-2xl border border-border bg-card p-6 md:p-8 animate-fade-in"
            style={{ animationDelay: '100ms' }}
          >
            <div className="mb-6 flex items-center justify-between">
              <h2 className="font-serif text-xl">Profile Information</h2>
              {!isEditing && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                  className="rounded-full"
                >
                  Edit Profile
                </Button>
              )}
            </div>

            {isEditing ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Name */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      className="rounded-lg"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      className="rounded-lg"
                    />
                  </div>
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="rounded-lg"
                  />
                </div>

                {/* Address */}
                <div className="space-y-4">
                  <Label>Address</Label>
                  <Input
                    name="street"
                    placeholder="Street"
                    value={formData.street}
                    onChange={handleChange}
                    className="rounded-lg"
                  />
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Input
                      name="city"
                      placeholder="City"
                      value={formData.city}
                      onChange={handleChange}
                      className="rounded-lg"
                    />
                    <Input
                      name="state"
                      placeholder="State"
                      value={formData.state}
                      onChange={handleChange}
                      className="rounded-lg"
                    />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Input
                      name="zipCode"
                      placeholder="ZIP Code"
                      value={formData.zipCode}
                      onChange={handleChange}
                      className="rounded-lg"
                    />
                    <Input
                      name="country"
                      placeholder="Country"
                      value={formData.country}
                      onChange={handleChange}
                      className="rounded-lg"
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsEditing(false)}
                    disabled={isSaving}
                    className="rounded-full"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSaving}
                    className="rounded-full"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Check className="h-4 w-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
              </form>
            ) : (
              <div className="space-y-6">
                {/* Email */}
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{user.email}</p>
                  </div>
                </div>

                {/* Phone */}
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                    <Phone className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="font-medium">{user.phone || 'Not provided'}</p>
                  </div>
                </div>

                {/* Address */}
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                    <MapPin className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Address</p>
                    {user.address?.street ? (
                      <p className="font-medium">
                        {user.address.street}
                        <br />
                        {user.address.city}, {user.address.state}{' '}
                        {user.address.zipCode}
                        <br />
                        {user.address.country}
                      </p>
                    ) : (
                      <p className="font-medium">Not provided</p>
                    )}
                  </div>
                </div>

                {/* Member Since */}
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Member Since</p>
                    <p className="font-medium">
                      {new Date(user.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}

function ProfileSkeleton() {
  return (
    <div className="min-h-screen">
      <PageHeader
        badge={<Skeleton className="h-20 w-20 rounded-full mx-auto" />}
        title={<Skeleton className="h-10 w-48 mx-auto" />}
        description={<Skeleton className="h-5 w-32 mx-auto" />}
      >
        <div className="flex items-center justify-center gap-2 -mt-2">
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
      </PageHeader>
      <section className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-2xl">
          <Skeleton className="h-96 w-full rounded-2xl" />
        </div>
      </section>
    </div>
  )
}
