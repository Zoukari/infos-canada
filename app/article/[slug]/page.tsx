import Header from '@/components/Header'
import Footer from '@/components/Footer'
import ArticleCard from '@/components/ArticleCard'
import Link from 'next/link'
import { notFound } from 'next/navigation'

async function getArticle(slug: string) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    const res = await fetch(`${baseUrl}/api/articles?search=${slug}&limit=1`, { cache: 'no-store' })
    if (!res.ok) return null
    const data = await res.json()
    return data.articles?.[0] || null
  } catch { return null }
}

async function getRelated(categorySlug: string, province: string, excludeId: string) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    const params = new URLSearchParams({ limit: '4', province: province || '' })
    if (categorySlug) params.set('category', categorySlug)
    const res = await fetch(`${baseUrl}/api/articles?${params}`, { next: { revalidate: 1800 } })
    if (!res.ok) return []
    const data = await res.json()
    return (data.articles || []).filter((a: { id: string }) => a.id !== excludeId).slice(0, 3)
  } catch { return [] }
}

const PROVINCE_LABELS: Record<string, string> = {
  NB: 'Nouveau-Brunswick', CA: 'Canada', QC: 'Québec', ON: 'Ontario', AB: 'Alberta', BC: 'Colombie-Britannique', federal: 'Canada', NS: 'Nouvelle-Écosse',
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const article = await getArticle(slug)
  if (!article) notFound()

  const related = await getRelated(article.category?.slug, article.province, article.id)
  const keyFacts = article.keyFacts ? JSON.parse(JSON.stringify(article.keyFacts)) : null

  return (
    <>
      <Header />
      <main>
        {/* Breadcrumb */}
        <div style={{ background: 'var(--white)', borderBottom: '1px solid var(--border)', padding: '10px 0' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px', display: 'flex', gap: 6, fontSize: 13, color: 'var(--text-muted)', alignItems: 'center', flexWrap: 'wrap' }}>
            <Link href="/" style={{ color: 'var(--red)', textDecoration: 'none' }}>Accueil</Link>
            <span>›</span>
            {article.province && <Link href={article.province === 'NB' ? '/nouveau-brunswick' : '/canada'} style={{ color: 'var(--red)', textDecoration: 'none' }}>{PROVINCE_LABELS[article.province]}</Link>}
            {article.category && (
              <>
                <span>›</span>
                <span>{article.category.name}</span>
              </>
            )}
          </div>
        </div>

        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 48, alignItems: 'start' }}>
            {/* Article principal */}
            <article style={{ maxWidth: 720 }}>
              {/* Tags */}
              <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
                {article.category && (
                  <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--red)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    {article.category.name}
                  </span>
                )}
                {article.province && (
                  <span style={{ fontSize: 11, background: article.province === 'NB' ? '#1E3A5F' : '#374151', color: '#fff', padding: '2px 8px', borderRadius: 3 }}>
                    {PROVINCE_LABELS[article.province] || article.province}
                  </span>
                )}
                {article.city && <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>📍 {article.city}</span>}
              </div>

              {/* Titre */}
              <h1 style={{ fontFamily: "'Source Serif 4', serif", fontSize: 'clamp(22px, 4vw, 34px)', fontWeight: 700, lineHeight: 1.3, color: 'var(--text)', marginBottom: 20 }}>
                {article.title}
              </h1>

              {/* Meta */}
              <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 28, padding: '14px 0', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', flexWrap: 'wrap' }}>
                <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                  Source : <span style={{ fontWeight: 600, color: 'var(--text)' }}>{article.source?.name}</span>
                </div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                  Publié le {new Date(article.publishedAt).toLocaleDateString('fr-CA', { day: 'numeric', month: 'long', year: 'numeric' })}
                </div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                  Collecté le {new Date(article.scrapedAt || article.createdAt).toLocaleDateString('fr-CA', { day: 'numeric', month: 'long' })}
                </div>
              </div>

              {/* Résumé Infos Canada */}
              {article.summary && (
                <div style={{ background: '#F0F9FF', border: '1px solid #BAE6FD', borderRadius: 8, padding: '20px 24px', marginBottom: 24 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#0369A1', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>📰 Résumé Infos Canada</div>
                  <p style={{ fontSize: 16, lineHeight: 1.7, color: '#1E3A5F', fontFamily: "'Source Serif 4', serif" }}>
                    {article.summary}
                  </p>
                </div>
              )}

              {/* Pourquoi c'est important */}
              {article.whyItMatters && (
                <div style={{ background: '#FFF7ED', border: '1px solid #FED7AA', borderRadius: 8, padding: '18px 24px', marginBottom: 24 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#C2410C', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>⚡ Pourquoi c&apos;est important</div>
                  <p style={{ fontSize: 15, lineHeight: 1.7, color: '#431407' }}>{article.whyItMatters}</p>
                </div>
              )}

              {/* Points clés */}
              {keyFacts && Object.keys(keyFacts).length > 0 && (
                <div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 8, padding: '18px 24px', marginBottom: 24 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>📋 Informations clés</div>
                  <dl style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    {Object.entries(keyFacts).map(([k, v]) => (
                      <div key={k}>
                        <dt style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, marginBottom: 2 }}>{k}</dt>
                        <dd style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{String(v)}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              )}

              {/* Mots-clés */}
              {article.keywords?.length > 0 && (
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 28 }}>
                  {article.keywords.slice(0, 8).map((kw: string) => (
                    <Link key={kw} href={`/recherche?q=${encodeURIComponent(kw)}`}
                      style={{ fontSize: 11, padding: '3px 10px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 20, textDecoration: 'none', color: 'var(--text-muted)' }}>
                      {kw}
                    </Link>
                  ))}
                </div>
              )}

              {/* Lien original */}
              <a href={article.originalUrl} target="_blank" rel="noopener noreferrer"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'var(--red)', color: '#fff', padding: '12px 24px', borderRadius: 6, textDecoration: 'none', fontWeight: 600, fontSize: 14 }}>
                Lire l&apos;article original sur {article.source?.name} ↗
              </a>
            </article>

            {/* Sidebar */}
            <aside style={{ display: 'flex', flexDirection: 'column', gap: 20, position: 'sticky', top: 140 }}>
              {related.length > 0 && (
                <div>
                  <h3 style={{ fontFamily: "'Source Serif 4', serif", fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Articles liés</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                    {related.map((a: Parameters<typeof ArticleCard>[0]['article']) => (
                      <ArticleCard key={a.id} article={a} compact={true} />
                    ))}
                  </div>
                </div>
              )}
              <div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 10, padding: '16px' }}>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.6 }}>
                  Cet article est une synthèse automatique. Pour l&apos;information complète et exacte, consultez toujours la source officielle.
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
