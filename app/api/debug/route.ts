import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const count = await prisma.article.count()
    const sources = await prisma.source.count()
    return NextResponse.json({ ok: true, articles: count, sources, dbUrl: process.env.DATABASE_URL ? 'set (' + process.env.DATABASE_URL.split('@')[1]?.split('/')[0] + ')' : 'MISSING' })
  } catch (e) {
    return NextResponse.json({
      ok: false,
      error: e instanceof Error ? e.message : String(e),
      dbUrl: process.env.DATABASE_URL ? 'set (' + process.env.DATABASE_URL.split('@')[1]?.split('/')[0] + ')' : 'MISSING',
      directUrl: process.env.DIRECT_URL ? 'set' : 'MISSING',
    }, { status: 500 })
  }
}
