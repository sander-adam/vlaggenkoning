"use client";

import { useState, useCallback, useMemo } from "react";
import stedenData from "@/data/steden.json";

export interface Stad {
  stad: string;
  inwoners: number;
  lat: number;
  lon: number;
}

type Status = "idle" | "playing" | "feedback" | "gameover";

interface CityGameState {
  status: Status;
  currentStad: Stad | null;
  streak: number;
  totalAnswered: number;
  lastCorrect: boolean | null;
  correctCities: string[];
  remaining: Stad[];
}

const allSteden: Stad[] = stedenData;

// Steden sorted by population (biggest first)
const stedenByPop = [...allSteden].sort((a, b) => b.inwoners - a.inwoners);

function shuffleArray<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/**
 * Tier definitions: each tier has a pool of cities (by population rank)
 * and a number of cities the player must guess before unlocking the next tier.
 * You don't have to guess ALL cities in a tier — just enough to prove you know them.
 */
const TIERS = [
  { poolEnd: 15, guessCount: 10 },   // Top 15 cities, guess 10 to unlock next
  { poolEnd: 35, guessCount: 15 },   // Cities 16-35, guess 15 more
  { poolEnd: 60, guessCount: 15 },   // Cities 36-60, guess 15 more
  { poolEnd: 100, guessCount: 60 },  // Cities 61-100, guess the rest
];

/**
 * How many cities are visible on the map at a given streak.
 */
function visibleCount(streak: number): number {
  let cumulative = 0;
  for (const tier of TIERS) {
    cumulative += tier.guessCount;
    if (streak < cumulative) return tier.poolEnd;
  }
  return 100;
}

/**
 * Build the play order: pick `guessCount` random cities from each tier's pool.
 * Within each tier, cities are shuffled.
 */
function buildPlayOrder(steden: Stad[]): Stad[] {
  const sorted = [...steden].sort((a, b) => b.inwoners - a.inwoners);
  const result: Stad[] = [];
  let prevEnd = 0;
  for (const tier of TIERS) {
    const pool = shuffleArray(sorted.slice(prevEnd, tier.poolEnd));
    result.push(...pool.slice(0, tier.guessCount));
    prevEnd = tier.poolEnd;
  }
  return result;
}

export function useCityGame() {
  const [state, setState] = useState<CityGameState>({
    status: "idle",
    currentStad: null,
    streak: 0,
    totalAnswered: 0,
    lastCorrect: null,
    correctCities: [],
    remaining: [],
  });

  // Which cities are visible on the map right now
  const visibleSteden = useMemo(() => {
    const count = visibleCount(state.streak);
    return stedenByPop.slice(0, count);
  }, [state.streak]);

  const startGame = useCallback(() => {
    const ordered = buildPlayOrder(allSteden);
    setState({
      status: "playing",
      currentStad: ordered[0],
      streak: 0,
      totalAnswered: 0,
      lastCorrect: null,
      correctCities: [],
      remaining: ordered.slice(1),
    });
  }, []);

  const guess = useCallback(
    (clickedStad: Stad) => {
      if (state.status !== "playing" || !state.currentStad) return;

      const correct = clickedStad.stad === state.currentStad.stad;

      setState((prev) => ({
        ...prev,
        status: "feedback",
        lastCorrect: correct,
        streak: correct ? prev.streak + 1 : prev.streak,
        totalAnswered: prev.totalAnswered + 1,
        correctCities: correct
          ? [...prev.correctCities, clickedStad.stad]
          : prev.correctCities,
      }));
    },
    [state.status, state.currentStad]
  );

  const nextRound = useCallback(() => {
    if (!state.lastCorrect) {
      setState((prev) => ({ ...prev, status: "gameover" }));
      return;
    }
    if (state.remaining.length === 0) {
      setState((prev) => ({ ...prev, status: "gameover" }));
      return;
    }
    setState((prev) => ({
      ...prev,
      status: "playing",
      currentStad: prev.remaining[0],
      remaining: prev.remaining.slice(1),
      lastCorrect: null,
    }));
  }, [state.lastCorrect, state.remaining]);

  const resetGame = useCallback(() => {
    setState({
      status: "idle",
      currentStad: null,
      streak: 0,
      totalAnswered: 0,
      lastCorrect: null,
      correctCities: [],
      remaining: [],
    });
  }, []);

  return {
    ...state,
    visibleSteden,
    allSteden,
    startGame,
    guess,
    nextRound,
    resetGame,
  };
}
