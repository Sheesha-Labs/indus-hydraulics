import { ButtonLink } from '@indus/ops-ui/controls'
import { EmptyState } from '@indus/ops-ui/states'

/**
 * notFound() anywhere in the console without a closer boundary (05 §6.4). Record segments get their own
 * not-found with the "not imported" state (board 211) when the route tree lands (S02-T07).
 */
export default function ConsoleNotFound() {
  return (
    <div className="px-io-page-x py-6">
      <EmptyState
        mark="?"
        title="We can’t find that"
        text="The link may be old, or the record moved or was never imported. Search finds it by any reference."
        actions={
          <>
            <ButtonLink href="/today" variant="primary" size="sm">
              Go to Today
            </ButtonLink>
            <ButtonLink href="/search" size="sm">
              Search
            </ButtonLink>
          </>
        }
      />
    </div>
  )
}
