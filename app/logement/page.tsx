import Header from '@/components/Header'
import Footer from '@/components/Footer'
import ArticleCard from '@/components/ArticleCard'
import Link from 'next/link'

const PAGE_CONFIG: Record<string, { title: string; desc: string; icon: string; catSlugs: string[]; color: string }> = {
  politique: { title: 'Politique', desc: 'Politique provinciale NB et politique fédérale canadienne', icon: '🏛️', catSlugs: ['politique-nb', 'politique-federale', 'gouvernement-nb', 'gouvernement-federal'], color: '#1E3A5F' },
  emploi: { title: 'Emploi', desc: 'Marché du travail, offres d\'emploi, salaires et pénuries de main-d\'œuvre', icon: '💼', catSlugs: ['emploi-nb', 'emploi'], color: '#15803D' },
  logement: { title: 'Logement', desc: 'Loyers, immobilier, aides au logement et marché hypothécaire', icon: '🏠', catSlugs: ['logement-nb', 'logement'], color: '#B45309' },
  economie: { title: 'Économie', desc: 'Inflation, taux d\'intérêt, statistiques économiques et finances personnelles', icon: '📊', catSlugs: ['economie', 'economie-nb', 'taux-interet', 'inflation', 'fiscalite'], color: '#7C3AED' },
  sante: { title: 'Santé', desc: 'Services de santé, médecins, hôpitaux et politiques de santé au Canada', icon: '🏥', catSlugs: ['sante', 'sante-nb'], color: '#D80621' },
  canada: { title: 'Canada', desc: 'Toutes les actualités nationales du Canada', icon: '🍁', catSlugs: ['actualites', 'gouvernement-federal', 'politique-federale', 'economie'], color: '#D80621' },
}

const SLUG = 'logement'

async function getArticles(slugs: string[]) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    const results = await Promise.all(
      slugs.slice(0, 3).map(slug =>
        fetch(`${baseUrl}/api/articles?category=${slug}&limit=6`, { next: { revalidate: 1800 } })
          .then(r => r.ok ? r.json() : { articles: [] })
          .then(d => ({ slug, articles: d.articles || [] }))
          .catch(() => ({ slug, articles: [] }))
      )
    )
    return results
  } catch { return [] }
}

export const metadata = {
  title: `${PAGE_CONFIG[SLUG]?.title} — Infos Canada`,
  description: PAGE_CONFIG[SLUG]?.desc,
}

export default async function Page() {
  const config = PAGE_CONFIG[SLUG]
  const sectionData = await getArticles(config.catSlugs)

  return (
    <>
      <Header />
      <main>
        <div style={{ background: config.color, color: '#fff', padding: '44px 0' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px' }}>
            <h1 style={{ fontFamily: "'Source Serif 4', serif", fontSize: 'clamp(26px, 4vw, 40px)', fontWeight: 700, color: '#fff', marginBottom: 10 }}>
              {config.icon} {config.title}
            </h1>
            <p style={{ color: 'rgba(255,255,255,.8)', fontSize: 16, maxWidth: 600 }}>{config.desc}</p>
          </div>
        </div>

        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 20px' }}>
          {sectionData.map(({ slug, articles }) => (
            articles.length > 0 && (
              <section key={slug} style={{ marginBottom: 48 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
                  <h2 style={{ fontFamily: "'Source Serif 4', serif", fontSize: 20, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ display: 'inline-block', width: 4, height: 22, background: config.color, borderRadius: 2 }} />
                    {slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                  </h2>
                  <Link href={`/?category=${slug}`} style={{ fontSize: 13, color: 'var(--red)', textDecoration: 'none', fontWeight: 500 }}>Tout voir →</Link>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 14 }}>
                  {articles.map((a: Parameters<typeof ArticleCard>[0]['article']) => (
                    <ArticleCard key={a.id} article={a} />
                  ))}
                </div>
              </section>
            )
          ))}
          {sectionData.every(s => s.articles.length === 0) && (
            <div style={{ padding: '60px 24px', textAlign: 'center' }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🔄</div>
              <div style={{ fontFamily: "'Source Serif 4', serif", fontSize: 20, fontWeight: 600, marginBottom: 8 }}>Collecte en cours</div>
              <p style={{ fontSize: 14, color: 'var(--text-muted)', maxWidth: 400, margin: '0 auto' }}>
                Les articles seront disponibles après la première collecte automatique. Lancez une collecte depuis l&apos;administration.
              </p>
              <Link href="/admin" style={{ display: 'inline-block', marginTop: 16, background: 'var(--red)', color: '#fff', padding: '10px 20px', borderRadius: 6, textDecoration: 'none', fontSize: 14, fontWeight: 600 }}>
                Administration →
              </Link>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
