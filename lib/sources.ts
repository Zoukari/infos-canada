export const WORKING_RSS_SOURCES = [
  // Radio-Canada — URLs valides confirmées
  { name: 'Radio-Canada NB', url: 'https://ici.radio-canada.ca', rssUrl: 'https://ici.radio-canada.ca/rss/6307', type: 'rss', province: 'NB', defaultCategory: 'actualites-nb' },
  { name: 'Radio-Canada Canada', url: 'https://ici.radio-canada.ca', rssUrl: 'https://ici.radio-canada.ca/rss/4159', type: 'rss', province: 'federal', defaultCategory: 'politique-federale' },
  { name: 'Radio-Canada Immigration', url: 'https://ici.radio-canada.ca', rssUrl: 'https://ici.radio-canada.ca/rss/5057', type: 'rss', province: 'federal', defaultCategory: 'immigration-canada' },
  // Immigrer.com — fonctionne
  { name: 'Immigrer.com', url: 'https://www.immigrer.com', rssUrl: 'https://www.immigrer.com/feed/', type: 'rss', province: 'federal', defaultCategory: 'immigration-canada' },
  { name: 'Immigrer.com NB', url: 'https://www.immigrer.com', rssUrl: 'https://www.immigrer.com/categories/nouveau-brunswick/feed/', type: 'rss', province: 'NB', defaultCategory: 'immigration-nb' },
  // Banque du Canada — fonctionne
  { name: 'Banque du Canada', url: 'https://www.banqueducanada.ca', rssUrl: 'https://www.banqueducanada.ca/feed/', type: 'rss', province: 'federal', defaultCategory: 'taux-interet' },
  // CBC — URLs corrigées
  { name: 'CBC Canada', url: 'https://www.cbc.ca', rssUrl: 'https://www.cbc.ca/cmlink/rss-canada', type: 'rss', province: 'federal', defaultCategory: 'actualites' },
  { name: 'CBC New Brunswick', url: 'https://www.cbc.ca', rssUrl: 'https://www.cbc.ca/cmlink/rss-canada-newbrunswick', type: 'rss', province: 'NB', defaultCategory: 'actualites-nb' },
  // Le Devoir
  { name: 'Le Devoir', url: 'https://www.ledevoir.com', rssUrl: 'https://www.ledevoir.com/rss/la-une.xml', type: 'rss', province: 'federal', defaultCategory: 'actualites' },
  // Gouvernement Canada
  { name: 'IRCC Nouvelles', url: 'https://www.canada.ca', rssUrl: 'https://www.canada.ca/content/dam/ircc/migration/ircc/francais/immigrer/parrainer/aph-serie/rss/feed-fra.xml', type: 'rss', province: 'federal', defaultCategory: 'immigration-canada' },
]
