import Header from '@/components/Header'
import Footer from '@/components/Footer'
import ArticleCard from '@/components/ArticleCard'
import Link from 'next/link'

async function getArticles(province?: string, limit = 10, minScore = 0) {
  try {
    const params = new URLSearchParams({ limit: String(limit) })
    if (province) params.set('province', province)
    if (minScore > 0) params.set('minScore', String(minScore))
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    const res = await fetch(`${baseUrl}/api/articles?${params}`, { next: { revalidate: 1800 } })
    if (!res.ok) return { articles: [] }
    return res.json()
  } catch {
    return { articles: [] }
  }
}

async function getWatchItems() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    const res = await fetch(`${baseUrl}/api/watch`, { next: { revalidate: 3600 } })
    if (!res.ok) return { items: [] }
    return res.json()
  } catch {
    return { items: [] }
  }
}

const CATEGORY_SECTIONS = [
  { slug: 'gouvernement-nb', label: 'Gouvernement' },
  { slug: 'immigration-nb', label: 'Immigration' },
  { slug: 'emploi-nb', label: 'Emploi' },
  { slug: 'logement-nb', label: 'Logement' },
  { slug: 'sante-nb', label: 'Santé' },
  { slug: 'actualites-nb', label: 'Actualités locales' },
]

export default async function HomePage() {
  const [latestData, nbData, watchData] = await Promise.all([
    getArticles(undefined, 10, 60),
    getArticles('NB', 12),
    getWatchItems(),
  ])

  const topArticles = latestData.articles || []
  const nbArticles = nbData.articles || []
  const watchItems = (watchData.items || []).slice(0, 4)

  return (
    <>
      <Header />
      <main>
        {/* Hero */}
        <section style={{ background: 'linear-gradient(135deg, #0F172A 0%, #1E3A5F 100%)', color: '#fff', padding: '56px 0 52px' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px' }}>
            <div style={{ maxWidth: 700 }}>
              <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
                <span style={{ background: 'var(--red)', color: '#fff', fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 4, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  Nouveau-Brunswick en priorité
                </span>
                <span style={{ background: 'rgba(255,255,255,.1)', color: 'rgba(255,255,255,.8)', fontSize: 11, padding: '3px 10px', borderRadius: 4 }}>
                  Mise à jour 3×/jour
                </span>
              </div>
              <h1 style={{ fontFamily: "'Source Serif 4', serif", fontSize: 'clamp(28px, 4vw, 46px)', fontWeight: 700, lineHeight: 1.2, marginBottom: 18, color: '#F8FAFC' }}>
                Tout ce qu&apos;il faut savoir sur le Canada aujourd&apos;hui.
              </h1>
              <p style={{ fontSize: 17, lineHeight: 1.7, color: 'rgba(255,255,255,.75)', marginBottom: 28 }}>
                Actualités, immigration, politique, emploi, logement et économie — avec une attention particulière au Nouveau-Brunswick.
              </p>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <Link href="/immigration" style={{ background: 'var(--red)', color: '#fff', padding: '11px 22px', borderRadius: 6, textDecoration: 'none', fontSize: 14, fontWeight: 600 }}>
                  Immigration →
                </Link>
                <Link href="/nouveau-brunswick" style={{ background: 'rgba(255,255,255,.1)', color: '#fff', padding: '11px 22px', borderRadius: 6, textDecoration: 'none', fontSize: 14, border: '1px solid rgba(255,255,255,.2)' }}>
                  Nouveau-Brunswick
                </Link>
                <Link href="/a-surveiller" style={{ background: 'rgba(255,255,255,.1)', color: '#fff', padding: '11px 22px', borderRadius: 6, textDecoration: 'none', fontSize: 14, border: '1px solid rgba(255,255,255,.2)' }}>
                  ⚑ À surveiller
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Quick nav thèmes */}
        <div style={{ background: 'var(--white)', borderBottom: '1px solid var(--border)' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px', display: 'flex', gap: 0, overflowX: 'auto' }}>
            {[
              { href: '/immigration', icon: '✈️', label: 'Immigration' },
              { href: '/emploi', icon: '💼', label: 'Emploi' },
              { href: '/logement', icon: '🏠', label: 'Logement' },
              { href: '/economie', icon: '📊', label: 'Économie' },
              { href: '/sante', icon: '🏥', label: 'Santé' },
              { href: '/politique', icon: '🏛️', label: 'Politique' },
              { href: '/a-surveiller', icon: '⚑', label: 'À surveiller' },
            ].map(item => (
              <Link key={item.href} href={item.href} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '12px 16px', fontSize: 13, color: 'var(--text)', textDecoration: 'none', whiteSpace: 'nowrap', borderRight: '1px solid var(--border)' }}>
                <span>{item.icon}</span> {item.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Body */}
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 40, alignItems: 'start' }}>
            {/* Colonne principale */}
            <div>
              {/* L'essentiel aujourd'hui */}
              <section style={{ marginBottom: 50 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 20 }}>
                  <h2 style={{ fontFamily: "'Source Serif 4', serif", fontSize: 26, fontWeight: 700, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ display: 'inline-block', width: 4, height: 28, background: 'var(--red)', borderRadius: 2, marginRight: 4 }} />
                    L&apos;essentiel aujourd&apos;hui
                  </h2>
                  <Link href="/canada" style={{ fontSize: 13, color: 'var(--red)', textDecoration: 'none', fontWeight: 500 }}>Tout voir →</Link>
                </div>

                {topArticles.length === 0 ? (
                  <EmptyState label="Aucune actualité disponible" sub="La collecte automatique s'effectue plusieurs fois par jour. Revenez bientôt ou lancez une collecte manuelle depuis l'administration." />
                ) : (
                  <div style={{ display: 'grid', gap: 16 }}>
                    {topArticles.slice(0, 1).map((a: Parameters<typeof ArticleCard>[0]['article']) => (
                      <ArticleCard key={a.id} article={a} size="large" />
                    ))}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                      {topArticles.slice(1, 5).map((a: Parameters<typeof ArticleCard>[0]['article']) => (
                        <ArticleCard key={a.id} article={a} />
                      ))}
                    </div>
                    <div style={{ display: 'grid', gap: 0 }}>
                      {topArticles.slice(5).map((a: Parameters<typeof ArticleCard>[0]['article']) => (
                        <ArticleCard key={a.id} article={a} size="compact" />
                      ))}
                    </div>
                  </div>
                )}
              </section>

              {/* Nouveau-Brunswick */}
              <section style={{ marginBottom: 50 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 20 }}>
                  <h2 style={{ fontFamily: "'Source Serif 4', serif", fontSize: 26, fontWeight: 700, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ display: 'inline-block', width: 4, height: 28, background: '#1E3A5F', borderRadius: 2, marginRight: 4 }} />
                    Aujourd&apos;hui au Nouveau-Brunswick
                  </h2>
                  <Link href="/nouveau-brunswick" style={{ fontSize: 13, color: 'var(--red)', textDecoration: 'none', fontWeight: 500 }}>Tout voir →</Link>
                </div>

                {/* Filtres catégories NB */}
                <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
                  {CATEGORY_SECTIONS.map(c => (
                    <Link key={c.slug} href={`/nouveau-brunswick?categorie=${c.slug}`} style={{ fontSize: 12, padding: '4px 12px', background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 20, color: 'var(--text-muted)', textDecoration: 'none', transition: 'all 0.15s' }}>
                      {c.label}
                    </Link>
                  ))}
                </div>

                {nbArticles.length === 0 ? (
                  <EmptyState label="Pas encore d'actualité NB" sub="Le Nouveau-Brunswick est notre priorité. La collecte RSS intègre Radio-Canada NB, le gouvernement NB, les municipalités et les sources d'immigration." />
                ) : (
                  <div style={{ display: 'grid', gap: 14 }}>
                    {nbArticles.map((a: Parameters<typeof ArticleCard>[0]['article']) => (
                      <ArticleCard key={a.id} article={a} />
                    ))}
                  </div>
                )}
              </section>
            </div>

            {/* Sidebar */}
            <aside style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
              {/* À surveiller */}
              {watchItems.length > 0 && (
                <div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
                  <div style={{ background: '#1E3A5F', padding: '14px 18px' }}>
                    <h3 style={{ fontFamily: "'Source Serif 4', serif", color: '#fff', fontSize: 16, fontWeight: 700 }}>⚑ À surveiller</h3>
                  </div>
                  <div style={{ padding: '0 18px' }}>
                    {watchItems.map((item: { id: string; title: string; description?: string; type: string; dueDate?: string }) => (
                      <div key={item.id} style={{ padding: '14px 0', borderBottom: '1px solid var(--border)' }}>
                        <div style={{ fontSize: 11, color: 'var(--red)', fontWeight: 600, textTransform: 'uppercase', marginBottom: 4 }}>
                          {item.type === 'immigration' ? 'Immigration' : item.type === 'budget' ? 'Budget' : item.type === 'date' ? 'Date importante' : 'À suivre'}
                        </div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>{item.title}</div>
                        {item.description && <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5 }}>{item.description.substring(0, 100)}…</div>}
                      </div>
                    ))}
                  </div>
                  <div style={{ padding: '12px 18px' }}>
                    <Link href="/a-surveiller" style={{ fontSize: 13, color: 'var(--red)', textDecoration: 'none', fontWeight: 600 }}>
                      Tout voir →
                    </Link>
                  </div>
                </div>
              )}

              {/* Navigation rapide */}
              <div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
                <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)' }}>
                  <h3 style={{ fontFamily: "'Source Serif 4', serif", fontSize: 15, fontWeight: 700 }}>Immigration — Dernières infos</h3>
                </div>
                <div style={{ padding: '12px 18px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {[
                    { href: '/immigration#entree-express', label: 'Entrée express' },
                    { href: '/immigration#nbpnp', label: 'Programme NB (NBPNP)' },
                    { href: '/immigration#francophonie', label: 'Tirages francophones' },
                    { href: '/immigration#a-surveiller', label: 'Prochains tirages' },
                  ].map(link => (
                    <Link key={link.href} href={link.href} style={{ fontSize: 13, color: 'var(--text)', textDecoration: 'none', display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border)' }}>
                      {link.label} <span style={{ color: 'var(--red)' }}>→</span>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Villes NB */}
              <div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 10, padding: '18px' }}>
                <h3 style={{ fontFamily: "'Source Serif 4', serif", fontSize: 15, fontWeight: 700, marginBottom: 14 }}>Villes du NB</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  {['Moncton', 'Dieppe', 'Fredericton', 'Saint John', 'Edmundston', 'Campbellton'].map(city => (
                    <Link key={city} href={`/nouveau-brunswick?ville=${city}`} style={{ fontSize: 13, padding: '7px 10px', background: 'var(--bg)', borderRadius: 6, textDecoration: 'none', color: 'var(--text)', textAlign: 'center' }}>
                      {city}
                    </Link>
                  ))}
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

function EmptyState({ label, sub }: { label: string; sub: string }) {
  return (
    <div style={{ padding: '48px 24px', textAlign: 'center', background: 'var(--white)', border: '1px dashed var(--border)', borderRadius: 10 }}>
      <div style={{ fontSize: 36, marginBottom: 12 }}>🔄</div>
      <div style={{ fontFamily: "'Source Serif 4', serif", fontSize: 18, fontWeight: 600, marginBottom: 8, color: 'var(--text)' }}>{label}</div>
      <p style={{ fontSize: 14, color: 'var(--text-muted)', maxWidth: 400, margin: '0 auto' }}>{sub}</p>
    </div>
  )
}
