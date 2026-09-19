import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const secret = req.headers.get('x-admin-secret') || req.nextUrl.searchParams.get('secret')
  if (secret !== process.env.ADMIN_SECRET) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const [
    totalArticles,
    lastLog,
    lastArticle,
    sourcesCount,
    recentLogs
  ] = await Promise.all([
    prisma.article.count(),
    prisma.scrapingLog.findFirst({ orderBy: { startedAt: 'desc' } }),
    prisma.article.findFirst({ orderBy: { scrapedAt: 'desc' } }),
    prisma.source.count({ where: { active: true } }),
    prisma.scrapingLog.findMany({ orderBy: { startedAt: 'desc' }, take: 5, include: { source: { select: { name: true } } } })
  ])

  return NextResponse.json({
    totalArticles,
    sourcesCount,
    lastSync: lastLog?.finishedAt,
    lastSyncStatus: lastLog?.status,
    lastSyncNew: lastLog?.articlesNew,
    lastArticleAt: lastArticle?.scrapedAt,
    recentLogs
  })
}
