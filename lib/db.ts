import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "../shared/schema";

type DbType = ReturnType<typeof drizzle>;

declare const globalThis: {
  __db?: DbType | null;
};

export function getDb(): DbType | null {
  if (globalThis.__db === undefined && process.env.DATABASE_URL) {
    try {
      const sql = neon(process.env.DATABASE_URL);
      globalThis.__db = drizzle(sql, { schema });
    } catch (error) {
      console.error("Failed to initialize database:", error);
      globalThis.__db = null;
    }
  }
  return globalThis.__db ?? null;
}

export const db = getDb();
