import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: {
    template: '%s | Infos Canada',
    default: 'Infos Canada — Toute l\'actualité utile du Canada, au même endroit',
  },
  description: 'Actualités, immigration, politique, emploi, logement et économie au Canada, avec une attention particulière au Nouveau-Brunswick.',
  keywords: ['Canada', 'Nouveau-Brunswick', 'immigration', 'emploi', 'logement', 'actualités'],
  openGraph: {
    siteName: 'Infos Canada',
    type: 'website',
    locale: 'fr_CA',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <head>
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🇨🇦</text></svg>" />
      </head>
      <body>{children}</body>
    </html>
  )
}
