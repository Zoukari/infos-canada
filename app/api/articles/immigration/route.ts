import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const articles = await prisma.article.findMany({
    where: {
      status: { in: ['published', 'pinned'] },
      OR: [
        { category: { slug: { in: ['immigration-canada', 'immigration-nb', 'entree-express', 'nbpnp', 'residence-permanente', 'permis-travail', 'permis-etudes', 'citoyennete', 'francophonie'] } } },
        { keywords: { has: 'immigration' } },
      ]
    },
    include: { source: { select: { name: true } }, category: { select: { name: true, slug: true } } },
    orderBy: [{ importanceScore: 'desc' }, { publishedAt: 'desc' }],
    take: 30,
  })
  return NextResponse.json({ articles })
}
