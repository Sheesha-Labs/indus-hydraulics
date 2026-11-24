import MailStatesSpecimen from '../../../../kit/surfaces/MailStatesSpecimen'

/**
 * /_kit/mail-states: boards 96 and 97 drawn from the real Mail state components with neutral fixtures, for
 * the P03 parity spec (S05-T07). No session, no database; gated like the rest of /_kit.
 */
export default async function MailStatesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const { board } = await searchParams
  return <MailStatesSpecimen board={board === '97' ? '97' : '96'} />
}
