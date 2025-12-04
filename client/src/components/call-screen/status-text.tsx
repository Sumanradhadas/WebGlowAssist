import { motion, AnimatePresence } from "framer-motion";
import type { CallStatus } from "@/hooks/use-vapi";
import { PhoneCall, PhoneOff, Loader2, AlertCircle } from "lucide-react";

interface StatusTextProps {
  status: CallStatus;
}

export function StatusText({ status }: StatusTextProps) {
  const getStatusContent = () => {
    switch (status) {
      case "idle":
        return { 
          text: "Ready to assist you", 
          color: "text-muted-foreground",
          icon: null
        };
      case "connecting":
        return { 
          text: "Connecting", 
          color: "text-primary", 
          dots: true,
          icon: Loader2,
          iconAnimation: true
        };
      case "connected":
        return { 
          text: "Call in progress", 
          color: "text-primary",
          icon: PhoneCall
        };
      case "ended":
        return { 
          text: "Call ended", 
          color: "text-muted-foreground",
          icon: PhoneOff
        };
      case "failed":
        return { 
          text: "Connection failed", 
          color: "text-red-400",
          icon: AlertCircle
        };
      default:
        return { text: "", color: "text-muted-foreground" };
    }
  };

  const { text, color, dots, icon: Icon, iconAnimation } = getStatusContent();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={status}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.25 }}
        className={`text-base font-medium ${color} flex items-center justify-center gap-2`}
        data-testid="text-status"
      >
        {Icon && (
          <motion.span
            animate={iconAnimation ? { rotate: 360 } : {}}
            transition={iconAnimation ? { duration: 1, repeat: Infinity, ease: "linear" } : {}}
          >
            <Icon className="w-4 h-4" />
          </motion.span>
        )}
        <span>{text}</span>
        {dots && (
          <span className="flex gap-0.5">
            {[0, 1, 2].map((i) => (
              <motion.span
                key={i}
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{
                  duration: 0.8,
                  repeat: Infinity,
                  delay: i * 0.15,
                }}
              >
                .
              </motion.span>
            ))}
          </span>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
