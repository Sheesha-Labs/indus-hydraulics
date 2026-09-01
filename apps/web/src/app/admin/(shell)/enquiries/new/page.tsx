import type { Metadata } from 'next'

import AdminPageShell from '../../../../../components/admin/AdminPageShell'
import PasteForm from './_components/paste-form'

export const metadata: Metadata = { title: 'New enquiry — Indus Admin' }

export default function NewEnquiryPage() {
  return (
    <AdminPageShell
      title="New enquiry"
      sub="Paste the enquiry text. Line items are extracted for you to review — nothing is treated as confirmed."
    >
      <PasteForm />
    </AdminPageShell>
  )
}
