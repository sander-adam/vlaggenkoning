"use client";

import { motion, AnimatePresence } from "framer-motion";

interface StreakBadgeProps {
  streak: number;
}

export default function StreakBadge({ streak }: StreakBadgeProps) {
  if (streak === 0) return null;

  return (
    <AnimatePresence mode="popLayout">
      <motion.div
        key={streak}
        initial={{ scale: 1.4 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 400, damping: 15 }}
        className="inline-flex items-center gap-1.5 rounded-full bg-orange-500 px-4 py-1.5
          text-white font-bold text-lg shadow-md"
      >
        <span className="text-xl">🔥</span>
        <span>{streak}</span>
      </motion.div>
    </AnimatePresence>
  );
}
