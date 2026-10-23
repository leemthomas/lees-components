import { NextResponse, type NextRequest } from 'next/server'
import { client } from '@/sanity/client'
import { PAGE_SEARCH_QUERY } from '@/sanity/queries'

// GET /api/search?q=biology  → pages on this site that match, for the menu's live search.
export async function GET(req: NextRequest) {
  const q = (req.nextUrl.searchParams.get('q') ?? '').trim().slice(0, 80)
  const words = q.split(/\s+/).map((w) => w.replace(/[^\p{L}\p{N}-]/gu, '')).filter(Boolean)
  if (!words.length) return NextResponse.json({ results: [] })

  // Each word is a prefix match, so "bio" finds "Biology"
  const terms = words.map((w) => `${w}*`)
  const results = await client.withConfig({ stega: false }).fetch(PAGE_SEARCH_QUERY, { terms })
  return NextResponse.json(
    { results: results.map((r) => ({ id: r._id, title: r.title, href: r.slug === 'home' ? '/' : `/${r.slug}`, description: r.description })) },
    { headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=600' } },
  )
}
