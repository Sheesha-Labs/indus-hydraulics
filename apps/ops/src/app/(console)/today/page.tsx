import { redirect } from 'next/navigation'
import { AccessError, requireOpsUser } from '../../../lib/access'
import { signOutAction } from '../../(auth)/sign-in/actions'

// Placeholder until S07 builds Today (board 178).
export default async function TodayPage() {
  let user
  try {
    user = await requireOpsUser()
  } catch (error) {
    if (error instanceof AccessError) redirect('/sign-in?next=%2Ftoday')
    throw error
  }
  return (
    <main className="px-io-page-x py-8">
      <div className="max-w-io-well rounded-io-card border-io-line bg-io-card border p-6">
        <h1 className="io-display text-io-greeting text-io-ink">Today</h1>
        <p className="text-io-body text-io-ink-3 mt-3">
          Signed in as {user.name} · {user.role === 'owner' ? 'Owner' : 'Helper'}
        </p>
        <form action={signOutAction} className="mt-4">
          <button type="submit" className="io-focus text-io-meta text-io-accent">
            Sign out
          </button>
        </form>
      </div>
    </main>
  )
}
