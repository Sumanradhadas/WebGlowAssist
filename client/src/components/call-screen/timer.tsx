import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface TimerProps {
  isRunning: boolean;
  onTimeUpdate?: (seconds: number) => void;
}

export function Timer({ isRunning, onTimeUpdate }: TimerProps) {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    if (!isRunning) {
      return;
    }

    setSeconds(0);

    const interval = setInterval(() => {
      setSeconds((prev) => {
        const newValue = prev + 1;
        onTimeUpdate?.(newValue);
        return newValue;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, onTimeUpdate]);

  useEffect(() => {
    if (!isRunning) {
      const timeout = setTimeout(() => setSeconds(0), 2500);
      return () => clearTimeout(timeout);
    }
  }, [isRunning]);

  const formatTime = (totalSeconds: number): { mins: string; secs: string } => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return {
      mins: mins.toString().padStart(2, "0"),
      secs: secs.toString().padStart(2, "0"),
    };
  };

  const { mins, secs } = formatTime(seconds);

  return (
    <motion.div
      className="flex items-center justify-center"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div 
        className="font-mono text-5xl font-bold tracking-tight flex items-center text-foreground"
        data-testid="text-timer"
      >
        <motion.span 
          key={`mins-${mins}`}
          initial={{ opacity: 0.5, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="tabular-nums"
        >
          {mins}
        </motion.span>
        <motion.span 
          className="mx-0.5 text-primary"
          animate={{ opacity: [1, 0.4, 1] }}
          transition={{ duration: 1, repeat: Infinity }}
        >
          :
        </motion.span>
        <motion.span 
          key={`secs-${secs}`}
          initial={{ opacity: 0.5, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="tabular-nums"
        >
          {secs}
        </motion.span>
      </div>
    </motion.div>
  );
}
