import { ButtonLink } from '@indus/ops-ui/controls'
import { T11Auth } from '@indus/ops-ui/templates'
import Arrives from '../../../components/skeleton/Arrives'
import { requireOpsUser } from '../../../lib/access'
import { signInFor } from '../../../lib/page-access'
import { to } from '../../../lib/routes'

/** Board 78 · Welcome (T11; the Owner, once). S03 builds it. */
export default async function WelcomePage() {
  const user = await requireOpsUser().catch(signInFor('/welcome'))
  return (
    <T11Auth>
      <p className="text-io-meta text-io-ink-3">Welcome, {user.name}</p>
      <h1 className="io-display text-io-record">Indus Operations</h1>
      <Arrives
        sprint="S03"
        what="Board 78: what Operations does for you, and the six setup steps."
        actions={
          <ButtonLink href={to('/setup/company')} variant="primary" size="sm">
            Start setup
          </ButtonLink>
        }
      />
    </T11Auth>
  )
}
