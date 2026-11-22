import { Button } from '@indus/ops-ui/controls'
import { Field } from '@indus/ops-ui/form'
import { ProductMark } from './shared'

/**
 * T11a · Sign-in, the card's content. The (auth) layout wraps it in T11Auth, as it wraps /sign-in: the
 * specimen is the board's sign-in card in neutral words (S03 builds the working page, board 77). Nothing
 * here submits: the buttons are plain buttons and the fields post nowhere.
 */
export default function T11ASpecimen() {
  return (
    <>
      <ProductMark size="lg" />
      <h1 className="io-display text-io-record">Sign in</h1>
      <Button size="lg">Continue with Google</Button>
      <div className="text-io-ink-3 flex items-center gap-2.5 text-[12px]">
        <span aria-hidden="true" className="bg-io-line h-px flex-1" />
        or with password
        <span aria-hidden="true" className="bg-io-line h-px flex-1" />
      </div>
      <Field type="email" name="email" label="Email" defaultValue="owner@example.test" />
      <Field
        type="text"
        name="password"
        label="Password"
        defaultValue="••••••••••"
        hint="An authenticator code is asked next"
      />
      <Button variant="primary" size="lg" className="self-start">
        Sign in
      </Button>
      <p className="text-io-ink-3 text-[12px] leading-[1.5]">
        Only @example.test accounts. Trouble signing in? Ask the Owner to reset your access.
      </p>
    </>
  )
}
