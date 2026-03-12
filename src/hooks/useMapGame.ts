"use client";

import { useState, useCallback } from "react";
import type { Land } from "@/lib/types";
import landen from "@/data/landen.json";
import { flagToAlpha2 } from "@/lib/countryCodeMap";
import { getMilestone } from "@/lib/milestones";
import { isLevelUp } from "@/lib/levels";

export type MapGameStatus = "idle" | "playing" | "feedback" | "gameover";

export interface MapGameState {
  status: MapGameStatus;
  currentLand: Land | null;
  currentAlpha2: string;
  streak: number;
  totalAnswered: number;
  lastCorrect: boolean | null;
  clickedAlpha2: string | null;
  clickedLandName: string | null;
  answeredCorrectly: Set<string>;
}

const allLanden: Land[] = landen;

// Lookup: alpha-2 code -> Dutch country name
const alpha2ToName: Record<string, string> = {};
for (const l of allLanden) {
  const code = flagToAlpha2(l.vlag);
  if (code) alpha2ToName[code] = l.land;
}

function getDifficultyRange(streak: number): [number, number] {
  if (streak <= 2) return [0, 30];
  if (streak <= 5) return [0, 50];
  if (streak <= 9) return [0, 70];
  if (streak <= 14) return [10, 85];
  if (streak <= 24) return [20, 95];
  return [0, 100];
}

export function useMapGame(availableCodes: Set<string>) {
  const [milestone, setMilestone] = useState<ReturnType<typeof getMilestone>>(null);
  const [levelledUp, setLevelledUp] = useState(false);
  const [state, setState] = useState<MapGameState>({
    status: "idle",
    currentLand: null,
    currentAlpha2: "",
    streak: 0,
    totalAnswered: 0,
    lastCorrect: null,
    clickedAlpha2: null,
    clickedLandName: null,
    answeredCorrectly: new Set(),
  });

  const getRandomLand = useCallback(
    (streak: number, answered: Set<string>, exclude?: string) => {
      const [minDiff, maxDiff] = getDifficultyRange(streak);
      const candidates = allLanden.filter((l) => {
        const code = flagToAlpha2(l.vlag);
        return (
          availableCodes.has(code) &&
          code !== exclude &&
          !answered.has(code) &&
          l.moeilijkheid >= minDiff &&
          l.moeilijkheid <= maxDiff
        );
      });
      // Fallback: ignore difficulty but still exclude answered
      const fallback = candidates.length > 0
        ? candidates
        : allLanden.filter((l) => {
            const code = flagToAlpha2(l.vlag);
            return availableCodes.has(code) && code !== exclude && !answered.has(code);
          });
      // Final fallback: allow all (when all have been answered)
      const pool = fallback.length > 0
        ? fallback
        : allLanden.filter((l) => {
            const code = flagToAlpha2(l.vlag);
            return availableCodes.has(code) && code !== exclude;
          });
      return pool[Math.floor(Math.random() * pool.length)];
    },
    [availableCodes]
  );

  const startGame = useCallback(() => {
    const land = getRandomLand(0, new Set());
    if (!land) return;
    setState({
      status: "playing",
      currentLand: land,
      currentAlpha2: flagToAlpha2(land.vlag),
      streak: 0,
      totalAnswered: 0,
      lastCorrect: null,
      clickedAlpha2: null,
      clickedLandName: null,
      answeredCorrectly: new Set(),
    });
    setMilestone(null);
    setLevelledUp(false);
  }, [getRandomLand]);

  const handleClick = useCallback(
    (clickedAlpha2: string) => {
      if (state.status !== "playing" || !state.currentLand) return;

      const correct = clickedAlpha2 === state.currentAlpha2;
      const newStreak = correct ? state.streak + 1 : state.streak;

      if (correct) {
        setMilestone(getMilestone(newStreak, "kaart"));
        setLevelledUp(isLevelUp(newStreak));
      }

      setState((prev) => ({
        ...prev,
        status: correct ? "feedback" : "gameover",
        streak: correct ? prev.streak + 1 : prev.streak,
        totalAnswered: prev.totalAnswered + 1,
        lastCorrect: correct,
        clickedAlpha2,
        clickedLandName: alpha2ToName[clickedAlpha2] || null,
        answeredCorrectly: correct
          ? new Set([...prev.answeredCorrectly, clickedAlpha2])
          : prev.answeredCorrectly,
      }));
    },
    [state.status, state.currentLand, state.currentAlpha2]
  );

  const nextRound = useCallback(() => {
    const land = getRandomLand(state.streak, state.answeredCorrectly, state.currentAlpha2);
    if (!land) return;
    setState((prev) => ({
      ...prev,
      status: "playing",
      currentLand: land,
      currentAlpha2: flagToAlpha2(land.vlag),
      lastCorrect: null,
      clickedAlpha2: null,
      clickedLandName: null,
    }));
    setMilestone(null);
    setLevelledUp(false);
  }, [getRandomLand, state.streak, state.currentAlpha2]);

  const resetGame = useCallback(() => {
    setState({
      status: "idle",
      currentLand: null,
      currentAlpha2: "",
      streak: 0,
      totalAnswered: 0,
      lastCorrect: null,
      clickedAlpha2: null,
      clickedLandName: null,
      answeredCorrectly: new Set(),
    });
    setMilestone(null);
    setLevelledUp(false);
  }, []);

  return {
    ...state,
    milestone,
    levelledUp,
    startGame,
    handleClick,
    nextRound,
    resetGame,
  };
}
