import { motion, AnimatePresence } from "framer-motion";
import { useVapi } from "@/hooks/use-vapi";
import { Avatar } from "@/components/call-screen/avatar";
import { Waveform } from "@/components/call-screen/waveform";
import { Timer } from "@/components/call-screen/timer";
import { StatusText } from "@/components/call-screen/status-text";
import { SwipeToCall } from "@/components/call-screen/swipe-to-call";
import { Shield, Clock, Sparkles, RotateCcw, PhoneOff, Mic, MicOff } from "lucide-react";

const VAPI_PUBLIC_KEY = import.meta.env.VITE_VAPI_PUBLIC_KEY || "";
const VAPI_ASSISTANT_ID = import.meta.env.VITE_VAPI_ASSISTANT_ID || "";

export default function Home() {
  const {
    status,
    isMuted,
    volumeLevel,
    startCall,
    endCall,
    toggleMute,
    resetStatus,
  } = useVapi({
    publicKey: VAPI_PUBLIC_KEY,
    assistantId: VAPI_ASSISTANT_ID,
  });

  const isConnected = status === "connected";
  const isConnecting = status === "connecting";
  const isIdle = status === "idle";
  const isFailed = status === "failed";

  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-primary/3 rounded-full blur-3xl" />
      </div>

      <header className="relative z-10 flex items-center justify-between px-6 py-4 border-b border-border/50">
        <div className="flex items-center gap-3">
          <img 
            src="https://webglowx.netlify.app/logo.png" 
            alt="WebGlow" 
            className="w-10 h-10 rounded-md object-cover shadow-lg shadow-primary/20"
          />
          <div>
            <span className="font-semibold text-foreground block" data-testid="text-brand">
              WebGlow Support
            </span>
            <span className="text-xs text-muted-foreground" data-testid="text-tagline">
              24/7 Voice Assistance
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-xs font-medium text-primary">Online</span>
          </div>
        </div>
      </header>

      <main className="relative z-10 flex-1 flex flex-col items-center px-6 py-8">
        <div className="flex-1 flex flex-col items-center justify-center w-full max-w-md">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="flex flex-col items-center"
          >
            <div className="mb-8">
              <Avatar
                status={status}
                name="WebGlow Assistant"
              />
            </div>

            <div className="text-center space-y-3 mb-8">
              <h1 className="text-2xl font-semibold text-foreground" data-testid="text-assistant-name">
                WebGlow
              </h1>
              <StatusText status={status} />
            </div>
          </motion.div>

          <div className="min-h-[140px] flex items-center justify-center w-full">
            <AnimatePresence mode="wait">
              {isConnected && (
                <motion.div
                  key="connected-content"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className="flex flex-col items-center space-y-6"
                >
                  <Timer isRunning={isConnected} />
                  <Waveform isActive={isConnected} volumeLevel={volumeLevel} />
                </motion.div>
              )}

              {isConnecting && (
                <motion.div
                  key="connecting-content"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center space-y-4"
                >
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                      className="w-5 h-5 border-2 border-muted-foreground/30 border-t-primary rounded-full"
                    />
                    <span>Requesting microphone access...</span>
                  </div>
                  <p className="text-sm text-muted-foreground/70 text-center max-w-xs">
                    Please allow microphone access when prompted by your browser
                  </p>
                </motion.div>
              )}

              {isIdle && (
                <motion.div
                  key="idle-content"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center"
                >
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <FeatureBadge icon={Shield} label="Secure" />
                    <FeatureBadge icon={Clock} label="24/7" />
                    <FeatureBadge icon={Sparkles} label="Smart" />
                  </div>
                  <SwipeToCall onSwipeComplete={startCall} />
                </motion.div>
              )}

              {isFailed && (
                <motion.div
                  key="failed-content"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center space-y-4"
                >
                  <p className="text-sm text-muted-foreground text-center max-w-xs">
                    Unable to connect. Please check your internet connection and try again.
                  </p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      resetStatus();
                      startCall();
                    }}
                    className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-full font-medium shadow-lg shadow-primary/20 hover:bg-primary/90 transition-colors"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Try Again
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {(isConnected || isConnecting) && (
            <motion.div
              key="call-controls"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 30 }}
              transition={{ duration: 0.3 }}
              className="mb-8 flex items-center gap-4"
            >
              {isConnected && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={toggleMute}
                  className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors ${
                    isMuted 
                      ? "bg-red-500/20 border border-red-500/30" 
                      : "bg-muted/50 border border-border/50"
                  }`}
                >
                  {isMuted ? (
                    <MicOff className="w-6 h-6 text-red-400" />
                  ) : (
                    <Mic className="w-6 h-6 text-muted-foreground" />
                  )}
                </motion.button>
              )}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={endCall}
                className="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center shadow-lg shadow-red-500/30"
              >
                <PhoneOff className="w-7 h-7 text-white" />
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center max-w-sm"
        >
          <AnimatePresence mode="wait">
            {isIdle && (
              <motion.p
                key="idle-text"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-sm text-muted-foreground"
                data-testid="text-help"
              >
                Speak with our assistant for instant support, lead generation, and deal assistance.
              </motion.p>
            )}
            {isConnected && (
              <motion.p
                key="connected-text"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-sm text-muted-foreground flex items-center justify-center gap-2"
                data-testid="text-secure"
              >
                <Shield className="w-3.5 h-3.5" />
                Your conversation is secure and private
              </motion.p>
            )}
            {isFailed && (
              <motion.p
                key="failed-text"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-sm text-red-400/80"
              >
                Connection could not be established
              </motion.p>
            )}
          </AnimatePresence>
        </motion.div>
      </main>

      <footer className="relative z-10 py-4 text-center border-t border-border/30">
        <p className="text-xs text-muted-foreground/60">
          Powered by WebGlow Technology
        </p>
      </footer>
    </div>
  );
}

function FeatureBadge({ icon: Icon, label }: { icon: typeof Shield; label: string }) {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className="flex flex-col items-center gap-2 p-3 rounded-lg bg-card/50 border border-border/50"
    >
      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
        <Icon className="w-4 h-4 text-primary" />
      </div>
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
    </motion.div>
  );
}
