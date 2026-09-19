import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'À surveiller — Prochaines échéances importantes au Canada' }

const TYPE_CONFIG: Record<string, { label: string; icon: string; color: string }> = {
  immigration: { label: 'Immigration', icon: '✈️', color: '#7C3AED' },
  budget: { label: 'Budget', icon: '💰', color: '#15803D' },
  law: { label: 'Nouvelle loi', icon: '⚖️', color: '#1E3A5F' },
  date: { label: 'Date importante', icon: '📅', color: '#B45309' },
  default: { label: 'À suivre', icon: '⚑', color: '#374151' },
}

export default async function ASurveillerPage() {
  const items = await prisma.watchItem.findMany({ where: { active: true }, orderBy: { priority: 'desc' } }).catch(() => [])

  return (
    <>
      <Header />
      <main>
        <div style={{ background: 'linear-gradient(135deg,#0F172A,#1E3A5F)', color: '#fff', padding: '36px 16px' }}>
          <div className="container">
            <h1 style={{ fontFamily: 'Source Serif 4,serif', fontSize: 'clamp(22px,4vw,36px)', fontWeight: 700, marginBottom: 8 }}>⚑ À surveiller au Canada</h1>
            <p style={{ color: 'rgba(255,255,255,.75)', fontSize: 15 }}>Tirages immigration, budgets, nouvelles lois — les échéances à venir.</p>
          </div>
        </div>
        <div className="container" style={{ padding: '24px 16px' }}>
          {items.length === 0 ? (
            <div style={{ padding: '48px 24px', textAlign: 'center', background: '#fff', border: '1px dashed #E5E7EB', borderRadius: 10 }}>
              <div style={{ fontSize: 32, marginBottom: 10 }}>📅</div>
              <div style={{ fontFamily: 'Source Serif 4,serif', fontSize: 18, fontWeight: 600, marginBottom: 8 }}>Aucune échéance enregistrée</div>
              <Link href="/admin" style={{ display: 'inline-block', marginTop: 8, background: '#C8102E', color: '#fff', padding: '9px 20px', borderRadius: 6, textDecoration: 'none', fontWeight: 600, fontSize: 14 }}>Administration →</Link>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: 16 }}>
              {items.map((item: { id: string; title: string; description?: string | null; type: string; dueDate?: Date | null; province?: string | null }) => {
                const tc = TYPE_CONFIG[item.type] || TYPE_CONFIG.default
                return (
                  <div key={item.id} style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 10, overflow: 'hidden' }}>
                    <div style={{ height: 4, background: tc.color }} />
                    <div style={{ padding: 18 }}>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
                        <span style={{ fontSize: 18 }}>{tc.icon}</span>
                        <span style={{ fontSize: 11, fontWeight: 700, color: tc.color, textTransform: 'uppercase' }}>{tc.label}</span>
                        {item.province && <span style={{ marginLeft: 'auto', fontSize: 11, background: item.province === 'NB' ? '#1E3A5F' : '#374151', color: '#fff', padding: '2px 6px', borderRadius: 3 }}>{item.province}</span>}
                      </div>
                      <h3 style={{ fontFamily: 'Source Serif 4,serif', fontSize: 16, fontWeight: 700, marginBottom: 8 }}>{item.title}</h3>
                      {item.dueDate && <div style={{ fontSize: 13, color: tc.color, fontWeight: 600, marginBottom: 8 }}>📅 {new Date(item.dueDate).toLocaleDateString('fr-CA', { day: 'numeric', month: 'long', year: 'numeric' })}</div>}
                      {item.description && <p style={{ fontSize: 13, color: '#6B7280', lineHeight: 1.6 }}>{item.description}</p>}
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
