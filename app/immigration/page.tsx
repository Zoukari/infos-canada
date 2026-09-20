import Header from '@/components/Header'
import Footer from '@/components/Footer'
import ArticleCard, { Article } from '@/components/ArticleCard'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Immigration Canada — Entrée express, NBPNP, francophonie' }

const SECTIONS = [
  { id: 'entree-express', label: 'Entrée express', slug: 'entree-express' },
  { id: 'nbpnp', label: 'NBPNP — Nouveau-Brunswick', slug: 'nbpnp' },
  { id: 'francophonie', label: 'Francophonie', slug: 'francophonie' },
  { id: 'immigration-nb', label: 'Immigration NB', slug: 'immigration-nb' },
  { id: 'immigration-canada', label: 'IRCC / Canada', slug: 'immigration-canada' },
]

export default async function ImmigrationPage() {
  const allArticles = await prisma.article.findMany({
    where: { status: { in: ['published','pinned'] }, OR: SECTIONS.map(s => ({ category: { slug: s.slug } })) },
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
        <div className="page-header">
          <div className="container">
            <h1 style={{ fontFamily: 'Source Serif 4,serif', fontSize: 'clamp(24px,4vw,36px)', fontWeight: 600, marginBottom: 8, color: 'var(--ink)' }}>Immigration Canada</h1>
            <p style={{ color: 'var(--ink-soft)', fontSize: 15, marginBottom: 18 }}>Entrée express, résidence permanente, NBPNP, francophonie et permis.</p>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {SECTIONS.map(s => <a key={s.id} href={`#${s.id}`} style={{ background: 'var(--red-tint)', color: 'var(--red)', padding: '5px 12px', borderRadius: 20, fontSize: 12, textDecoration: 'none', fontWeight: 500 }}>{s.label}</a>)}
            </div>
          </div>
        </div>

        <div className="container grid-sidebar" style={{ padding: '32px 20px', display: 'grid', gridTemplateColumns: '1fr 280px', gap: 32, alignItems: 'start' }}>
          <div>
            {SECTIONS.map(section => {
              const articles = bySlug(section.slug)
              return (
                <section key={section.id} id={section.id} style={{ marginBottom: 44, scrollMarginTop: 120 }}>
                  <h2 style={{ fontFamily: 'Source Serif 4,serif', fontSize: 19, fontWeight: 600, marginBottom: 14, color: 'var(--ink)', borderBottom: '2px solid var(--ink)', paddingBottom: 10 }}>
                    {section.label}
                  </h2>
                  {articles.length === 0 ? (
                    <div style={{ padding: '16px', background: 'var(--card)', borderRadius: 6, border: '1px dashed var(--border)', fontSize: 13, color: '#9C9C9C', textAlign: 'center' }}>
                      Collecte en attente pour cette catégorie
                    </div>
                  ) : (
                    <div style={{ display: 'grid', gap: 12 }}>
                      {articles.map((a: Article) => <ArticleCard key={a.id} article={a} />)}
                    </div>
                  )}
                </section>
              )
            })}
          </div>

          <aside style={{ position: 'sticky', top: 120, display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div id="a-surveiller" style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 6 }}>
              <div style={{ padding: '13px 16px', borderBottom: '1px solid var(--border-soft)' }}>
                <h3 style={{ fontFamily: 'Source Serif 4,serif', fontSize: 15, fontWeight: 600, color: 'var(--ink)' }}>À surveiller</h3>
              </div>
              <div style={{ padding: '0 16px' }}>
                {watchItems.length === 0 ? <div style={{ padding: '14px 0', fontSize: 13, color: '#9C9C9C' }}>Aucune échéance</div> :
                  watchItems.map((item: { id: string; title: string; description?: string | null }) => (
                    <div key={item.id} style={{ padding: '12px 0', borderBottom: '1px solid var(--border-soft)' }}>
                      <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 3 }}>{item.title}</div>
                      {item.description && <div style={{ fontSize: 12, color: '#9C9C9C', lineHeight: 1.5 }}>{item.description.substring(0,100)}…</div>}
                    </div>
                  ))
                }
              </div>
              <div style={{ padding: '11px 16px' }}><Link href="/a-surveiller" style={{ fontSize: 13, color: 'var(--red)', textDecoration: 'none', fontWeight: 500 }}>Tout voir →</Link></div>
            </div>
            <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 6, padding: '16px' }}>
              <h3 style={{ fontFamily: 'Source Serif 4,serif', fontSize: 15, fontWeight: 600, marginBottom: 10, color: 'var(--ink)' }}>Liens officiels</h3>
              {[['IRCC','https://www.canada.ca/fr/immigration-refugies-citoyennete.html'],['Entrée express','https://www.canada.ca/fr/immigration-refugies-citoyennete/services/entree-express.html'],['NBPNP','https://www2.gnb.ca/content/gnb/fr/services/services_renderer.201468.Immigration.html']].map(([l,h]) => (
                <a key={h} href={h} target="_blank" rel="noopener" style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid var(--border-soft)', fontSize: 13, color: 'var(--ink-soft)', textDecoration: 'none' }}>
                  {l} <span style={{ color: 'var(--red)' }}>↗</span>
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
