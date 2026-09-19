import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: {
    template: '%s | Infos Canada',
    default: 'Infos Canada — Toute l\'actualité utile du Canada',
  },
  description: 'Actualités, immigration, politique, emploi, logement et économie au Canada, avec une priorité sur le Nouveau-Brunswick.',
  keywords: ['Canada', 'Nouveau-Brunswick', 'immigration', 'emploi', 'logement'],
  openGraph: {
    siteName: 'Infos Canada',
    type: 'website',
    locale: 'fr_CA',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <head>
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
      </head>
      <body>{children}</body>
    </html>
  )
}
