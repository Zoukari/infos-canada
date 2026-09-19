import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const CATEGORIES = [
  { slug: 'gouvernement-nb', name: 'Gouvernement NB', province: 'NB', priority: 90 },
  { slug: 'politique-nb', name: 'Politique NB', province: 'NB', priority: 88 },
  { slug: 'immigration-nb', name: 'Immigration NB', province: 'NB', priority: 95 },
  { slug: 'nbpnp', name: 'Programme Candidats NB', province: 'NB', priority: 92 },
  { slug: 'emploi-nb', name: 'Emploi NB', province: 'NB', priority: 85 },
  { slug: 'logement-nb', name: 'Logement NB', province: 'NB', priority: 82 },
  { slug: 'sante-nb', name: 'Santé NB', province: 'NB', priority: 78 },
  { slug: 'education-nb', name: 'Éducation NB', province: 'NB', priority: 75 },
  { slug: 'economie-nb', name: 'Économie NB', province: 'NB', priority: 80 },
  { slug: 'moncton', name: 'Moncton', province: 'NB', priority: 70 },
  { slug: 'dieppe', name: 'Dieppe', province: 'NB', priority: 68 },
  { slug: 'fredericton', name: 'Fredericton', province: 'NB', priority: 68 },
  { slug: 'saint-john', name: 'Saint John', province: 'NB', priority: 65 },
  { slug: 'edmundston', name: 'Edmundston', province: 'NB', priority: 63 },
  { slug: 'actualites-nb', name: 'Actualités NB', province: 'NB', priority: 72 },
  { slug: 'gouvernement-federal', name: 'Gouvernement fédéral', province: 'federal', priority: 85 },
  { slug: 'politique-federale', name: 'Politique fédérale', province: 'federal', priority: 83 },
  { slug: 'immigration-canada', name: 'Immigration Canada', province: 'federal', priority: 90 },
  { slug: 'entree-express', name: 'Entrée express', province: 'federal', priority: 92 },
  { slug: 'francophonie', name: 'Francophonie', province: 'federal', priority: 88 },
  { slug: 'residence-permanente', name: 'Résidence permanente', province: 'federal', priority: 88 },
  { slug: 'permis-travail', name: 'Permis de travail', province: 'federal', priority: 85 },
  { slug: 'permis-etudes', name: "Permis d'études", province: 'federal', priority: 82 },
  { slug: 'citoyennete', name: 'Citoyenneté', province: 'federal', priority: 80 },
  { slug: 'economie', name: 'Économie', province: 'federal', priority: 80 },
  { slug: 'emploi', name: 'Emploi', province: 'federal', priority: 78 },
  { slug: 'logement', name: 'Logement', province: 'federal', priority: 78 },
  { slug: 'sante', name: 'Santé', province: 'federal', priority: 75 },
  { slug: 'taux-interet', name: "Taux d'intérêt", province: 'federal', priority: 82 },
  { slug: 'inflation', name: 'Inflation', province: 'federal', priority: 80 },
  { slug: 'fiscalite', name: 'Fiscalité', province: 'federal', priority: 75 },
  { slug: 'actualites', name: 'Actualités Canada', province: 'federal', priority: 60 },
]

async function main() {
  console.log('🌱 Seeding...')
  for (const cat of CATEGORIES) {
    await prisma.category.upsert({ where: { slug: cat.slug }, update: cat, create: cat })
  }
  console.log(`✅ ${CATEGORIES.length} catégories`)
  console.log('🎉 Seed terminé')
}

main().catch(e => { console.error(e); process.exit(1) }).finally(() => prisma.$disconnect())
