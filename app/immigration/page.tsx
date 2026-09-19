import Header from '@/components/Header'
import Footer from '@/components/Footer'
import ArticleCard from '@/components/ArticleCard'
import Link from 'next/link'

export const metadata = {
  title: 'Immigration Canada — Entrée express, NBPNP, francophonie et résidence permanente',
  description: 'Suivez les dernières nouvelles sur l\'immigration au Canada : Entrée express, tirages francophones, Programme des candidats du Nouveau-Brunswick (NBPNP) et IRCC.',
}

const IMMI_SECTIONS = [
  { id: 'entree-express', label: 'Entrée express', slug: 'entree-express', color: '#D80621', icon: '🎯' },
  { id: 'nbpnp', label: 'Programme NB (NBPNP)', slug: 'nbpnp', color: '#1E3A5F', icon: '📋' },
  { id: 'francophonie', label: 'Francophonie', slug: 'francophonie', color: '#15803D', icon: '🇫🇷' },
  { id: 'immigration-nb', label: 'Immigration NB', slug: 'immigration-nb', color: '#1E3A5F', icon: '📍' },
  { id: 'immigration-canada', label: 'IRCC / Canada', slug: 'immigration-canada', color: '#7C3AED', icon: '🍁' },
]

async function getImmigrationArticles(categorySlug: string, limit = 8) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    const res = await fetch(`${baseUrl}/api/articles?category=${categorySlug}&limit=${limit}`, { next: { revalidate: 1800 } })
    if (!res.ok) return []
    return (await res.json()).articles || []
  } catch { return [] }
}

async function getWatchItems() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    const res = await fetch(`${baseUrl}/api/watch`, { next: { revalidate: 3600 } })
    if (!res.ok) return []
    return (await res.json()).items?.filter((i: { type: string }) => i.type === 'immigration') || []
  } catch { return [] }
}

