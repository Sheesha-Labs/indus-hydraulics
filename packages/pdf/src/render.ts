import { renderToBuffer } from '@react-pdf/renderer'
import { EstimatePDF } from './EstimatePDF'
import type { EstimateInput } from './types'

/**
 * Render an Estimate/Quote PDF to a Node Buffer. Server-side only — calls
 * @react-pdf/renderer's headless renderer.
 */
export async function renderEstimatePdf(input: EstimateInput): Promise<Buffer> {
  return renderToBuffer(EstimatePDF(input))
}
