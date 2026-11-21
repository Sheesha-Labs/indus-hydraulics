import Link from 'next/link'

export default function CompareNotFound() {
  return (
    <div className="mx-auto max-w-[680px] px-8 py-20 text-center">
      <div className="text-ih-muted mb-3 font-mono text-[12px] tracking-[0.14em] uppercase">
        Not found
      </div>
      <h1 className="mb-3 text-[28px] font-semibold tracking-tight">No comparison here</h1>
      <p className="text-ih-muted mb-8 text-[14px] leading-[1.6]">
        Add products from the catalogue to start a comparison.
      </p>
      <Link
        href={`/c`}
        className="bg-ih-accent inline-flex h-10 items-center px-6 text-sm font-medium text-white hover:opacity-90"
      >
        Browse Products
      </Link>
    </div>
  )
}
