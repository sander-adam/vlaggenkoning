"use client";

import { motion, AnimatePresence } from "framer-motion";
import { getLevel, getNextLevel, getLevelProgress } from "@/lib/levels";

interface LevelBarProps {
  streak: number;
  levelledUp: boolean;
}

export default function LevelBar({ streak, levelledUp }: LevelBarProps) {
  const level = getLevel(streak);
  const next = getNextLevel(streak);
  const progress = getLevelProgress(streak);

  return (
    <div className="w-full">
      {/* Level name + next level hint */}
      <div className="flex items-center justify-between mb-1.5">
        <AnimatePresence mode="wait">
          <motion.div
            key={level.name}
            initial={levelledUp ? { scale: 1.3, y: -4 } : false}
            animate={{ scale: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 15 }}
            className={`flex items-center gap-1.5 rounded-full bg-gradient-to-r ${level.color} px-3 py-1 shadow-md`}
          >
            <span className="text-base">{level.emoji}</span>
            <span className="text-sm font-bold text-white">{level.name}</span>
          </motion.div>
        </AnimatePresence>
        {next && (
          <span className="text-xs font-medium text-white/60">
            {next.emoji} {next.name} bij {next.minStreak}
          </span>
        )}
      </div>

      {/* Progress bar */}
      <div className="h-2.5 w-full rounded-full bg-white/20 overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${level.barColor}`}
          initial={{ width: 0 }}
          animate={{ width: `${Math.max(progress * 100, 4)}%` }}
          transition={{ type: "spring", stiffness: 100, damping: 20 }}
        />
      </div>

      {/* Streak markers */}
      {next && (
        <div className="flex justify-between mt-0.5 px-0.5">
          <span className="text-[10px] font-medium text-white/50">{streak}</span>
          <span className="text-[10px] font-medium text-white/50">{next.minStreak}</span>
        </div>
      )}
      {!next && (
        <p className="text-[10px] text-center font-medium text-yellow-200/80 mt-0.5">
          Hoogste niveau bereikt!
        </p>
      )}
    </div>
  );
}
