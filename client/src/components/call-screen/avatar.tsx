import { motion } from "framer-motion";
import type { CallStatus } from "@/hooks/use-vapi";

interface AvatarProps {
  status: CallStatus;
  imageUrl?: string;
  name: string;
}

const WEBGLOW_LOGO = "https://webglowx.netlify.app/logo.png";

export function Avatar({ status, imageUrl, name }: AvatarProps) {
  const isConnecting = status === "connecting";
  const isConnected = status === "connected";

  return (
    <div className="relative flex items-center justify-center">
      {isConnecting && (
        <>
          <motion.div
            className="absolute rounded-full border-2 border-primary/40"
            initial={{ width: 128, height: 128, opacity: 0.6 }}
            animate={{
              width: [128, 180, 220],
              height: [128, 180, 220],
              opacity: [0.6, 0.3, 0],
            }}
            transition={{
              duration: 1.8,
              repeat: Infinity,
              ease: "easeOut",
            }}
          />
          <motion.div
            className="absolute rounded-full border-2 border-primary/30"
            initial={{ width: 128, height: 128, opacity: 0.4 }}
            animate={{
              width: [128, 160, 200],
              height: [128, 160, 200],
              opacity: [0.4, 0.2, 0],
            }}
            transition={{
              duration: 1.8,
              repeat: Infinity,
              ease: "easeOut",
              delay: 0.4,
            }}
          />
          <motion.div
            className="absolute rounded-full border border-primary/20"
            initial={{ width: 128, height: 128, opacity: 0.3 }}
            animate={{
              width: [128, 150, 180],
              height: [128, 150, 180],
              opacity: [0.3, 0.15, 0],
            }}
            transition={{
              duration: 1.8,
              repeat: Infinity,
              ease: "easeOut",
              delay: 0.8,
            }}
          />
        </>
      )}

      {isConnected && (
        <motion.div
          className="absolute rounded-full bg-primary/10"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.1, 0.3],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{ width: 144, height: 144 }}
        />
      )}

      <motion.div
        className="relative overflow-hidden rounded-full border-4 border-primary/20 shadow-2xl shadow-primary/20"
        initial={false}
        animate={{
          width: isConnecting ? 160 : 128,
          height: isConnecting ? 160 : 128,
        }}
        transition={{ duration: 0.4, ease: "easeInOut" }}
      >
        <img
          src={imageUrl || WEBGLOW_LOGO}
          alt={name}
          className="w-full h-full object-contain bg-transparent"
          data-testid="img-avatar"
        />

        {isConnected && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-t from-white/0 via-white/5 to-white/10"
            animate={{ 
              opacity: [0.5, 1, 0.5],
              y: [0, -2, 0]
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        )}
      </motion.div>

      {isConnected && (
        <motion.div
          className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-green-500 border-2 border-background flex items-center justify-center"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 400, damping: 20 }}
        >
          <motion.div
            className="w-2 h-2 rounded-full bg-white"
            animate={{ scale: [1, 0.8, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        </motion.div>
      )}
    </div>
  );
}
