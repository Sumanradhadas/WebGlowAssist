import { WebSocketServer, WebSocket } from "ws";
import type { Server } from "http";
import { v4 as uuidv4 } from "uuid";

interface TranscriptEntry {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface CallSession {
  id: string;
  status: "idle" | "connecting" | "connected" | "ended" | "failed";
  startTime: Date | null;
  endTime: Date | null;
  duration: number;
  transcript: TranscriptEntry[];
  clientWs: WebSocket | null;
  lastPing: Date;
  reconnectAttempts: number;
}

const sessions = new Map<string, CallSession>();

const KEEP_ALIVE_INTERVAL = 20000;
const SESSION_TIMEOUT = 60000;
const RECONNECT_GRACE_PERIOD = 30000;

export function setupCallSessionWebSocket(server: Server): WebSocketServer {
  const wss = new WebSocketServer({ server, path: "/ws/call" });

  wss.on("connection", (ws: WebSocket) => {
    let sessionId: string | null = null;

    ws.on("message", (data: Buffer) => {
      try {
        const message = JSON.parse(data.toString());
        
        switch (message.type) {
          case "start_session":
            const newSessionId: string = message.sessionId || uuidv4();
            sessionId = newSessionId;
            let session = sessions.get(newSessionId);
            
            if (session) {
              session.clientWs = ws;
              session.lastPing = new Date();
              session.reconnectAttempts = 0;
              ws.send(JSON.stringify({
                type: "session_restored",
                sessionId: newSessionId,
                status: session.status,
                duration: session.duration,
                transcript: session.transcript,
              }));
            } else {
              session = {
                id: newSessionId,
                status: "idle",
                startTime: null,
                endTime: null,
                duration: 0,
                transcript: [],
                clientWs: ws,
                lastPing: new Date(),
                reconnectAttempts: 0,
              };
              sessions.set(newSessionId, session);
              ws.send(JSON.stringify({
                type: "session_created",
                sessionId: newSessionId,
              }));
            }
            break;

          case "call_start":
            if (sessionId) {
              const callSession = sessions.get(sessionId);
              if (callSession) {
                callSession.status = "connecting";
                callSession.startTime = new Date();
                broadcastToSession(sessionId, {
                  type: "status_update",
                  status: "connecting",
                });
              }
            }
            break;

          case "call_connected":
            if (sessionId) {
              const callSession = sessions.get(sessionId);
              if (callSession) {
                callSession.status = "connected";
                broadcastToSession(sessionId, {
                  type: "status_update",
                  status: "connected",
                });
              }
            }
            break;

          case "call_end":
            if (sessionId) {
              const callSession = sessions.get(sessionId);
              if (callSession) {
                callSession.status = "ended";
                callSession.endTime = new Date();
                if (callSession.startTime) {
                  callSession.duration = Math.floor(
                    (callSession.endTime.getTime() - callSession.startTime.getTime()) / 1000
                  );
                }
                broadcastToSession(sessionId, {
                  type: "status_update",
                  status: "ended",
                  duration: callSession.duration,
                });
              }
            }
            break;

          case "transcript":
            if (sessionId) {
              const callSession = sessions.get(sessionId);
              if (callSession) {
                callSession.transcript.push({
                  role: message.role,
                  content: message.content,
                  timestamp: new Date(),
                });
                broadcastToSession(sessionId, {
                  type: "transcript_update",
                  transcript: callSession.transcript,
                });
              }
            }
            break;

          case "ping":
            if (sessionId) {
              const callSession = sessions.get(sessionId);
              if (callSession) {
                callSession.lastPing = new Date();
              }
            }
            ws.send(JSON.stringify({ type: "pong", timestamp: Date.now() }));
            break;

          case "get_session":
            if (message.sessionId) {
              const existingSession = sessions.get(message.sessionId);
              if (existingSession) {
                ws.send(JSON.stringify({
                  type: "session_data",
                  session: {
                    id: existingSession.id,
                    status: existingSession.status,
                    duration: existingSession.duration,
                    transcript: existingSession.transcript,
                  },
                }));
              } else {
                ws.send(JSON.stringify({
                  type: "session_not_found",
                  sessionId: message.sessionId,
                }));
              }
            }
            break;
        }
      } catch (error) {
        console.error("WebSocket message error:", error);
      }
    });

    ws.on("close", () => {
      if (sessionId) {
        const session = sessions.get(sessionId);
        if (session) {
          session.clientWs = null;
          setTimeout(() => {
            const currentSession = sessions.get(sessionId!);
            if (currentSession && !currentSession.clientWs && currentSession.status !== "connected") {
              sessions.delete(sessionId!);
            }
          }, RECONNECT_GRACE_PERIOD);
        }
      }
    });

    ws.on("error", (error) => {
      console.error("WebSocket error:", error);
    });
  });

  setInterval(() => {
    const now = new Date();
    sessions.forEach((session, id) => {
      if (session.clientWs && session.clientWs.readyState === WebSocket.OPEN) {
        session.clientWs.send(JSON.stringify({ type: "keep_alive", timestamp: Date.now() }));
      }
      if (now.getTime() - session.lastPing.getTime() > SESSION_TIMEOUT && session.status !== "connected") {
        sessions.delete(id);
      }
    });
  }, KEEP_ALIVE_INTERVAL);

  console.log("WebSocket server for call sessions initialized");
  return wss;
}

function broadcastToSession(sessionId: string, message: object): void {
  const session = sessions.get(sessionId);
  if (session?.clientWs && session.clientWs.readyState === WebSocket.OPEN) {
    session.clientWs.send(JSON.stringify(message));
  }
}

export function getSession(sessionId: string): CallSession | undefined {
  return sessions.get(sessionId);
}

export function getSessionTranscript(sessionId: string): TranscriptEntry[] {
  const session = sessions.get(sessionId);
  return session?.transcript || [];
}

export function saveTranscript(sessionId: string, role: "user" | "assistant", content: string): void {
  const session = sessions.get(sessionId);
  if (session) {
    session.transcript.push({
      role,
      content,
      timestamp: new Date(),
    });
  }
}
