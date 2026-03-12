"use client";

import { useState, useCallback } from "react";
import landenData from "@/data/landen.json";
import type { Land } from "@/lib/types";
import { getDifficultyRange } from "@/lib/gameLogic";

type Status = "idle" | "playing" | "feedback" | "gameover";

interface CapitalGameState {
  status: Status;
  currentLand: Land | null;
  options: string[]; // 4 city names, shuffled
  streak: number;
  totalAnswered: number;
  lastCorrect: boolean | null;
  chosenCity: string | null;
}

const allLanden: Land[] = landenData as Land[];

// Collect all city names for distractors
const allCities: string[] = Array.from(
  new Set(allLanden.flatMap((l) => l.prominente_steden))
);

function shuffleArray<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function pickLand(streak: number, exclude?: string): Land {
  const [min, max] = getDifficultyRange(streak);
  const pool = allLanden.filter(
    (l) =>
      l.moeilijkheid >= min &&
      l.moeilijkheid <= max &&
      l.land !== exclude
  );
  const source = pool.length > 0 ? pool : allLanden.filter((l) => l.land !== exclude);
  return source[Math.floor(Math.random() * source.length)];
}

/** Build 4 options: always include the capital + other cities + distractors */
function buildOptions(land: Land): string[] {
  // Start with the capital, then add other cities from the country
  const cities = [land.hoofdstad];
  for (const city of land.prominente_steden) {
    if (city.toLowerCase() !== land.hoofdstad.toLowerCase() && cities.length < 4) {
      cities.push(city);
    }
  }

  // Fill remaining slots with distractors from other countries
  const used = new Set(cities.map((c) => c.toLowerCase()));
  const distractors = shuffleArray(
    allCities.filter((c) => !used.has(c.toLowerCase()))
  );
  while (cities.length < 4 && distractors.length > 0) {
    cities.push(distractors.pop()!);
  }

  return shuffleArray(cities);
}

export function useCapitalGame() {
  const [state, setState] = useState<CapitalGameState>({
    status: "idle",
    currentLand: null,
    options: [],
    streak: 0,
    totalAnswered: 0,
    lastCorrect: null,
    chosenCity: null,
  });

  const startGame = useCallback(() => {
    const land = pickLand(0);
    setState({
      status: "playing",
      currentLand: land,
      options: buildOptions(land),
      streak: 0,
      totalAnswered: 0,
      lastCorrect: null,
      chosenCity: null,
    });
  }, []);

  const guess = useCallback(
    (city: string) => {
      if (state.status !== "playing" || !state.currentLand) return;
      const correct = city === state.currentLand.hoofdstad;

      setState((prev) => ({
        ...prev,
        status: "feedback",
        lastCorrect: correct,
        chosenCity: city,
        streak: correct ? prev.streak + 1 : prev.streak,
        totalAnswered: prev.totalAnswered + 1,
      }));
    },
    [state.status, state.currentLand]
  );

  const nextRound = useCallback(() => {
    if (!state.lastCorrect) {
      setState((prev) => ({ ...prev, status: "gameover" }));
      return;
    }
    const land = pickLand(state.streak, state.currentLand?.land);
    setState((prev) => ({
      ...prev,
      status: "playing",
      currentLand: land,
      options: buildOptions(land),
      lastCorrect: null,
      chosenCity: null,
    }));
  }, [state.lastCorrect, state.streak, state.currentLand]);

  const resetGame = useCallback(() => {
    setState({
      status: "idle",
      currentLand: null,
      options: [],
      streak: 0,
      totalAnswered: 0,
      lastCorrect: null,
      chosenCity: null,
    });
  }, []);

  return {
    ...state,
    startGame,
    guess,
    nextRound,
    resetGame,
  };
}
