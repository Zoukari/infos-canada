import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const articles = await prisma.article.findMany({
    where: { status: { in: ['published', 'pinned'] }, importanceScore: { gte: 50 } },
    include: { source: { select: { name: true } }, category: { select: { name: true, slug: true } } },
    orderBy: [{ status: 'desc' }, { importanceScore: 'desc' }, { publishedAt: 'desc' }],
    take: 10,
  })
  return NextResponse.json({ articles })
}
