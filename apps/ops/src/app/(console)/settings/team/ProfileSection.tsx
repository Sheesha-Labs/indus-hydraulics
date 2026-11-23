import { Card } from '@indus/ops-ui/card'
import Link from 'next/link'
import ProfileEdit from '../../../../components/settings/team/ProfileEdit'
import type { MyProfile } from '../../../../data/team'
import { firstName } from '../../../../lib/setup-steps'

const ROW = 'border-io-line flex items-center justify-between gap-2.5 border-b py-2.5 text-[13px]'

/**
 * Board 84 "Profile · <first name>" (S03-T03): name, phone, the signature (plain text until S04 reads
 * the Gmail one) with Edit, and Notifications › Preferences (S30). Always the signed-in person's own.
 */
export default function ProfileSection({ me }: { me: MyProfile }) {
  const signatureLabel = me.mailbox ? `Signature · ${me.mailbox}` : 'Signature'
  return (
    <Card as="div" eyebrow={`Profile · ${firstName(me.name)}`}>
      <dl className="m-0 flex flex-col">
        <div className={ROW}>
          <dt className="text-io-ink-3">Name</dt>
          <dd className="m-0 text-right">{me.name}</dd>
        </div>
        <div className={ROW}>
          <dt className="text-io-ink-3">Phone</dt>
          <dd className="io-num m-0 text-right">{me.phone ?? '—'}</dd>
        </div>
        <div className={ROW}>
          <dt className="text-io-ink-3">{signatureLabel}</dt>
          <dd className="m-0 text-right">
            <ProfileEdit
              name={me.name}
              phone={me.phone}
              signature={me.signature}
              signatureLabel={signatureLabel}
            />
          </dd>
        </div>
        <div className={`${ROW} border-b-0`}>
          <dt className="text-io-ink-3">Notifications</dt>
          <dd className="m-0 text-right">
            <Link
              href="/settings/notifications"
              className="io-focus rounded-io-tag text-io-accent hover:text-io-accent-hover"
            >
              Preferences ↗
            </Link>
          </dd>
        </div>
      </dl>
    </Card>
  )
}
