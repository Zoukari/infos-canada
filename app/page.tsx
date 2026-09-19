import Header from '@/components/Header'
import Footer from '@/components/Footer'
import ArticleCard, { Article } from '@/components/ArticleCard'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'

export const revalidate = 900

async function getData() {
  try {
    const [top, nb, watch, lastSync] = await Promise.all([
      prisma.article.findMany({
        where: { status: { in: ['published','pinned'] } },
        include: { source: { select: { name: true } }, category: { select: { name: true, slug: true } } },
        orderBy: [{ importanceScore: 'desc' }, { publishedAt: 'desc' }],
        take: 8,
      }),
      prisma.article.findMany({
        where: { province: 'NB', status: { in: ['published','pinned'] } },
        include: { source: { select: { name: true } }, category: { select: { name: true, slug: true } } },
        orderBy: [{ importanceScore: 'desc' }, { publishedAt: 'desc' }],
        take: 8,
      }),
      prisma.watchItem.findMany({ where: { active: true }, orderBy: { priority: 'desc' }, take: 4 }),
      prisma.scrapingLog.findFirst({ orderBy: { startedAt: 'desc' } }),
    ])
    return { top, nb, watch, lastSync: lastSync?.finishedAt || null }
  } catch { return { top: [], nb: [], watch: [], lastSync: null } }
}

function ago(date: Date) {
  const m = Math.floor((Date.now() - date.getTime()) / 60000)
  if (m < 1) return 'à l\'instant'
  if (m < 60) return `il y a ${m}min`
  const h = Math.floor(m / 60)
  return `il y a ${h}h${m % 60 > 0 ? ` ${m % 60}min` : ''}`
}

