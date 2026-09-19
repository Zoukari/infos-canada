import Header from '@/components/Header'
import Footer from '@/components/Footer'
import ArticleCard, { Article } from '@/components/ArticleCard'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

const PROVINCE_LABELS: Record<string, string> = { NB: 'Nouveau-Brunswick', CA: 'Canada', federal: 'Canada', QC: 'Québec', ON: 'Ontario' }

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const article = await prisma.article.findUnique({
    where: { slug },
    include: { source: true, category: true },
  }).catch(() => null)

  if (!article) notFound()

  const related = await prisma.article.findMany({
    where: {
      id: { not: article.id },
      status: { in: ['published', 'pinned'] },
      ...(article.categoryId ? { categoryId: article.categoryId } : { province: article.province }),
    },
    include: { source: { select: { name: true } }, category: { select: { name: true, slug: true } } },
    orderBy: { publishedAt: 'desc' },
    take: 3,
  }).catch(() => [])

  return (
    <>
      <Header />
      <main>
        <div style={{ background: '#fff', borderBottom: '1px solid #E5E7EB', padding: '10px 0' }}>
          <div className="container" style={{ display: 'flex', gap: 6, fontSize: 13, color: '#6B7280', alignItems: 'center', flexWrap: 'wrap' }}>
            <Link href="/" style={{ color: '#C8102E', textDecoration: 'none' }}>Accueil</Link>
            <span>›</span>
            {article.province && <Link href={article.province === 'NB' ? '/nouveau-brunswick' : '/canada'} style={{ color: '#C8102E', textDecoration: 'none' }}>{PROVINCE_LABELS[article.province] || article.province}</Link>}
            {article.category && <><span>›</span><span>{article.category.name}</span></>}
          </div>
        </div>

        <div className="container" style={{ padding: '32px 16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 32, alignItems: 'start' }}>
            <article style={{ maxWidth: 680 }}>
              <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap', alignItems: 'center' }}>
                {article.category && <span style={{ fontSize: 11, fontWeight: 700, color: '#C8102E', textTransform: 'uppercase' }}>{article.category.name}</span>}
                {article.province && <span style={{ fontSize: 11, background: article.province === 'NB' ? '#1E3A5F' : '#374151', color: '#fff', padding: '2px 7px', borderRadius: 3 }}>{PROVINCE_LABELS[article.province] || article.province}</span>}
                {article.city && <span style={{ fontSize: 11, color: '#6B7280' }}>📍 {article.city}</span>}
              </div>

              <h1 style={{ fontFamily: 'Source Serif 4,serif', fontSize: 'clamp(22px,4vw,32px)', fontWeight: 700, lineHeight: 1.3, marginBottom: 18 }}>{article.title}</h1>

              <div style={{ display: 'flex', gap: 14, alignItems: 'center', marginBottom: 24, padding: '12px 0', borderTop: '1px solid #E5E7EB', borderBottom: '1px solid #E5E7EB', flexWrap: 'wrap', fontSize: 13, color: '#6B7280' }}>
                <span>Source : <strong style={{ color: '#374151' }}>{article.source?.name}</strong></span>
                <span>{new Date(article.publishedAt).toLocaleDateString('fr-CA', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
              </div>

              {article.summary && (
                <div style={{ background: '#F0F9FF', border: '1px solid #BAE6FD', borderRadius: 8, padding: '18px 20px', marginBottom: 20 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#0369A1', textTransform: 'uppercase', marginBottom: 8 }}>📰 Résumé</div>
                  <p style={{ fontSize: 15, lineHeight: 1.7, color: '#1E3A5F' }}>{article.summary}</p>
                </div>
              )}

              {article.whyItMatters && (
                <div style={{ background: '#FFF7ED', border: '1px solid #FED7AA', borderRadius: 8, padding: '16px 20px', marginBottom: 20 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#C2410C', textTransform: 'uppercase', marginBottom: 8 }}>⚡ Pourquoi c&apos;est important</div>
                  <p style={{ fontSize: 14, lineHeight: 1.7, color: '#431407' }}>{article.whyItMatters}</p>
                </div>
              )}

              {article.keywords?.length > 0 && (
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 24 }}>
                  {article.keywords.slice(0, 8).map((kw: string) => (
                    <span key={kw} style={{ fontSize: 11, padding: '3px 10px', background: '#F4F5F7', border: '1px solid #E5E7EB', borderRadius: 20, color: '#6B7280' }}>{kw}</span>
                  ))}
                </div>
              )}

              <a href={article.originalUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#C8102E', color: '#fff', padding: '11px 22px', borderRadius: 6, textDecoration: 'none', fontWeight: 600, fontSize: 14 }}>
                Lire l&apos;article original sur {article.source?.name} ↗
              </a>
            </article>

            <aside style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {related.length > 0 && (
                <div>
                  <h3 style={{ fontFamily: 'Source Serif 4,serif', fontSize: 15, fontWeight: 700, marginBottom: 12 }}>Articles liés</h3>
                  {related.map((a: Article) => <ArticleCard key={a.id} article={a} compact={true} />)}
                </div>
              )}
            </aside>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
