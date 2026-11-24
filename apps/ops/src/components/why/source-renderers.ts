import type { ComponentType } from 'react'
import type { WhySpan } from '../../data/why'

/**
 * How Why? draws a source (S06-T05). Keyed by `source_span.sourceKind`. S06 registers 'email' and the
 * scanned-page frame ('page_only' spans of any kind); S08 registers:
 *   'pdf'   the page image with the span's bbox outlined
 *   'sheet' the sheet with the cited cell highlighted
 *   'docx'  the paragraph with the quote marked
 * A kind with no renderer shows the quote alone (QuoteSource), never nothing.
 */
export interface SourceRendererProps {
  span: WhySpan
  /** The span the Why? link pointed at. */
  active: boolean
}
export type SourceRenderer = ComponentType<SourceRendererProps>
export type PlannedSourceKind = 'email' | 'pdf' | 'sheet' | 'docx' | 'image'

const RENDERERS = new Map<string, SourceRenderer>()

export function registerSourceRenderer(
  kind: PlannedSourceKind | 'page_only',
  r: SourceRenderer
): void {
  RENDERERS.set(kind, r)
}

export function rendererFor(span: WhySpan): SourceRenderer | null {
  if (span.pageOnly) return RENDERERS.get('page_only') ?? null
  return RENDERERS.get(span.sourceKind) ?? null
}
