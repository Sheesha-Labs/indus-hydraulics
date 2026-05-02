import { db } from '@indus/db'
import { redirect } from 'next/navigation'

type Props = { params: Promise<Record<string, never>> }

export default async function CategoriesIndexPage({ params }: Props) {
  await params

  // Redirect to the first published category
  const first = await db.category.findFirst({
    where: { isPublished: true },
    orderBy: { position: 'asc' },
  })

  if (first) redirect(`/c/${first.slug}`)

  redirect(`/`)
}
