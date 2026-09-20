import Header from '@/components/Header'
import Footer from '@/components/Footer'
import ArticleCard, { Article } from '@/components/ArticleCard'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

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
  try { return await prisma.watchItem.findMany({ where: { active: true }, orderBy: { priority: 'desc' }, take: 4 }) } catch { return [] }
}
async function getLastSync() {
  try { const log = await prisma.scrapingLog.findFirst({ orderBy: { startedAt: 'desc' } }); return log?.finishedAt || null } catch { return null }
}

function timeAgo(date: Date) {
  const diff = Math.floor((Date.now() - date.getTime()) / 60000)
  if (diff < 1) return 'à l\'instant'
  if (diff < 60) return `il y a ${diff} min`
  const h = Math.floor(diff / 60)
  return `il y a ${h}h${diff % 60 > 0 ? ` ${diff % 60}min` : ''}`
}

export default async function HomePage() {
  const [top, nb, watch, lastSync] = await Promise.all([getTopArticles(), getNBArticles(), getWatchItems(), getLastSync()])
  const isEmpty = top.length === 0 && nb.length === 0

  return (
    <>
      <Header />
      <main>
        {/* Hero — éditorial sobre */}
        <div style={{ background: 'var(--card)', borderBottom: '1px solid var(--border)' }}>
          <div className="container" style={{ padding: '48px 20px 40px' }}>
            <div style={{ maxWidth: 640 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
                <span style={{ width: 28, height: 2, background: 'var(--red)', display: 'inline-block' }} />
                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--red)', textTransform: 'uppercase', letterSpacing: '.1em' }}>
                  Édition du {new Date().toLocaleDateString('fr-CA', { day: 'numeric', month: 'long' })}
                </span>
              </div>
              <h1 style={{ fontFamily: 'Source Serif 4,serif', fontSize: 'clamp(28px,5vw,46px)', fontWeight: 600, lineHeight: 1.15, color: 'var(--ink)', marginBottom: 18, letterSpacing: '-0.01em' }}>
                Tout ce qu&apos;il faut savoir pour vivre, travailler et s&apos;installer au Canada.
              </h1>
              <p style={{ color: 'var(--ink-soft)', fontSize: 16, lineHeight: 1.65, marginBottom: 26 }}>
                Immigration, emploi, logement et politique — avec une attention particulière au Nouveau-Brunswick.
                {lastSync && <span style={{ display: 'block', marginTop: 6, fontSize: 13, color: '#9C9C9C' }}>Dernière mise à jour {timeAgo(new Date(lastSync))}</span>}
              </p>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <Link href="/immigration" style={{ background: 'var(--ink)', color: '#fff', padding: '10px 20px', borderRadius: 3, textDecoration: 'none', fontSize: 14, fontWeight: 500 }}>
                  Immigration
                </Link>
                <Link href="/nouveau-brunswick" style={{ background: 'transparent', color: 'var(--ink)', padding: '10px 20px', borderRadius: 3, textDecoration: 'none', fontSize: 14, border: '1px solid var(--border)' }}>
                  Nouveau-Brunswick
                </Link>
                <Link href="/a-surveiller" style={{ background: 'transparent', color: 'var(--ink)', padding: '10px 20px', borderRadius: 3, textDecoration: 'none', fontSize: 14, border: '1px solid var(--border)' }}>
                  À surveiller
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Thèmes */}
        <div style={{ background: 'var(--paper)', borderBottom: '1px solid var(--border)', overflowX: 'auto' }}>
          <div className="container" style={{ display: 'flex' }}>
            {[['Immigration','/immigration'],['Emploi','/emploi'],['Logement','/logement'],['Économie','/economie'],['Santé','/sante'],['Politique','/politique']].map(([label,href]) => (
              <Link key={href} href={href} style={{ padding: '11px 16px', fontSize: 13, textDecoration: 'none', color: 'var(--ink-soft)', whiteSpace: 'nowrap', borderRight: '1px solid var(--border-soft)' }}>
                {label}
              </Link>
            ))}
          </div>
        </div>

        <div className="container" style={{ padding: '32px 20px' }}>
          {isEmpty && (
            <div style={{ background: 'var(--red-soft)', border: '1px solid #F5D0D0', borderRadius: 6, padding: '24px', marginBottom: 28, textAlign: 'center' }}>
              <h2 style={{ fontFamily: 'Source Serif 4,serif', fontSize: 18, fontWeight: 600, marginBottom: 8, color: '#7F1D24' }}>Aucun article disponible</h2>
              <p style={{ fontSize: 14, color: '#8A4A4A', maxWidth: 380, margin: '0 auto 16px' }}>
                {lastSync ? `Dernière collecte ${timeAgo(new Date(lastSync))} — aucun article récupéré.` : 'Collecte jamais lancée.'}
              </p>
              <Link href="/admin" style={{ display: 'inline-block', background: 'var(--ink)', color: '#fff', padding: '9px 20px', borderRadius: 3, textDecoration: 'none', fontWeight: 500, fontSize: 14 }}>
                Administration →
              </Link>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 32, alignItems: 'start' }} className="grid-sidebar">
            <div>
              <Section title="L'essentiel aujourd'hui" href="/canada">
                {top.length === 0 ? <Empty /> : top.map((a: Article) => <ArticleCard key={a.id} article={a} />)}
              </Section>
              <div style={{ marginTop: 40 }}>
                <Section title="Nouveau-Brunswick" href="/nouveau-brunswick">
                  {nb.length === 0 ? <Empty /> : nb.map((a: Article) => <ArticleCard key={a.id} article={a} />)}
                </Section>
              </div>
            </div>
            <aside style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <SideCard title="À surveiller" href="/a-surveiller">
                {watch.map((item: { id: string; title: string; description?: string | null; type: string }) => (
                  <div key={item.id} style={{ padding: '12px 0', borderBottom: '1px solid var(--border-soft)' }}>
                    <div style={{ fontSize: 11, color: 'var(--red)', fontWeight: 600, textTransform: 'uppercase', marginBottom: 4, letterSpacing: '.03em' }}>
                      {item.type === 'immigration' ? 'Immigration' : item.type === 'budget' ? 'Budget' : 'Date clé'}
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 500 }}>{item.title}</div>
                  </div>
                ))}
                {watch.length === 0 && <div style={{ padding: '12px 0', fontSize: 13, color: '#9C9C9C' }}>Aucun élément</div>}
              </SideCard>
              <SideCard title="Villes du N.-B." href="/nouveau-brunswick">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                  {['Moncton','Dieppe','Fredericton','Saint John','Edmundston','Campbellton'].map(c => (
                    <Link key={c} href={`/nouveau-brunswick?ville=${c}`} style={{ padding: '7px 8px', background: 'var(--paper)', borderRadius: 3, fontSize: 12, textDecoration: 'none', color: 'var(--ink-soft)', textAlign: 'center' }}>{c}</Link>
                  ))}
                </div>
              </SideCard>
              <SideCard title="Immigration" href="/immigration">
                {[['Entrée express','/immigration#entree-express'],['NBPNP','/immigration#nbpnp'],['Francophonie','/immigration#francophonie']].map(([label,href]) => (
                  <Link key={href} href={href} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border-soft)', fontSize: 13, textDecoration: 'none', color: 'var(--ink-soft)' }}>
                    {label} <span style={{ color: 'var(--red)' }}>→</span>
                  </Link>
                ))}
              </SideCard>
            </aside>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}

