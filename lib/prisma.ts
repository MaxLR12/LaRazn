import { PrismaClient } from "@/app/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import path from "path";

function createPrismaClient() {
  // DATABASE_URL puede ser "file:/app/prisma/data.db" (Railway, ruta absoluta)
  // o "file:./prisma/dev.db" (local, relativa a cwd). Normalizamos ambos casos.
  const raw = process.env.DATABASE_URL?.replace(/^file:/, "") ?? "./prisma/dev.db";
  const dbPath = path.isAbsolute(raw) ? raw : path.join(process.cwd(), raw);
  const adapter = new PrismaBetterSqlite3({ url: dbPath });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return new (PrismaClient as any)({ adapter }) as PrismaClient;
}

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };
export const prisma = globalForPrisma.prisma ?? createPrismaClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
