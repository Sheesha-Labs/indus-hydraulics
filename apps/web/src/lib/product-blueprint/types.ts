export const BLUEPRINT_SUGGESTION_FIELD = 'productBlueprint'
export const BLUEPRINT_PROMPT_MODEL = 'gpt-5.5'
export const BLUEPRINT_ORCHESTRATOR_MODEL = 'gpt-5.5'
export const BLUEPRINT_IMAGE_MODEL = 'gpt-image-2'
export const BLUEPRINT_IMAGE_WIDTH = 1600
export const BLUEPRINT_IMAGE_HEIGHT = 1200
export const BLUEPRINT_IMAGE_SIZE = `${BLUEPRINT_IMAGE_WIDTH}x${BLUEPRINT_IMAGE_HEIGHT}`
export const BLUEPRINT_REFERENCE_URL =
  'https://hesezbozronntejnsopr.supabase.co/storage/v1/object/public/product-images/generation-references/indus-technical-blueprint-v1.png'

export type BlueprintGenerationStatus = 'queued' | 'generating' | 'ready' | 'failed'

export type BlueprintGenerationContext = {
  version: 1
  generationStatus: BlueprintGenerationStatus
  prompt: string
  customInstructions: string | null
  referenceImageUrl: string
  productSnapshot: {
    id: string
    sku: string
    mpn: string | null
    title: string
    descriptionShort: string | null
    brandName: string | null
    categoryName: string | null
    specs: Array<{
      group: string
      label: string
      value: string
      unit: string | null
    }>
  }
  attempts: number
  responseId?: string
  revisedPrompt?: string | null
  storagePath?: string
  objectPath?: string
  bytes?: number
  mimeType?: string
  width?: number
  height?: number
  error?: string
  acceptedStoragePath?: string
  refinementHistory?: Array<{
    instruction: string
    requestedAt: string
  }>
}

export function parseBlueprintContext(value: unknown): BlueprintGenerationContext | null {
  if (!value || typeof value !== 'object') return null
  const candidate = value as Partial<BlueprintGenerationContext>
  if (
    candidate.version !== 1 ||
    typeof candidate.prompt !== 'string' ||
    typeof candidate.referenceImageUrl !== 'string' ||
    !candidate.productSnapshot ||
    typeof candidate.productSnapshot !== 'object'
  ) {
    return null
  }
  return candidate as BlueprintGenerationContext
}
