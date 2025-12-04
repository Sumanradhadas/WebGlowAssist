import { useCallback, useEffect, useRef, useState } from "react";
import Vapi from "@vapi-ai/web";
import ringtoneAudio from "@assets/ringtone-023-376906_1764668466136.mp3";

export type CallStatus = "idle" | "connecting" | "connected" | "ended" | "failed";

interface UseVapiOptions {
  publicKey: string;
  assistantId: string;
}

interface TranscriptEntry {
  role: "user" | "assistant";
  content: string;
}

interface UseVapiReturn {
  status: CallStatus;
  isMuted: boolean;
  volumeLevel: number;
  callDuration: number;
  transcript: TranscriptEntry[];
  startCall: () => Promise<void>;
  endCall: () => void;
  toggleMute: () => void;
  resetStatus: () => void;
}

const RECONNECT_INTERVAL = 3000;
const PING_INTERVAL = 20000;

function getBrowserInfo(): string {
  const ua = navigator.userAgent;
  let browserInfo = "Unknown Browser";
  
  if (ua.includes("Chrome") && !ua.includes("Edg")) {
    browserInfo = "Chrome";
  } else if (ua.includes("Safari") && !ua.includes("Chrome")) {
    browserInfo = "Safari";
  } else if (ua.includes("Firefox")) {
    browserInfo = "Firefox";
  } else if (ua.includes("Edg")) {
    browserInfo = "Edge";
  }
  
  const isMobile = /Mobi|Android|iPhone|iPad/i.test(ua);
  const deviceType = isMobile ? "Mobile" : "Desktop";
  
  return `${browserInfo} on ${deviceType}`;
}

