import { NextResponse } from 'next/server'
import { runAutocomplete } from '../../../../lib/search'

export const runtime = 'nodejs'

export async function GET(req: Request) {
  const url = new URL(req.url)
  const q = (url.searchParams.get('q') ?? '').trim()
  if (q.length < 1 || q.length > 80) {
    return NextResponse.json({ items: [] })
  }
  try {
    const items = await runAutocomplete(q, 8)
    return NextResponse.json({
      items: items.map((it) => ({
        sku: it.sku,
        title: it.title,
        url: `/p/${it.sku}`,
        brandName: it.brandName,
      })),
    })
  } catch {
    return NextResponse.json({ items: [] })
  }
}
