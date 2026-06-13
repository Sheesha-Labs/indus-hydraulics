import { NonRetriableError } from 'inngest'
import { db, Prisma } from '@indus/db'
import { inngest } from './client'
import {
  deleteBlueprintObject,
  generateProductBlueprint,
  uploadBlueprintDraft,
} from '../lib/product-blueprint/generate'
import {
  BLUEPRINT_SUGGESTION_FIELD,
  parseBlueprintContext,
  type BlueprintGenerationContext,
} from '../lib/product-blueprint/types'

type ProductBlueprintEvent = {
  suggestionId: string
  mode: 'initial' | 'refine' | 'retry'
  refinement?: string
}

export const productBlueprintGenerate = inngest.createFunction(
  {
    id: 'product.blueprint.generate',
    concurrency: { limit: 1, key: 'event.data.suggestionId' },
    retries: 1,
  },
  { event: 'product/blueprint.requested' },
  async ({ event, step }) => {
    const { suggestionId, mode, refinement } = event.data as ProductBlueprintEvent

    const suggestion = await step.run('load-suggestion', () =>
      db.aiSuggestion.findUnique({ where: { id: suggestionId } }),
    )
    if (!suggestion) throw new NonRetriableError(`AiSuggestion ${suggestionId} not found`)
    if (
      suggestion.entityType !== 'product' ||
      suggestion.field !== BLUEPRINT_SUGGESTION_FIELD ||
      suggestion.status !== 'pending'
    ) {
      throw new NonRetriableError('Suggestion is not a pending product blueprint')
    }

    const context = parseBlueprintContext(suggestion.inputContext)
    if (!context) throw new NonRetriableError('Blueprint context is invalid')
    if (mode === 'refine' && (!context.responseId || !refinement?.trim())) {
      throw new NonRetriableError('Refinement requires a prior response and instruction')
    }

    const generatingContext: BlueprintGenerationContext = {
      ...context,
      generationStatus: 'generating',
      error: undefined,
    }
    await step.run(`mark-generating-v${context.attempts}`, () =>
      db.aiSuggestion.update({
        where: { id: suggestion.id },
        data: {
          inputContext: generatingContext as unknown as Prisma.InputJsonValue,
        },
      }),
    )

    try {
      const generated = await step.run(`generate-and-upload-v${context.attempts}`, async () => {
        const image = await generateProductBlueprint({
          prompt: context.prompt,
          referenceImageUrl: context.referenceImageUrl,
          ...(mode === 'refine'
            ? {
                previousResponseId: context.responseId,
                refinement,
              }
            : {}),
        })
        const uploaded = await uploadBlueprintDraft({
          suggestionId: suggestion.id,
          productId: suggestion.entityId,
          attempt: context.attempts,
          buffer: image.buffer,
        })

        if (context.objectPath && context.objectPath !== uploaded.objectPath) {
          await deleteBlueprintObject(context.objectPath).catch((error) => {
            console.warn('[product-blueprint] stale draft cleanup failed:', error)
          })
        }

        return {
          ...uploaded,
          responseId: image.responseId,
          revisedPrompt: image.revisedPrompt,
          inputTokens: image.inputTokens,
          outputTokens: image.outputTokens,
        }
      })

      const readyContext: BlueprintGenerationContext = {
        ...generatingContext,
        generationStatus: 'ready',
        responseId: generated.responseId,
        revisedPrompt: generated.revisedPrompt,
        storagePath: generated.storagePath,
        objectPath: generated.objectPath,
        bytes: generated.bytes,
        mimeType: 'image/png',
        width: 1024,
        height: 1024,
      }
      await step.run(`mark-ready-v${context.attempts}`, () =>
        db.aiSuggestion.update({
          where: { id: suggestion.id },
          data: {
            output: generated.storagePath,
            inputContext: readyContext as unknown as Prisma.InputJsonValue,
            inputTokens: generated.inputTokens,
            outputTokens: generated.outputTokens,
          },
        }),
      )

      return {
        suggestionId,
        productId: suggestion.entityId,
        attempt: context.attempts,
        storagePath: generated.storagePath,
      }
    } catch (error) {
      const message = (error as Error).message || 'Blueprint generation failed'
      await step.run(`mark-failed-v${context.attempts}`, () =>
        db.aiSuggestion.update({
          where: { id: suggestion.id },
          data: {
            inputContext: {
              ...generatingContext,
              generationStatus: 'failed',
              error: message.slice(0, 1000),
            } as unknown as Prisma.InputJsonValue,
          },
        }),
      )
      if (message.includes('OPENAI_API_KEY')) throw new NonRetriableError(message)
      throw error
    }
  },
)
