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
    <main>
      <h1>Today</h1>
      <p>
        Signed in as {user.name} · {user.role === 'owner' ? 'Owner' : 'Helper'}
      </p>
      <form action={signOutAction}>
        <button type="submit">Sign out</button>
      </form>
    </main>
  )
}
