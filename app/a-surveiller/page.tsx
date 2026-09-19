import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Link from 'next/link'

export const metadata = {
  title: 'À surveiller — Prochaines échéances importantes au Canada',
  description: 'Tirages Entrée express, NBPNP, budgets, nouvelles lois et dates importantes à retenir pour les immigrants et résidents du Canada.',
}

async function getWatchItems() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    const res = await fetch(`${baseUrl}/api/watch`, { next: { revalidate: 3600 } })
    if (!res.ok) return []
    return (await res.json()).items || []
  } catch { return [] }
}

const TYPE_CONFIG: Record<string, { label: string; icon: string; color: string }> = {
  immigration: { label: 'Immigration', icon: '✈️', color: '#7C3AED' },
  budget: { label: 'Budget', icon: '💰', color: '#15803D' },
  law: { label: 'Nouvelle loi', icon: '⚖️', color: '#1E3A5F' },
  election: { label: 'Élection', icon: '🗳️', color: '#D80621' },
  date: { label: 'Date importante', icon: '📅', color: '#B45309' },
  default: { label: 'À suivre', icon: '⚑', color: '#374151' },
}

export default async function ASurveillerPage() {
  const items = await getWatchItems()

  const byType = items.reduce((acc: Record<string, unknown[]>, item: { type: string }) => {
    const type = item.type || 'default'
    if (!acc[type]) acc[type] = []
    acc[type].push(item)
    return acc
  }, {})

  return (
    <>
      <Header />
      <main>
        <div style={{ background: 'linear-gradient(135deg, #0F172A 0%, #1E3A5F 100%)', color: '#fff', padding: '44px 0' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px' }}>
            <h1 style={{ fontFamily: "'Source Serif 4', serif", fontSize: 'clamp(26px, 4vw, 40px)', fontWeight: 700, color: '#fff', marginBottom: 10 }}>
              ⚑ À surveiller au Canada
            </h1>
            <p style={{ color: 'rgba(255,255,255,.8)', fontSize: 16, maxWidth: 600 }}>
              Prochains tirages immigration, dates importantes, nouvelles lois, budgets — tout ce qui va changer dans les semaines à venir.
            </p>
          </div>
        </div>

        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 20px' }}>
          {items.length === 0 ? (
            <div style={{ padding: '60px 24px', textAlign: 'center', background: 'var(--white)', border: '1px dashed var(--border)', borderRadius: 10 }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>📅</div>
              <div style={{ fontFamily: "'Source Serif 4', serif", fontSize: 20, fontWeight: 600, marginBottom: 8 }}>Aucune échéance enregistrée</div>
              <p style={{ fontSize: 14, color: 'var(--text-muted)', maxWidth: 400, margin: '0 auto' }}>
                Les éléments à surveiller peuvent être ajoutés depuis l&apos;administration. Ils sont affichés ici par ordre chronologique.
              </p>
              <Link href="/admin" style={{ display: 'inline-block', marginTop: 16, background: 'var(--red)', color: '#fff', padding: '10px 20px', borderRadius: 6, textDecoration: 'none', fontSize: 14, fontWeight: 600 }}>
                Administration →
              </Link>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
              {items.map((item: { id: string; title: string; description?: string; type: string; dueDate?: string; sourceUrl?: string; province?: string; priority?: number }) => {
                const tc = TYPE_CONFIG[item.type] || TYPE_CONFIG.default
                return (
                  <div key={item.id} style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
                    <div style={{ height: 4, background: tc.color }} />
                    <div style={{ padding: '20px' }}>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 10 }}>
                        <span style={{ fontSize: 20 }}>{tc.icon}</span>
                        <span style={{ fontSize: 11, fontWeight: 700, color: tc.color, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{tc.label}</span>
                        {item.province && (
                          <span style={{ marginLeft: 'auto', fontSize: 11, background: item.province === 'NB' ? '#1E3A5F' : '#374151', color: '#fff', padding: '2px 7px', borderRadius: 3 }}>
                            {item.province}
                          </span>
                        )}
                      </div>
                      <h3 style={{ fontFamily: "'Source Serif 4', serif", fontSize: 17, fontWeight: 700, marginBottom: 8, lineHeight: 1.35 }}>{item.title}</h3>
                      {item.dueDate && (
                        <div style={{ fontSize: 13, color: tc.color, fontWeight: 600, marginBottom: 8 }}>
                          📅 {new Date(item.dueDate).toLocaleDateString('fr-CA', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </div>
                      )}
                      {item.description && (
                        <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 12 }}>{item.description}</p>
                      )}
                      {item.sourceUrl && (
                        <a href={item.sourceUrl} target="_blank" rel="noopener" style={{ fontSize: 12, color: 'var(--red)', textDecoration: 'none', fontWeight: 600 }}>
                          En savoir plus ↗
                        </a>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
