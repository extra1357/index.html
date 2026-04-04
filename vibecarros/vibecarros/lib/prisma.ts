import { PrismaClient } from "../app/generated/prisma/client"
import { PrismaNeon } from "@prisma/adapter-neon"
import { neonConfig, Pool } from "@neondatabase/serverless"
import ws from "ws"

if (typeof window === "undefined") {
  neonConfig.webSocketConstructor = ws
}

const globalForPrisma = global as unknown as {
  prisma: PrismaClient
  pool: Pool
}

function createPrismaClient() {
  const pool = globalForPrisma.pool ?? new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
  })

  if (process.env.NODE_ENV !== "production") globalForPrisma.pool = pool

  const adapter = new PrismaNeon(pool)

  return new PrismaClient({
    adapter,
    log: ["error", "warn"],
  })
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma
