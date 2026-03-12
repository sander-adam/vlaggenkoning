"use client";

import { useState, useCallback } from "react";
import type { Land } from "@/lib/types";
import landen from "@/data/landen.json";

type Status = "idle" | "playing" | "feedback" | "gameover";

interface PopulationState {
  status: Status;
  landA: Land | null;
  landB: Land | null;
  streak: number;
  totalAnswered: number;
  lastCorrect: boolean | null;
  chosenLand: Land | null;
}

const allLanden: Land[] = landen;

function pickTwo(exclude?: [Land, Land] | null): [Land, Land] {
  const pool = [...allLanden];
  let a: Land, b: Land;
  do {
    a = pool[Math.floor(Math.random() * pool.length)];
    b = pool[Math.floor(Math.random() * pool.length)];
  } while (
    a.land === b.land ||
    a.inwoners === b.inwoners ||
    (exclude && a.land === exclude[0].land && b.land === exclude[1].land) ||
    (exclude && a.land === exclude[1].land && b.land === exclude[0].land)
  );
  return [a, b];
}

export function usePopulationGame() {
  const [state, setState] = useState<PopulationState>({
    status: "idle",
    landA: null,
    landB: null,
    streak: 0,
    totalAnswered: 0,
    lastCorrect: null,
    chosenLand: null,
  });

  const startGame = useCallback(() => {
    const [a, b] = pickTwo();
    setState({
      status: "playing",
      landA: a,
      landB: b,
      streak: 0,
      totalAnswered: 0,
      lastCorrect: null,
      chosenLand: null,
    });
  }, []);

  const choose = useCallback(
    (chosen: Land) => {
      if (state.status !== "playing" || !state.landA || !state.landB) return;

      const correct =
        chosen.inwoners ===
        Math.max(state.landA.inwoners, state.landB.inwoners);

      setState((prev) => ({
        ...prev,
        status: "feedback",
        lastCorrect: correct,
        chosenLand: chosen,
        streak: correct ? prev.streak + 1 : prev.streak,
        totalAnswered: prev.totalAnswered + 1,
      }));
    },
    [state.status, state.landA, state.landB]
  );

  const nextRound = useCallback(() => {
    if (!state.lastCorrect) {
      // Game over
      setState((prev) => ({ ...prev, status: "gameover" }));
      return;
    }
    const pair = state.landA && state.landB ? [state.landA, state.landB] as [Land, Land] : null;
    const [a, b] = pickTwo(pair);
    setState((prev) => ({
      ...prev,
      status: "playing",
      landA: a,
      landB: b,
      lastCorrect: null,
      chosenLand: null,
    }));
  }, [state.lastCorrect, state.landA, state.landB]);

  const resetGame = useCallback(() => {
    setState({
      status: "idle",
      landA: null,
      landB: null,
      streak: 0,
      totalAnswered: 0,
      lastCorrect: null,
      chosenLand: null,
    });
  }, []);

  return { ...state, startGame, choose, nextRound, resetGame };
}
