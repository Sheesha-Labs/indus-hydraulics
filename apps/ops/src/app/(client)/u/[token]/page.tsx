import { T12Client } from '@indus/ops-ui/templates'
import UploadPortal from '../../../../components/client/UploadPortal'
import { requestIp } from '../../../../lib/request-origin'
import { linkToken } from '../../../../lib/route-params'
import { portalView } from '../../../../server/directory/document-request'

/**
 * /u/[token] · Upload your documents (S10-T04, board 50 request, C28; T12 look, responsive). No console session is
 * read: the token is the only credential, checked by its hash, rate-limited per link and per address. The page shows
 * only the supplier's own name, the documents asked for and the expiry. Expired, completed, withdrawn and unknown
 * links are states, never a 404 or an error.
 */
const BRAND = (
  <>
    <span className="text-[15px] font-semibold">Indus Hydraulic Power Trading LLC</span>
    <span className="text-io-ink-3 text-[13px]">Supplier registration</span>
  </>
)

function State({ title, text }: { title: string; text: string }) {
  return (
    <T12Client
      brandBar={BRAND}
      eyebrow="Supplier registration"
      title={title}
      document={<p className="text-io-ink-2 m-0 max-w-[560px] text-[15px] leading-[1.6]">{text}</p>}
      actions={null}
    />
  )
}

export default async function UTokenPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const parsed = linkToken.safeParse(token)
  if (!parsed.success)
    return (
      <State
        title="This link is not valid"
        text="Check that the whole link was copied, or ask Indus for a new one."
      />
    )
  const view = await portalView(parsed.data, await requestIp())
  switch (view.state) {
    case 'invalid':
      return (
        <State
          title="This link is not valid"
          text="Check that the whole link was copied, or ask Indus for a new one."
        />
      )
    case 'rate_limited':
      return <State title="Too many attempts" text="Wait a few minutes and open the link again." />
    case 'expired':
      return (
        <State
          title="This link has expired"
          text="Ask your contact at Indus for a new link. Documents already uploaded are safe."
        />
      )
    case 'revoked':
      return (
        <State
          title="This link was replaced"
          text="Indus sent a newer link. Use the latest email, or ask your contact for one."
        />
      )
    case 'completed':
      return (
        <State
          title="Thank you: every document is in"
          text="We have received all the documents we asked for. We will be in touch if anything else is needed."
        />
      )
  }
  const left = view.kinds!.filter((k) => !k.received).length
  return (
    <T12Client
      brandBar={BRAND}
      eyebrow={`Supplier registration · ${view.supplier}`}
      title="Upload your documents"
      document={
        <>
          <p className="text-io-ink-2 m-0 text-[15px] leading-[1.6]">
            Documents requested by Indus Hydraulic Power Trading LLC. You can upload them in more
            than one visit.
          </p>
          <UploadPortal token={parsed.data} kinds={view.kinds!} />
        </>
      }
      actions={
        <p className="m-0 text-[14px]" data-part="portal-left">
          {left ? `${left} of ${view.kinds!.length} still needed` : 'All documents received'}
        </p>
      }
      note={
        <p className="text-io-ink-3 m-0 text-[13px]">This link stays open until {view.expires}.</p>
      }
    />
  )
}
