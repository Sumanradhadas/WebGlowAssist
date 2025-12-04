import { useState, useRef } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { Phone, ChevronUp } from "lucide-react";

interface SwipeToCallProps {
  onSwipeComplete: () => void;
  disabled?: boolean;
}

export function SwipeToCall({ onSwipeComplete, disabled }: SwipeToCallProps) {
  const constraintsRef = useRef<HTMLDivElement>(null);
  const [isComplete, setIsComplete] = useState(false);
  const y = useMotionValue(0);
  
  const trackHeight = 160;
  const thumbSize = 72;
  const maxDrag = trackHeight - thumbSize - 8;
  
  const background = useTransform(
    y,
    [0, -maxDrag],
    ["rgba(20, 184, 166, 0.1)", "rgba(20, 184, 166, 0.4)"]
  );
  
  const arrowOpacity = useTransform(
    y,
    [0, -maxDrag * 0.5, -maxDrag],
    [1, 0.3, 0]
  );

  const textOpacity = useTransform(
    y,
    [0, -maxDrag * 0.3],
    [1, 0]
  );

  const checkOpacity = useTransform(
    y,
    [-maxDrag * 0.7, -maxDrag],
    [0, 1]
  );

  const thumbScale = useTransform(
    y,
    [0, -maxDrag],
    [1, 1.1]
  );

  const handleDragEnd = () => {
    const currentY = y.get();
    if (currentY <= -maxDrag * 0.7) {
      triggerCall();
    } else {
      animate(y, 0, { type: "spring", stiffness: 400, damping: 30 });
    }
  };

  const handleClick = () => {
    if (disabled || isComplete) return;
    triggerCall();
  };

  const triggerCall = () => {
    setIsComplete(true);
    animate(y, -maxDrag, { duration: 0.3 });
    setTimeout(() => {
      onSwipeComplete();
      setTimeout(() => {
        setIsComplete(false);
        animate(y, 0, { duration: 0.3 });
      }, 500);
    }, 300);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="flex flex-col items-center"
    >
      <motion.div
        ref={constraintsRef}
        style={{ background, height: trackHeight }}
        className="relative w-24 rounded-full border border-primary/30 overflow-hidden shadow-lg shadow-primary/10"
      >
        <motion.div
          style={{ opacity: arrowOpacity }}
          className="absolute inset-x-0 top-4 flex flex-col items-center pointer-events-none"
        >
          <motion.div
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          >
            <ChevronUp className="w-6 h-6 text-primary/60" />
          </motion.div>
          <motion.div
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.1 }}
          >
            <ChevronUp className="w-6 h-6 text-primary/40 -mt-3" />
          </motion.div>
          <motion.div
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
          >
            <ChevronUp className="w-6 h-6 text-primary/20 -mt-3" />
          </motion.div>
        </motion.div>

        <motion.div
          style={{ opacity: checkOpacity }}
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
        >
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 0.5 }}
            className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center"
          >
            <Phone className="w-5 h-5 text-primary" />
          </motion.div>
        </motion.div>

        <div className="absolute inset-x-0 bottom-1 flex justify-center">
          <motion.div
            drag={disabled || isComplete ? false : "y"}
            dragConstraints={{ top: -maxDrag, bottom: 0 }}
            dragElastic={0}
            style={{ y, scale: thumbScale, width: thumbSize, height: thumbSize }}
            onDragEnd={handleDragEnd}
            onClick={handleClick}
            whileHover={{ scale: disabled ? 1 : 1.05 }}
            whileTap={{ scale: disabled ? 1 : 0.95 }}
            className={`rounded-full flex items-center justify-center cursor-pointer ${
              disabled ? "bg-muted cursor-not-allowed" : "bg-gradient-to-br from-primary to-primary/80"
            } shadow-lg shadow-primary/30`}
          >
            <motion.div
              animate={isComplete ? { rotate: 0 } : { rotate: [0, -10, 10, 0] }}
              transition={isComplete ? {} : { duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
            >
              <Phone className={`w-7 h-7 ${disabled ? "text-muted-foreground" : "text-primary-foreground"}`} />
            </motion.div>
          </motion.div>
        </div>
      </motion.div>

      <motion.div
        style={{ opacity: textOpacity }}
        className="mt-4 text-center"
      >
        <p className="text-sm font-medium text-primary/80">Swipe up to call</p>
        <p className="text-xs text-muted-foreground/60 mt-1">or tap to connect</p>
      </motion.div>
    </motion.div>
  );
}
