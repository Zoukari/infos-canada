import { NextRequest, NextResponse } from 'next/server'
import { scrapeAllSources, scrapeSource } from '@/lib/scraper'
import { prisma } from '@/lib/prisma'

function verifyAdmin(req: NextRequest): boolean {
  const secret = req.headers.get('x-admin-secret') || req.nextUrl.searchParams.get('secret')
  return secret === process.env.ADMIN_SECRET
}

export async function POST(req: NextRequest) {
  if (!verifyAdmin(req)) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }
  
  const body = await req.json().catch(() => ({}))
  const sourceId = body.sourceId
  
  if (sourceId) {
    const result = await scrapeSource(sourceId)
    return NextResponse.json({ success: true, ...result })
  }
  
  const result = await scrapeAllSources()
  return NextResponse.json({ success: true, ...result })
}
