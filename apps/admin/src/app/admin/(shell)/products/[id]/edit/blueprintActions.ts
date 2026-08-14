'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { db, Prisma } from '@indus/db'
import { auth } from '../../../../../../lib/auth'
import { ROLES, requireRole } from '../../../../../../lib/rbac'
import { fail, failFromError, ok, type Result } from '../../../../../../lib/result'
import { scoreFromProduct } from '../../../../../../lib/product-content-score'
import { inngest } from '../../../../../../inngest/client'
import { authorProductBlueprintPrompt } from '../../../../../../lib/product-blueprint/author'
import {
  copyBlueprintDraftToProduct,
  deleteBlueprintObject,
} from '../../../../../../lib/product-blueprint/generate'
import {
  BLUEPRINT_IMAGE_HEIGHT,
  BLUEPRINT_IMAGE_WIDTH,
  BLUEPRINT_ORCHESTRATOR_MODEL,
  BLUEPRINT_REFERENCE_URL,
  BLUEPRINT_SUGGESTION_FIELD,
  parseBlueprintContext,
  type BlueprintGenerationContext,
} from '../../../../../../lib/product-blueprint/types'

const ProductIdSchema = z.string().uuid()
const SuggestionIdSchema = z.string().uuid()
const BlueprintPromptSchema = z.string().trim().min(400).max(12000)
const RefinementSchema = z.string().trim().min(3).max(1000)

export async function generateProductBlueprintPrompt(
  productId: string
): Promise<Result<{ prompt: string }>> {
  try {
    requireRole(await auth(), ROLES.AI_GENERATE)
    ProductIdSchema.parse(productId)

    if (!process.env.OPENAI_API_KEY) {
      return fail('PRECONDITION_FAILED', 'OPENAI_API_KEY is not configured')
    }

    const product = await db.product.findUnique({
      where: { id: productId },
      select: { title: true },
    })
    if (!product) return fail('NOT_FOUND', 'Product not found')

    try {
      const authored = await authorProductBlueprintPrompt(product.title)
      return ok({ prompt: authored.prompt })
    } catch (error) {
      console.error('[product-blueprint] prompt authoring failed:', error)
      return fail('INTERNAL', 'Could not generate the product image prompt')
    }
  } catch (error) {
    return failFromError(error)
  }
}

export async function queueProductBlueprintGeneration(
  formData: FormData
): Promise<Result<{ suggestionId: string }>> {
  try {
    const session = requireRole(await auth(), ROLES.AI_GENERATE)
    if (!process.env.OPENAI_API_KEY) {
      return fail('PRECONDITION_FAILED', 'OPENAI_API_KEY is not configured')
    }

    const productId = ProductIdSchema.parse(formData.get('productId'))
    const prompt = BlueprintPromptSchema.parse(formData.get('prompt'))

    const existing = await db.aiSuggestion.findFirst({
      where: {
        entityType: 'product',
        entityId: productId,
        field: BLUEPRINT_SUGGESTION_FIELD,
        status: 'pending',
      },
      select: { id: true },
    })
    if (existing) {
      return fail(
        'PRECONDITION_FAILED',
        'This product already has a blueprint draft awaiting review'
      )
    }

    const product = await db.product.findUnique({
      where: { id: productId },
      include: {
        brand: { select: { name: true } },
        category: { select: { name: true } },
        specs: { orderBy: { position: 'asc' } },
      },
    })
    if (!product) return fail('NOT_FOUND', 'Product not found')

    const context: BlueprintGenerationContext = {
      version: 1,
      generationStatus: 'queued',
      prompt,
      customInstructions: null,
      referenceImageUrl: process.env.OPENAI_BLUEPRINT_REFERENCE_URL ?? BLUEPRINT_REFERENCE_URL,
      productSnapshot: {
        id: product.id,
        sku: product.sku,
        mpn: product.mpn,
        title: product.title,
        descriptionShort: product.descriptionShort,
        brandName: product.brand?.name ?? null,
        categoryName: product.category?.name ?? null,
        specs: product.specs
          .filter((spec) => spec.label.trim() && spec.value.trim())
          .slice(0, 24)
          .map((spec) => ({
            group: spec.group,
            label: spec.label,
            value: spec.value,
            unit: spec.unit,
          })),
      },
      attempts: 1,
      refinementHistory: [],
    }

    const suggestion = await db.aiSuggestion.create({
      data: {
        entityType: 'product',
        entityId: product.id,
        field: BLUEPRINT_SUGGESTION_FIELD,
        model: process.env.OPENAI_BLUEPRINT_ORCHESTRATOR_MODEL ?? BLUEPRINT_ORCHESTRATOR_MODEL,
        inputContext: context as unknown as Prisma.InputJsonValue,
        output: '',
        status: 'pending',
        createdById: session.user.id,
      },
      select: { id: true },
    })

    try {
      await inngest.send({
        name: 'product/blueprint.requested',
        data: { suggestionId: suggestion.id, mode: 'initial' },
      })
    } catch (error) {
      await db.aiSuggestion.update({
        where: { id: suggestion.id },
        data: {
          inputContext: {
            ...context,
            generationStatus: 'failed',
            error: `Could not queue generation: ${(error as Error).message}`,
          } as unknown as Prisma.InputJsonValue,
        },
      })
      return fail('INTERNAL', 'Could not queue blueprint generation')
    }

    revalidateProduct(product.id)
    return ok({ suggestionId: suggestion.id })
  } catch (error) {
    return failFromError(error)
  }
}

