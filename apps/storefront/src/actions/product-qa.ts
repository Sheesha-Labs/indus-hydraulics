'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { db } from '@indus/db'

type Result<T = void> =
  | { success: true; data: T }
  | { success: false; message: string }

const AskSchema = z.object({
  productId: z.string().uuid(),
  askerName: z.string().trim().min(1, 'Name is required').max(120),
  askerEmail: z
    .string()
    .trim()
    .email('Enter a valid email')
    .max(255)
    .optional()
    .or(z.literal(''))
    .transform((v) => (v ? v : null)),
  question: z.string().trim().min(10, 'Please write at least 10 characters').max(2000),
})

export async function askProductQuestion(formData: FormData): Promise<Result> {
  try {
    const parsed = AskSchema.parse({
      productId: formData.get('productId'),
      askerName: formData.get('askerName'),
      askerEmail: formData.get('askerEmail') ?? '',
      question: formData.get('question'),
    })

    const product = await db.product.findUnique({
      where: { id: parsed.productId },
      select: { id: true, sku: true },
    })
    if (!product) return { success: false, message: 'Product not found' }

    await db.productQuestion.create({
      data: {
        productId: product.id,
        askerName: parsed.askerName,
        askerEmail: parsed.askerEmail,
        question: parsed.question,
        isPublished: false,
      },
    })

    revalidatePath(`/en/p/${product.sku}`)
    revalidatePath(`/ar/p/${product.sku}`)
    return { success: true, data: undefined }
  } catch (err) {
    if (err instanceof z.ZodError) {
      const first = err.issues[0]
      return { success: false, message: first?.message ?? 'Invalid input' }
    }
    return { success: false, message: 'Something went wrong. Please try again.' }
  }
}
