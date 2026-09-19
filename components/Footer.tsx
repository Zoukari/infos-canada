import Link from 'next/link'

export default function Footer() {
  return (
    <footer style={{ background: '#0F172A', color: '#94A3B8', marginTop: 60 }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '48px 20px 32px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 40, marginBottom: 40 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <span style={{ fontSize: 24 }}>🇨🇦</span>
              <span style={{ fontFamily: "'Source Serif 4', serif", fontSize: 18, fontWeight: 700, color: '#F1F5F9' }}>Infos Canada</span>
            </div>
            <p style={{ fontSize: 13, lineHeight: 1.7 }}>
              Actualités automatisées sur le Canada et le Nouveau-Brunswick pour les immigrants, travailleurs et résidents.
            </p>
          </div>
          <div>
            <h4 style={{ color: '#F1F5F9', fontSize: 13, fontWeight: 600, marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Sections</h4>
            {[
              { href: '/nouveau-brunswick', label: 'Nouveau-Brunswick' },
              { href: '/immigration', label: 'Immigration' },
              { href: '/emploi', label: 'Emploi' },
              { href: '/logement', label: 'Logement' },
              { href: '/politique', label: 'Politique' },
              { href: '/a-surveiller', label: 'À surveiller' },
            ].map(({ href, label }) => (
              <Link key={href} href={href} style={{ display: 'block', fontSize: 13, color: '#94A3B8', textDecoration: 'none', marginBottom: 6 }}>
                {label}
              </Link>
            ))}
          </div>
          <div>
            <h4 style={{ color: '#F1F5F9', fontSize: 13, fontWeight: 600, marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Sources</h4>
            <p style={{ fontSize: 12, lineHeight: 1.7 }}>
              Infos Canada agrège des informations provenant de sources officielles et de médias reconnus du Canada. 
              Les articles originaux restent la propriété de leurs auteurs.
            </p>
          </div>
          <div>
            <h4 style={{ color: '#F1F5F9', fontSize: 13, fontWeight: 600, marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Administration</h4>
            <Link href="/admin" style={{ fontSize: 13, color: '#94A3B8', textDecoration: 'none', display: 'block', marginBottom: 6 }}>
              Tableau de bord
            </Link>
            <Link href="/admin/sources" style={{ fontSize: 13, color: '#94A3B8', textDecoration: 'none', display: 'block', marginBottom: 6 }}>
              Gérer les sources
            </Link>
          </div>
        </div>
        <div style={{ borderTop: '1px solid #1E293B', paddingTop: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <span style={{ fontSize: 12 }}>© {new Date().getFullYear()} Infos Canada. Collecte automatisée, sources citées.</span>
          <span style={{ fontSize: 12 }}>Données mises à jour plusieurs fois par jour</span>
        </div>
      </div>
    </footer>
  )
}
