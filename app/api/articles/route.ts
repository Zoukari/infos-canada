import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const province = searchParams.get('province')
  const category = searchParams.get('category')
  const city = searchParams.get('city')
  const search = searchParams.get('search')
  const status = searchParams.get('status') || 'published'
  const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100)
  const page = parseInt(searchParams.get('page') || '1')
  const minScore = parseInt(searchParams.get('minScore') || '0')

  const where: Record<string, unknown> = { status: { in: status === 'all' ? ['published', 'pinned', 'draft'] : [status, 'pinned'] } }
  if (province) where.province = province
  if (city) where.city = city
  if (minScore > 0) where.importanceScore = { gte: minScore }
  if (category) where.category = { slug: category }
  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { summary: { contains: search, mode: 'insensitive' } },
      { keywords: { has: search.toLowerCase() } },
    ]
  }

  const [articles, total] = await Promise.all([
    prisma.article.findMany({
      where,
      include: { source: { select: { name: true, url: true } }, category: { select: { slug: true, name: true, color: true } } },
      orderBy: [{ status: 'desc' }, { importanceScore: 'desc' }, { publishedAt: 'desc' }],
      take: limit,
      skip: (page - 1) * limit,
    }),
    prisma.article.count({ where }),
  ])

  return NextResponse.json({ articles, total, page, pages: Math.ceil(total / limit) })
}
