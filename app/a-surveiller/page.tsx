import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'À surveiller — Prochaines échéances importantes au Canada' }

const TYPE_CONFIG: Record<string, { label: string; color: string }> = {
  immigration: { label: 'Immigration', color: '#6B4C9A' },
  budget: { label: 'Budget', color: '#3D7A4D' },
  law: { label: 'Nouvelle loi', color: 'var(--nb)' },
  date: { label: 'Date importante', color: 'var(--gold)' },
  default: { label: 'À suivre', color: 'var(--ink-soft)' },
}

export default async function ASurveillerPage() {
  const items = await prisma.watchItem.findMany({ where: { active: true }, orderBy: { priority: 'desc' } }).catch(() => [])

  return (
    <>
      <Header />
      <main>
        <div className="page-header">
          <div className="container">
            <h1 style={{ fontFamily: 'Source Serif 4,serif', fontSize: 'clamp(24px,4vw,36px)', fontWeight: 600, marginBottom: 8, color: 'var(--ink)' }}>À surveiller au Canada</h1>
            <p style={{ color: 'var(--ink-soft)', fontSize: 15 }}>Tirages immigration, budgets, nouvelles lois — les échéances à venir.</p>
          </div>
        </div>
        <div className="container" style={{ padding: '28px 20px' }}>
          {items.length === 0 ? (
            <div style={{ padding: '48px 24px', textAlign: 'center', background: 'var(--card)', border: '1px dashed var(--border)', borderRadius: 6 }}>
              <div style={{ fontFamily: 'Source Serif 4,serif', fontSize: 18, fontWeight: 600, marginBottom: 8, color: 'var(--ink)' }}>Aucune échéance enregistrée</div>
              <Link href="/admin" style={{ display: 'inline-block', marginTop: 8, background: 'var(--ink)', color: '#fff', padding: '9px 20px', borderRadius: 3, textDecoration: 'none', fontWeight: 500, fontSize: 14 }}>Administration →</Link>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(290px,1fr))', gap: 14 }}>
              {items.map((item: { id: string; title: string; description?: string | null; type: string; dueDate?: Date | null; province?: string | null }) => {
                const tc = TYPE_CONFIG[item.type] || TYPE_CONFIG.default
                return (
                  <div key={item.id} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 6, padding: 18, position: 'relative' }}>
                    <div style={{ position: 'absolute', top: 0, left: 0, width: 3, height: '100%', background: tc.color, borderRadius: '6px 0 0 6px' }} />
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
                      <span style={{ fontSize: 11, fontWeight: 600, color: tc.color, textTransform: 'uppercase', letterSpacing: '.03em' }}>{tc.label}</span>
                      {item.province && <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--nb)', background: 'var(--nb-tint)', padding: '2px 7px', borderRadius: 3 }}>{item.province}</span>}
                    </div>
                    <h3 style={{ fontFamily: 'Source Serif 4,serif', fontSize: 16, fontWeight: 600, marginBottom: 8, color: 'var(--ink)' }}>{item.title}</h3>
                    {item.dueDate && <div style={{ fontSize: 13, color: tc.color, fontWeight: 500, marginBottom: 8 }}>{new Date(item.dueDate).toLocaleDateString('fr-CA', { day: 'numeric', month: 'long', year: 'numeric' })}</div>}
                    {item.description && <p style={{ fontSize: 13, color: 'var(--ink-soft)', lineHeight: 1.6 }}>{item.description}</p>}
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
