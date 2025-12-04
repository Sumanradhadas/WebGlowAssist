import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertCallLogSchema, insertLeadSchema } from "@shared/schema";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

function escapeHtml(text: string): string {
  const htmlEntities: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  };
  return text.replace(/[&<>"']/g, (char) => htmlEntities[char] || char);
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins} minute${mins !== 1 ? "s" : ""} ${secs} second${secs !== 1 ? "s" : ""}`;
}

export async function registerRoutes(
  httpServer: Server,
  app: Express,
): Promise<Server> {
  app.post("/api/notify", async (req, res) => {
    try {
      const { transcript, callStartTime, callEndTime, duration, browserInfo } = req.body;

      if (!transcript || transcript.trim().length === 0) {
        return res.status(400).json({ error: "No transcript provided" });
      }

      const startDate = new Date(callStartTime);
      const endDate = new Date(callEndTime);
      const durationSeconds = parseInt(duration, 10) || 0;

      const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2dd4bf;">New Voice Service Usage</h2>
          <p>A visitor used the voice service on the WebGlow Support website.</p>
          
          <div style="background-color: #1e293b; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #2dd4bf; margin-top: 0;">Call Details</h3>
            <table style="width: 100%; color: #e2e8f0;">
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #334155;"><strong>Start Time:</strong></td>
                <td style="padding: 8px 0; border-bottom: 1px solid #334155;">${startDate.toLocaleString()}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #334155;"><strong>End Time:</strong></td>
                <td style="padding: 8px 0; border-bottom: 1px solid #334155;">${endDate.toLocaleString()}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #334155;"><strong>Duration:</strong></td>
                <td style="padding: 8px 0; border-bottom: 1px solid #334155;">${formatDuration(durationSeconds)}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0;"><strong>Browser/Device:</strong></td>
                <td style="padding: 8px 0;">${browserInfo || "Unknown"}</td>
              </tr>
            </table>
          </div>
          
          <div style="background-color: #0f172a; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #2dd4bf; margin-top: 0;">Transcript</h3>
            <pre style="color: #e2e8f0; white-space: pre-wrap; word-wrap: break-word; font-family: monospace; font-size: 14px; line-height: 1.6; margin: 0;">${escapeHtml(transcript)}</pre>
          </div>
          
          <hr style="border: none; border-top: 1px solid #334155; margin: 20px 0;">
          <p style="color: #64748b; font-size: 12px;">This is an automated notification from WebGlow Support.</p>
        </div>
      `;

      await resend.emails.send({
        from: "WebGlow Support <onboarding@resend.dev>",
        to: ["glowseoulaura@yahoo.com"],
        subject: `New Voice Service Usage - ${startDate.toLocaleDateString()} at ${startDate.toLocaleTimeString()}`,
        html: emailHtml,
      });

      console.log("Transcript notification email sent successfully");
      res
        .status(200)
        .json({ success: true, message: "Notification sent successfully" });
    } catch (error) {
      console.error("Error sending notification:", error);
      res.status(500).json({ error: "Failed to send notification" });
    }
  });

  app.post("/api/calls", async (req, res) => {
    try {
      const result = insertCallLogSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({
          error: "Invalid call log data",
          details: result.error.issues,
        });
      }

      const callLog = await storage.createCallLog(result.data);
      res.status(201).json(callLog);
    } catch (error) {
      console.error("Error creating call log:", error);
      res.status(500).json({ error: "Failed to create call log" });
    }
  });

  app.get("/api/calls", async (_req, res) => {
    try {
      const callLogs = await storage.getCallLogs();
      res.json(callLogs);
    } catch (error) {
      console.error("Error fetching call logs:", error);
      res.status(500).json({ error: "Failed to fetch call logs" });
    }
  });

  app.get("/api/calls/:id", async (req, res) => {
    try {
      const callLog = await storage.getCallLog(req.params.id);
      if (!callLog) {
        return res.status(404).json({ error: "Call log not found" });
      }
      res.json(callLog);
    } catch (error) {
      console.error("Error fetching call log:", error);
      res.status(500).json({ error: "Failed to fetch call log" });
    }
  });

  app.patch("/api/calls/:id", async (req, res) => {
    try {
      const updates = req.body;
      const callLog = await storage.updateCallLog(req.params.id, updates);
      if (!callLog) {
        return res.status(404).json({ error: "Call log not found" });
      }
      res.json(callLog);
    } catch (error) {
      console.error("Error updating call log:", error);
      res.status(500).json({ error: "Failed to update call log" });
    }
  });

  app.get("/api/stats", async (_req, res) => {
    try {
      const stats = await storage.getCallStats();
      const leads = await storage.getLeads();

      res.json({
        ...stats,
        totalLeads: leads.length,
        leadCaptureRate:
          stats.totalCalls > 0
            ? Math.round((leads.length / stats.totalCalls) * 100)
            : 0,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
      res.status(500).json({ error: "Failed to fetch stats" });
    }
  });

  app.post("/api/leads", async (req, res) => {
    try {
      const result = insertLeadSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({
          error: "Invalid lead data",
          details: result.error.issues,
        });
      }

      const lead = await storage.createLead(result.data);
      res.status(201).json(lead);
    } catch (error) {
      console.error("Error creating lead:", error);
      res.status(500).json({ error: "Failed to create lead" });
    }
  });

  app.get("/api/leads", async (_req, res) => {
    try {
      const leads = await storage.getLeads();
      res.json(leads);
    } catch (error) {
      console.error("Error fetching leads:", error);
      res.status(500).json({ error: "Failed to fetch leads" });
    }
  });

  app.get("/api/leads/:id", async (req, res) => {
    try {
      const lead = await storage.getLead(req.params.id);
      if (!lead) {
        return res.status(404).json({ error: "Lead not found" });
      }
      res.json(lead);
    } catch (error) {
      console.error("Error fetching lead:", error);
      res.status(500).json({ error: "Failed to fetch lead" });
    }
  });

  return httpServer;
}
