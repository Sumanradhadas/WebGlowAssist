import { motion, AnimatePresence } from "framer-motion";
import { Phone, PhoneOff, Mic, MicOff } from "lucide-react";
import type { CallStatus } from "@/hooks/use-vapi";

interface CallButtonProps {
  status: CallStatus;
  isMuted: boolean;
  onStartCall: () => void;
  onEndCall: () => void;
  onToggleMute: () => void;
}

export function CallButton({
  status,
  isMuted,
  onStartCall,
  onEndCall,
  onToggleMute,
}: CallButtonProps) {
  const isIdle = status === "idle";
  const isConnecting = status === "connecting";
  const isConnected = status === "connected";
  const isEnded = status === "ended";

  return (
    <div className="flex items-center justify-center gap-8">
      <AnimatePresence mode="popLayout">
        {isConnected && (
          <motion.button
            key="mute-button"
            initial={{ scale: 0, opacity: 0, x: 20 }}
            animate={{ scale: 1, opacity: 1, x: 0 }}
            exit={{ scale: 0, opacity: 0, x: 20 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            onClick={onToggleMute}
            className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-200 border ${
              isMuted
                ? "bg-destructive/20 border-destructive/30 text-destructive"
                : "bg-muted/50 border-border text-foreground"
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label={isMuted ? "Unmute microphone" : "Mute microphone"}
            data-testid="button-mute"
          >
            {isMuted ? (
              <MicOff className="w-6 h-6" />
            ) : (
              <Mic className="w-6 h-6" />
            )}
          </motion.button>
        )}

        {(isIdle || isEnded) && (
          <motion.button
            key="start-button"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            onClick={onStartCall}
            className="relative w-20 h-20 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-xl shadow-primary/30"
            whileHover={{ 
              scale: 1.08,
              boxShadow: "0 0 40px rgba(20, 184, 166, 0.4)"
            }}
            whileTap={{ scale: 0.95 }}
            aria-label="Start call"
            data-testid="button-start-call"
          >
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-primary/50"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 0, 0.5],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
            <Phone className="w-8 h-8 text-primary-foreground" />
          </motion.button>
        )}

        {isConnecting && (
          <motion.div
            key="connecting-button"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="relative w-20 h-20 rounded-full bg-gradient-to-br from-primary/60 to-primary/40 flex items-center justify-center"
          >
            <motion.div
              className="absolute inset-0 rounded-full border-3 border-transparent"
              style={{
                borderTopColor: "hsl(var(--primary-foreground))",
                borderRightColor: "hsl(var(--primary-foreground) / 0.3)",
              }}
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
            <Phone className="w-8 h-8 text-primary-foreground/70" />
          </motion.div>
        )}

        {isConnected && (
          <motion.button
            key="end-button"
            initial={{ scale: 0, opacity: 0, x: -20 }}
            animate={{ scale: 1, opacity: 1, x: 0 }}
            exit={{ scale: 0, opacity: 0, x: -20 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            onClick={onEndCall}
            className="relative w-20 h-20 rounded-full bg-gradient-to-br from-destructive to-destructive/80 flex items-center justify-center shadow-xl shadow-destructive/30"
            whileHover={{ 
              scale: 1.08,
              boxShadow: "0 0 40px rgba(239, 68, 68, 0.4)"
            }}
            whileTap={{ scale: 0.95 }}
            aria-label="End call"
            data-testid="button-end-call"
          >
            <PhoneOff className="w-8 h-8 text-destructive-foreground" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
