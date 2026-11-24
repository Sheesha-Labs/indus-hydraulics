import ReviewStatesSpecimen from '../../../../kit/surfaces/ReviewStatesSpecimen'
import WhySheetSpecimen from '../../../../kit/surfaces/WhySheetSpecimen'

/**
 * /_kit/review-states: boards 103, 110, 112 and 114 drawn from the real Review, Why? and undo components with neutral
 * fixtures, for the P05/P06 parity spec (S06). No session, no database; gated like the rest of /_kit.
 */
export default async function ReviewStatesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const { board } = await searchParams
  if (board === '112') return <WhySheetSpecimen />
  return <ReviewStatesSpecimen board={board === '110' ? '110' : board === '114' ? '114' : '103'} />
}
