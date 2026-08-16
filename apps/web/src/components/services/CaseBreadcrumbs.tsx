import Link from 'next/link'
import { SERVICE_CASE_CATEGORY_LABELS } from '@indus/domain'
import type { ServiceCaseCategory } from '@indus/db'

type Props = {
  caseNumber: string
  title: string
  category: ServiceCaseCategory
}

export default function CaseBreadcrumbs({ caseNumber, title, category }: Props) {
  const catLabel = SERVICE_CASE_CATEGORY_LABELS[category] ?? category
  return (
    <div className="mono border-b border-ih-border py-4 text-xs uppercase tracking-[0.04em] text-ih-muted">
      <Link href="/" className="hover:text-ih-ink">Home</Link>
      <span className="mx-2 opacity-50">/</span>
      <Link href="/services" className="hover:text-ih-ink">Services</Link>
      <span className="mx-2 opacity-50">/</span>
      <Link href={`/services?category=${category}`} className="hover:text-ih-ink">
        {catLabel}
      </Link>
      <span className="mx-2 opacity-50">/</span>
      <span className="text-ih-ink">No. {caseNumber} — {title}</span>
    </div>
  )
}
