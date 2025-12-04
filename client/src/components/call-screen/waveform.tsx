import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface WaveformProps {
  isActive: boolean;
  volumeLevel: number;
}

export function Waveform({ isActive, volumeLevel }: WaveformProps) {
  const bars = 9;
  const [heights, setHeights] = useState<number[]>(Array(bars).fill(0.15));

  useEffect(() => {
    if (!isActive) {
      setHeights(Array(bars).fill(0.15));
      return;
    }

    const interval = setInterval(() => {
      const baseHeight = 0.15 + volumeLevel * 0.4;
      const newHeights = Array(bars)
        .fill(0)
        .map((_, i) => {
          const centerIndex = Math.floor(bars / 2);
          const distanceFromCenter = Math.abs(i - centerIndex);
          const centerBoost = 1 - distanceFromCenter * 0.1;
          const randomVariation = 0.4 + Math.random() * 0.6;
          return Math.min(1, Math.max(0.15, baseHeight * centerBoost * randomVariation));
        });
      setHeights(newHeights);
    }, 60);

    return () => clearInterval(interval);
  }, [isActive, volumeLevel]);

  return (
    <motion.div 
      className="flex items-center justify-center gap-1.5 h-20 px-8 py-4 rounded-2xl bg-card/30 border border-border/30 backdrop-blur-sm" 
      data-testid="waveform-container"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      {heights.map((height, index) => (
        <motion.div
          key={index}
          className="w-1.5 rounded-full"
          initial={{ height: 6 }}
          animate={{
            height: isActive ? height * 60 + 6 : 6,
            backgroundColor: isActive 
              ? `hsl(174, 77%, ${45 + height * 20}%)` 
              : "hsl(var(--muted-foreground) / 0.3)",
          }}
          transition={{
            type: "spring",
            stiffness: 350,
            damping: 18,
          }}
          data-testid={`waveform-bar-${index}`}
        />
      ))}
    </motion.div>
  );
}
