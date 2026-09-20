import Header from '@/components/Header'
import Footer from '@/components/Footer'
import ArticleCard, { Article } from '@/components/ArticleCard'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

const CONFIG: Record<string, { title: string; desc: string; slugs: string[]; accent: string }> = {
  politique: { title: 'Politique', desc: 'Politique provinciale et fédérale canadienne', slugs: ['politique-nb','politique-federale','gouvernement-nb','gouvernement-federal'], accent: 'var(--nb)' },
  emploi: { title: 'Emploi', desc: 'Marché du travail, salaires, recrutement', slugs: ['emploi-nb','emploi'], accent: '#3D7A4D' },
  logement: { title: 'Logement', desc: 'Loyers, immobilier, aides au logement', slugs: ['logement-nb','logement'], accent: 'var(--gold)' },
  economie: { title: 'Économie', desc: 'Inflation, taux d\'intérêt, finances', slugs: ['economie','economie-nb','taux-interet','inflation'], accent: '#6B4C9A' },
  sante: { title: 'Santé', desc: 'Services de santé, hôpitaux, médecins', slugs: ['sante','sante-nb'], accent: 'var(--red)' },
  canada: { title: 'Canada', desc: 'Toutes les actualités nationales', slugs: ['actualites','gouvernement-federal','politique-federale','economie'], accent: 'var(--red)' },
}

const SLUG = 'sante'

export default async function Page() {
  const c = CONFIG[SLUG]
  const articles = await prisma.article.findMany({
    where: { status: { in: ['published','pinned'] }, OR: c.slugs.map(s => ({ category: { slug: s } })) },
    include: { source: { select: { name: true } }, category: { select: { name: true, slug: true } } },
    orderBy: [{ importanceScore: 'desc' }, { publishedAt: 'desc' }],
    take: 30,
  }).catch(() => [])

  return (
    <>
      <Header />
      <main>
        <div className="page-header" style={{ ['--accent' as string]: c.accent }}>
          <div className="container">
            <h1 style={{ fontFamily: 'Source Serif 4,serif', fontSize: 'clamp(24px,4vw,34px)', fontWeight: 600, marginBottom: 6, color: 'var(--ink)' }}>{c.title}</h1>
            <p style={{ color: 'var(--ink-soft)', fontSize: 15 }}>{c.desc}</p>
          </div>
        </div>
        <div className="container" style={{ padding: '28px 20px' }}>
          {articles.length === 0 ? (
            <div style={{ padding: '48px 24px', textAlign: 'center', background: 'var(--card)', border: '1px dashed var(--border)', borderRadius: 6 }}>
              <h2 style={{ fontFamily: 'Source Serif 4,serif', fontSize: 18, fontWeight: 600, marginBottom: 8, color: 'var(--ink)' }}>Collecte en attente</h2>
              <p style={{ fontSize: 14, color: 'var(--ink-soft)', maxWidth: 360, margin: '0 auto 16px' }}>
                Lancez une collecte depuis l&apos;administration pour récupérer les articles.
              </p>
              <Link href="/admin" style={{ display: 'inline-block', background: 'var(--ink)', color: '#fff', padding: '9px 20px', borderRadius: 3, textDecoration: 'none', fontWeight: 500, fontSize: 14 }}>
                Administration →
              </Link>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: 14 }}>
              {articles.map((a: Article) => <ArticleCard key={a.id} article={a} />)}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
