import Header from '@/components/Header'
import Footer from '@/components/Footer'
import ArticleCard, { Article } from '@/components/ArticleCard'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'

export const revalidate = 1800
export const metadata = { title: 'Immigration Canada — Entrée express, NBPNP, francophonie' }

const SECTIONS = [
  { id: 'entree-express', label: 'Entrée express', slug: 'entree-express', color: '#C8102E', icon: '🎯' },
  { id: 'nbpnp', label: 'NBPNP — Nouveau-Brunswick', slug: 'nbpnp', color: '#1E3A5F', icon: '📋' },
  { id: 'francophonie', label: 'Francophonie', slug: 'francophonie', color: '#15803D', icon: '🇫🇷' },
  { id: 'immigration-nb', label: 'Immigration NB', slug: 'immigration-nb', color: '#1E3A5F', icon: '📍' },
  { id: 'immigration-canada', label: 'IRCC / Canada', slug: 'immigration-canada', color: '#7C3AED', icon: '🍁' },
]

export default async function ImmigrationPage() {
  const allArticles = await prisma.article.findMany({
    where: {
      status: { in: ['published','pinned'] },
      OR: SECTIONS.map(s => ({ category: { slug: s.slug } }))
    },
    include: { source: { select: { name: true } }, category: { select: { name: true, slug: true } } },
    orderBy: [{ importanceScore: 'desc' }, { publishedAt: 'desc' }],
    take: 100,
  }).catch(() => [])

  const watchItems = await prisma.watchItem.findMany({ where: { active: true, type: 'immigration' }, orderBy: { priority: 'desc' } }).catch(() => [])

  const bySlug = (slug: string) => allArticles.filter((a: Article & { category?: { slug: string } | null }) => a.category?.slug === slug).slice(0, 6)

  return (
    <>
      <Header />
      <main>
        <div style={{ background: 'linear-gradient(135deg,#7C3AED,#C8102E)', color: '#fff', padding: '40px 16px' }}>
          <div className="container">
            <h1 style={{ fontFamily: 'Source Serif 4,serif', fontSize: 'clamp(22px,4vw,38px)', fontWeight: 700, marginBottom: 10 }}>✈️ Immigration Canada</h1>
            <p style={{ color: 'rgba(255,255,255,.8)', fontSize: 15, marginBottom: 18 }}>Entrée express, résidence permanente, NBPNP, francophonie et permis.</p>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {SECTIONS.map(s => <a key={s.id} href={`#${s.id}`} style={{ background: 'rgba(255,255,255,.15)', color: '#fff', padding: '5px 12px', borderRadius: 20, fontSize: 12, textDecoration: 'none', border: '1px solid rgba(255,255,255,.2)' }}>{s.icon} {s.label}</a>)}
            </div>
          </div>
        </div>

        <div className="container" style={{ padding: '28px 16px', display: 'grid', gridTemplateColumns: '1fr 280px', gap: 28, alignItems: 'start' }} >
          <div>
            {SECTIONS.map(section => {
              const articles = bySlug(section.slug)
              return (
                <section key={section.id} id={section.id} style={{ marginBottom: 40, scrollMarginTop: 120 }}>
                  <h2 style={{ fontFamily: 'Source Serif 4,serif', fontSize: 20, fontWeight: 700, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ width: 4, height: 22, background: section.color, borderRadius: 2, display: 'inline-block' }} />
                    {section.icon} {section.label}
                  </h2>
                  {articles.length === 0 ? (
                    <div style={{ padding: '16px', background: '#F9FAFB', borderRadius: 8, border: '1px dashed #E5E7EB', fontSize: 13, color: '#9CA3AF', textAlign: 'center' }}>
                      Collecte en attente pour cette catégorie
                    </div>
                  ) : (
                    <div style={{ display: 'grid', gap: 10 }}>
                      {articles.map((a: Article) => <ArticleCard key={a.id} article={a} />)}
                    </div>
                  )}
                </section>
              )
            })}
          </div>

          <aside style={{ position: 'sticky', top: 120, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ background: '#fff', border: '2px solid #C8102E', borderRadius: 10, overflow: 'hidden' }}>
              <div style={{ background: '#C8102E', padding: '12px 16px' }}>
                <h3 style={{ fontFamily: 'Source Serif 4,serif', color: '#fff', fontSize: 14, fontWeight: 700 }}>⚑ À surveiller</h3>
              </div>
              <div style={{ padding: '0 16px' }}>
                {watchItems.length === 0 ? <div style={{ padding: '14px 0', fontSize: 13, color: '#9CA3AF' }}>Aucune échéance</div> :
                  watchItems.map(item => (
                    <div key={item.id} style={{ padding: '12px 0', borderBottom: '1px solid #E5E7EB' }}>
                      <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 3 }}>{item.title}</div>
                      {item.description && <div style={{ fontSize: 12, color: '#6B7280', lineHeight: 1.5 }}>{item.description.substring(0,100)}…</div>}
                    </div>
                  ))
                }
              </div>
              <div style={{ padding: '10px 16px' }}><Link href="/a-surveiller" style={{ fontSize: 13, color: '#C8102E', textDecoration: 'none', fontWeight: 600 }}>Tout voir →</Link></div>
            </div>
            <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 10, padding: '16px' }}>
              <h3 style={{ fontFamily: 'Source Serif 4,serif', fontSize: 14, fontWeight: 700, marginBottom: 10 }}>🔗 Liens officiels</h3>
              {[['IRCC','https://www.canada.ca/fr/immigration-refugies-citoyennete.html'],['Entrée express','https://www.canada.ca/fr/immigration-refugies-citoyennete/services/entree-express.html'],['NBPNP','https://www2.gnb.ca/content/gnb/fr/services/services_renderer.201468.Immigration.html'],['Permis travail','https://www.canada.ca/fr/immigration-refugies-citoyennete/services/travailler-canada.html']].map(([l,h]) => (
                <a key={h} href={h} target="_blank" rel="noopener" style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid #E5E7EB', fontSize: 13, color: '#374151', textDecoration: 'none' }}>
                  {l} <span style={{ color: '#C8102E' }}>↗</span>
                </a>
              ))}
            </div>
          </aside>
        </div>
      </main>
      <Footer />
    </>
  )
}
