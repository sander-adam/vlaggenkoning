"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useHintGame } from "@/hooks/useHintGame";
import { useHighScores } from "@/hooks/useHighScores";
import FlagImage from "@/components/FlagImage";
import AnswerInput from "@/components/AnswerInput";
import ConfettiEffect from "@/components/ConfettiEffect";
import MilestoneOverlay from "@/components/MilestoneOverlay";
import ResultFeedback from "@/components/ResultFeedback";
import NameInput from "@/components/NameInput";
import { isNewRecord } from "@/lib/storage";

const hintIcons = ["🌍", "👥", "🔤", "🅰️", "🏙️", "🏛️"];

function PointsBadge({ points }: { points: number }) {
  return (
    <AnimatePresence mode="popLayout">
      <motion.div
        key={points}
        initial={{ scale: 1.4 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 400, damping: 15 }}
        className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5
          font-bold text-lg shadow-md ${
            points <= 3
              ? "bg-red-500 text-white"
              : "bg-white/20 text-white"
          }`}
      >
        <span className="text-xl">💎</span>
        <span>{points}</span>
      </motion.div>
    </AnimatePresence>
  );
}

export default function IkZiePage() {
  const game = useHintGame();
  const { scores, addScore } = useHighScores("ikzie");
  const scoreSaved = useRef(false);
  const [nameEntered, setNameEntered] = useState(false);

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

  const handleNameSubmit = useCallback((name: string) => {
    if (!scoreSaved.current) {
      addScore(game.totalCorrect, game.totalAnswered, name);
      scoreSaved.current = true;
    }
    setNameEntered(true);
  }, [addScore, game.totalCorrect, game.totalAnswered]);

  const handleMilestoneDismiss = useCallback(() => {
    game.nextRound();
  }, [game]);

  // Global Enter key: reveal next hint when input is empty (or not focused)
  useEffect(() => {
    if (game.status !== "playing" || game.revealedCount >= 6) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Enter") return;
      const active = document.activeElement;
      // If an input is focused, only trigger if it's empty
      if (active instanceof HTMLInputElement && active.type === "text") {
        if (active.value.trim()) return; // has text, let normal submit handle it
      }
      e.preventDefault();
      game.revealNextHint();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [game.status, game.revealedCount, game.revealNextHint]);

  const newRecord = game.status === "gameover" && isNewRecord(game.totalCorrect, "ikzie");
  const position = game.status === "gameover"
    ? scores.findIndex(s => s.streak <= game.totalCorrect) + 1
    : 0;

  return (
    <div className="min-h-dvh bg-gradient-to-b from-amber-500 to-rose-600 flex flex-col items-center">
      <main className="w-full max-w-[393px] flex flex-col items-center gap-4 px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between w-full">
          <Link
            href="/"
            className="text-white/80 font-bold text-lg hover:text-white transition-colors"
          >
            &larr; Home
          </Link>
          {game.status !== "idle" && <PointsBadge points={game.points} />}
        </div>

        {/* Stats row */}
        {game.status !== "idle" && game.totalAnswered > 0 && (
          <div className="flex gap-4 text-sm text-white/70">
            <span>Goed: <strong className="text-white">{game.totalCorrect}</strong></span>
            <span>Streak: <strong className="text-white">{game.streak}</strong></span>
          </div>
        )}

        {/* Playing state */}
        {game.status === "playing" && game.currentLand && (
          <>
            <div className="text-center mb-2">
              <h2 className="text-2xl font-bold text-white drop-shadow">
                Ik zie, ik zie...
              </h2>
              <p className="text-white/70 text-sm mt-1">
                wat jij niet ziet! Welk land is het?
              </p>
            </div>

            {/* Hint cards */}
            <div className="w-full flex flex-col gap-2">
              {game.hints.map((hint, i) => {
                const revealed = i < game.revealedCount;
                return (
                  <AnimatePresence key={i}>
                    {revealed ? (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        className="rounded-xl bg-white/20 backdrop-blur-sm border border-white/30 p-3 flex items-start gap-3"
                      >
                        <span className="text-xl flex-shrink-0">{hintIcons[i]}</span>
                        <div>
                          <div className="text-xs font-bold text-white/60 uppercase tracking-wide">
                            Hint {i + 1}: {hint.label}
                          </div>
                          <div className="text-white font-medium text-sm mt-0.5">
                            {hint.text}
                          </div>
                        </div>
                      </motion.div>
                    ) : (
                      <div className="rounded-xl bg-white/10 border border-white/10 p-3 flex items-center gap-3">
                        <span className="text-xl opacity-30 flex-shrink-0">{hintIcons[i]}</span>
                        <div className="text-white/30 text-sm font-medium">
                          Hint {i + 1} &mdash; nog verborgen
                        </div>
                      </div>
                    )}
                  </AnimatePresence>
                );
              })}
            </div>

            {/* Next hint button */}
            {game.revealedCount < 6 && (
              <button
                onClick={game.revealNextHint}
                className="rounded-xl bg-white/20 border border-white/30 px-6 py-2.5 text-sm
                  font-bold text-white active:scale-95 transition-transform"
              >
                Volgende hint (-1 punt) &rarr;
              </button>
            )}

            {/* Wrong answer flash */}
            <AnimatePresence>
              {game.wrongFlash > 0 && (
                <motion.div
                  key={game.wrongFlash}
                  initial={{ opacity: 1, scale: 1.05 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="w-full rounded-xl bg-red-500/30 border border-red-400/50 px-4 py-2 text-center"
                >
                  <span className="text-white font-bold text-sm">
                    Fout! -3 punten
                  </span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Answer input */}
            <AnswerInput onSubmit={game.submitAnswer} />
          </>
        )}

        {/* Feedback state (correct answer) */}
        {game.status === "feedback" && game.currentLand && (
          <>
            <FlagImage
              src={game.currentLand.vlag}
              alt={game.currentLand.land}
            />
            <ConfettiEffect trigger={true} />
            <ResultFeedback
              correct={true}
              correctAnswer={game.currentLand.land}
              onNext={game.milestone ? undefined : game.nextRound}
            />
            <MilestoneOverlay
              milestone={game.milestone}
              onDismiss={handleMilestoneDismiss}
            />
          </>
        )}

        {/* Game over state */}
        {game.status === "gameover" && (
          <div className="flex flex-col items-center gap-4 w-full">
            {game.currentLand && (
              <FlagImage src={game.currentLand.vlag} alt={game.currentLand.land} />
            )}

            {game.lastAnswerCorrect === false && game.currentLand && (
              <ResultFeedback correct={false} correctAnswer={game.currentLand.land} />
            )}

            <div className="text-center mt-2">
              <div className="text-xl font-bold text-white/80 mb-2">
                Geen punten meer!
              </div>
              {newRecord && game.totalCorrect > 0 && (
                <div className="text-2xl font-bold text-yellow-300 mb-2">
                  Nieuw record!
                </div>
              )}
              <div className="text-4xl font-bold text-white">
                {game.totalCorrect} goed
              </div>
              <p className="text-amber-200 mt-1">
                {game.totalCorrect === 0
                  ? "Volgende keer beter!"
                  : `${game.totalCorrect} van de ${game.totalAnswered} landen geraden`}
              </p>
            </div>

            {!nameEntered && (
              <NameInput onSubmit={handleNameSubmit} />
            )}

            {nameEntered && (
              <>
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
              </>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
