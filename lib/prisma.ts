import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Force pgbouncer=true si absent — obligatoire avec le pooler Supabase (port 6543)
// pour éviter "prepared statement already exists" en environnement serverless
function getDatabaseUrl(): string {
  const url = process.env.DATABASE_URL || ''
  if (url.includes('pgbouncer=')) return url
  const separator = url.includes('?') ? '&' : '?'
  return `${url}${separator}pgbouncer=true&connection_limit=1`
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['error'],
    datasources: {
      db: { url: getDatabaseUrl() },
    },
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
