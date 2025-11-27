import { z } from 'zod'

export const reviewSchema = z.object({
  rating: z
    .number()
    .min(1, 'Please select a rating')
    .max(5, 'Rating must be between 1 and 5'),
  title: z
    .string()
    .min(1, 'Title is required')
    .min(3, 'Title must be at least 3 characters')
    .max(100, 'Title must be less than 100 characters'),
  comment: z
    .string()
    .min(1, 'Review is required')
    .min(10, 'Review must be at least 10 characters')
    .max(1000, 'Review must be less than 1000 characters'),
})

export type ReviewFormData = z.infer<typeof reviewSchema>
