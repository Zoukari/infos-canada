import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const [totalArticles, lastLog, lastArticle, sourcesCount, recentLogs] = await Promise.all([
    prisma.article.count(),
    prisma.scrapingLog.findFirst({ orderBy: { startedAt: 'desc' } }),
    prisma.article.findFirst({ orderBy: { scrapedAt: 'desc' } }),
    prisma.source.count({ where: { active: true } }),
    prisma.scrapingLog.findMany({
      orderBy: { startedAt: 'desc' }, take: 5,
      include: { source: { select: { name: true } } }
    })
  ])
  return NextResponse.json({
    totalArticles, sourcesCount,
    lastSync: lastLog?.finishedAt || null,
    lastSyncStatus: lastLog?.status || null,
    lastSyncNew: lastLog?.articlesNew || 0,
    lastArticleAt: lastArticle?.scrapedAt || null,
    recentLogs
  })
}
