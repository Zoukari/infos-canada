import Link from 'next/link'

export default function Footer() {
  return (
    <footer style={{ background: 'var(--ink)', color: '#9C9C9C', marginTop: 56 }}>
      <div className="container" style={{ padding: '40px 20px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 32, marginBottom: 32 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <img src="/maple-leaf.png" width={24} height={24} alt="" style={{ filter: 'invert(1) brightness(1.4)' }} />
              <span style={{ fontFamily: 'Source Serif 4,serif', fontSize: 16, fontWeight: 600, color: '#F5F5F5' }}>Infos Canada</span>
            </div>
            <p style={{ fontSize: 13, lineHeight: 1.7 }}>Actualités automatisées sur le Canada et le Nouveau-Brunswick.</p>
          </div>
          <div>
            <h4 style={{ color: '#F5F5F5', fontSize: 12, fontWeight: 600, marginBottom: 10, textTransform: 'uppercase', letterSpacing: '.06em' }}>Sections</h4>
            {[['Nouveau-Brunswick','/nouveau-brunswick'],['Immigration','/immigration'],['Emploi','/emploi'],['Logement','/logement'],['À surveiller','/a-surveiller']].map(([l,h]) => (
              <Link key={h} href={h} style={{ display: 'block', fontSize: 13, color: '#9C9C9C', textDecoration: 'none', marginBottom: 6 }}>{l}</Link>
            ))}
          </div>
          <div>
            <h4 style={{ color: '#F5F5F5', fontSize: 12, fontWeight: 600, marginBottom: 10, textTransform: 'uppercase', letterSpacing: '.06em' }}>Administration</h4>
            <Link href="/admin" style={{ display: 'block', fontSize: 13, color: '#9C9C9C', textDecoration: 'none' }}>Tableau de bord</Link>
          </div>
        </div>
        <div style={{ borderTop: '1px solid #333', paddingTop: 18, fontSize: 12 }}>
          © {new Date().getFullYear()} Infos Canada — Sources citées, liens originaux inclus
        </div>
      </div>
    </footer>
  )
}
