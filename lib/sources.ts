// Sources vérifiées + Google News RSS (agrège automatiquement toutes les sources)
export const WORKING_SOURCES = [
  // Sources officielles directes
  { name: 'IRCC — Officiel', url: 'https://www.canada.ca/fr/immigration-refugies-citoyennete.html', rssUrl: 'https://api.io.canada.ca/io-server/gc/news/fr/v2?dept=departmentofcitizenshipandimmigration&sort=publishedDate&orderBy=desc&publishedDate%3E=2025-01-01&pick=50&format=atom&atomtitle=IRCC', type: 'rss', province: 'federal', defaultCategory: 'immigration-canada' },
  { name: 'Radio-Canada Canada', url: 'https://ici.radio-canada.ca', rssUrl: 'https://ici.radio-canada.ca/rss/4159', type: 'rss', province: 'federal', defaultCategory: 'politique-federale' },
  { name: 'Immigrer.com', url: 'https://www.immigrer.com', rssUrl: 'https://www.immigrer.com/feed/', type: 'rss', province: 'federal', defaultCategory: 'immigration-canada' },
  { name: 'Banque du Canada', url: 'https://www.banqueducanada.ca', rssUrl: 'https://www.banqueducanada.ca/feed/', type: 'rss', province: 'federal', defaultCategory: 'taux-interet' },
  // Google News — agrège Radio-Canada, CBC, Acadie Nouvelle, médias locaux automatiquement
  { name: 'Google News — Nouveau-Brunswick', url: 'https://news.google.com', rssUrl: 'https://news.google.com/rss/search?q=Nouveau-Brunswick&hl=fr-CA&gl=CA&ceid=CA:fr', type: 'rss', province: 'NB', defaultCategory: 'actualites-nb' },
  { name: 'Google News — Immigration NB', url: 'https://news.google.com', rssUrl: 'https://news.google.com/rss/search?q=immigration%20Nouveau-Brunswick&hl=fr-CA&gl=CA&ceid=CA:fr', type: 'rss', province: 'NB', defaultCategory: 'immigration-nb' },
  { name: 'Google News — Emploi NB', url: 'https://news.google.com', rssUrl: 'https://news.google.com/rss/search?q=emploi%20Nouveau-Brunswick&hl=fr-CA&gl=CA&ceid=CA:fr', type: 'rss', province: 'NB', defaultCategory: 'emploi-nb' },
  { name: 'Google News — Logement NB', url: 'https://news.google.com', rssUrl: 'https://news.google.com/rss/search?q=logement%20loyer%20Nouveau-Brunswick&hl=fr-CA&gl=CA&ceid=CA:fr', type: 'rss', province: 'NB', defaultCategory: 'logement-nb' },
  { name: 'Google News — Moncton', url: 'https://news.google.com', rssUrl: 'https://news.google.com/rss/search?q=Moncton&hl=fr-CA&gl=CA&ceid=CA:fr', type: 'rss', province: 'NB', defaultCategory: 'moncton' },
  { name: 'Google News — Emploi Canada', url: 'https://news.google.com', rssUrl: 'https://news.google.com/rss/search?q=emploi%20chomage%20Canada&hl=fr-CA&gl=CA&ceid=CA:fr', type: 'rss', province: 'federal', defaultCategory: 'emploi' },
  { name: 'Google News — Logement Canada', url: 'https://news.google.com', rssUrl: 'https://news.google.com/rss/search?q=logement%20immobilier%20Canada&hl=fr-CA&gl=CA&ceid=CA:fr', type: 'rss', province: 'federal', defaultCategory: 'logement' },
]
