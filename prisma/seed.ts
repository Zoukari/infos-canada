// eslint-disable-next-line @typescript-eslint/no-var-requires
const { PrismaClient } = require('@prisma/client')
import { INITIAL_SOURCES, CATEGORIES } from '../lib/sources'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding categories…')
  for (const cat of CATEGORIES) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: cat,
      create: cat,
    })
  }
  console.log(`✅ ${CATEGORIES.length} catégories créées`)

  console.log('🌱 Seeding sources…')
  for (const src of INITIAL_SOURCES) {
    const existing = await prisma.source.findFirst({ where: { url: src.url } })
    if (!existing) {
      await prisma.source.create({ data: src })
    }
  }
  console.log(`✅ ${INITIAL_SOURCES.length} sources vérifiées/créées`)
  
  console.log('🌱 Seeding watch items…')
  const watchItems = [
    { title: 'Prochain tirage Entrée Express', description: 'Les tirages Entrée Express ont lieu environ toutes les 2 semaines. Suivez le score CRS minimum requis et le nombre d\'invitations émises.', type: 'immigration', province: 'federal', priority: 95 },
    { title: 'Programme Candidats NB (NBPNP)', description: 'Ouvertures périodiques des différents volets du Programme des candidats du Nouveau-Brunswick pour les travailleurs qualifiés, entrepreneurs et étudiants diplômés.', type: 'immigration', province: 'NB', priority: 92 },
    { title: 'Mises à jour IRCC — Délais de traitement', description: 'L\'IRCC met à jour régulièrement les délais de traitement pour les demandes de résidence permanente, permis de travail et d\'études.', type: 'immigration', province: 'federal', priority: 80 },
    { title: 'Budget fédéral Canada', description: 'Le budget fédéral est généralement présenté au printemps. Attendez-vous à des annonces importantes sur l\'immigration, le logement et le marché du travail.', type: 'budget', province: 'federal', priority: 88 },
    { title: 'Décision taux directeur — Banque du Canada', description: 'La Banque du Canada annonce ses décisions sur les taux directeurs environ 8 fois par an. Ces décisions affectent les taux hypothécaires et le coût du crédit.', type: 'date', province: 'federal', priority: 82 },
    { title: 'Nouvelles données sur le logement', description: 'Statistique Canada publie régulièrement des données sur le marché du logement, les prix et les nouvelles constructions.', type: 'date', province: 'federal', priority: 70 },
    { title: 'Salaire minimum NB', description: 'Le salaire minimum au Nouveau-Brunswick est révisé annuellement. Toute modification est annoncée plusieurs mois à l\'avance.', type: 'law', province: 'NB', priority: 75 },
  ]
  
  for (const item of watchItems) {
    await prisma.watchItem.create({ data: item }).catch(() => {})
  }
  console.log('✅ Watch items créés')
  
  console.log('\n🎉 Seed terminé avec succès !')
  console.log('👉 Prochaine étape: lancez une collecte depuis /admin')
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
