import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { db } from '@indus/db'
import { auth } from '../../../../../../lib/auth'
import { ROLES, requireRole } from '../../../../../../lib/rbac'
import { revalidatePath } from 'next/cache'

export const metadata: Metadata = { title: 'Edit Page — Indus Admin' }

type Props = { params: Promise<{ locale: string; id: string }> }

async function savePage(formData: FormData) {
  'use server'
  requireRole(await auth(), ROLES.CMS_WRITE)

  const id = formData.get('id') as string
  const locale = (formData.get('locale') as string) ?? 'en'
  const title = formData.get('title') as string
  const slug = formData.get('slug') as string
  const body = formData.get('body') as string
  const seoTitle = (formData.get('seoTitle') as string | null) || undefined
  const seoDescription = (formData.get('seoDescription') as string | null) || undefined
  const publish = formData.get('publish') === '1'

  const data = {
    title,
    slug,
    body,
    seoTitle,
    seoDescription,
    isPublished: publish,
    publishedAt: publish ? new Date() : undefined,
  }

  if (id === 'new') {
    const page = await db.cmsPage.create({ data })
    revalidatePath(`/${locale}/cms`)
    redirect(`/${locale}/cms/pages/${page.id}`)
  } else {
    await db.cmsPage.update({ where: { id }, data })
    revalidatePath(`/${locale}/cms`)
    revalidatePath(`/${locale}/${slug}`)
  }
}

export default async function CmsPageEditorPage({ params }: Props) {
  const { locale, id } = await params

  const page = id === 'new'
    ? null
    : await db.cmsPage.findUnique({ where: { id } })

  if (id !== 'new' && !page) notFound()

  return (
    <div className="max-w-[860px]">
      <div className="mb-6">
        <Link href={`/${locale}/cms?tab=pages`} className="font-mono text-[12px] text-[var(--color-muted)] hover:text-[var(--color-primary)] mb-2 inline-block">
          ← CMS
        </Link>
        <h1 className="text-[24px] font-semibold tracking-tight">{id === 'new' ? 'New Page' : 'Edit Page'}</h1>
      </div>

      <form action={savePage} className="space-y-5">
        <input type="hidden" name="id" value={id} />
        <input type="hidden" name="locale" value={locale} />

        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block font-mono text-[11px] tracking-[0.1em] uppercase text-[var(--color-muted)] mb-1.5">Title *</label>
            <input
              name="title"
              required
              defaultValue={page?.title ?? ''}
              type="text"
              className="w-full h-10 px-3 border border-[var(--color-border)] bg-[var(--color-elevated)] text-[15px] font-semibold focus:outline-none focus:border-[var(--color-accent)]"
            />
          </div>
          <div>
            <label className="block font-mono text-[11px] tracking-[0.1em] uppercase text-[var(--color-muted)] mb-1.5">Slug *</label>
            <input
              name="slug"
              required
              defaultValue={page?.slug ?? ''}
              type="text"
              placeholder="about, contact, terms"
              className="w-full h-10 px-3 border border-[var(--color-border)] bg-[var(--color-elevated)] text-[13px] font-mono focus:outline-none focus:border-[var(--color-accent)]"
            />
          </div>
        </div>

        <div>
          <label className="block font-mono text-[11px] tracking-[0.1em] uppercase text-[var(--color-muted)] mb-1.5">Body *</label>
          <textarea
            name="body"
            required
            defaultValue={page?.body ?? ''}
            rows={20}
            placeholder="Page content (HTML)"
            className="w-full px-3 py-2.5 border border-[var(--color-border)] bg-[var(--color-elevated)] text-[13px] font-mono text-[var(--color-primary)] placeholder:text-[var(--color-caption)] focus:outline-none focus:border-[var(--color-accent)] resize-none"
          />
        </div>

        <div className="border-t border-[var(--color-border)] pt-4">
          <p className="font-mono text-[11px] tracking-[0.1em] uppercase text-[var(--color-muted)] mb-3">SEO</p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-mono text-[11px] text-[var(--color-muted)] mb-1">Meta Title</label>
              <input name="seoTitle" defaultValue={page?.seoTitle ?? ''} type="text" className="w-full h-9 px-3 border border-[var(--color-border)] bg-[var(--color-elevated)] text-[13px] focus:outline-none" />
            </div>
            <div>
              <label className="block font-mono text-[11px] text-[var(--color-muted)] mb-1">Meta Description</label>
              <input name="seoDescription" defaultValue={page?.seoDescription ?? ''} type="text" className="w-full h-9 px-3 border border-[var(--color-border)] bg-[var(--color-elevated)] text-[13px] focus:outline-none" />
            </div>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button type="submit" name="publish" value="0" className="h-10 px-6 border border-[var(--color-border)] text-[13px] font-medium hover:bg-[var(--color-deep)]">
            Save Draft
          </button>
          <button type="submit" name="publish" value="1" className="h-10 px-6 bg-[var(--color-accent)] text-white text-[13px] font-medium hover:opacity-90">
            {page?.isPublished ? 'Update' : 'Publish'}
          </button>
        </div>
      </form>
    </div>
  )
}
