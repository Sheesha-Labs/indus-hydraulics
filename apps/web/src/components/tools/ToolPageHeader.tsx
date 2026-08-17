import Link from 'next/link'

export default function ToolPageHeader({
  title,
  intro,
}: {
  title: string
  intro: string
}) {
  return (
    <>
      <nav className="mono flex items-center gap-2 pt-8 text-[12px] text-ih-muted">
        <Link href="/" className="hover:text-ih-ink">
          Home
        </Link>
        <span className="opacity-40">/</span>
        <Link href="/tools" className="hover:text-ih-ink">
          Tools
        </Link>
        <span className="opacity-40">/</span>
        <span className="text-ih-ink">{title}</span>
      </nav>
      <header className="max-w-[720px] py-8">
        <h1 className="mb-3 font-serif text-[clamp(30px,4.5vw,44px)] font-normal leading-[1.1] tracking-[-0.02em]">
          {title}
        </h1>
        <p className="text-[17px] leading-[1.55] text-ih-muted">{intro}</p>
      </header>
    </>
  )
}
