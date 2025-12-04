import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const callLogs = pgTable("call_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  vapiCallId: text("vapi_call_id"),
  duration: integer("duration").notNull(),
  status: text("status").notNull(),
  startedAt: timestamp("started_at").defaultNow().notNull(),
  endedAt: timestamp("ended_at"),
  recordingUrl: text("recording_url"),
  transcript: text("transcript"),
});

export const insertCallLogSchema = z.object({
  vapiCallId: z.string().optional(),
  duration: z.number().int().min(0),
  status: z.string(),
  endedAt: z.string().nullable().optional(),
  recordingUrl: z.string().nullable().optional(),
  transcript: z.string().nullable().optional(),
});

export type InsertCallLog = z.infer<typeof insertCallLogSchema>;
export type CallLog = typeof callLogs.$inferSelect;

export const leads = pgTable("leads", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  callLogId: varchar("call_log_id").references(() => callLogs.id),
  name: text("name"),
  email: text("email"),
  phone: text("phone"),
  company: text("company"),
  notes: text("notes"),
  extractedData: jsonb("extracted_data"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertLeadSchema = z.object({
  callLogId: z.string().optional(),
  name: z.string().nullable().optional(),
  email: z.string().email().nullable().optional(),
  phone: z.string().nullable().optional(),
  company: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  extractedData: z.record(z.any()).nullable().optional(),
});

export type InsertLead = z.infer<typeof insertLeadSchema>;
export type Lead = typeof leads.$inferSelect;
