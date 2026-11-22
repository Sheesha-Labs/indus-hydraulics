import { Card } from '@indus/ops-ui/card'
import { PageHeader } from '@indus/ops-ui/shell'
import { T8Today } from '@indus/ops-ui/templates'
import { signOutAction } from '../../(auth)/sign-in/actions'
import Arrives from '../../../components/skeleton/Arrives'
import { requireOpsUser } from '../../../lib/access'
import { signInFor } from '../../../lib/page-access'

/**
 * Boards 178 / 180 · Today (T8, Owner or Helper variant from the session role). S07 builds it, with the
 * greeting header (TodayHeader); until then a page header and who is signed in.
 */
export default async function TodayPage() {
  const user = await requireOpsUser().catch(signInFor('/today'))
  const helper = user.role === 'helper'
  return (
    <T8Today
      variant={helper ? 'helper' : 'owner'}
      header={<PageHeader crumb="Workspace" title="Today" />}
      needsYou={
        <Arrives
          sprint="S07"
          what="Boards 178 and 180: what needs you, what came in since yesterday and what is late."
        />
      }
      cameIn={<Card eyebrow="Came in since yesterday" text="New mail, quotes and orders." />}
      late={<Card eyebrow="Late" text="Replies and deliveries past their date." />}
      rail={
        <Card eyebrow="Signed in">
          <p className="text-io-body text-io-ink-3">
            Signed in as {user.name} · {helper ? 'Helper' : 'Owner'}
          </p>
          <form action={signOutAction}>
            <button type="submit" className="io-focus text-io-meta text-io-accent">
              Sign out
            </button>
          </form>
        </Card>
      }
    />
  )
}
