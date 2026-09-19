import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

function verifyAdmin(req: NextRequest): boolean {
  const secret = req.headers.get('x-admin-secret') || req.nextUrl.searchParams.get('secret')
  return secret === process.env.ADMIN_SECRET
}

export async function GET(req: NextRequest) {
  if (!verifyAdmin(req)) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }
  
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const [totalArticles, todayArticles, nbArticles, caArticles, immigrationArticles, sourcesActive, sourcesError, lastLog] = await Promise.all([
    prisma.article.count(),
    prisma.article.count({ where: { createdAt: { gte: today } } }),
    prisma.article.count({ where: { createdAt: { gte: today }, province: 'NB' } }),
    prisma.article.count({ where: { createdAt: { gte: today }, province: 'CA' } }),
    prisma.article.count({
      where: {
        createdAt: { gte: today },
        category: { slug: { in: ['immigration-canada', 'immigration-nb', 'entree-express', 'nbpnp'] } }
      }
    }),
    prisma.source.count({ where: { active: true, errorCount: { lt: 3 } } }),
    prisma.source.count({ where: { active: true, errorCount: { gte: 3 } } }),
    prisma.scrapingLog.findFirst({ orderBy: { startedAt: 'desc' } }),
  ])
  
  return NextResponse.json({
    today: { articles: todayArticles, nb: nbArticles, canada: caArticles, immigration: immigrationArticles },
    total: totalArticles,
    sources: { active: sourcesActive, error: sourcesError },
    lastSync: lastLog?.finishedAt || null,
  })
}
