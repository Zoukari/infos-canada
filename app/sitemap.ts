import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://infos-canada.vercel.app'
  const routes = ['', '/nouveau-brunswick', '/canada', '/immigration', '/politique', '/emploi', '/logement', '/economie', '/sante', '/a-surveiller', '/recherche']
  return routes.map(route => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1 : 0.8,
  }))
}