function Section({ title, href, children }: { title: string; href: string; children: React.ReactNode }) {
  return (
    <section>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 16, borderBottom: '2px solid var(--ink)', paddingBottom: 10 }}>
        <h2 style={{ fontFamily: 'Source Serif 4,serif', fontSize: 21, fontWeight: 600, color: 'var(--ink)' }}>{title}</h2>
        <Link href={href} style={{ fontSize: 13, color: 'var(--red)', textDecoration: 'none' }}>Tout voir →</Link>
      </div>
      <div style={{ display: 'grid', gap: 12 }}>{children}</div>
    </section>
  )
}

function SideCard({ title, href, children }: { title: string; href: string; children: React.ReactNode }) {
  return (
    <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 6 }}>
      <div style={{ padding: '13px 16px', borderBottom: '1px solid var(--border-soft)' }}>
        <h3 style={{ fontFamily: 'Source Serif 4,serif', fontSize: 15, fontWeight: 600, color: 'var(--ink)' }}>{title}</h3>
      </div>
      <div style={{ padding: '0 16px' }}>{children}</div>
      <div style={{ padding: '11px 16px' }}>
        <Link href={href} style={{ fontSize: 13, color: 'var(--red)', textDecoration: 'none', fontWeight: 500 }}>Tout voir →</Link>
      </div>
    </div>
  )
}

function Empty() {
  return (
    <div style={{ padding: '20px', textAlign: 'center', background: 'var(--card)', border: '1px dashed var(--border)', borderRadius: 6 }}>
      <div style={{ fontSize: 13, color: '#9C9C9C' }}>Collecte en attente</div>
    </div>
  )
}
