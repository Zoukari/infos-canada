import Header from '@/components/Header'
import Footer from '@/components/Footer'
import ArticleCard, { Article } from '@/components/ArticleCard'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export default async function NouveauBrunswickPage({ searchParams }: { searchParams: Promise<{ categorie?: string; ville?: string }> }) {
  const params = await searchParams
  const activeCity = params.ville
  const activeCategory = params.categorie || 'all'

  const articles = await prisma.article.findMany({
    where: {
      province: 'NB',
      status: { in: ['published', 'pinned'] },
      ...(activeCity ? { city: activeCity } : {}),
      ...(activeCategory !== 'all' ? { category: { slug: activeCategory } } : {}),
    },
    include: { source: { select: { name: true } }, category: { select: { name: true, slug: true } } },
    orderBy: [{ importanceScore: 'desc' }, { publishedAt: 'desc' }],
    take: 30,
  }).catch(() => [])

  const CATS = [
    { slug: 'all', label: 'Tout' }, { slug: 'gouvernement-nb', label: 'Gouvernement' },
    { slug: 'immigration-nb', label: 'Immigration' }, { slug: 'nbpnp', label: 'NBPNP' },
    { slug: 'emploi-nb', label: 'Emploi' }, { slug: 'logement-nb', label: 'Logement' },
    { slug: 'sante-nb', label: 'Santé' }, { slug: 'actualites-nb', label: 'Actualités' },
  ]

  return (
    <>
      <Header />
      <main>
        <div className="page-header" style={{ ['--accent' as string]: 'var(--nb)' }}>
          <div className="container">
            <h1 style={{ fontFamily: 'Source Serif 4,serif', fontSize: 'clamp(24px,4vw,36px)', fontWeight: 600, marginBottom: 8, color: 'var(--ink)' }}>Nouveau-Brunswick</h1>
            <p style={{ color: 'var(--ink-soft)', fontSize: 15 }}>Immigration, emploi, logement et actualités de la province.</p>
          </div>
        </div>

        <div style={{ background: 'var(--card)', borderBottom: '1px solid var(--border)', overflowX: 'auto' }}>
          <div className="container" style={{ display: 'flex' }}>
            {CATS.map(cat => (
              <Link key={cat.slug} href={`/nouveau-brunswick?categorie=${cat.slug}${activeCity ? `&ville=${activeCity}` : ''}`}
                style={{ padding: '11px 14px', fontSize: 13, textDecoration: 'none', whiteSpace: 'nowrap', color: activeCategory === cat.slug ? 'var(--nb)' : 'var(--ink-soft)', fontWeight: activeCategory === cat.slug ? 600 : 400, borderBottom: activeCategory === cat.slug ? '2px solid var(--nb)' : '2px solid transparent' }}>
                {cat.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="container grid-sidebar" style={{ padding: '28px 20px', display: 'grid', gridTemplateColumns: '1fr 260px', gap: 24, alignItems: 'start' }}>
          <div>
            <div style={{ fontSize: 13, color: '#9C9C9C', marginBottom: 14 }}>{articles.length} article{articles.length > 1 ? 's' : ''}{activeCity ? ` à ${activeCity}` : ''}</div>
            {articles.length === 0 ? (
              <div style={{ padding: 32, textAlign: 'center', background: 'var(--card)', border: '1px dashed var(--border)', borderRadius: 6 }}>
                <div style={{ fontSize: 14, color: '#9C9C9C' }}>Aucun article — lancez une collecte depuis l&apos;administration</div>
                <Link href="/admin" style={{ display: 'inline-block', marginTop: 12, background: 'var(--ink)', color: '#fff', padding: '8px 18px', borderRadius: 3, textDecoration: 'none', fontSize: 13, fontWeight: 500 }}>Administration →</Link>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: 12 }}>
                {articles.map((a: Article) => <ArticleCard key={a.id} article={a} />)}
              </div>
            )}
          </div>
          <aside style={{ display: 'flex', flexDirection: 'column', gap: 14 }} className="hide-mobile">
            <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 6, padding: '16px' }}>
              <h3 style={{ fontFamily: 'Source Serif 4,serif', fontSize: 15, fontWeight: 600, marginBottom: 10, color: 'var(--ink)' }}>Filtrer par ville</h3>
              {['Moncton','Dieppe','Fredericton','Saint John','Edmundston'].map(v => (
                <Link key={v} href={`/nouveau-brunswick?categorie=${activeCategory}&ville=${v}`}
                  style={{ display: 'block', padding: '7px 8px', fontSize: 13, textDecoration: 'none', color: activeCity === v ? 'var(--nb)' : 'var(--ink-soft)', fontWeight: activeCity === v ? 600 : 400, borderBottom: '1px solid var(--border-soft)' }}>
                  {v}
                </Link>
              ))}
            </div>
          </aside>
        </div>
      </main>
      <Footer />
    </>
  )
}
