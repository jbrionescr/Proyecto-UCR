import { PrismaClient } from "@prisma/client"

declare global {
  // eslint-disable-next-line no-var
  var prismaGlobal: PrismaClient | undefined
}

let prisma: PrismaClient | undefined

function getPrismaClient() {
  if (!prisma) {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL is not set")
    }

    prisma = globalThis.prismaGlobal ?? new PrismaClient()

    if (process.env.NODE_ENV !== "production") {
      globalThis.prismaGlobal = prisma
    }
  }

  return prisma
}

const prismaProxy = new Proxy({} as PrismaClient, {
  get(target, prop) {
    const client = getPrismaClient() as any
    const value = client[prop]
    return typeof value === "function" ? value.bind(client) : value
  }
})

export default prismaProxy
