import Parser from 'rss-parser'
import crypto from 'crypto'
import { prisma } from './prisma'

const parser = new Parser({
  timeout: 10000,
  headers: {
    'User-Agent': 'InfosCanada-Bot/1.0 (https://infos-canada.vercel.app; contact@infos-canada.ca)',
  },
  customFields: {
    item: ['source'],
  },
})

// Google News ajoute " - NomDuMédia" à la fin du titre — on nettoie
function cleanGoogleNewsTitle(title: string): string {
  return title.replace(/\s+-\s+[^-]{2,40}$/, '').trim()
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 100)
    + '-' + Date.now().toString(36)
}

function hashContent(url: string, title: string): string {
  return crypto.createHash('sha256').update(url + title).digest('hex').substring(0, 16)
}

function detectProvince(text: string): string {
  const t = text.toLowerCase()
  if (t.includes('nouveau-brunswick') || t.includes('new brunswick') || t.includes('nb ') || t.includes('moncton') || t.includes('fredericton') || t.includes('dieppe') || t.includes('saint john') || t.includes('edmundston')) return 'NB'
  if (t.includes('québec') || t.includes('quebec')) return 'QC'
  if (t.includes('ontario')) return 'ON'
  if (t.includes('alberta')) return 'AB'
  if (t.includes('colombie-britannique') || t.includes('british columbia')) return 'BC'
  if (t.includes('nova scotia') || t.includes('nouvelle-écosse')) return 'NS'
  if (t.includes('île-du-prince') || t.includes('prince edward')) return 'PE'
  if (t.includes('terra-neuve') || t.includes('newfoundland')) return 'NL'
  if (t.includes('manitoba')) return 'MB'
  if (t.includes('saskatchewan')) return 'SK'
  return 'CA'
}

function detectCity(text: string): string | null {
  const t = text.toLowerCase()
  if (t.includes('moncton')) return 'Moncton'
  if (t.includes('dieppe')) return 'Dieppe'
  if (t.includes('fredericton')) return 'Fredericton'
  if (t.includes('saint john')) return 'Saint John'
  if (t.includes('edmundston')) return 'Edmundston'
  if (t.includes('campbellton')) return 'Campbellton'
  if (t.includes('bathurst')) return 'Bathurst'
  return null
}

function detectCategorySlug(text: string, sourceCategory?: string | null): string {
  const t = text.toLowerCase()
  if (t.includes('entrée express') || t.includes('express entry') || t.includes('crs') || t.includes('draw')) return 'entree-express'
  if (t.includes('nbpnp') || t.includes('candidats du nouveau-brunswick') || t.includes('provincial nominee') && t.includes('brunswick')) return 'nbpnp'
  if (t.includes('immigration') && (t.includes('nouveau-brunswick') || t.includes('new brunswick'))) return 'immigration-nb'
  if (t.includes('immigration') || t.includes('ircc') || t.includes('résidence permanente') || t.includes('permanent resident')) return 'immigration-canada'
  if (t.includes('moncton')) return 'moncton'
  if (t.includes('dieppe')) return 'dieppe'
  if (t.includes('fredericton')) return 'fredericton'
  if (t.includes('saint john') && !t.includes('st. john')) return 'saint-john'
  if (t.includes('edmundston')) return 'edmundston'
  if ((t.includes('logement') || t.includes('loyer') || t.includes('housing') || t.includes('rent')) && (t.includes('nouveau-brunswick') || t.includes('nb '))) return 'logement-nb'
  if (t.includes('logement') || t.includes('loyer') || t.includes('housing') || t.includes('rent') || t.includes('immobilier')) return 'logement'
  if ((t.includes('emploi') || t.includes('travail') || t.includes('job') || t.includes('recrutement')) && (t.includes('nouveau-brunswick') || t.includes('nb '))) return 'emploi-nb'
  if (t.includes('emploi') || t.includes('chômage') || t.includes('unemployment') || t.includes('job')) return 'emploi'
  if (t.includes('salaire minimum') || t.includes('minimum wage')) return 'emploi'
  if (t.includes('santé') || t.includes('health') || t.includes('hôpital') || t.includes('médecin')) return 'sante'
  if (t.includes('taux') || t.includes('banque') || t.includes('inflation') || t.includes('économie')) return 'economie'
  if (t.includes('politique') || t.includes('élection') || t.includes('premier ministre') || t.includes('assemblée')) return 'politique-federale'
  if (t.includes('francoph')) return 'francophonie'
  if (t.includes('nouveau-brunswick') || t.includes('new brunswick')) return 'actualites-nb'
  return sourceCategory || 'actualites'
}

