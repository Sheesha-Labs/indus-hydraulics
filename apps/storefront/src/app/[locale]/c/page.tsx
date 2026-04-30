import { db } from '@indus/db'
import { redirect } from 'next/navigation'

type Props = { params: Promise<{ locale: string }> }

export default async function CategoriesIndexPage({ params }: Props) {
  const { locale } = await params

  // Redirect to the first published category
  const first = await db.category.findFirst({
    where: { isPublished: true },
    orderBy: { position: 'asc' },
  })

  if (first) redirect(`/${locale}/c/${first.slug}`)

  redirect(`/${locale}`)
}
