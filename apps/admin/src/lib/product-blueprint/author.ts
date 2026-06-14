import 'server-only'
import { buildBlueprintPromptAuthoringRequest, normalizeAuthoredBlueprintPrompt } from './prompt'
import { productBlueprintOpenAI } from './openai'
import { BLUEPRINT_PROMPT_MODEL } from './types'

export type AuthoredBlueprintPrompt = {
  prompt: string
  responseId: string
  model: string
}

export async function authorProductBlueprintPrompt(
  productTitle: string,
  date = new Date()
): Promise<AuthoredBlueprintPrompt> {
  const model = process.env.OPENAI_BLUEPRINT_PROMPT_MODEL ?? BLUEPRINT_PROMPT_MODEL
  const request = buildBlueprintPromptAuthoringRequest(productTitle, date)
  const response = await productBlueprintOpenAI().responses.create({
    model,
    reasoning: { effort: 'low' },
    instructions: request.instructions,
    input: request.input,
    max_output_tokens: 3000,
  })
  const prompt = normalizeAuthoredBlueprintPrompt(response.output_text)

  if (prompt.length < 400) {
    throw new Error('OpenAI returned an incomplete blueprint prompt')
  }

  return {
    prompt,
    responseId: response.id,
    model,
  }
}
