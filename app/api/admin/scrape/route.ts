import { NextRequest, NextResponse } from 'next/server'
import { scrapeAllSources, scrapeSource } from '@/lib/scraper'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    if (body.sourceId) {
      const result = await scrapeSource(body.sourceId)
      return NextResponse.json({ success: true, ...result })
    }
    const result = await scrapeAllSources()
    return NextResponse.json({ success: true, ...result })
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
