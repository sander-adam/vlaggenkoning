"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useGame } from "@/hooks/useGame";
import { useHighScores } from "@/hooks/useHighScores";
import FlagImage from "@/components/FlagImage";
import AnswerInput from "@/components/AnswerInput";
import StreakBadge from "@/components/StreakBadge";
import ConfettiEffect from "@/components/ConfettiEffect";
import MilestoneOverlay from "@/components/MilestoneOverlay";
import LevelBar from "@/components/LevelBar";
import NameInput from "@/components/NameInput";
import { isNewRecord, getPlayerName } from "@/lib/storage";
import { getLevel } from "@/lib/levels";

export default function SpeelPage() {
  const game = useGame();
  const { scores, addScore } = useHighScores("vlaggen");
  const scoreSaved = useRef(false);
  const [nameEntered, setNameEntered] = useState(false);

  // Start game on mount if idle
  useEffect(() => {
    if (game.status === "idle") {
      game.startGame();
    }
  }, [game.status, game.startGame]);

  // Reset score-saved state when a new game starts
  useEffect(() => {
    if (game.status === "playing") {
      scoreSaved.current = false;
      setNameEntered(false);
    }
  }, [game.status]);

  // Auto-advance on correct (1.2s), auto game-over on wrong (2.5s)
  useEffect(() => {
    if (game.status === "feedback") {
      if (game.lastAnswerCorrect) {
        if (!game.milestone) {
          const t = setTimeout(() => game.nextRound(), 1200);
          return () => clearTimeout(t);
        }
      } else {
        const t = setTimeout(() => game.goToGameOver(), 2500);
        return () => clearTimeout(t);
      }
    }
  }, [game.status, game.lastAnswerCorrect, game.milestone, game.nextRound, game.goToGameOver]);

  const handleNameSubmit = useCallback((name: string) => {
    if (!scoreSaved.current) {
      addScore(game.streak, game.totalAnswered, name);
      scoreSaved.current = true;
    }
    setNameEntered(true);
  }, [addScore, game.streak, game.totalAnswered]);

  const handleMilestoneDismiss = useCallback(() => {
    game.nextRound();
  }, [game]);

  const newRecord = game.status === "gameover" && isNewRecord(game.streak, "vlaggen");
  const position = game.status === "gameover"
    ? scores.findIndex(s => s.streak <= game.streak) + 1
    : 0;

  return (
    <div className="min-h-dvh bg-gradient-to-b from-blue-500 to-blue-700 flex flex-col items-center">
      <main className="w-full max-w-[393px] flex flex-col items-center gap-4 px-6 py-8">
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

        {/* Level progress */}
        {game.status !== "idle" && (
          <LevelBar streak={game.streak} levelledUp={game.levelledUp} />
        )}

        {/* Playing state */}
        {game.status === "playing" && game.currentLand && (
          <>
            <FlagImage
              src={game.currentLand.vlag}
              alt="Welke vlag is dit?"
            />
            <AnswerInput onSubmit={game.submitAnswer} />
          </>
        )}

        {/* Feedback state */}
        {game.status === "feedback" && game.currentLand && (
          <>
            <FlagImage
              src={game.currentLand.vlag}
              alt={game.currentLand.land}
            />

            {game.lastAnswerCorrect ? (
              <>
                <ConfettiEffect trigger={true} />
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-2xl p-3 text-center w-full bg-green-400/20 border-2 border-green-400/40"
                >
                  <span className="text-lg font-bold text-white">
                    ✓ Goed! {game.currentLand.land}
                  </span>
                </motion.div>
              </>
            ) : (
              <motion.div
                initial={{ x: -20 }}
                animate={{ x: 0 }}
                transition={{ type: "spring", stiffness: 500, damping: 15 }}
                className="rounded-2xl p-3 text-center w-full bg-red-400/20 border-2 border-red-400/40"
              >
                <span className="text-lg font-bold text-white">
                  ✗ Helaas!
                </span>
                <p className="text-white/80 text-sm mt-1">
                  Het was <strong>{game.currentLand.land}</strong>
                </p>
              </motion.div>
            )}

            {game.milestone && (
              <MilestoneOverlay
                milestone={game.milestone}
                onDismiss={handleMilestoneDismiss}
              />
            )}
          </>
        )}

        {/* Game over */}
        {game.status === "gameover" && game.currentLand && (
          <div className="flex flex-col items-center gap-4 w-full">
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
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="w-full rounded-2xl bg-black/20 backdrop-blur-sm border border-white/10 p-4 text-center"
            >
              <div className="w-24 h-16 rounded-xl overflow-hidden shadow-lg border border-white/20 mx-auto mb-3">
                <Image
                  src={game.currentLand.vlag.startsWith("/") ? game.currentLand.vlag : `/${game.currentLand.vlag}`}
                  alt={game.currentLand.land}
                  width={96}
                  height={64}
                  className="w-full h-full object-cover"
                />
              </div>
              {game.userAnswer && (
                <>
                  <p className="text-white/50 text-sm">Je antwoord</p>
                  <p className="text-red-300 text-xl font-bold line-through decoration-2">
                    {game.userAnswer}
                  </p>
                </>
              )}
              <p className="text-white/50 text-sm mt-2">Het juiste antwoord</p>
              <p className="text-green-300 text-xl font-bold">
                {game.currentLand.land}
              </p>
            </motion.div>

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
              <p className="text-blue-200 mt-1 text-lg font-semibold">
                {game.streak === 0
                  ? "Volgende keer beter!"
                  : `${game.streak} op een rij!`}
              </p>
              {game.streak > 0 && (
                <div className={`mt-2 inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r ${getLevel(game.streak).color} px-3 py-1`}>
                  <span>{getLevel(game.streak).emoji}</span>
                  <span className="text-sm font-bold text-white">
                    Niveau: {getLevel(game.streak).name}
                  </span>
                </div>
              )}
            </motion.div>

            {!nameEntered && <NameInput onSubmit={handleNameSubmit} />}

            {nameEntered && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
                className="flex flex-col items-center gap-3"
              >
                {position > 0 && (
                  <div className="rounded-xl bg-white/20 px-5 py-2 text-center">
                    <span className="text-white/70 text-sm">Leaderboard positie</span>
                    <div className="text-2xl font-bold text-white">#{position}</div>
                  </div>
                )}
                <div className="flex gap-3 mt-2">
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
                </div>
              </motion.div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
