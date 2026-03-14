"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useCapitalGame } from "@/hooks/useCapitalGame";
import { useHighScores } from "@/hooks/useHighScores";
import { isNewRecord } from "@/lib/storage";
import { getMilestone } from "@/lib/milestones";
import StreakBadge from "@/components/StreakBadge";
import ConfettiEffect from "@/components/ConfettiEffect";
import MilestoneOverlay from "@/components/MilestoneOverlay";
import NameInput from "@/components/NameInput";

export default function HoofdstadPage() {
  const game = useCapitalGame();
  const { addScore } = useHighScores("hoofdstad");
  const scoreSaved = useRef(false);
  const [nameEntered, setNameEntered] = useState(false);
  const [milestone, setMilestone] = useState<ReturnType<typeof getMilestone>>(null);

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

  // Check milestones
  useEffect(() => {
    if (game.status === "feedback" && game.lastCorrect) {
      setMilestone(getMilestone(game.streak, "hoofdstad"));
    } else {
      setMilestone(null);
    }
  }, [game.status, game.lastCorrect, game.streak]);

  // Auto-advance on correct, auto game-over on wrong
  useEffect(() => {
    if (game.status === "feedback") {
      if (game.lastCorrect) {
        const m = getMilestone(game.streak, "hoofdstad");
        if (!m) {
          const t = setTimeout(() => game.nextRound(), 1200);
          return () => clearTimeout(t);
        }
      } else {
        const t = setTimeout(() => game.nextRound(), 2500);
        return () => clearTimeout(t);
      }
    }
  }, [game.status, game.lastCorrect, game.streak, game.nextRound]);

  const handleMilestoneDismiss = useCallback(() => {
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

  const newRecord = game.status === "gameover" && isNewRecord(game.streak, "hoofdstad");

  return (
    <div className="min-h-dvh bg-gradient-to-b from-purple-500 to-indigo-700 flex flex-col items-center">
      <main className="w-full max-w-[393px] flex flex-col items-center gap-4 px-4 py-6">
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

        {/* Playing / feedback */}
        {(game.status === "playing" || game.status === "feedback") &&
          game.currentLand && (
            <div className="w-full flex flex-col items-center gap-4">
              {/* Flag + country name */}
              <motion.div
                key={game.currentLand.land}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex flex-col items-center gap-2"
              >
                <div className="w-48 h-32 rounded-2xl overflow-hidden shadow-xl border-2 border-white/20">
                  <Image
                    src={
                      game.currentLand.vlag.startsWith("/")
                        ? game.currentLand.vlag
                        : `/${game.currentLand.vlag}`
                    }
                    alt={game.currentLand.land}
                    width={192}
                    height={128}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h2 className="text-2xl font-bold text-white drop-shadow">
                  {game.currentLand.land}
                </h2>
                <p className="text-white/70 text-sm font-medium">
                  Wat is de hoofdstad?
                </p>
              </motion.div>

              {/* City options */}
              <div className="w-full grid grid-cols-2 gap-3">
                {game.options.map((city) => {
                  const isChosen = game.chosenCity === city;
                  const isCorrect = city === game.currentLand!.hoofdstad;
                  const showResult = game.status === "feedback";

                  let bg = "bg-white/15 border-white/20";
                  let textColor = "text-white";

                  if (showResult) {
                    if (isCorrect) {
                      bg = "bg-green-500/30 border-green-400";
                      textColor = "text-green-100";
                    } else if (isChosen) {
                      bg = "bg-red-500/30 border-red-400";
                      textColor = "text-red-100";
                    } else {
                      bg = "bg-white/5 border-white/10";
                      textColor = "text-white/40";
                    }
                  }

                  return (
                    <motion.button
                      key={city}
                      onClick={() =>
                        game.status === "playing" && game.guess(city)
                      }
                      disabled={game.status !== "playing"}
                      whileTap={
                        game.status === "playing" ? { scale: 0.95 } : undefined
                      }
                      className={`rounded-2xl border-2 ${bg} backdrop-blur-sm
                        px-4 py-5 text-center shadow-lg transition-colors
                        ${game.status === "playing" ? "cursor-pointer active:scale-95" : ""}`}
                    >
                      <span className={`text-lg font-bold ${textColor}`}>
                        {city}
                      </span>
                      {showResult && isCorrect && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 400 }}
                          className="text-2xl mt-1"
                        >
                          ✓
                        </motion.div>
                      )}
                      {showResult && isChosen && !isCorrect && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 400 }}
                          className="text-2xl mt-1"
                        >
                          ✗
                        </motion.div>
                      )}
                    </motion.button>
                  );
                })}
              </div>

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
                      {game.lastCorrect
                        ? "✓ Goed!"
                        : `✗ Het was ${game.currentLand.hoofdstad}`}
                    </span>
                  </motion.div>

                  {milestone && (
                    <MilestoneOverlay
                      milestone={milestone}
                      onDismiss={handleMilestoneDismiss}
                    />
                  )}
                </>
              )}
            </div>
          )}

        {/* Game over */}
        {game.status === "gameover" && (
          <div className="flex flex-col items-center gap-4 w-full mt-2">
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
            {game.currentLand && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="w-full rounded-2xl bg-black/20 backdrop-blur-sm border border-white/10 p-4 text-center"
              >
                <div className="w-24 h-16 rounded-xl overflow-hidden shadow-lg border border-white/20 mx-auto mb-3">
                  <Image
                    src={
                      game.currentLand.vlag.startsWith("/")
                        ? game.currentLand.vlag
                        : `/${game.currentLand.vlag}`
                    }
                    alt={game.currentLand.land}
                    width={96}
                    height={64}
                    className="w-full h-full object-cover"
                  />
                </div>
                <p className="text-white/80 font-bold mb-2">
                  {game.currentLand.land}
                </p>
                {game.chosenCity && (
                  <>
                    <p className="text-white/50 text-sm">Je koos</p>
                    <p className="text-red-300 text-xl font-bold line-through decoration-2">
                      {game.chosenCity}
                    </p>
                  </>
                )}
                <p className="text-white/50 text-sm mt-2">De hoofdstad is</p>
                <p className="text-green-300 text-xl font-bold">
                  {game.currentLand.hoofdstad}
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
              <p className="text-purple-200 mt-1 text-lg font-semibold">
                {game.streak === 0
                  ? "Volgende keer beter!"
                  : `${game.streak} hoofdsteden goed!`}
              </p>
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
                  className="rounded-2xl bg-gradient-to-r from-purple-400 to-purple-500
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
      </main>
    </div>
  );
}
