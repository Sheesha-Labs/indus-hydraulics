import 'server-only'
import OpenAI from 'openai'
import { supabaseAdmin, STORAGE_BUCKETS } from '../supabase'
import {
  BLUEPRINT_IMAGE_SIZE,
  BLUEPRINT_IMAGE_MODEL,
  BLUEPRINT_ORCHESTRATOR_MODEL,
} from './types'

let openaiClient: OpenAI | null = null

function openai(): OpenAI {
  if (openaiClient) return openaiClient
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) throw new Error('OPENAI_API_KEY is not set')
  openaiClient = new OpenAI({ apiKey })
  return openaiClient
}

export type GeneratedBlueprint = {
  buffer: Buffer
  responseId: string
  revisedPrompt: string | null
  inputTokens: number | null
  outputTokens: number | null
}

export async function generateProductBlueprint(input: {
  prompt: string
  referenceImageUrl: string
  previousResponseId?: string
  refinement?: string
}): Promise<GeneratedBlueprint> {
  const orchestratorModel =
    process.env.OPENAI_BLUEPRINT_ORCHESTRATOR_MODEL ?? BLUEPRINT_ORCHESTRATOR_MODEL
  const imageModel = process.env.OPENAI_BLUEPRINT_IMAGE_MODEL ?? BLUEPRINT_IMAGE_MODEL
  const isRefinement = Boolean(input.previousResponseId)

  const response = await openai().responses.create({
    model: orchestratorModel,
    ...(isRefinement
      ? {
          previous_response_id: input.previousResponseId,
          input: `Edit the current blueprint image using this reviewer instruction. Preserve every other approved aspect of the composition and visual system: ${input.refinement?.trim() || 'Improve technical accuracy, text legibility, and fidelity to the reference layout.'}`,
        }
      : {
          input: [
            {
              role: 'user',
              content: [
                { type: 'input_text', text: input.prompt },
                {
                  type: 'input_image',
                  image_url: input.referenceImageUrl,
                  detail: 'original',
                },
              ],
            },
          ],
        }),
    tools: [
      {
        type: 'image_generation',
        model: imageModel,
        action: isRefinement ? 'edit' : 'generate',
        size: BLUEPRINT_IMAGE_SIZE,
        quality: 'high',
        output_format: 'png',
        background: 'opaque',
      },
    ],
    tool_choice: { type: 'image_generation' },
  })

  const imageCall = response.output.find(
    (item): item is Extract<(typeof response.output)[number], { type: 'image_generation_call' }> =>
      item.type === 'image_generation_call',
  )
  if (!imageCall?.result) {
    throw new Error('OpenAI completed without returning an image')
  }

  return {
    buffer: Buffer.from(imageCall.result, 'base64'),
    responseId: response.id,
    revisedPrompt:
      'revised_prompt' in imageCall && typeof imageCall.revised_prompt === 'string'
        ? imageCall.revised_prompt
        : null,
    inputTokens: response.usage?.input_tokens ?? null,
    outputTokens: response.usage?.output_tokens ?? null,
  }
}

export async function uploadBlueprintDraft(input: {
  suggestionId: string
  productId: string
  attempt: number
  buffer: Buffer
}): Promise<{ storagePath: string; objectPath: string; bytes: number }> {
  const objectPath = `blueprint-drafts/${input.productId}/${input.suggestionId}-v${input.attempt}.png`
  const { error } = await supabaseAdmin()
    .storage.from(STORAGE_BUCKETS.images)
    .upload(objectPath, input.buffer, {
      contentType: 'image/png',
      cacheControl: '3600',
      upsert: true,
    })
  if (error) throw new Error(`Blueprint draft upload failed: ${error.message}`)

  return {
    storagePath: supabaseAdmin().storage.from(STORAGE_BUCKETS.images).getPublicUrl(objectPath).data
      .publicUrl,
    objectPath,
    bytes: input.buffer.byteLength,
  }
}

export async function copyBlueprintDraftToProduct(input: {
  draftObjectPath: string
  productId: string
  productSlug: string
  suggestionId: string
}): Promise<{ storagePath: string; objectPath: string; filename: string }> {
  const filename = `${input.productSlug}-blueprint-${input.suggestionId.slice(0, 8)}.png`
  const objectPath = `products/${input.productId}/${filename}`
  const { error } = await supabaseAdmin()
    .storage.from(STORAGE_BUCKETS.images)
    .copy(input.draftObjectPath, objectPath)
  if (error) throw new Error(`Could not promote blueprint draft: ${error.message}`)

  return {
    filename,
    objectPath,
    storagePath: supabaseAdmin().storage.from(STORAGE_BUCKETS.images).getPublicUrl(objectPath).data
      .publicUrl,
  }
}

export async function deleteBlueprintObject(objectPath: string): Promise<void> {
  const { error } = await supabaseAdmin().storage.from(STORAGE_BUCKETS.images).remove([objectPath])
  if (error && !error.message.toLowerCase().includes('not found')) {
    throw new Error(`Could not delete blueprint object: ${error.message}`)
  }
}
