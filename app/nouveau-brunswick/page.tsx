import Header from '@/components/Header'
import Footer from '@/components/Footer'
import ArticleCard, { Article } from '@/components/ArticleCard'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export default async function NouveauBrunswickPage({ searchParams }: { searchParams: Promise<{ categorie?: string; ville?: string }> }) {
  const params = await searchParams
  const activeCity = params.ville

  const articles = await prisma.article.findMany({
    where: {
      province: 'NB',
      status: { in: ['published', 'pinned'] },
      ...(activeCity ? { city: activeCity } : {}),
      ...(params.categorie && params.categorie !== 'all' ? { category: { slug: params.categorie } } : {}),
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
  const activeCategory = params.categorie || 'all'

  return (
    <>
      <Header />
      <main>
        <div style={{ background: '#1E3A5F', color: '#fff', padding: '36px 16px' }}>
          <div className="container">
            <h1 style={{ fontFamily: 'Source Serif 4,serif', fontSize: 'clamp(22px,4vw,36px)', fontWeight: 700, marginBottom: 8 }}>
              📍 Nouveau-Brunswick
            </h1>
            <p style={{ color: 'rgba(255,255,255,.75)', fontSize: 15 }}>Immigration, emploi, logement et actualités de la province.</p>
          </div>
        </div>

        <div style={{ background: '#fff', borderBottom: '1px solid #E5E7EB', overflowX: 'auto' }}>
          <div className="container" style={{ display: 'flex' }}>
            {CATS.map(cat => (
              <Link key={cat.slug} href={`/nouveau-brunswick?categorie=${cat.slug}${activeCity ? `&ville=${activeCity}` : ''}`}
                style={{ padding: '10px 14px', fontSize: 13, textDecoration: 'none', whiteSpace: 'nowrap', color: activeCategory === cat.slug ? '#D80621' : '#374151', fontWeight: activeCategory === cat.slug ? 600 : 400, borderBottom: activeCategory === cat.slug ? '2px solid #D80621' : '2px solid transparent' }}>
                {cat.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="container" style={{ padding: '24px 16px', display: 'grid', gridTemplateColumns: '1fr 260px', gap: 24, alignItems: 'start' }}>
          <div>
            <div style={{ fontSize: 14, color: '#6B7280', marginBottom: 14 }}>{articles.length} article{articles.length > 1 ? 's' : ''}{activeCity ? ` à ${activeCity}` : ''}</div>
            {articles.length === 0 ? (
              <div style={{ padding: 32, textAlign: 'center', background: '#fff', border: '1px dashed #E5E7EB', borderRadius: 8 }}>
                <div style={{ fontSize: 28, marginBottom: 8 }}>📭</div>
                <div style={{ fontSize: 14, color: '#9CA3AF' }}>Aucun article — lancez une collecte depuis l&apos;administration</div>
                <Link href="/admin" style={{ display: 'inline-block', marginTop: 12, background: '#D80621', color: '#fff', padding: '8px 18px', borderRadius: 6, textDecoration: 'none', fontSize: 13, fontWeight: 600 }}>Administration →</Link>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: 10 }}>
                {articles.map((a: Article) => <ArticleCard key={a.id} article={a} />)}
              </div>
            )}
          </div>
          <aside style={{ display: 'flex', flexDirection: 'column', gap: 14 }} className="hide-mobile">
            <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 10, padding: '16px' }}>
              <h3 style={{ fontFamily: 'Source Serif 4,serif', fontSize: 14, fontWeight: 700, marginBottom: 10 }}>📍 Filtrer par ville</h3>
              {['Moncton','Dieppe','Fredericton','Saint John','Edmundston'].map(v => (
                <Link key={v} href={`/nouveau-brunswick?categorie=${activeCategory}&ville=${v}`}
                  style={{ display: 'block', padding: '7px 8px', fontSize: 13, textDecoration: 'none', color: activeCity === v ? '#D80621' : '#374151', fontWeight: activeCity === v ? 600 : 400, borderBottom: '1px solid #E5E7EB' }}>
                  {activeCity === v ? '● ' : ''}{v}
                </Link>
              ))}
              {activeCity && (
                <Link href={`/nouveau-brunswick?categorie=${activeCategory}`} style={{ display: 'block', padding: '7px 8px', fontSize: 12, textDecoration: 'none', color: '#9CA3AF', marginTop: 4 }}>
                  ✕ Effacer le filtre
                </Link>
              )}
            </div>
          </aside>
        </div>
      </main>
      <Footer />
    </>
  )
}
