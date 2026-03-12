"use client";

import { useState, useCallback } from "react";
import type { GameState, Land } from "@/lib/types";
import { getRandomLand } from "@/lib/gameLogic";
import { checkAnswer } from "@/lib/fuzzyMatch";
import { getMilestone } from "@/lib/milestones";
import { isLevelUp } from "@/lib/levels";

const initialState: GameState = {
  status: "idle",
  currentLand: null,
  streak: 0,
  totalAnswered: 0,
  lastAnswerCorrect: null,
  userAnswer: "",
};

export function useGame() {
  const [state, setState] = useState<GameState>(initialState);
  const [milestone, setMilestone] = useState<ReturnType<typeof getMilestone>>(null);
  const [levelledUp, setLevelledUp] = useState(false);

  const startGame = useCallback(() => {
    const land = getRandomLand(0);
    setState({
      status: "playing",
      currentLand: land,
      streak: 0,
      totalAnswered: 0,
      lastAnswerCorrect: null,
      userAnswer: "",
    });
    setMilestone(null);
    setLevelledUp(false);
  }, []);

  const submitAnswer = useCallback(
    (answer: string) => {
      if (!state.currentLand || state.status !== "playing") return;

      const correct = checkAnswer(answer, state.currentLand.land);
      const newStreak = correct ? state.streak + 1 : state.streak;

      if (correct) {
        const m = getMilestone(newStreak);
        setMilestone(m);
        setLevelledUp(isLevelUp(newStreak));
      }

      setState((prev) => ({
        ...prev,
        status: correct ? "feedback" : "gameover",
        streak: newStreak,
        totalAnswered: prev.totalAnswered + 1,
        lastAnswerCorrect: correct,
        userAnswer: answer,
      }));
    },
    [state.currentLand, state.status, state.streak]
  );

  const nextRound = useCallback(() => {
    const land = getRandomLand(state.streak, state.currentLand);
    setState((prev) => ({
      ...prev,
      status: "playing",
      currentLand: land,
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
    submitAnswer,
    nextRound,
    resetGame,
  };
}
