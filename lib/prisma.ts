// Prisma Client — compatible Prisma 8+
// Note: Après npm run db:push, exécutez: npx prisma generate

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let prismaInstance: any = null

// Lazy import pour éviter les erreurs de build si le client n'est pas encore généré
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function getPrisma(): Promise<any> {
  if (prismaInstance) return prismaInstance
  const { PrismaClient } = await import('@prisma/client')
  prismaInstance = new PrismaClient({ log: ['error'] })
  return prismaInstance
}

// Export synchrone pour les Server Components
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const globalForPrisma = globalThis as unknown as { prisma: any }

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { PrismaClient } = (() => {
  try {
    return require('@prisma/client')
  } catch {
    return { PrismaClient: null }
  }
})()

export const prisma = PrismaClient
  ? (globalForPrisma.prisma ?? new PrismaClient({ log: ['error'] }))
  : null as unknown as ReturnType<typeof PrismaClient extends new () => infer R ? () => R : never>

if (process.env.NODE_ENV !== 'production' && PrismaClient) {
  globalForPrisma.prisma = prisma
}

export { getPrisma }
