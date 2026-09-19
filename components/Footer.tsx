import Link from 'next/link'

export default function Footer() {
  return (
    <footer style={{ background: '#0F172A', color: '#94A3B8', marginTop: 48 }}>
      <div className="container" style={{ padding: '40px 16px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 32, marginBottom: 32 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <img src="/favicon.svg" width={28} height={28} alt="" />
              <span style={{ fontFamily: 'Source Serif 4,serif', fontSize: 17, fontWeight: 700, color: '#F1F5F9' }}>Infos Canada</span>
            </div>
            <p style={{ fontSize: 13, lineHeight: 1.7 }}>Actualités automatisées sur le Canada et le Nouveau-Brunswick. Mis à jour 3×/jour.</p>
          </div>
          <div>
            <h4 style={{ color: '#F1F5F9', fontSize: 12, fontWeight: 600, marginBottom: 10, textTransform: 'uppercase', letterSpacing: '.08em' }}>Sections</h4>
            {[['Nouveau-Brunswick','/nouveau-brunswick'],['Immigration','/immigration'],['Emploi','/emploi'],['Logement','/logement'],['À surveiller','/a-surveiller']].map(([l,h]) => (
              <Link key={h} href={h} style={{ display: 'block', fontSize: 13, color: '#94A3B8', textDecoration: 'none', marginBottom: 5 }}>{l}</Link>
            ))}
          </div>
          <div>
            <h4 style={{ color: '#F1F5F9', fontSize: 12, fontWeight: 600, marginBottom: 10, textTransform: 'uppercase', letterSpacing: '.08em' }}>Administration</h4>
            <Link href="/admin" style={{ display: 'block', fontSize: 13, color: '#94A3B8', textDecoration: 'none', marginBottom: 5 }}>Tableau de bord</Link>
            <Link href="/admin?tab=sources" style={{ display: 'block', fontSize: 13, color: '#94A3B8', textDecoration: 'none', marginBottom: 5 }}>Sources RSS</Link>
          </div>
        </div>
        <div style={{ borderTop: '1px solid #1E293B', paddingTop: 20, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, fontSize: 12 }}>
          <span>© {new Date().getFullYear()} Infos Canada — Sources citées, liens originaux inclus</span>
          <span>Données mises à jour automatiquement</span>
        </div>
      </div>
    </footer>
  )
}
