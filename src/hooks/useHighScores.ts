"use client";

import { useState, useEffect, useCallback } from "react";
import type { HighScore } from "@/lib/types";
import { getHighScores, saveHighScore, isNewRecord } from "@/lib/storage";

type GameMode = "vlaggen" | "inwoners" | "kaart" | "steden" | "hoofdstad" | "ikzie";

export function useHighScores(mode: GameMode = "vlaggen") {
  const [scores, setScores] = useState<HighScore[]>([]);

  useEffect(() => {
    setScores(getHighScores(mode));
  }, [mode]);

  const addScore = useCallback((streak: number, totalAnswered: number, name?: string) => {
    const score: HighScore = {
      streak,
      totalAnswered,
      date: new Date().toLocaleDateString("nl-NL"),
      name: name || undefined,
    };
    const updated = saveHighScore(score, mode);
    setScores(updated);
    return isNewRecord(streak, mode);
  }, [mode]);

  // Update the name on the most recent score (for when name is entered after game over)
  const updateLastScoreName = useCallback((name: string) => {
    const current = getHighScores(mode);
    // Find the most recent score without a name (or update the top one)
    const updated = current.map((s, i) => {
      if (i === 0 || (!s.name && s.date === new Date().toLocaleDateString("nl-NL"))) {
        return { ...s, name };
      }
      return s;
    });
    localStorage.setItem(`vlaggenkoning-highscores-${mode}`, JSON.stringify(updated));
    setScores(updated);
  }, [mode]);

  return { scores, addScore, updateLastScoreName };
}
