import { z } from 'zod'

export const shippingAddressSchema = z.object({
  street: z
    .string()
    .min(1, 'Street address is required')
    .min(5, 'Please enter a valid street address'),
  city: z
    .string()
    .min(1, 'City is required')
    .min(2, 'Please enter a valid city'),
  state: z
    .string()
    .min(1, 'State is required')
    .min(2, 'Please enter a valid state'),
  zipCode: z
    .string()
    .min(1, 'ZIP code is required')
    .regex(/^\d{5}(-\d{4})?$/, 'Please enter a valid ZIP code'),
  country: z
    .string()
    .min(1, 'Country is required'),
})

export const checkoutSchema = z.object({
  shippingAddress: shippingAddressSchema,
  paymentMethod: z.enum(['credit_card', 'paypal'], {
    required_error: 'Please select a payment method',
  }),
})

export type ShippingAddressFormData = z.infer<typeof shippingAddressSchema>
export type CheckoutFormData = z.infer<typeof checkoutSchema>
