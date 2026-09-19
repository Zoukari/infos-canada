import { NextRequest, NextResponse } from 'next/server'
import { scrapeAllSources } from '@/lib/scraper'

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }
  try {
    const result = await scrapeAllSources()
    return NextResponse.json({ success: true, ...result, timestamp: new Date().toISOString() })
  } catch (error) {
    return NextResponse.json({ error: 'Erreur collecte', details: String(error) }, { status: 500 })
  }
}