export function useVapi({ publicKey, assistantId }: UseVapiOptions): UseVapiReturn {
  const [status, setStatus] = useState<CallStatus>("idle");
  const [isMuted, setIsMuted] = useState(false);
  const [volumeLevel, setVolumeLevel] = useState(0);
  const [callDuration, setCallDuration] = useState(0);
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  
  const vapiRef = useRef<Vapi | null>(null);
  const durationRef = useRef(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const wasConnectedRef = useRef(false);
  
  const ringtoneRef = useRef<HTMLAudioElement | null>(null);
  const ringtoneTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const callStartTimeRef = useRef<Date | null>(null);
  const transcriptRef = useRef<TranscriptEntry[]>([]);
  
  const wsRef = useRef<WebSocket | null>(null);
  const sessionIdRef = useRef<string | null>(null);
  const pingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const getWebSocketUrl = useCallback(() => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    return `${protocol}//${window.location.host}/ws/call`;
  }, []);

  const sendWsMessage = useCallback((type: string, payload: object = {}) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type, ...payload }));
    }
  }, []);

  const connectWebSocket = useCallback(() => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      return;
    }

    try {
      const ws = new WebSocket(getWebSocketUrl());
      wsRef.current = ws;

      ws.onopen = () => {
        ws.send(JSON.stringify({
          type: "start_session",
          sessionId: sessionIdRef.current,
        }));

        if (pingIntervalRef.current) {
          clearInterval(pingIntervalRef.current);
        }
        pingIntervalRef.current = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: "ping" }));
          }
        }, PING_INTERVAL);
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          if (message.type === "session_created" || message.type === "session_restored") {
            sessionIdRef.current = message.sessionId;
          }
        } catch (error) {
          console.error("Failed to parse WebSocket message:", error);
        }
      };

      ws.onclose = () => {
        wsRef.current = null;
        if (pingIntervalRef.current) {
          clearInterval(pingIntervalRef.current);
          pingIntervalRef.current = null;
        }
        
        reconnectTimeoutRef.current = setTimeout(() => {
          connectWebSocket();
        }, RECONNECT_INTERVAL);
      };

      ws.onerror = (error) => {
        console.error("WebSocket error:", error);
      };
    } catch (error) {
      console.error("Failed to connect WebSocket:", error);
      reconnectTimeoutRef.current = setTimeout(() => {
        connectWebSocket();
      }, RECONNECT_INTERVAL);
    }
  }, [getWebSocketUrl]);

  const stopRingtone = useCallback(() => {
    if (ringtoneTimeoutRef.current) {
      clearTimeout(ringtoneTimeoutRef.current);
      ringtoneTimeoutRef.current = null;
    }
    if (ringtoneRef.current) {
      ringtoneRef.current.pause();
      ringtoneRef.current.currentTime = 0;
      ringtoneRef.current.src = "";
      ringtoneRef.current = null;
    }
  }, []);

  const startRingtone = useCallback(() => {
    stopRingtone();
    
    const audio = new Audio(ringtoneAudio);
    audio.loop = false;
    audio.volume = 0.5;
    ringtoneRef.current = audio;
    
    audio.play().catch((err) => {
      console.warn("Ringtone play failed:", err);
    });
    
    ringtoneTimeoutRef.current = setTimeout(() => {
      stopRingtone();
    }, 3000);
  }, [stopRingtone]);

  const sendTranscriptNotification = useCallback(async () => {
    try {
      const callEndTime = new Date();
      const callStartTime = callStartTimeRef.current || new Date();
      const duration = durationRef.current;
      
      const fullTranscript = transcriptRef.current
        .map(entry => `[${entry.role.toUpperCase()}]: ${entry.content}`)
        .join("\n");
      
      if (fullTranscript.trim().length === 0) {
        console.log("No transcript to send");
        return;
      }
      
      const response = await fetch('/api/notify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          transcript: fullTranscript,
          callStartTime: callStartTime.toISOString(),
          callEndTime: callEndTime.toISOString(),
          duration: String(duration),
          browserInfo: getBrowserInfo(),
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("Failed to send notification:", errorData);
      } else {
        console.log("Transcript notification sent successfully");
      }
    } catch (error) {
      console.error("Failed to send transcript notification:", error);
    }
  }, []);

  useEffect(() => {
    connectWebSocket();
    
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (pingIntervalRef.current) {
        clearInterval(pingIntervalRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [connectWebSocket]);

  useEffect(() => {
    if (!publicKey) return;
    
    const vapi = new Vapi(publicKey);
    vapiRef.current = vapi;

    vapi.on("call-start", () => {
      stopRingtone();
      wasConnectedRef.current = true;
      setStatus("connected");
      setCallDuration(0);
      setIsMuted(false);
      durationRef.current = 0;
      setTranscript([]);
      transcriptRef.current = [];
      callStartTimeRef.current = new Date();
      
      sendWsMessage("call_connected");
      
      timerRef.current = setInterval(() => {
        durationRef.current += 1;
        setCallDuration(durationRef.current);
      }, 1000);
    });

    vapi.on("call-end", async () => {
      stopRingtone();
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      sendWsMessage("call_end");

      if (wasConnectedRef.current) {
        setStatus("ended");
        
        await sendTranscriptNotification();
        
        if (durationRef.current > 0) {
          fetch("/api/calls", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              duration: durationRef.current,
              status: "completed",
              endedAt: new Date().toISOString(),
            }),
          }).catch(console.error);
        }

        setTimeout(() => {
          setStatus("idle");
          setCallDuration(0);
          setIsMuted(false);
          durationRef.current = 0;
          wasConnectedRef.current = false;
          setTranscript([]);
          transcriptRef.current = [];
          callStartTimeRef.current = null;
        }, 2500);
      } else {
        setStatus("failed");
      }
    });

    vapi.on("message", (message: any) => {
      if (message.type === "transcript") {
        const entry: TranscriptEntry = {
          role: message.role as "user" | "assistant",
          content: message.transcript,
        };
        setTranscript(prev => [...prev, entry]);
        transcriptRef.current = [...transcriptRef.current, entry];
        sendWsMessage("transcript", entry);
      }
    });

    vapi.on("volume-level", (level: number) => {
      setVolumeLevel(level);
    });

    vapi.on("error", (error: Error) => {
      console.error("VAPI Error:", error);
      stopRingtone();
      setStatus("failed");
      setIsMuted(false);
      wasConnectedRef.current = false;
      transcriptRef.current = [];
      callStartTimeRef.current = null;
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    });

    return () => {
      stopRingtone();
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      vapi.stop();
    };
  }, [publicKey, stopRingtone, sendTranscriptNotification, sendWsMessage]);

  const startCall = useCallback(async () => {
    if (!vapiRef.current) return;
    
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (error) {
      console.error("Microphone permission denied:", error);
      setStatus("failed");
      return;
    }
    
    setStatus("connecting");
    setIsMuted(false);
    wasConnectedRef.current = false;
    setTranscript([]);
    transcriptRef.current = [];
    
    sendWsMessage("call_start");
    startRingtone();
    
    try {
      await vapiRef.current.start(assistantId);
    } catch (error) {
      console.error("Failed to start call:", error);
      stopRingtone();
      setStatus("failed");
    }
  }, [assistantId, startRingtone, stopRingtone, sendWsMessage]);

  const resetStatus = useCallback(() => {
    setStatus("idle");
    setCallDuration(0);
    setIsMuted(false);
    durationRef.current = 0;
    wasConnectedRef.current = false;
    setTranscript([]);
    transcriptRef.current = [];
    callStartTimeRef.current = null;
  }, []);

  const endCall = useCallback(() => {
    if (!vapiRef.current) return;
    stopRingtone();
    vapiRef.current.stop();
  }, [stopRingtone]);

  const toggleMute = useCallback(() => {
    if (!vapiRef.current) return;
    const newMutedState = !isMuted;
    vapiRef.current.setMuted(newMutedState);
    setIsMuted(newMutedState);
  }, [isMuted]);

  return {
    status,
    isMuted,
    volumeLevel,
    callDuration,
    transcript,
    startCall,
    endCall,
    toggleMute,
    resetStatus,
  };
}
