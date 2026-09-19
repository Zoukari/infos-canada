import Header from '@/components/Header'
import Footer from '@/components/Footer'
import ArticleCard, { Article } from '@/components/ArticleCard'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'

async function getTopArticles() {
  try {
    return await prisma.article.findMany({
      where: { status: { in: ['published', 'pinned'] } },
      include: { source: { select: { name: true } }, category: { select: { name: true, slug: true } } },
      orderBy: [{ importanceScore: 'desc' }, { publishedAt: 'desc' }],
      take: 8,
    })
  } catch { return [] }
}

async function getNBArticles() {
  try {
    return await prisma.article.findMany({
      where: { province: 'NB', status: { in: ['published', 'pinned'] } },
      include: { source: { select: { name: true } }, category: { select: { name: true, slug: true } } },
      orderBy: [{ importanceScore: 'desc' }, { publishedAt: 'desc' }],
      take: 8,
    })
  } catch { return [] }
}

async function getWatchItems() {
  try {
    return await prisma.watchItem.findMany({
      where: { active: true },
      orderBy: [{ priority: 'desc' }],
      take: 4,
    })
  } catch { return [] }
}

async function getLastSync() {
  try {
    const log = await prisma.scrapingLog.findFirst({ orderBy: { startedAt: 'desc' } })
    return log?.finishedAt || null
  } catch { return null }
}

export const revalidate = 1800

