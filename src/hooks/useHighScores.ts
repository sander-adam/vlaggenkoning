"use client";

import { useState, useEffect, useCallback } from "react";
import type { HighScore } from "@/lib/types";
import { getHighScores, saveHighScore, isNewRecord } from "@/lib/storage";

export function useHighScores() {
  const [scores, setScores] = useState<HighScore[]>([]);

  useEffect(() => {
    setScores(getHighScores());
  }, []);

  const addScore = useCallback((streak: number, totalAnswered: number) => {
    const score: HighScore = {
      streak,
      totalAnswered,
      date: new Date().toLocaleDateString("nl-NL"),
    };
    const updated = saveHighScore(score);
    setScores(updated);
    return isNewRecord(streak);
  }, []);

  return { scores, addScore, isNewRecord };
}