export default async function HomePage() {
  const { top, nb, watch, lastSync } = await getData()
  const empty = top.length === 0 && nb.length === 0

  return (
    <>
      <Header />
      <main>
        {/* Hero — sans les badges */}
        <div style={{ background: 'linear-gradient(135deg,#0F172A,#1E3A5F)', color: '#fff', padding: '40px 16px' }}>
          <div className="container">
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
              <img src="/maple-leaf.png" alt="" style={{ width: 52, height: 52, objectFit: 'contain' }} />
              <div>
                <h1 style={{ fontFamily: 'Source Serif 4,serif', fontSize: 'clamp(22px,5vw,40px)', fontWeight: 700, lineHeight: 1.2 }}>
                  Infos Canada
                </h1>
                <p style={{ color: 'rgba(255,255,255,.7)', fontSize: 13, marginTop: 2 }}>
                  {lastSync ? `Dernière mise à jour ${ago(new Date(lastSync))}` : 'Actualités automatisées'}
                </p>
              </div>
            </div>
            <p style={{ color: 'rgba(255,255,255,.85)', fontSize: 'clamp(15px,3vw,19px)', maxWidth: 560, marginBottom: 24, lineHeight: 1.6 }}>
              Tout ce qu&apos;il faut savoir pour vivre, travailler et s&apos;installer au Canada — au même endroit, chaque jour.
            </p>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {[['✈️ Immigration','/immigration',true],['📍 Nouveau-Brunswick','/nouveau-brunswick',false],['⚑ À surveiller','/a-surveiller',false]].map(([l,h,p]) => (
                <Link key={String(h)} href={String(h)} style={{ background: p ? '#C8102E' : 'rgba(255,255,255,.12)', color: '#fff', padding: '9px 16px', borderRadius: 6, textDecoration: 'none', fontSize: 13, fontWeight: p ? 600 : 400, border: '1px solid rgba(255,255,255,.15)' }}>
                  {String(l)}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Thèmes */}
        <div style={{ background: '#fff', borderBottom: '1px solid #E5E7EB', overflowX: 'auto' }}>
          <div className="container" style={{ display: 'flex' }}>
            {[['✈️','Immigration','/immigration'],['💼','Emploi','/emploi'],['🏠','Logement','/logement'],['📊','Économie','/economie'],['🏥','Santé','/sante'],['🏛️','Politique','/politique']].map(([icon,label,href]) => (
              <Link key={String(href)} href={String(href)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, padding: '10px 14px', fontSize: 12, textDecoration: 'none', color: '#374151', whiteSpace: 'nowrap', borderRight: '1px solid #E5E7EB' }}>
                <span style={{ fontSize: 18 }}>{String(icon)}</span>{String(label)}
              </Link>
            ))}
          </div>
        </div>

        <div className="container" style={{ padding: '24px 16px' }}>
          {/* Bandeau vide */}
          {empty && (
            <div style={{ background: '#FFF7ED', border: '1px solid #FED7AA', borderRadius: 10, padding: '24px', marginBottom: 24, textAlign: 'center' }}>
              <div style={{ fontSize: 32, marginBottom: 10 }}>⏳</div>
              <h2 style={{ fontFamily: 'Source Serif 4,serif', fontSize: 18, fontWeight: 700, marginBottom: 8, color: '#92400E' }}>Aucun article disponible</h2>
              <p style={{ fontSize: 14, color: '#78350F', maxWidth: 380, margin: '0 auto 16px' }}>
                {lastSync ? `Dernière collecte ${ago(new Date(lastSync))} — aucun article récupéré.` : 'Collecte jamais lancée.'}
                {' '}Lancez la collecte depuis l&apos;administration.
              </p>
              <Link href="/admin" style={{ display: 'inline-block', background: '#C8102E', color: '#fff', padding: '10px 22px', borderRadius: 6, textDecoration: 'none', fontWeight: 600, fontSize: 14 }}>
                🔄 Administration →
              </Link>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 28, alignItems: 'start' }} className="grid-sidebar">
            <div>
              <Section title="L'essentiel aujourd'hui" href="/canada" color="#C8102E">
                {top.length === 0 ? <Empty /> : top.map((a: Article) => <ArticleCard key={a.id} article={a} />)}
              </Section>
              <div style={{ marginTop: 36 }}>
                <Section title="Nouveau-Brunswick" href="/nouveau-brunswick" color="#1E3A5F">
                  {nb.length === 0 ? <Empty /> : nb.map((a: Article) => <ArticleCard key={a.id} article={a} />)}
                </Section>
              </div>
            </div>
            <aside style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <SideCard title="⚑ À surveiller" color="#1E3A5F" href="/a-surveiller">
                {watch.map(item => (
                  <div key={item.id} style={{ padding: '11px 0', borderBottom: '1px solid #E5E7EB' }}>
                    <div style={{ fontSize: 11, color: '#C8102E', fontWeight: 600, textTransform: 'uppercase', marginBottom: 3 }}>
                      {item.type === 'immigration' ? 'Immigration' : item.type === 'budget' ? 'Budget' : 'Date clé'}
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{item.title}</div>
                    {item.description && <div style={{ fontSize: 12, color: '#6B7280', marginTop: 2, lineHeight: 1.5 }}>{item.description.substring(0,90)}…</div>}
                  </div>
                ))}
                {watch.length === 0 && <div style={{ padding: '12px 0', fontSize: 13, color: '#9CA3AF' }}>Aucun élément</div>}
              </SideCard>
              <SideCard title="📍 Villes NB" color="#1E3A5F" href="/nouveau-brunswick">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                  {['Moncton','Dieppe','Fredericton','Saint John','Edmundston','Campbellton'].map(c => (
                    <Link key={c} href={`/nouveau-brunswick?ville=${c}`} style={{ padding: '6px 8px', background: '#F4F5F7', borderRadius: 6, fontSize: 12, textDecoration: 'none', color: '#374151', textAlign: 'center' }}>{c}</Link>
                  ))}
                </div>
              </SideCard>
              <SideCard title="✈️ Immigration" color="#1E3A5F" href="/immigration">
                {[['Entrée express','/immigration#entree-express'],['NBPNP','/immigration#nbpnp'],['Francophonie','/immigration#francophonie'],['IRCC','/immigration#immigration-canada']].map(([l,h]) => (
                  <Link key={String(h)} href={String(h)} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid #E5E7EB', fontSize: 13, textDecoration: 'none', color: '#374151' }}>
                    {String(l)} <span style={{ color: '#C8102E' }}>→</span>
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

function Section({ title, href, color, children }: { title: string; href: string; color: string; children: React.ReactNode }) {
  return (
    <section>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <h2 style={{ fontFamily: 'Source Serif 4,serif', fontSize: 20, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 4, height: 22, background: color, borderRadius: 2, display: 'inline-block', flexShrink: 0 }} />
          {title}
        </h2>
        <Link href={href} style={{ fontSize: 13, color: '#C8102E', textDecoration: 'none' }}>Tout voir →</Link>
      </div>
      <div style={{ display: 'grid', gap: 10 }}>{children}</div>
    </section>
  )
}

function SideCard({ title, color, href, children }: { title: string; color: string; href: string; children: React.ReactNode }) {
  return (
    <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 10, overflow: 'hidden' }}>
      <div style={{ background: color, padding: '11px 16px' }}>
        <h3 style={{ fontFamily: 'Source Serif 4,serif', color: '#fff', fontSize: 14, fontWeight: 700 }}>{title}</h3>
      </div>
      <div style={{ padding: '0 16px' }}>{children}</div>
      <div style={{ padding: '10px 16px' }}>
        <Link href={href} style={{ fontSize: 13, color: '#C8102E', textDecoration: 'none', fontWeight: 600 }}>Tout voir →</Link>
      </div>
    </div>
  )
}

function Empty() {
  return (
    <div style={{ padding: '20px', textAlign: 'center', background: '#fff', border: '1px dashed #E5E7EB', borderRadius: 8 }}>
      <div style={{ fontSize: 13, color: '#9CA3AF' }}>🔄 Collecte en attente</div>
    </div>
  )
}
