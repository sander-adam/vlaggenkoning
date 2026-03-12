"use client";

import { useState, useCallback } from "react";
import type { Land } from "@/lib/types";
import { type Hint, generateHints } from "@/lib/hints";
import { getRandomLand } from "@/lib/gameLogic";
import { checkAnswer } from "@/lib/fuzzyMatch";
import { getMilestone } from "@/lib/milestones";
import { isLevelUp } from "@/lib/levels";

const STARTING_POINTS = 10;
const HINT_COST = 1;
const WRONG_PENALTY = 3;
const CORRECT_REWARD = 5;

export type HintGameStatus = "idle" | "playing" | "feedback" | "gameover";

export interface HintGameState {
  status: HintGameStatus;
  currentLand: Land | null;
  hints: Hint[];
  revealedCount: number;
  points: number;
  streak: number;
  totalCorrect: number;
  totalAnswered: number;
  lastAnswerCorrect: boolean | null;
  userAnswer: string;
  wrongFlash: number; // increments on wrong answer to trigger animation
}

const initialState: HintGameState = {
  status: "idle",
  currentLand: null,
  hints: [],
  revealedCount: 0,
  points: STARTING_POINTS,
  streak: 0,
  totalCorrect: 0,
  totalAnswered: 0,
  lastAnswerCorrect: null,
  userAnswer: "",
  wrongFlash: 0,
};

export function useHintGame() {
  const [state, setState] = useState<HintGameState>(initialState);
  const [milestone, setMilestone] = useState<ReturnType<typeof getMilestone>>(null);
  const [levelledUp, setLevelledUp] = useState(false);

  const startGame = useCallback(() => {
    const land = getRandomLand(0);
    const hints = generateHints(land);
    setState({
      status: "playing",
      currentLand: land,
      hints,
      revealedCount: 1,
      points: STARTING_POINTS,
      streak: 0,
      totalCorrect: 0,
      totalAnswered: 0,
      lastAnswerCorrect: null,
      userAnswer: "",
      wrongFlash: 0,
    });
    setMilestone(null);
    setLevelledUp(false);
  }, []);

  const revealNextHint = useCallback(() => {
    setState((prev) => {
      if (prev.revealedCount >= 6) return prev;
      const newPoints = prev.points - HINT_COST;
      if (newPoints <= 0) {
        return { ...prev, status: "gameover", points: 0 };
      }
      return { ...prev, revealedCount: prev.revealedCount + 1, points: newPoints };
    });
  }, []);

  const submitAnswer = useCallback(
    (answer: string) => {
      if (!state.currentLand || state.status !== "playing") return;

      const correct = checkAnswer(answer, state.currentLand.land);

      if (correct) {
        const newStreak = state.streak + 1;
        const m = getMilestone(newStreak, "ikzie");
        setMilestone(m);
        setLevelledUp(isLevelUp(newStreak));

        setState((prev) => ({
          ...prev,
          status: "feedback",
          points: prev.points + CORRECT_REWARD,
          streak: newStreak,
          totalCorrect: prev.totalCorrect + 1,
          totalAnswered: prev.totalAnswered + 1,
          lastAnswerCorrect: true,
          userAnswer: answer,
        }));
      } else {
        const newPoints = state.points - WRONG_PENALTY;
        const dead = newPoints <= 0;

        setState((prev) => ({
          ...prev,
          status: dead ? "gameover" : "playing",
          points: Math.max(newPoints, 0),
          streak: 0,
          totalAnswered: prev.totalAnswered + 1,
          lastAnswerCorrect: false,
          userAnswer: answer,
          wrongFlash: prev.wrongFlash + 1,
        }));
      }
    },
    [state.currentLand, state.status, state.streak, state.points]
  );

  const nextRound = useCallback(() => {
    const land = getRandomLand(state.streak, state.currentLand);
    const hints = generateHints(land);
    setState((prev) => ({
      ...prev,
      status: "playing",
      currentLand: land,
      hints,
      revealedCount: 1,
      lastAnswerCorrect: null,
      userAnswer: "",
    }));
    setMilestone(null);
    setLevelledUp(false);
  }, [state.currentLand, state.streak]);

  const resetGame = useCallback(() => {
    setState(initialState);
    setMilestone(null);
    setLevelledUp(false);
  }, []);

  return {
    ...state,
    milestone,
    levelledUp,
    startGame,
    revealNextHint,
    submitAnswer,
    nextRound,
    resetGame,
  };
}
