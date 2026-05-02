import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { db } from '@indus/db'
import { auth } from '../../../../../lib/auth'
import { ROLES, requireRole } from '../../../../../lib/rbac'
import { revalidatePath } from 'next/cache'

export const metadata: Metadata = { title: 'Edit Post — Indus Admin' }

type Props = { params: Promise<{ id: string }> }

async function savePost(formData: FormData) {
  'use server'
  const session = requireRole(await auth(), ROLES.CMS_WRITE)

  const id = formData.get('id') as string
  const locale = (formData.get('locale') as string) ?? 'en'
  const title = formData.get('title') as string
  const slug = formData.get('slug') as string
  const excerpt = (formData.get('excerpt') as string | null) || undefined
  const body = formData.get('body') as string
  const seoTitle = (formData.get('seoTitle') as string | null) || undefined
  const seoDescription = (formData.get('seoDescription') as string | null) || undefined
  const tagsRaw = (formData.get('tags') as string | null) || ''
  const tags = tagsRaw.split(',').map((t) => t.trim()).filter(Boolean)
  const publish = formData.get('publish') === '1'

  const data = {
    title,
    slug,
    excerpt,
    body,
    seoTitle,
    seoDescription,
    tags,
    isPublished: publish,
    publishedAt: publish ? new Date() : undefined,
    authorStaffId: session.user.id,
  }

  if (id === 'new') {
    const post = await db.blogPost.create({ data })
    revalidatePath(`/cms`)
    redirect(`/cms/blog/${post.id}`)
  } else {
    await db.blogPost.update({ where: { id }, data })
    revalidatePath(`/cms`)
    revalidatePath(`/blog/${slug}`)
  }
}

export default async function BlogPostEditorPage({ params }: Props) {
  const { id } = await params

  const post = id === 'new'
    ? null
    : await db.blogPost.findUnique({ where: { id } })

  if (id !== 'new' && !post) notFound()

  return (
    <div className="max-w-[860px]">
      <div className="mb-6">
        <Link href={`/cms?tab=blog`} className="font-mono text-[12px] text-[var(--color-muted)] hover:text-[var(--color-primary)] mb-2 inline-block">
          ← CMS
        </Link>
        <h1 className="text-[24px] font-semibold tracking-tight">{id === 'new' ? 'New Blog Post' : 'Edit Post'}</h1>
      </div>

      <form action={savePost} className="space-y-5">
        <input type="hidden" name="id" value={id} />

        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block font-mono text-[11px] tracking-[0.1em] uppercase text-[var(--color-muted)] mb-1.5">Title *</label>
            <input
              name="title"
              required
              defaultValue={post?.title ?? ''}
              type="text"
              placeholder="Post title"
              className="w-full h-10 px-3 border border-[var(--color-border)] bg-[var(--color-elevated)] text-[15px] font-semibold text-[var(--color-primary)] placeholder:text-[var(--color-caption)] focus:outline-none focus:border-[var(--color-accent)]"
            />
          </div>

          <div>
            <label className="block font-mono text-[11px] tracking-[0.1em] uppercase text-[var(--color-muted)] mb-1.5">Slug *</label>
            <input
              name="slug"
              required
              defaultValue={post?.slug ?? ''}
              type="text"
              placeholder="url-friendly-slug"
              className="w-full h-10 px-3 border border-[var(--color-border)] bg-[var(--color-elevated)] text-[13px] font-mono text-[var(--color-primary)] placeholder:text-[var(--color-caption)] focus:outline-none focus:border-[var(--color-accent)]"
            />
          </div>

          <div>
            <label className="block font-mono text-[11px] tracking-[0.1em] uppercase text-[var(--color-muted)] mb-1.5">Tags (comma-separated)</label>
            <input
              name="tags"
              defaultValue={post ? (post.tags as string[]).join(', ') : ''}
              type="text"
              placeholder="hydraulics, maintenance, pumps"
              className="w-full h-10 px-3 border border-[var(--color-border)] bg-[var(--color-elevated)] text-[13px] text-[var(--color-primary)] placeholder:text-[var(--color-caption)] focus:outline-none focus:border-[var(--color-accent)]"
            />
          </div>
        </div>

        <div>
          <label className="block font-mono text-[11px] tracking-[0.1em] uppercase text-[var(--color-muted)] mb-1.5">Excerpt</label>
          <textarea
            name="excerpt"
            defaultValue={post?.excerpt ?? ''}
            rows={2}
            placeholder="Short summary shown in blog listings"
            className="w-full px-3 py-2.5 border border-[var(--color-border)] bg-[var(--color-elevated)] text-[13px] text-[var(--color-primary)] placeholder:text-[var(--color-caption)] focus:outline-none focus:border-[var(--color-accent)] resize-none"
          />
        </div>

        <div>
          <label className="block font-mono text-[11px] tracking-[0.1em] uppercase text-[var(--color-muted)] mb-1.5">Body *</label>
          <textarea
            name="body"
            required
            defaultValue={post?.body ?? ''}
            rows={18}
            placeholder="Post content (HTML or Markdown)"
            className="w-full px-3 py-2.5 border border-[var(--color-border)] bg-[var(--color-elevated)] text-[13px] font-mono text-[var(--color-primary)] placeholder:text-[var(--color-caption)] focus:outline-none focus:border-[var(--color-accent)] resize-none"
          />
        </div>

        <div className="border-t border-[var(--color-border)] pt-4">
          <p className="font-mono text-[11px] tracking-[0.1em] uppercase text-[var(--color-muted)] mb-3">SEO</p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-mono text-[11px] text-[var(--color-muted)] mb-1">Meta Title</label>
              <input
                name="seoTitle"
                defaultValue={post?.seoTitle ?? ''}
                type="text"
                className="w-full h-9 px-3 border border-[var(--color-border)] bg-[var(--color-elevated)] text-[13px] focus:outline-none focus:border-[var(--color-accent)]"
              />
            </div>
            <div>
              <label className="block font-mono text-[11px] text-[var(--color-muted)] mb-1">Meta Description</label>
              <input
                name="seoDescription"
                defaultValue={post?.seoDescription ?? ''}
                type="text"
                className="w-full h-9 px-3 border border-[var(--color-border)] bg-[var(--color-elevated)] text-[13px] focus:outline-none focus:border-[var(--color-accent)]"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button type="submit" name="publish" value="0" className="h-10 px-6 border border-[var(--color-border)] text-[13px] font-medium text-[var(--color-body)] hover:bg-[var(--color-deep)] transition-colors">
            Save Draft
          </button>
          <button type="submit" name="publish" value="1" className="h-10 px-6 bg-[var(--color-accent)] text-white text-[13px] font-medium hover:opacity-90 transition-opacity">
            {post?.isPublished ? 'Update & Publish' : 'Publish'}
          </button>
          {post?.isPublished && (
            <Link href={`/blog/${post.slug}`} target="_blank" className="font-mono text-[12px] text-[var(--color-accent)] hover:underline ml-2">
              View post ↗
            </Link>
          )}
        </div>
      </form>
    </div>
  )
}