export default async function ImmigrationPage() {
  const [eeArticles, nbpnpArticles, francoArticles, nbArticles, irccArticles, watchItems] = await Promise.all([
    getImmigrationArticles('entree-express'),
    getImmigrationArticles('nbpnp'),
    getImmigrationArticles('francophonie'),
    getImmigrationArticles('immigration-nb'),
    getImmigrationArticles('immigration-canada'),
    getWatchItems(),
  ])

  return (
    <>
      <Header />
      <main>
        {/* Hero Immigration */}
        <div style={{ background: 'linear-gradient(135deg, #7C3AED 0%, #D80621 100%)', color: '#fff', padding: '44px 0' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px' }}>
            <div style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,.7)', marginBottom: 10 }}>Section</div>
            <h1 style={{ fontFamily: "'Source Serif 4', serif", fontSize: 'clamp(26px, 4vw, 42px)', fontWeight: 700, color: '#fff', marginBottom: 12 }}>
              Immigration Canada
            </h1>
            <p style={{ color: 'rgba(255,255,255,.8)', fontSize: 16, maxWidth: 640, marginBottom: 20 }}>
              Entrée express, résidence permanente, permis de travail, permis d&apos;études, citoyenneté — et focus sur le Nouveau-Brunswick et la francophonie.
            </p>
            {/* Quick nav */}
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {IMMI_SECTIONS.map(s => (
                <a key={s.id} href={`#${s.id}`} style={{ background: 'rgba(255,255,255,.15)', color: '#fff', padding: '6px 14px', borderRadius: 20, fontSize: 13, textDecoration: 'none', border: '1px solid rgba(255,255,255,.2)' }}>
                  {s.icon} {s.label}
                </a>
              ))}
            </div>
          </div>
        </div>

        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 40, alignItems: 'start' }}>
            <div>
              {IMMI_SECTIONS.map((section, idx) => {
                const articles = [eeArticles, nbpnpArticles, francoArticles, nbArticles, irccArticles][idx]
                return (
                  <section key={section.id} id={section.id} style={{ marginBottom: 48, scrollMarginTop: 160 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                      <h2 style={{ fontFamily: "'Source Serif 4', serif", fontSize: 22, fontWeight: 700, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ display: 'inline-block', width: 4, height: 24, background: section.color, borderRadius: 2 }} />
                        {section.icon} {section.label}
                      </h2>
                      <Link href={`/canada?category=${section.slug}`} style={{ fontSize: 13, color: 'var(--red)', textDecoration: 'none', fontWeight: 500 }}>Tout voir →</Link>
                    </div>
                    {articles.length === 0 ? (
                      <div style={{ padding: '32px 20px', background: 'var(--white)', border: '1px dashed var(--border)', borderRadius: 8, textAlign: 'center' }}>
                        <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                          Aucun article pour le moment. La collecte s&apos;effectue automatiquement plusieurs fois par jour.
                        </div>
                      </div>
                    ) : (
                      <div style={{ display: 'grid', gap: 14 }}>
                        {articles.map((a: Parameters<typeof ArticleCard>[0]['article']) => (
                          <ArticleCard key={a.id} article={a} />
                        ))}
                      </div>
                    )}
                  </section>
                )
              })}
            </div>

            {/* Sidebar Immigration */}
            <aside style={{ display: 'flex', flexDirection: 'column', gap: 20, position: 'sticky', top: 160 }}>
              {/* À surveiller */}
              <div id="a-surveiller" style={{ background: 'var(--white)', border: '2px solid var(--red)', borderRadius: 10, overflow: 'hidden' }}>
                <div style={{ background: 'var(--red)', padding: '14px 18px' }}>
                  <h3 style={{ fontFamily: "'Source Serif 4', serif", color: '#fff', fontSize: 16, fontWeight: 700 }}>⚑ À surveiller</h3>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,.8)' }}>Prochaines échéances immigration</div>
                </div>
                <div style={{ padding: '0 18px' }}>
                  {watchItems.length === 0 ? (
                    <div style={{ padding: '16px 0', fontSize: 13, color: 'var(--text-muted)' }}>Aucune échéance enregistrée.</div>
                  ) : watchItems.map((item: { id: string; title: string; description?: string; dueDate?: string }) => (
                    <div key={item.id} style={{ padding: '14px 0', borderBottom: '1px solid var(--border)' }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>{item.title}</div>
                      {item.dueDate && (
                        <div style={{ fontSize: 12, color: 'var(--red)', fontWeight: 600 }}>
                          📅 {new Date(item.dueDate).toLocaleDateString('fr-CA')}
                        </div>
                      )}
                      {item.description && <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5, marginTop: 4 }}>{item.description.substring(0, 120)}…</div>}
                    </div>
                  ))}
                </div>
              </div>

              {/* Liens officiels */}
              <div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 10, padding: '18px' }}>
                <h3 style={{ fontFamily: "'Source Serif 4', serif", fontSize: 15, fontWeight: 700, marginBottom: 12 }}>🔗 Sources officielles</h3>
                {[
                  { href: 'https://www.canada.ca/fr/immigration-refugies-citoyennete.html', label: 'IRCC — Immigration Canada' },
                  { href: 'https://www.canada.ca/fr/immigration-refugies-citoyennete/services/entree-express.html', label: 'Entrée express officiel' },
                  { href: 'https://www2.gnb.ca/content/gnb/fr/services/services_renderer.201468.Immigration.html', label: 'NBPNP — Programme NB' },
                  { href: 'https://www.canada.ca/fr/immigration-refugies-citoyennete/services/travailler-canada.html', label: 'Permis de travail' },
                  { href: 'https://www.canada.ca/fr/immigration-refugies-citoyennete/services/etudier-canada.html', label: 'Permis d\'études' },
                ].map(l => (
                  <a key={l.href} href={l.href} target="_blank" rel="noopener" style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', fontSize: 13, color: 'var(--text)', textDecoration: 'none', borderBottom: '1px solid var(--border)' }}>
                    {l.label} <span style={{ color: 'var(--red)' }}>↗</span>
                  </a>
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
