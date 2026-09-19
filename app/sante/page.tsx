import Header from '@/components/Header'
import Footer from '@/components/Footer'
import ArticleCard, { Article } from '@/components/ArticleCard'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

const CONFIG: Record<string, { title: string; desc: string; icon: string; slugs: string[]; color: string }> = {
  politique: { title: 'Politique', desc: 'Politique provinciale et fédérale canadienne', icon: '🏛️', slugs: ['politique-nb','politique-federale','gouvernement-nb','gouvernement-federal'], color: '#1E3A5F' },
  emploi: { title: 'Emploi', desc: 'Marché du travail, salaires, recrutement', icon: '💼', slugs: ['emploi-nb','emploi'], color: '#15803D' },
  logement: { title: 'Logement', desc: 'Loyers, immobilier, aides au logement', icon: '🏠', slugs: ['logement-nb','logement'], color: '#B45309' },
  economie: { title: 'Économie', desc: 'Inflation, taux d\'intérêt, finances', icon: '📊', slugs: ['economie','economie-nb','taux-interet','inflation'], color: '#7C3AED' },
  sante: { title: 'Santé', desc: 'Services de santé, hôpitaux, médecins', icon: '🏥', slugs: ['sante','sante-nb'], color: '#C8102E' },
  canada: { title: 'Canada', desc: 'Toutes les actualités nationales', icon: '🍁', slugs: ['actualites','gouvernement-federal','politique-federale','economie'], color: '#C8102E' },
}

const SLUG = 'sante'

export default async function Page() {
  const c = CONFIG[SLUG]
  const articles = await prisma.article.findMany({
    where: {
      status: { in: ['published','pinned'] },
      OR: c.slugs.map(s => ({ category: { slug: s } }))
    },
    include: { source: { select: { name: true } }, category: { select: { name: true, slug: true } } },
    orderBy: [{ importanceScore: 'desc' }, { publishedAt: 'desc' }],
    take: 30,
  }).catch(() => [])

  return (
    <>
      <Header />
      <main>
        <div style={{ background: c.color, color: '#fff', padding: '36px 16px' }}>
          <div className="container">
            <h1 style={{ fontFamily: 'Source Serif 4,serif', fontSize: 'clamp(22px,4vw,36px)', fontWeight: 700, marginBottom: 6 }}>
              {c.icon} {c.title}
            </h1>
            <p style={{ color: 'rgba(255,255,255,.8)', fontSize: 15 }}>{c.desc}</p>
          </div>
        </div>
        <div className="container" style={{ padding: '24px 16px' }}>
          {articles.length === 0 ? (
            <div style={{ padding: '48px 24px', textAlign: 'center', background: '#fff', border: '1px dashed #E5E7EB', borderRadius: 10 }}>
              <div style={{ fontSize: 32, marginBottom: 10 }}>🔄</div>
              <h2 style={{ fontFamily: 'Source Serif 4,serif', fontSize: 18, fontWeight: 600, marginBottom: 8 }}>Collecte en attente</h2>
              <p style={{ fontSize: 14, color: '#6B7280', maxWidth: 360, margin: '0 auto 16px' }}>
                Lancez une collecte depuis l&apos;administration pour récupérer les articles.
              </p>
              <Link href="/admin" style={{ display: 'inline-block', background: '#C8102E', color: '#fff', padding: '9px 20px', borderRadius: 6, textDecoration: 'none', fontWeight: 600, fontSize: 14 }}>
                Administration →
              </Link>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: 12 }}>
              {articles.map((a: Article) => <ArticleCard key={a.id} article={a} />)}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
