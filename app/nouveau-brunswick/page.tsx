import Header from '@/components/Header'
import Footer from '@/components/Footer'
import ArticleCard from '@/components/ArticleCard'
import Link from 'next/link'

export const metadata = {
  title: 'Nouveau-Brunswick — Actualités, immigration, emploi et logement',
  description: 'Toutes les actualités du Nouveau-Brunswick : immigration, NBPNP, emploi, logement, santé et politique provinciale.',
}

const CATEGORIES_NB = [
  { slug: 'all', label: 'Tout', icon: '📰' },
  { slug: 'gouvernement-nb', label: 'Gouvernement', icon: '🏛️' },
  { slug: 'immigration-nb', label: 'Immigration', icon: '✈️' },
  { slug: 'nbpnp', label: 'NBPNP', icon: '📋' },
  { slug: 'emploi-nb', label: 'Emploi', icon: '💼' },
  { slug: 'logement-nb', label: 'Logement', icon: '🏠' },
  { slug: 'sante-nb', label: 'Santé', icon: '🏥' },
  { slug: 'actualites-nb', label: 'Actualités locales', icon: '📍' },
]

const VILLES = ['Moncton', 'Dieppe', 'Fredericton', 'Saint John', 'Edmundston']

async function getNBArticles(category?: string, city?: string) {
  try {
    const params = new URLSearchParams({ province: 'NB', limit: '30' })
    if (category && category !== 'all') params.set('category', category)
    if (city) params.set('city', city)
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    const res = await fetch(`${baseUrl}/api/articles?${params}`, { next: { revalidate: 1800 } })
    if (!res.ok) return []
    const data = await res.json()
    return data.articles || []
  } catch { return [] }
}

export default async function NouveauBrunswickPage({
  searchParams
}: {
  searchParams: Promise<{ categorie?: string; ville?: string }>
}) {
  const params = await searchParams
  const activeCategory = params.categorie || 'all'
  const activeCity = params.ville

  const articles = await getNBArticles(activeCategory, activeCity)

  return (
    <>
      <Header />
      <main>
        {/* Hero NB */}
        <div style={{ background: '#1E3A5F', color: '#fff', padding: '40px 0' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px' }}>
            <div style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,.6)', marginBottom: 10 }}>Province</div>
            <h1 style={{ fontFamily: "'Source Serif 4', serif", fontSize: 'clamp(26px, 4vw, 42px)', fontWeight: 700, color: '#F8FAFC', marginBottom: 12 }}>
              Nouveau-Brunswick
            </h1>
            <p style={{ color: 'rgba(255,255,255,.75)', fontSize: 16, maxWidth: 600 }}>
              Immigration, emploi, logement, santé — toutes les actualités essentielles de la province, avec les informations les plus importantes en premier.
            </p>
          </div>
        </div>

        {/* Filtres */}
        <div style={{ background: 'var(--white)', borderBottom: '1px solid var(--border)', position: 'sticky', top: 110, zIndex: 50 }}>
          <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px', overflowX: 'auto' }}>
            <div style={{ display: 'flex', gap: 0 }}>
              {CATEGORIES_NB.map(cat => {
                const active = activeCategory === cat.slug
                return (
                  <Link key={cat.slug} href={`/nouveau-brunswick?categorie=${cat.slug}${activeCity ? `&ville=${activeCity}` : ''}`}
                    style={{ padding: '12px 16px', fontSize: 13, color: active ? 'var(--red)' : 'var(--text)', fontWeight: active ? 600 : 400, textDecoration: 'none', borderBottom: active ? '2px solid var(--red)' : '2px solid transparent', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 6 }}>
                    {cat.icon} {cat.label}
                  </Link>
                )
              })}
            </div>
          </div>
        </div>

        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 36, alignItems: 'start' }}>
            {/* Articles */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h2 style={{ fontFamily: "'Source Serif 4', serif", fontSize: 20, fontWeight: 700 }}>
                  {activeCity ? `📍 ${activeCity}` : CATEGORIES_NB.find(c => c.slug === activeCategory)?.label || 'Toutes les actualités'}
                  <span style={{ fontSize: 14, fontWeight: 400, color: 'var(--text-muted)', marginLeft: 10 }}>{articles.length} article{articles.length > 1 ? 's' : ''}</span>
                </h2>
              </div>

              {articles.length === 0 ? (
                <div style={{ padding: '48px 24px', textAlign: 'center', background: 'var(--white)', border: '1px dashed var(--border)', borderRadius: 10 }}>
                  <div style={{ fontSize: 36, marginBottom: 12 }}>📭</div>
                  <div style={{ fontFamily: "'Source Serif 4', serif", fontSize: 18, fontWeight: 600, marginBottom: 8 }}>Pas encore d&apos;article</div>
                  <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>Lancez une collecte depuis l&apos;administration pour remplir la base de données.</p>
                </div>
              ) : (
                <div style={{ display: 'grid', gap: 14 }}>
                  {articles.map((a: Parameters<typeof ArticleCard>[0]['article']) => (
                    <ArticleCard key={a.id} article={a} />
                  ))}
                </div>
              )}
            </div>

            {/* Sidebar */}
            <aside style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Villes */}
              <div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 10, padding: '18px' }}>
                <h3 style={{ fontFamily: "'Source Serif 4', serif", fontSize: 15, fontWeight: 700, marginBottom: 12 }}>📍 Filtrer par ville</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Link href={`/nouveau-brunswick?categorie=${activeCategory}`}
                    style={{ padding: '8px 10px', borderRadius: 6, fontSize: 13, textDecoration: 'none', color: !activeCity ? 'var(--red)' : 'var(--text)', background: !activeCity ? '#FEF2F2' : 'transparent', fontWeight: !activeCity ? 600 : 400 }}>
                    Tout le Nouveau-Brunswick
                  </Link>
                  {VILLES.map(v => (
                    <Link key={v} href={`/nouveau-brunswick?categorie=${activeCategory}&ville=${v}`}
                      style={{ padding: '8px 10px', borderRadius: 6, fontSize: 13, textDecoration: 'none', color: activeCity === v ? 'var(--red)' : 'var(--text)', background: activeCity === v ? '#FEF2F2' : 'transparent', fontWeight: activeCity === v ? 600 : 400 }}>
                      {v}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Liens utiles NB */}
              <div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 10, padding: '18px' }}>
                <h3 style={{ fontFamily: "'Source Serif 4', serif", fontSize: 15, fontWeight: 700, marginBottom: 12 }}>🔗 Liens officiels NB</h3>
                {[
                  { href: 'https://www.gnb.ca', label: 'Gouvernement NB' },
                  { href: 'https://www.tourismenouveau-brunswick.com', label: 'Immigration NB' },
                  { href: 'https://www.moncton.ca', label: 'Ville de Moncton' },
                  { href: 'https://www.fredericton.ca', label: 'Ville de Fredericton' },
                  { href: 'https://www2.gnb.ca/content/gnb/fr/services/services_renderer.201468.Immigration.html', label: 'NBPNP officiel' },
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
