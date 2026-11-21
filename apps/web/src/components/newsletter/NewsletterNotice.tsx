import Link from 'next/link'

type Props = {
  eyebrow?: string
  title: string
  children?: React.ReactNode
  /** Rendered under the copy — the page's one action, if it has one. */
  action?: React.ReactNode
}

/**
 * The frame for the newsletter's confirm and unsubscribe pages: an eyebrow,
 * a heading, a short paragraph, at most one action, and a way back.
 */
export default function NewsletterNotice({
  eyebrow = 'Newsletter',
  title,
  children,
  action,
}: Props) {
  return (
    <section className="mx-auto max-w-[640px] px-4 py-20 pb-28 text-center sm:px-8">
      <p className="text-ih-muted font-mono text-[10.5px] font-medium tracking-[0.13em] uppercase">
        {eyebrow}
      </p>
      <h1 className="text-ih-ink mt-4 font-serif text-[40px] leading-[1.1] font-normal tracking-[-0.02em]">
        {title}
      </h1>
      {children ? (
        <div className="text-ih-ink-2 mt-5 text-[15px] leading-[1.6]">{children}</div>
      ) : null}
      {action ? <div className="mt-8 flex justify-center">{action}</div> : null}
      <div className="mt-10">
        <Link href="/" className="text-ih-accent font-mono text-[12px] hover:underline">
          ← Back to indushydraulics.com
        </Link>
      </div>
    </section>
  )
}
