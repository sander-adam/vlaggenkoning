"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect } from "react";
import confetti from "canvas-confetti";

interface MilestoneOverlayProps {
  milestone: {
    streak: number;
    title: string;
    message: string;
    emoji: string;
  } | null;
  onDismiss: () => void;
}

export default function MilestoneOverlay({ milestone, onDismiss }: MilestoneOverlayProps) {
  useEffect(() => {
    if (milestone) {
      // Big celebration confetti
      const duration = 2000;
      const end = Date.now() + duration;
      const interval = setInterval(() => {
        if (Date.now() > end) {
          clearInterval(interval);
          return;
        }
        confetti({
          particleCount: 30,
          spread: 100,
          origin: { x: Math.random(), y: Math.random() * 0.6 },
          colors: ["#f97316", "#eab308", "#3b82f6", "#22c55e", "#ef4444", "#a855f7"],
        });
      }, 200);

      const timer = setTimeout(onDismiss, 3000);
      return () => {
        clearInterval(interval);
        clearTimeout(timer);
      };
    }
  }, [milestone, onDismiss]);

  return (
    <AnimatePresence>
      {milestone && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onDismiss}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-6"
        >
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="rounded-3xl bg-gradient-to-b from-yellow-400 to-orange-500 p-8
              text-center shadow-2xl max-w-sm w-full"
          >
            <div className="text-6xl mb-4">{milestone.emoji}</div>
            <h2 className="text-3xl font-bold text-white mb-2">{milestone.title}</h2>
            <p className="text-xl text-white/90">{milestone.message}</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