export async function refineProductBlueprint(
  suggestionId: string,
  instruction: string
): Promise<Result<void>> {
  try {
    requireRole(await auth(), ROLES.AI_GENERATE)
    SuggestionIdSchema.parse(suggestionId)
    const refinement = RefinementSchema.parse(instruction)

    const suggestion = await db.aiSuggestion.findUnique({ where: { id: suggestionId } })
    if (!suggestion) return fail('NOT_FOUND', 'Blueprint draft not found')
    if (suggestion.status !== 'pending') {
      return fail('PRECONDITION_FAILED', `Blueprint draft is already ${suggestion.status}`)
    }

    const context = parseBlueprintContext(suggestion.inputContext)
    if (!context || context.generationStatus !== 'ready' || !context.responseId) {
      return fail('PRECONDITION_FAILED', 'Blueprint draft is not ready to refine')
    }

    const nextContext: BlueprintGenerationContext = {
      ...context,
      generationStatus: 'queued',
      attempts: context.attempts + 1,
      error: undefined,
      refinementHistory: [
        ...(context.refinementHistory ?? []),
        { instruction: refinement, requestedAt: new Date().toISOString() },
      ],
    }
    await db.aiSuggestion.update({
      where: { id: suggestion.id },
      data: { inputContext: nextContext as unknown as Prisma.InputJsonValue },
    })

    try {
      await inngest.send({
        name: 'product/blueprint.requested',
        data: { suggestionId, mode: 'refine', refinement },
      })
    } catch (error) {
      await db.aiSuggestion.update({
        where: { id: suggestion.id },
        data: {
          inputContext: {
            ...context,
            generationStatus: 'ready',
            error: `Could not queue refinement: ${(error as Error).message}`,
          } as unknown as Prisma.InputJsonValue,
        },
      })
      return fail('INTERNAL', 'Could not queue blueprint refinement')
    }

    revalidateProduct(suggestion.entityId)
    return ok(undefined)
  } catch (error) {
    return failFromError(error)
  }
}

export async function retryProductBlueprint(suggestionId: string): Promise<Result<void>> {
  try {
    requireRole(await auth(), ROLES.AI_GENERATE)
    SuggestionIdSchema.parse(suggestionId)

    const suggestion = await db.aiSuggestion.findUnique({ where: { id: suggestionId } })
    if (!suggestion) return fail('NOT_FOUND', 'Blueprint draft not found')
    if (suggestion.status !== 'pending') {
      return fail('PRECONDITION_FAILED', `Blueprint draft is already ${suggestion.status}`)
    }

    const context = parseBlueprintContext(suggestion.inputContext)
    if (!context || context.generationStatus !== 'failed') {
      return fail('PRECONDITION_FAILED', 'Only failed blueprint runs can be retried')
    }

    const nextContext: BlueprintGenerationContext = {
      ...context,
      generationStatus: 'queued',
      attempts: context.attempts + 1,
      error: undefined,
    }
    await db.aiSuggestion.update({
      where: { id: suggestion.id },
      data: { inputContext: nextContext as unknown as Prisma.InputJsonValue },
    })
    await inngest.send({
      name: 'product/blueprint.requested',
      data: { suggestionId, mode: 'retry' },
    })

    revalidateProduct(suggestion.entityId)
    return ok(undefined)
  } catch (error) {
    return failFromError(error)
  }
}

