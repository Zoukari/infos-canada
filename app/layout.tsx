import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: { template: '%s | Infos Canada', default: 'Infos Canada — L\'actualité essentielle pour vivre et immigrer au Canada' },
  description: 'Actualités immigration, emploi, logement et politique au Canada — priorité Nouveau-Brunswick.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>
        <div id="splash" style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          background: '#fff',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          animation: 'splashOut 0.5s ease-in-out 2.8s forwards',
        }}>
          <img src="/maple-leaf.png" alt="Feuille d'érable" style={{
            width: 130, height: 130, objectFit: 'contain',
            animation: 'leafIn 0.7s ease-out forwards',
          }} />
          <h1 style={{
            fontFamily: 'Source Serif 4, serif',
            fontSize: 'clamp(28px, 6vw, 48px)',
            fontWeight: 700, color: '#C8102E',
            marginTop: 16, marginBottom: 12,
            animation: 'textIn 0.7s ease-out 0.4s both',
          }}>
            Infos Canada
          </h1>
          <p style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: 'clamp(14px, 3vw, 18px)',
            color: '#444', textAlign: 'center',
            maxWidth: 480, padding: '0 24px', lineHeight: 1.5,
            animation: 'textIn 0.7s ease-out 0.7s both',
          }}>
            Tout ce qu&apos;il faut savoir pour vivre, travailler et s&apos;installer au Canada — au même endroit, chaque jour.
          </p>
        </div>
        {children}
        <style>{`
          @keyframes leafIn { 0% { opacity:0; transform: scale(0.3) rotate(-25deg); } 60% { opacity:1; transform: scale(1.1) rotate(5deg); } 100% { opacity:1; transform: scale(1) rotate(0deg); } }
          @keyframes textIn { from { opacity:0; transform: translateY(16px); } to { opacity:1; transform: translateY(0); } }
          @keyframes splashOut { from { opacity:1; } to { opacity:0; visibility: hidden; pointer-events: none; } }
        `}</style>
      </body>
    </html>
  )
}
