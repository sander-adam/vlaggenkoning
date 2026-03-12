"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useCityGame } from "@/hooks/useCityGame";
import type { Stad } from "@/hooks/useCityGame";
import { useHighScores } from "@/hooks/useHighScores";
import { isNewRecord, getPlayerName } from "@/lib/storage";
import { getMilestone } from "@/lib/milestones";
import StreakBadge from "@/components/StreakBadge";
import ConfettiEffect from "@/components/ConfettiEffect";
import MilestoneOverlay from "@/components/MilestoneOverlay";
import NameInput from "@/components/NameInput";
import NetherlandsMap from "@/components/NetherlandsMap";

export default function StedenPage() {
  const game = useCityGame();
  const { addScore } = useHighScores("steden");
  const scoreSaved = useRef(false);
  const [nameEntered, setNameEntered] = useState(false);
  const [canAdvance, setCanAdvance] = useState(false);
  const [clickedWrong, setClickedWrong] = useState<Stad | null>(null);
  const [lastWrong, setLastWrong] = useState<{ clicked: Stad; correct: Stad } | null>(null);
  const [milestone, setMilestone] = useState<ReturnType<typeof getMilestone>>(null);

  useEffect(() => {
    if (game.status === "idle") {
      game.startGame();
    }
  }, [game.status, game.startGame]);

  // Save score on game over
  useEffect(() => {
    if (game.status === "gameover" && !scoreSaved.current) {
      const savedName = getPlayerName();
      if (savedName) {
        addScore(game.streak, game.totalAnswered, savedName);
        scoreSaved.current = true;
        setNameEntered(true);
      }
    }
    if (game.status === "playing") {
      scoreSaved.current = false;
      setNameEntered(false);
    }
  }, [game.status, game.streak, game.totalAnswered, addScore]);

  // Check milestones on correct answer
  useEffect(() => {
    if (game.status === "feedback" && game.lastCorrect) {
      const m = getMilestone(game.streak, "steden");
      setMilestone(m);
    } else {
      setMilestone(null);
    }
  }, [game.status, game.lastCorrect, game.streak]);

  // Auto-advance on correct, delay before manual advance on wrong
  useEffect(() => {
    if (game.status === "feedback") {
      setCanAdvance(false);
      if (game.lastCorrect) {
        // Auto-advance after short delay, but not if a milestone is showing
        const m = getMilestone(game.streak, "steden");
        if (!m) {
          const t = setTimeout(() => {
            setClickedWrong(null);
            game.nextRound();
          }, 800);
          return () => clearTimeout(t);
        }
      } else {
        // Wrong: show feedback briefly, then go to game over
        const t = setTimeout(() => {
          setClickedWrong(null);
          game.nextRound();
        }, 2500);
        return () => clearTimeout(t);
      }
    } else {
      setCanAdvance(false);
      setClickedWrong(null);
    }
  }, [game.status, game.lastCorrect, game.nextRound]);

  const handleCityClick = useCallback(
    (stad: Stad) => {
      if (game.status !== "playing") return;
      if (game.correctCities.includes(stad.stad)) return; // already guessed
      if (stad.stad !== game.currentStad?.stad) {
        setClickedWrong(stad);
        if (game.currentStad) {
          setLastWrong({ clicked: stad, correct: game.currentStad });
        }
      }
      game.guess(stad);
    },
    [game]
  );

  const handleNext = useCallback(() => {
    if (!canAdvance) return;
    setClickedWrong(null);
    game.nextRound();
  }, [canAdvance, game]);

  const handleMilestoneDismiss = useCallback(() => {
    setClickedWrong(null);
    game.nextRound();
  }, [game]);

  const handleNameSubmit = useCallback(
    (name: string) => {
      if (!scoreSaved.current) {
        addScore(game.streak, game.totalAnswered, name);
        scoreSaved.current = true;
      }
      setNameEntered(true);
    },
    [addScore, game.streak, game.totalAnswered]
  );

  const newRecord = game.status === "gameover" && isNewRecord(game.streak, "steden");

  return (
    <div className="min-h-dvh bg-gradient-to-b from-amber-500 to-orange-700 flex flex-col items-center">
      <main className="w-full max-w-[393px] flex flex-col items-center gap-3 px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between w-full">
          <Link
            href="/"
            className="text-white/80 font-bold text-lg hover:text-white transition-colors"
          >
            ← Home
          </Link>
          <StreakBadge streak={game.streak} />
        </div>

        {/* Current city prompt */}
        {(game.status === "playing" || game.status === "feedback") && game.currentStad && (
          <div className="text-center">
            <p className="text-white/70 text-sm font-medium">Waar ligt...</p>
            <motion.h2
              key={game.currentStad.stad}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-3xl font-bold text-white drop-shadow"
            >
              {game.currentStad.stad}?
            </motion.h2>
          </div>
        )}

        {/* Map */}
        {(game.status === "playing" || game.status === "feedback") && (
          <NetherlandsMap
            steden={game.visibleSteden}
            correctCities={game.correctCities}
            currentStad={game.currentStad}
            clickedWrong={clickedWrong}
            onClickStad={handleCityClick}
            disabled={game.status !== "playing"}
          />
        )}

        {/* Feedback */}
        {game.status === "feedback" && (
          <>
            <ConfettiEffect trigger={!!game.lastCorrect} />

            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={`rounded-2xl p-3 text-center w-full ${
                game.lastCorrect
                  ? "bg-green-400/20 border-2 border-green-400/40"
                  : "bg-red-400/20 border-2 border-red-400/40"
              }`}
            >
              <span className="text-lg font-bold text-white">
                {game.lastCorrect ? "✓ Goed!" : "✗ Helaas!"}
              </span>
            </motion.div>

            {/* Milestone overlay */}
            {milestone && (
              <MilestoneOverlay
                milestone={milestone}
                onDismiss={handleMilestoneDismiss}
              />
            )}

          </>
        )}

        {/* Game over */}
        {game.status === "gameover" && (
          <div className="flex flex-col items-center gap-4 w-full mt-2">
            {/* GAME OVER header */}
            <motion.div
              initial={{ scale: 0, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 12 }}
              className="text-center"
            >
              <div className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-b from-red-400 to-red-700 drop-shadow-lg tracking-tight">
                GAME OVER
              </div>
            </motion.div>

            {/* What went wrong */}
            {lastWrong && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="w-full rounded-2xl bg-black/20 backdrop-blur-sm border border-white/10 p-4 text-center"
              >
                <p className="text-white/60 text-sm mb-2">Je klikte op</p>
                <p className="text-red-300 text-xl font-bold line-through decoration-2">
                  {lastWrong.clicked.stad}
                </p>
                <p className="text-white/60 text-sm mt-2 mb-1">maar het was</p>
                <p className="text-green-300 text-xl font-bold">
                  {lastWrong.correct.stad}
                </p>
              </motion.div>
            )}

            {/* Score */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, type: "spring", stiffness: 300 }}
              className="text-center"
            >
              {newRecord && game.streak > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  className="text-2xl font-bold text-yellow-300 mb-2"
                >
                  🎉 Nieuw record!
                </motion.div>
              )}
              <div className="text-6xl font-black text-white drop-shadow-lg">
                {game.streak}
              </div>
              <p className="text-amber-200 mt-1 text-lg font-semibold">
                {game.streak === 0
                  ? "Volgende keer beter!"
                  : `${game.streak} steden goed!`}
              </p>
            </motion.div>

            {/* Map with all correct cities */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="w-full"
            >
              <NetherlandsMap
                steden={game.allSteden}
                correctCities={game.correctCities}
                currentStad={lastWrong?.correct ?? null}
                clickedWrong={lastWrong?.clicked ?? null}
                onClickStad={() => {}}
                disabled={true}
              />
            </motion.div>

            {!nameEntered && <NameInput onSubmit={handleNameSubmit} />}

            {nameEntered && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
                className="flex gap-3 mt-2"
              >
                <button
                  onClick={game.startGame}
                  autoFocus
                  className="rounded-2xl bg-gradient-to-r from-orange-400 to-orange-500
                    px-8 py-3 text-xl font-bold text-white shadow-lg
                    active:scale-95 transition-transform"
                >
                  Opnieuw!
                </button>
                <Link
                  href="/"
                  className="rounded-2xl bg-white/20 px-8 py-3 text-xl font-bold text-white
                    shadow-lg active:scale-95 transition-transform"
                >
                  Home
                </Link>
              </motion.div>
            )}
          </div>
        )}

        {/* Score counter */}
        {game.status !== "gameover" && game.status !== "idle" && (
          <div className="text-center text-white/50 text-sm">
            {game.correctCities.length} steden gevonden
          </div>
        )}
      </main>
    </div>
  );
}
