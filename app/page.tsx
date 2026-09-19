import Header from '@/components/Header'
import Footer from '@/components/Footer'
import ArticleCard, { Article } from '@/components/ArticleCard'
import Link from 'next/link'

async function getArticles(province?: string, limit = 10) {
  try {
    const p = new URLSearchParams({ limit: String(limit), status: 'published' })
    if (province) p.set('province', province)
    const base = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    const res = await fetch(`${base}/api/articles?${p}`, { next: { revalidate: 1800 } })
    return res.ok ? (await res.json()).articles || [] : []
  } catch { return [] }
}

async function getWatch() {
  try {
    const base = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    const res = await fetch(`${base}/api/watch`, { next: { revalidate: 3600 } })
    return res.ok ? (await res.json()).items || [] : []
  } catch { return [] }
}

export default async function HomePage() {
  const [top, nb, watch] = await Promise.all([getArticles(undefined, 8), getArticles('NB', 8), getWatch()])

  const isEmpty = top.length === 0 && nb.length === 0

  return (
    <>
      <Header />
      <main>
        {/* Hero */}
        <div style={{ background: 'linear-gradient(135deg,#0F172A,#1E3A5F)', color: '#fff', padding: '40px 16px' }}>
          <div className="container">
            <div style={{ display: 'inline-flex', gap: 6, marginBottom: 14, flexWrap: 'wrap' }}>
              <span style={{ background: 'var(--red)', fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, letterSpacing: '.06em', textTransform: 'uppercase' }}>
                🍁 Nouveau-Brunswick en priorité
              </span>
              <span style={{ background: 'rgba(255,255,255,.12)', fontSize: 11, padding: '3px 10px', borderRadius: 20 }}>
                Mise à jour automatique 3×/jour
              </span>
            </div>
            <h1 style={{ fontFamily: 'Source Serif 4,serif', fontSize: 'clamp(24px,5vw,42px)', fontWeight: 700, lineHeight: 1.2, marginBottom: 14 }}>
              Tout ce qu&apos;il faut savoir<br />sur le Canada aujourd&apos;hui.
            </h1>
            <p style={{ color: 'rgba(255,255,255,.75)', fontSize: 16, maxWidth: 540, marginBottom: 24 }}>
              Immigration, emploi, logement, politique — avec une priorité sur le Nouveau-Brunswick.
            </p>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {[
                { href: '/immigration', label: '✈️ Immigration' },
                { href: '/nouveau-brunswick', label: '📍 Nouveau-Brunswick' },
                { href: '/a-surveiller', label: '⚑ À surveiller' },
              ].map(l => (
                <Link key={l.href} href={l.href} style={{
                  background: l.href === '/immigration' ? 'var(--red)' : 'rgba(255,255,255,.12)',
                  color: '#fff', padding: '9px 18px', borderRadius: 6, textDecoration: 'none',
                  fontSize: 14, fontWeight: l.href === '/immigration' ? 600 : 400,
                  border: '1px solid rgba(255,255,255,.15)'
                }}>
                  {l.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Thèmes rapides */}
        <div style={{ background: '#fff', borderBottom: '1px solid var(--border)', overflowX: 'auto' }}>
          <div className="container" style={{ display: 'flex' }}>
            {[
              ['✈️', 'Immigration', '/immigration'],
              ['💼', 'Emploi', '/emploi'],
              ['🏠', 'Logement', '/logement'],
              ['📊', 'Économie', '/economie'],
              ['🏥', 'Santé', '/sante'],
              ['🏛️', 'Politique', '/politique'],
            ].map(([icon, label, href]) => (
              <Link key={href} href={href} style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
                padding: '10px 14px', fontSize: 12, textDecoration: 'none',
                color: 'var(--text)', whiteSpace: 'nowrap', borderRight: '1px solid var(--border)'
              }}>
                <span style={{ fontSize: 18 }}>{icon}</span>
                {label}
              </Link>
            ))}
          </div>
        </div>

        <div className="container" style={{ padding: '28px 16px' }}>

          {/* Bandeau vide — si pas encore de collecte */}
          {isEmpty && (
            <div style={{ background: '#FFF7ED', border: '1px solid #FED7AA', borderRadius: 10, padding: '24px', marginBottom: 28, textAlign: 'center' }}>
              <div style={{ fontSize: 36, marginBottom: 10 }}>⏳</div>
              <h2 style={{ fontFamily: 'Source Serif 4,serif', fontSize: 20, fontWeight: 700, marginBottom: 8, color: '#92400E' }}>
                Aucun article pour l&apos;instant
              </h2>
              <p style={{ fontSize: 14, color: '#78350F', maxWidth: 480, margin: '0 auto 16px' }}>
                La base de données est vide. Lancez la première collecte RSS depuis l&apos;administration pour récupérer les articles.
              </p>
              <Link href="/admin" style={{
                display: 'inline-block', background: 'var(--red)', color: '#fff',
                padding: '10px 22px', borderRadius: 6, textDecoration: 'none', fontWeight: 600, fontSize: 14
              }}>
                🔄 Aller dans l&apos;administration →
              </Link>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 32, alignItems: 'start' }} className="grid-sidebar">
            {/* Colonne principale */}
            <div>
              {/* Essentiel */}
              <section style={{ marginBottom: 40 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <h2 style={{ fontFamily: 'Source Serif 4,serif', fontSize: 22, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ width: 4, height: 24, background: 'var(--red)', borderRadius: 2, display: 'inline-block' }} />
                    L&apos;essentiel aujourd&apos;hui
                  </h2>
                  <Link href="/canada" style={{ fontSize: 13, color: 'var(--red)', textDecoration: 'none' }}>Tout voir →</Link>
                </div>
                {top.length === 0 ? (
                  <EmptySection label="Collecte en attente" />
                ) : (
                  <div style={{ display: 'grid', gap: 12 }}>
                    {top.map((a: Article) => <ArticleCard key={a.id} article={a} />)}
                  </div>
                )}
              </section>

              {/* NB */}
              <section>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <h2 style={{ fontFamily: 'Source Serif 4,serif', fontSize: 22, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ width: 4, height: 24, background: 'var(--nb)', borderRadius: 2, display: 'inline-block' }} />
                    Nouveau-Brunswick
                  </h2>
                  <Link href="/nouveau-brunswick" style={{ fontSize: 13, color: 'var(--red)', textDecoration: 'none' }}>Tout voir →</Link>
                </div>
                {nb.length === 0 ? (
                  <EmptySection label="Collecte en attente" />
                ) : (
                  <div style={{ display: 'grid', gap: 12 }}>
                    {nb.map((a: Article) => <ArticleCard key={a.id} article={a} />)}
                  </div>
                )}
              </section>
            </div>

            {/* Sidebar */}
            <aside style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* À surveiller */}
              <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
                <div style={{ background: 'var(--nb)', padding: '12px 16px' }}>
                  <h3 style={{ fontFamily: 'Source Serif 4,serif', color: '#fff', fontSize: 15, fontWeight: 700 }}>⚑ À surveiller</h3>
                </div>
                <div style={{ padding: '0 16px' }}>
                  {watch.slice(0, 4).map((item: { id: string; title: string; type: string; description?: string }) => (
                    <div key={item.id} style={{ padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
                      <div style={{ fontSize: 11, color: 'var(--red)', fontWeight: 600, textTransform: 'uppercase', marginBottom: 4 }}>
                        {item.type === 'immigration' ? 'Immigration' : item.type === 'budget' ? 'Budget' : 'Date importante'}
                      </div>
                      <div style={{ fontSize: 14, fontWeight: 600 }}>{item.title}</div>
                      {item.description && <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 3, lineHeight: 1.5 }}>{item.description.substring(0, 90)}…</div>}
                    </div>
                  ))}
                </div>
                <div style={{ padding: '12px 16px' }}>
                  <Link href="/a-surveiller" style={{ fontSize: 13, color: 'var(--red)', textDecoration: 'none', fontWeight: 600 }}>Tout voir →</Link>
                </div>
              </div>

              {/* Villes NB */}
              <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10, padding: '16px' }}>
                <h3 style={{ fontFamily: 'Source Serif 4,serif', fontSize: 15, fontWeight: 700, marginBottom: 12 }}>📍 Villes du NB</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                  {['Moncton', 'Dieppe', 'Fredericton', 'Saint John', 'Edmundston', 'Campbellton'].map(c => (
                    <Link key={c} href={`/nouveau-brunswick?ville=${c}`} style={{
                      padding: '7px 10px', background: 'var(--bg)', borderRadius: 6, fontSize: 13,
                      textDecoration: 'none', color: 'var(--text)', textAlign: 'center'
                    }}>{c}</Link>
                  ))}
                </div>
              </div>

              {/* Immigration rapide */}
              <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10, padding: '16px' }}>
                <h3 style={{ fontFamily: 'Source Serif 4,serif', fontSize: 15, fontWeight: 700, marginBottom: 12 }}>✈️ Immigration</h3>
                {[
                  ['Entrée express', '/immigration#entree-express'],
                  ['NBPNP', '/immigration#nbpnp'],
                  ['Francophonie', '/immigration#francophonie'],
                  ['IRCC / Canada', '/immigration#immigration-canada'],
                ].map(([label, href]) => (
                  <Link key={href} href={href} style={{
                    display: 'flex', justifyContent: 'space-between', padding: '8px 0',
                    borderBottom: '1px solid var(--border)', fontSize: 13, textDecoration: 'none', color: 'var(--text)'
                  }}>
                    {label} <span style={{ color: 'var(--red)' }}>→</span>
                  </Link>
                ))}
              </div>
            </aside>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}

function EmptySection({ label }: { label: string }) {
  return (
    <div style={{ padding: '28px 16px', textAlign: 'center', background: 'var(--card)', border: '1px dashed var(--border)', borderRadius: 8 }}>
      <div style={{ fontSize: 28, marginBottom: 6 }}>🔄</div>
      <div style={{ fontSize: 14, color: 'var(--text-muted)' }}>{label}</div>
    </div>
  )
}