function calculateImportance(text: string, province: string, categorySlug: string): number {
  let score = 40
  
  // Bonus province NB
  if (province === 'NB') score += 20
  
  // Bonus catégories prioritaires
  const highPriority = ['entree-express', 'nbpnp', 'immigration-nb', 'immigration-canada', 'logement-nb', 'emploi-nb']
  const medPriority = ['gouvernement-federal', 'gouvernement-nb', 'politique-federale', 'logement', 'emploi', 'economie', 'sante']
  if (highPriority.includes(categorySlug)) score += 25
  else if (medPriority.includes(categorySlug)) score += 15
  
  // Mots-clés importants
  const t = text.toLowerCase()
  const importantWords = ['nouveau', 'changement', 'augmentation', 'loi', 'budget', 'annonce', 'ouverture', 'fermeture', 'urgent', 'important', 'modification', 'suspension']
  importantWords.forEach(w => { if (t.includes(w)) score += 3 })
  
  return Math.min(100, score)
}

function generateSummary(title: string, description: string | undefined): { summary: string; whyItMatters: string } {
  const desc = description ? description.replace(/<[^>]*>/g, '').substring(0, 500) : ''
  const summary = desc.length > 50 ? desc.substring(0, 280) + (desc.length > 280 ? '…' : '') : title
  
  const t = (title + ' ' + desc).toLowerCase()
  let whyItMatters = ''
  
  if (t.includes('immigration') || t.includes('nbpnp') || t.includes('entrée express')) {
    whyItMatters = 'Cette information peut affecter directement les personnes qui souhaitent immigrer ou obtenir leur résidence permanente au Canada.'
  } else if (t.includes('logement') || t.includes('loyer') || t.includes('rent')) {
    whyItMatters = 'Ces données sont importantes pour les locataires et propriétaires qui cherchent à se loger ou investir au Nouveau-Brunswick.'
  } else if (t.includes('emploi') || t.includes('travail') || t.includes('recrutement')) {
    whyItMatters = 'Cette actualité intéresse les travailleurs, chercheurs d\'emploi et entreprises du Nouveau-Brunswick.'
  } else if (t.includes('santé')) {
    whyItMatters = 'Cette information concerne les résidents du Nouveau-Brunswick et leur accès aux services de santé.'
  } else if (t.includes('économie') || t.includes('inflation') || t.includes('taux')) {
    whyItMatters = 'Cette donnée économique peut influencer le coût de la vie et les décisions financières des habitants du Canada.'
  } else if (t.includes('politique') || t.includes('loi') || t.includes('budget')) {
    whyItMatters = 'Cette décision politique peut avoir des effets concrets sur la vie quotidienne des résidents et des nouveaux arrivants.'
  } else {
    whyItMatters = 'À suivre pour comprendre l\'évolution de la situation au Canada et au Nouveau-Brunswick.'
  }
  
  return { summary, whyItMatters }
}

