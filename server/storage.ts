import { 
  type User, type InsertUser, 
  type CallLog, type InsertCallLog, 
  type Lead, type InsertLead,
  users, callLogs, leads 
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, sql } from "drizzle-orm";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  createCallLog(callLog: InsertCallLog): Promise<CallLog>;
  getCallLogs(): Promise<CallLog[]>;
  getCallLog(id: string): Promise<CallLog | undefined>;
  getCallLogByVapiId(vapiCallId: string): Promise<CallLog | undefined>;
  updateCallLog(id: string, updates: Partial<InsertCallLog>): Promise<CallLog | undefined>;
  getCallStats(): Promise<{
    totalCalls: number;
    avgDuration: number;
    totalDuration: number;
    completedCalls: number;
  }>;

  createLead(lead: InsertLead): Promise<Lead>;
  getLeads(): Promise<Lead[]>;
  getLead(id: string): Promise<Lead | undefined>;
  getLeadByCallId(callLogId: string): Promise<Lead | undefined>;
}

class InMemoryStorage implements IStorage {
  private users: User[] = [];
  private callLogs: CallLog[] = [];
  private leads: Lead[] = [];

  async getUser(id: string): Promise<User | undefined> {
    return this.users.find(u => u.id === id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return this.users.find(u => u.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const user: User = {
      id: randomUUID(),
      username: insertUser.username,
      password: insertUser.password,
    };
    this.users.push(user);
    return user;
  }

  async createCallLog(insertCallLog: InsertCallLog): Promise<CallLog> {
    const callLog: CallLog = {
      id: randomUUID(),
      vapiCallId: insertCallLog.vapiCallId || null,
      duration: insertCallLog.duration ?? 0,
      status: insertCallLog.status ?? "pending",
      startedAt: new Date(),
      endedAt: insertCallLog.endedAt ? new Date(insertCallLog.endedAt) : null,
      recordingUrl: insertCallLog.recordingUrl || null,
      transcript: insertCallLog.transcript || null,
    };
    this.callLogs.push(callLog);
    return callLog;
  }

  async getCallLogs(): Promise<CallLog[]> {
    return [...this.callLogs].sort((a, b) => 
      new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()
    );
  }

  async getCallLog(id: string): Promise<CallLog | undefined> {
    return this.callLogs.find(c => c.id === id);
  }

  async getCallLogByVapiId(vapiCallId: string): Promise<CallLog | undefined> {
    return this.callLogs.find(c => c.vapiCallId === vapiCallId);
  }

  async updateCallLog(id: string, updates: Partial<InsertCallLog>): Promise<CallLog | undefined> {
    const index = this.callLogs.findIndex(c => c.id === id);
    if (index === -1) return undefined;
    
    const callLog = this.callLogs[index];
    if (updates.duration !== undefined) callLog.duration = updates.duration;
    if (updates.status !== undefined) callLog.status = updates.status;
    if (updates.endedAt !== undefined) callLog.endedAt = updates.endedAt ? new Date(updates.endedAt) : null;
    if (updates.recordingUrl !== undefined) callLog.recordingUrl = updates.recordingUrl;
    if (updates.transcript !== undefined) callLog.transcript = updates.transcript;
    if (updates.vapiCallId !== undefined) callLog.vapiCallId = updates.vapiCallId;
    
    return callLog;
  }

  async getCallStats(): Promise<{
    totalCalls: number;
    avgDuration: number;
    totalDuration: number;
    completedCalls: number;
  }> {
    const totalCalls = this.callLogs.length;
    const totalDuration = this.callLogs.reduce((sum, c) => sum + (c.duration || 0), 0);
    const avgDuration = totalCalls > 0 ? Math.round(totalDuration / totalCalls) : 0;
    const completedCalls = this.callLogs.filter(c => c.status === "completed").length;
    
    return { totalCalls, avgDuration, totalDuration, completedCalls };
  }

  async createLead(insertLead: InsertLead): Promise<Lead> {
    const lead: Lead = {
      id: randomUUID(),
      callLogId: insertLead.callLogId || null,
      name: insertLead.name || null,
      email: insertLead.email || null,
      phone: insertLead.phone || null,
      company: insertLead.company || null,
      notes: insertLead.notes || null,
      extractedData: insertLead.extractedData || null,
      createdAt: new Date(),
    };
    this.leads.push(lead);
    return lead;
  }

  async getLeads(): Promise<Lead[]> {
    return [...this.leads].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async getLead(id: string): Promise<Lead | undefined> {
    return this.leads.find(l => l.id === id);
  }

  async getLeadByCallId(callLogId: string): Promise<Lead | undefined> {
    return this.leads.find(l => l.callLogId === callLogId);
  }
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    if (!db) throw new Error("Database not available");
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    if (!db) throw new Error("Database not available");
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    if (!db) throw new Error("Database not available");
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async createCallLog(insertCallLog: InsertCallLog): Promise<CallLog> {
    if (!db) throw new Error("Database not available");
    const [callLog] = await db.insert(callLogs).values({
      vapiCallId: insertCallLog.vapiCallId || null,
      duration: insertCallLog.duration,
      status: insertCallLog.status,
      endedAt: insertCallLog.endedAt ? new Date(insertCallLog.endedAt) : null,
      recordingUrl: insertCallLog.recordingUrl || null,
      transcript: insertCallLog.transcript || null,
    }).returning();
    return callLog;
  }

  async getCallLogs(): Promise<CallLog[]> {
    if (!db) throw new Error("Database not available");
    return db.select().from(callLogs).orderBy(desc(callLogs.startedAt));
  }

  async getCallLog(id: string): Promise<CallLog | undefined> {
    if (!db) throw new Error("Database not available");
    const [callLog] = await db.select().from(callLogs).where(eq(callLogs.id, id));
    return callLog;
  }

  async getCallLogByVapiId(vapiCallId: string): Promise<CallLog | undefined> {
    if (!db) throw new Error("Database not available");
    const [callLog] = await db.select().from(callLogs).where(eq(callLogs.vapiCallId, vapiCallId));
    return callLog;
  }

  async updateCallLog(id: string, updates: Partial<InsertCallLog>): Promise<CallLog | undefined> {
    if (!db) throw new Error("Database not available");
    const updateData: Record<string, unknown> = {};
    
    if (updates.duration !== undefined) updateData.duration = updates.duration;
    if (updates.status !== undefined) updateData.status = updates.status;
    if (updates.endedAt !== undefined) updateData.endedAt = updates.endedAt ? new Date(updates.endedAt) : null;
    if (updates.recordingUrl !== undefined) updateData.recordingUrl = updates.recordingUrl;
    if (updates.transcript !== undefined) updateData.transcript = updates.transcript;
    if (updates.vapiCallId !== undefined) updateData.vapiCallId = updates.vapiCallId;

    const [callLog] = await db.update(callLogs).set(updateData).where(eq(callLogs.id, id)).returning();
    return callLog;
  }

  async getCallStats(): Promise<{
    totalCalls: number;
    avgDuration: number;
    totalDuration: number;
    completedCalls: number;
  }> {
    if (!db) throw new Error("Database not available");
    const [stats] = await db.select({
      totalCalls: sql<number>`count(*)::int`,
      totalDuration: sql<number>`coalesce(sum(${callLogs.duration}), 0)::int`,
      avgDuration: sql<number>`coalesce(avg(${callLogs.duration}), 0)::int`,
      completedCalls: sql<number>`count(*) filter (where ${callLogs.status} = 'completed')::int`,
    }).from(callLogs);
    
    return stats || { totalCalls: 0, avgDuration: 0, totalDuration: 0, completedCalls: 0 };
  }

  async createLead(insertLead: InsertLead): Promise<Lead> {
    if (!db) throw new Error("Database not available");
    const [lead] = await db.insert(leads).values({
      callLogId: insertLead.callLogId || null,
      name: insertLead.name || null,
      email: insertLead.email || null,
      phone: insertLead.phone || null,
      company: insertLead.company || null,
      notes: insertLead.notes || null,
      extractedData: insertLead.extractedData || null,
    }).returning();
    return lead;
  }

  async getLeads(): Promise<Lead[]> {
    if (!db) throw new Error("Database not available");
    return db.select().from(leads).orderBy(desc(leads.createdAt));
  }

  async getLead(id: string): Promise<Lead | undefined> {
    if (!db) throw new Error("Database not available");
    const [lead] = await db.select().from(leads).where(eq(leads.id, id));
    return lead;
  }

  async getLeadByCallId(callLogId: string): Promise<Lead | undefined> {
    if (!db) throw new Error("Database not available");
    const [lead] = await db.select().from(leads).where(eq(leads.callLogId, callLogId));
    return lead;
  }
}

export const storage: IStorage = db ? new DatabaseStorage() : new InMemoryStorage();
