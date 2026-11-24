/**
 * Errors `structuredCall` throws rather than returns. A returned failure (`budget`, `refusal`, `invalid`,
 * `max_tokens`) is an outcome the action records; a thrown one is for the Inngest step to retry
 * (ProviderUnavailableError, at 2, 4 and 8 minutes) or a bug to fix (AiRequestError, MissingPriceError).
 */

/** 429, 529, 5xx or a dropped connection, after the SDK's own two retries. */
export class ProviderUnavailableError extends Error {
  readonly status: number | null
  constructor(message: string, status: number | null) {
    super(message)
    this.name = 'ProviderUnavailableError'
    this.status = status
  }
}

/** A request the API rejected (400, 401, 403, 404, 413): a bug or a configuration fault, never retried. */
export class AiRequestError extends Error {
  readonly status: number | null
  constructor(message: string, status: number | null) {
    super(message)
    this.name = 'AiRequestError'
    this.status = status
  }
}

/** No `ops.ai_model_price` row covers the model on that date. */
export class MissingPriceError extends Error {
  constructor(model: string, at: Date) {
    super(`No price for ${model} on ${at.toISOString().slice(0, 10)}`)
    this.name = 'MissingPriceError'
  }
}
