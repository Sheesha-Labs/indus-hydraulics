import { ButtonLink } from '@indus/ops-ui/controls'
import { EmptyState } from '@indus/ops-ui/states'

/** An unknown or malformed evidence id on the full Why? page (S04). */
export default function WhyNotFound() {
  return (
    <div className="px-io-page-x py-6">
      <EmptyState
        mark="?"
        title="We can’t find that evidence"
        text="The link may be old, or what it pointed to was removed. The record’s Activity tab keeps what the Assistant did."
        actions={
          <ButtonLink href="/assistant/log" variant="primary" size="sm">
            Open the Assistant log
          </ButtonLink>
        }
      />
    </div>
  )
}