export default async function HomePage() {
  const [top, nb, watch, lastSync] = await Promise.all([
    getTopArticles(), getNBArticles(), getWatchItems(), getLastSync()
  ])

  const isEmpty = top.length === 0 && nb.length === 0

  function timeAgo(date: Date) {
    const diff = Math.floor((Date.now() - date.getTime()) / 60000)
    if (diff < 1) return 'à l\'instant'
    if (diff < 60) return `il y a ${diff} min`
    const h = Math.floor(diff / 60)
    const m = diff % 60
    if (h < 24) return `il y a ${h}h${m > 0 ? ` ${m}min` : ''}`
    return `il y a ${Math.floor(h / 24)}j`
  }

  return (
    <>
      <Header />
      <main>
        {/* Hero */}
        <div style={{ background: 'linear-gradient(135deg,#0F172A,#1E3A5F)', color: '#fff', padding: '36px 16px' }}>
          <div className="container">
            <div style={{ display: 'flex', gap: 6, marginBottom: 14, flexWrap: 'wrap' }}>
              <span style={{ background: '#D80621', fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, letterSpacing: '.06em', textTransform: 'uppercase' }}>
                🍁 Nouveau-Brunswick en priorité
              </span>
              <span style={{ background: 'rgba(255,255,255,.12)', fontSize: 11, padding: '3px 10px', borderRadius: 20 }}>
                Mise à jour 3×/jour
              </span>
              {lastSync && (
                <span style={{ background: 'rgba(255,255,255,.08)', fontSize: 11, padding: '3px 10px', borderRadius: 20, color: 'rgba(255,255,255,.7)' }}>
                  Dernière collecte {timeAgo(new Date(lastSync))}
                </span>
              )}
            </div>
            <h1 style={{ fontFamily: 'Source Serif 4,serif', fontSize: 'clamp(22px,5vw,40px)', fontWeight: 700, lineHeight: 1.2, marginBottom: 12 }}>
              Tout ce qu&apos;il faut savoir<br />sur le Canada aujourd&apos;hui.
            </h1>
            <p style={{ color: 'rgba(255,255,255,.75)', fontSize: 15, maxWidth: 500, marginBottom: 22 }}>
              Immigration, emploi, logement, politique — priorité Nouveau-Brunswick.
            </p>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {[
                { href: '/immigration', label: '✈️ Immigration', primary: true },
                { href: '/nouveau-brunswick', label: '📍 Nouveau-Brunswick', primary: false },
                { href: '/a-surveiller', label: '⚑ À surveiller', primary: false },
              ].map(l => (
                <Link key={l.href} href={l.href} style={{
                  background: l.primary ? '#D80621' : 'rgba(255,255,255,.12)',
                  color: '#fff', padding: '9px 16px', borderRadius: 6, textDecoration: 'none',
                  fontSize: 13, fontWeight: l.primary ? 600 : 400, border: '1px solid rgba(255,255,255,.15)'
                }}>
                  {l.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Thèmes rapides */}
        <div style={{ background: '#fff', borderBottom: '1px solid #E5E7EB', overflowX: 'auto' }}>
          <div className="container" style={{ display: 'flex' }}>
            {[['✈️','Immigration','/immigration'],['💼','Emploi','/emploi'],['🏠','Logement','/logement'],['📊','Économie','/economie'],['🏥','Santé','/sante'],['🏛️','Politique','/politique']].map(([icon,label,href]) => (
              <Link key={href} href={href} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, padding: '10px 14px', fontSize: 12, textDecoration: 'none', color: '#374151', whiteSpace: 'nowrap', borderRight: '1px solid #E5E7EB' }}>
                <span style={{ fontSize: 18 }}>{icon}</span>{label}
              </Link>
            ))}
          </div>
        </div>

        <div className="container" style={{ padding: '24px 16px' }}>

          {/* Bandeau si base vide */}
          {isEmpty && (
            <div style={{ background: '#FFF7ED', border: '1px solid #FED7AA', borderRadius: 10, padding: '24px', marginBottom: 24, textAlign: 'center' }}>
              <div style={{ fontSize: 32, marginBottom: 10 }}>⏳</div>
              <h2 style={{ fontFamily: 'Source Serif 4,serif', fontSize: 18, fontWeight: 700, marginBottom: 8, color: '#92400E' }}>
                Aucun article pour l&apos;instant
              </h2>
              <p style={{ fontSize: 14, color: '#78350F', maxWidth: 400, margin: '0 auto 16px' }}>
                {lastSync
                  ? `Dernière tentative de collecte : ${timeAgo(new Date(lastSync))} — aucun article récupéré.`
                  : 'La collecte n\'a jamais été lancée.'}
                {' '}Lancez la collecte depuis l&apos;administration.
              </p>
              <Link href="/admin" style={{ display: 'inline-block', background: '#D80621', color: '#fff', padding: '10px 22px', borderRadius: 6, textDecoration: 'none', fontWeight: 600, fontSize: 14 }}>
                🔄 Aller dans l&apos;administration →
              </Link>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 290px', gap: 28, alignItems: 'start' }} className="grid-sidebar">
            {/* Colonne principale */}
            <div>
              {/* Essentiel */}
              <section style={{ marginBottom: 36 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                  <h2 style={{ fontFamily: 'Source Serif 4,serif', fontSize: 20, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ width: 4, height: 22, background: '#D80621', borderRadius: 2, display: 'inline-block', flexShrink: 0 }} />
                    L&apos;essentiel aujourd&apos;hui
                  </h2>
                  <Link href="/canada" style={{ fontSize: 13, color: '#D80621', textDecoration: 'none' }}>Tout voir →</Link>
                </div>
                {top.length === 0 ? <EmptySection /> : (
                  <div style={{ display: 'grid', gap: 10 }}>
                    {top.map((a: Article) => <ArticleCard key={a.id} article={a} />)}
                  </div>
                )}
              </section>

              {/* NB */}
              <section>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                  <h2 style={{ fontFamily: 'Source Serif 4,serif', fontSize: 20, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ width: 4, height: 22, background: '#1E3A5F', borderRadius: 2, display: 'inline-block', flexShrink: 0 }} />
                    Nouveau-Brunswick
                  </h2>
                  <Link href="/nouveau-brunswick" style={{ fontSize: 13, color: '#D80621', textDecoration: 'none' }}>Tout voir →</Link>
                </div>
                {nb.length === 0 ? <EmptySection /> : (
                  <div style={{ display: 'grid', gap: 10 }}>
                    {nb.map((a: Article) => <ArticleCard key={a.id} article={a} />)}
                  </div>
                )}
              </section>
            </div>

            {/* Sidebar */}
            <aside style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 10, overflow: 'hidden' }}>
                <div style={{ background: '#1E3A5F', padding: '12px 16px' }}>
                  <h3 style={{ fontFamily: 'Source Serif 4,serif', color: '#fff', fontSize: 14, fontWeight: 700 }}>⚑ À surveiller</h3>
                </div>
                <div style={{ padding: '0 16px' }}>
                  {watch.map((item) => (
                    <div key={item.id} style={{ padding: '12px 0', borderBottom: '1px solid #E5E7EB' }}>
                      <div style={{ fontSize: 11, color: '#D80621', fontWeight: 600, textTransform: 'uppercase', marginBottom: 3 }}>
                        {item.type === 'immigration' ? 'Immigration' : item.type === 'budget' ? 'Budget' : 'Date importante'}
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{item.title}</div>
                      {item.description && <div style={{ fontSize: 12, color: '#6B7280', marginTop: 3, lineHeight: 1.5 }}>{item.description.substring(0, 80)}…</div>}
                    </div>
                  ))}
                  {watch.length === 0 && <div style={{ padding: '16px 0', fontSize: 13, color: '#9CA3AF' }}>Aucun élément</div>}
                </div>
                <div style={{ padding: '10px 16px' }}>
                  <Link href="/a-surveiller" style={{ fontSize: 13, color: '#D80621', textDecoration: 'none', fontWeight: 600 }}>Tout voir →</Link>
                </div>
              </div>

              <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 10, padding: '16px' }}>
                <h3 style={{ fontFamily: 'Source Serif 4,serif', fontSize: 14, fontWeight: 700, marginBottom: 10 }}>📍 Villes NB</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                  {['Moncton','Dieppe','Fredericton','Saint John','Edmundston','Campbellton'].map(c => (
                    <Link key={c} href={`/nouveau-brunswick?ville=${c}`} style={{ padding: '6px 8px', background: '#F4F5F7', borderRadius: 6, fontSize: 12, textDecoration: 'none', color: '#374151', textAlign: 'center' }}>{c}</Link>
                  ))}
                </div>
              </div>

              <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 10, padding: '16px' }}>
                <h3 style={{ fontFamily: 'Source Serif 4,serif', fontSize: 14, fontWeight: 700, marginBottom: 10 }}>✈️ Immigration</h3>
                {[['Entrée express','/immigration#entree-express'],['NBPNP','/immigration#nbpnp'],['Francophonie','/immigration#francophonie'],['IRCC','/immigration#immigration-canada']].map(([label,href]) => (
                  <Link key={href} href={href} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid #E5E7EB', fontSize: 13, textDecoration: 'none', color: '#374151' }}>
                    {label} <span style={{ color: '#D80621' }}>→</span>
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

function EmptySection() {
  return (
    <div style={{ padding: '24px', textAlign: 'center', background: '#fff', border: '1px dashed #E5E7EB', borderRadius: 8 }}>
      <div style={{ fontSize: 24, marginBottom: 6 }}>🔄</div>
      <div style={{ fontSize: 13, color: '#9CA3AF' }}>Collecte en attente</div>
    </div>
  )
}