export async function acceptProductBlueprint(suggestionId: string): Promise<Result<void>> {
  try {
    const session = requireRole(await auth(), ROLES.AI_GENERATE)
    SuggestionIdSchema.parse(suggestionId)

    const suggestion = await db.aiSuggestion.findUnique({ where: { id: suggestionId } })
    if (!suggestion) return fail('NOT_FOUND', 'Blueprint draft not found')
    if (suggestion.status !== 'pending') {
      return fail('PRECONDITION_FAILED', `Blueprint draft is already ${suggestion.status}`)
    }

    const context = parseBlueprintContext(suggestion.inputContext)
    if (
      !context ||
      context.generationStatus !== 'ready' ||
      !context.objectPath ||
      !context.storagePath ||
      !context.bytes
    ) {
      return fail('PRECONDITION_FAILED', 'Blueprint draft is not ready to accept')
    }

    const product = await db.product.findUnique({
      where: { id: suggestion.entityId },
      select: { id: true, slug: true, title: true },
    })
    if (!product) return fail('NOT_FOUND', 'Product not found')

    const promoted = await copyBlueprintDraftToProduct({
      draftObjectPath: context.objectPath,
      productId: product.id,
      productSlug: product.slug,
      suggestionId: suggestion.id,
    })

    try {
      const max = await db.productImage.aggregate({
        where: { productId: product.id },
        _max: { position: true },
      })
      const alt = `${product.title} technical blueprint illustration`
      await db.$transaction(async (tx) => {
        const media = await tx.media.create({
          data: {
            kind: 'image',
            mimeType: context.mimeType ?? 'image/png',
            originalFilename: promoted.filename,
            storagePath: promoted.storagePath,
            bytes: context.bytes!,
            width: context.width ?? BLUEPRINT_IMAGE_WIDTH,
            height: context.height ?? BLUEPRINT_IMAGE_HEIGHT,
            alt,
            uploadedById: session.user.id,
          },
        })
        await tx.productImage.create({
          data: {
            productId: product.id,
            mediaId: media.id,
            alt,
            position: (max._max.position ?? -1) + 1,
          },
        })
        await tx.aiSuggestion.update({
          where: { id: suggestion.id },
          data: {
            status: 'accepted',
            reviewedAt: new Date(),
            output: promoted.storagePath,
            inputContext: {
              ...context,
              acceptedStoragePath: promoted.storagePath,
            } as unknown as Prisma.InputJsonValue,
          },
        })
      })
    } catch (error) {
      await deleteBlueprintObject(promoted.objectPath).catch(() => undefined)
      throw error
    }

    await deleteBlueprintObject(context.objectPath).catch((error) => {
      console.warn('[product-blueprint] accepted draft cleanup failed:', error)
    })
    await recomputeContentScore(product.id)
    revalidateProduct(product.id, product.slug)
    return ok(undefined)
  } catch (error) {
    return failFromError(error)
  }
}

export async function rejectProductBlueprint(suggestionId: string): Promise<Result<void>> {
  try {
    requireRole(await auth(), ROLES.AI_GENERATE)
    SuggestionIdSchema.parse(suggestionId)

    const suggestion = await db.aiSuggestion.findUnique({ where: { id: suggestionId } })
    if (!suggestion) return fail('NOT_FOUND', 'Blueprint draft not found')
    if (suggestion.status !== 'pending') {
      return fail('PRECONDITION_FAILED', `Blueprint draft is already ${suggestion.status}`)
    }

    const context = parseBlueprintContext(suggestion.inputContext)
    if (context?.objectPath) await deleteBlueprintObject(context.objectPath)

    await db.aiSuggestion.update({
      where: { id: suggestion.id },
      data: { status: 'rejected', reviewedAt: new Date() },
    })

    revalidateProduct(suggestion.entityId)
    return ok(undefined)
  } catch (error) {
    return failFromError(error)
  }
}

async function recomputeContentScore(productId: string): Promise<void> {
  const product = await db.product.findUnique({
    where: { id: productId },
    select: {
      descriptionShort: true,
      descriptionLong: true,
      brandId: true,
      categoryId: true,
      focusKeyword: true,
      seoTitle: true,
      seoDescription: true,
      weightKg: true,
      countryOfOrigin: true,
      mpn: true,
      _count: {
        select: {
          faqs: true,
          specs: true,
          crossReferences: true,
          documents: true,
          images: true,
        },
      },
    },
  })
  if (!product) return
  await db.product.update({
    where: { id: productId },
    data: { contentScore: scoreFromProduct(product).score },
  })
}

function revalidateProduct(productId: string, slug?: string): void {
  revalidatePath(`/admin/products/${productId}/edit`)
  revalidatePath('/admin/products')
  if (slug) revalidatePath(`/p/${slug}`)
}