export async function scrapeSource(sourceId: string): Promise<{ fetched: number; newArticles: number; error?: string }> {
  const source = await prisma.source.findUnique({ where: { id: sourceId } })
  if (!source || !source.active) return { fetched: 0, newArticles: 0 }
  
  const log = await prisma.scrapingLog.create({
    data: { sourceId, status: 'running' }
  })
  
  let fetched = 0
  let newArticles = 0
  
  try {
    if (!source.rssUrl) {
      await prisma.scrapingLog.update({
        where: { id: log.id },
        data: { status: 'error', finishedAt: new Date(), errorMessage: 'Pas de RSS URL configuré' }
      })
      return { fetched: 0, newArticles: 0, error: 'Pas de RSS' }
    }
    
    const feed = await parser.parseURL(source.rssUrl)
    fetched = feed.items?.length || 0
    
    for (const item of feed.items || []) {
      if (!item.link || !item.title) continue
      
      // Vérifier si l'article existe déjà
      const existing = await prisma.article.findUnique({ where: { originalUrl: item.link } })
      if (existing) continue
      
      const isGoogleNews = source.url?.includes('news.google.com')
      const titleText = isGoogleNews ? cleanGoogleNewsTitle(item.title) : item.title
      const description = item.contentSnippet || item.content || item.summary || ''
      const fullText = titleText + ' ' + description
      
      const detectedProvince = detectProvince(fullText)
      const province = detectedProvince !== 'CA' ? detectedProvince : (source.province || 'CA')
      const city = detectCity(fullText)
      const categorySlug = detectCategorySlug(fullText, source.defaultCategory)
      const importanceScore = calculateImportance(fullText, province, categorySlug)
      const { summary, whyItMatters } = generateSummary(titleText, description)
      const contentHash = hashContent(item.link, titleText)
      
      // Trouver ou créer la catégorie
      let category = await prisma.category.findUnique({ where: { slug: categorySlug } })
      if (!category) {
        category = await prisma.category.findFirst({ where: { slug: 'actualites' } })
      }
      
      const keywords = [...new Set([
        province,
        city,
        categorySlug,
        ...(titleText.toLowerCase().match(/\b(immigration|logement|emploi|santé|politique|économie|moncton|fredericton|dieppe)\b/g) || [])
      ].filter(Boolean))] as string[]
      
      await prisma.article.create({
        data: {
          title: titleText,
          slug: slugify(titleText),
          originalTitle: titleText,
          originalUrl: item.link,
          contentHash,
          sourceId: source.id,
          publishedAt: item.pubDate ? new Date(item.pubDate) : new Date(),
          summary,
          whyItMatters,
          categoryId: category?.id,
          province,
          city,
          importanceScore,
          status: importanceScore >= 40 ? 'published' : 'draft',
          keywords,
        }
      })
      
      newArticles++
    }
    
    // Mettre à jour la source
    await prisma.source.update({
      where: { id: sourceId },
      data: {
        lastSyncAt: new Date(),
        articlesCount: { increment: newArticles },
        errorCount: 0,
        lastError: null,
      }
    })
    
    await prisma.scrapingLog.update({
      where: { id: log.id },
      data: { status: 'success', finishedAt: new Date(), articlesFetched: fetched, articlesNew: newArticles }
    })
    
    return { fetched, newArticles }
    
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : 'Erreur inconnue'
    await prisma.source.update({
      where: { id: sourceId },
      data: { errorCount: { increment: 1 }, lastError: errMsg }
    })
    await prisma.scrapingLog.update({
      where: { id: log.id },
      data: { status: 'error', finishedAt: new Date(), errorMessage: errMsg }
    })
    return { fetched: 0, newArticles: 0, error: errMsg }
  }
}

export async function scrapeAllSources(): Promise<{ total: number; newArticles: number; errors: number }> {
  const sources = await prisma.source.findMany({ where: { active: true } })
  let total = 0
  let newArticles = 0
  let errors = 0
  
  for (const source of sources) {
    // Délai poli entre les requêtes
    await new Promise(r => setTimeout(r, 1500))
    const result = await scrapeSource(source.id)
    total += result.fetched
    newArticles += result.newArticles
    if (result.error) errors++
  }
  
  return { total, newArticles, errors }
}
