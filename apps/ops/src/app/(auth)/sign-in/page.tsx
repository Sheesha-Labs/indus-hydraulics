import { signInWithGoogle } from './actions'

// Placeholder for board 77, which S03 builds and styles. The copy for each refusal
// is the board's; the email is not echoed back through the URL.
const ERRORS: Record<string, string> = {
  personal_account:
    'That Google account is a personal account. Indus Operations only accepts your Indus Workspace account.',
  wrong_domain: 'That Google account is not an Indus Workspace account.',
  not_invited: 'That account has no access yet. Ask the Owner to invite you from Settings › Team.',
  email_unverified: 'Google has not verified that email address.',
}

type Props = { searchParams: Promise<{ next?: string; error?: string }> }

export default async function SignInPage({ searchParams }: Props) {
  const { next, error } = await searchParams
  const message = error ? (ERRORS[error] ?? 'Sign-in failed. Try again.') : null
  return (
    <main>
      <h1>Indus Operations</h1>
      <p>Sign in</p>
      {message ? <p role="alert">{message}</p> : null}
      <form action={signInWithGoogle}>
        <input type="hidden" name="next" value={next ?? ''} />
        <button type="submit">Continue with Google</button>
      </form>
    </main>
  )
}
