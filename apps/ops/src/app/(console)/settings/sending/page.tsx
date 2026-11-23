import SendingRulesTable from '../../../../components/sending/SendingRulesTable'
import SendPolicyCards from '../../../../components/sending/SendPolicyCards'
import SignatureBlocks from '../../../../components/sending/SignatureBlocks'
import { getSendingPage } from '../../../../data/sending'
import { requireOpsUser } from '../../../../lib/access'
import { signInFor } from '../../../../lib/page-access'

/**
 * Board 87 · Settings › Sending (T7 body; the layout draws the header with "Rules apply to every send, approved
 * or automatic"). From, CC, signature and thread per mail type; the signature blocks; the delay, the send window
 * and attachment names; daily limits, test addresses and the fixed-off Gmail Drafts mirror. Owner edits; the
 * Helper reads.
 */
export default async function SettingsSendingPage() {
  const user = await requireOpsUser().catch(signInFor('/settings/sending'))
  const page = await getSendingPage(user)
  return (
    <div data-built="sending" className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <SendingRulesTable page={page} />
        <p className="text-io-ink-3 m-0 text-[12px]">
          Never sends from a Read-only or Personal mailbox. If a row’s mailbox is disconnected,
          those sends wait (“Waiting for sales@”) rather than switching mailbox.
        </p>
      </div>
      <SignatureBlocks
        signers={page.signers}
        version={page.signaturesVersion}
        canEdit={page.canEdit}
      />
      <SendPolicyCards page={page} />
    </div>
  )
}
