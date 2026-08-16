import Link from 'next/link'

export default function CompareNotFound() {
  return (
    <div className="max-w-[680px] mx-auto px-8 py-20 text-center">
      <div className="font-mono text-[12px] tracking-[0.14em] uppercase text-ih-muted mb-3">
        Not found
      </div>
      <h1 className="text-[28px] font-semibold tracking-tight mb-3">No comparison here</h1>
      <p className="text-[14px] text-ih-muted mb-8 leading-[1.6]">
        Add products from the catalogue to start a comparison.
      </p>
      <Link
        href={`/c`}
        className="inline-flex h-10 px-6 items-center bg-ih-accent text-white text-sm font-medium hover:opacity-90"
      >
        Browse Products
      </Link>
    </div>
  )
}
