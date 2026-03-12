"use client";

import { useCallback, useEffect, useRef } from "react";
import Link from "next/link";
import { useGame } from "@/hooks/useGame";
import { useHighScores } from "@/hooks/useHighScores";
import FlagImage from "@/components/FlagImage";
import AnswerInput from "@/components/AnswerInput";
import StreakBadge from "@/components/StreakBadge";
import ConfettiEffect from "@/components/ConfettiEffect";
import MilestoneOverlay from "@/components/MilestoneOverlay";
import ResultFeedback from "@/components/ResultFeedback";
import LevelBar from "@/components/LevelBar";
import { isNewRecord } from "@/lib/storage";
import { getLevel } from "@/lib/levels";

export default function SpeelPage() {
  const game = useGame();
  const { addScore } = useHighScores();
  const scoreSaved = useRef(false);

  // Start game on mount if idle
  useEffect(() => {
    if (game.status === "idle") {
      game.startGame();
    }
  }, [game.status, game.startGame]);

  // Save score when game is over
  useEffect(() => {
    if (game.status === "gameover" && !scoreSaved.current) {
      addScore(game.streak, game.totalAnswered);
      scoreSaved.current = true;
    }
    if (game.status === "playing") {
      scoreSaved.current = false;
    }
  }, [game.status, game.streak, game.totalAnswered, addScore]);

  const handleMilestoneDismiss = useCallback(() => {
    game.nextRound();
  }, [game]);

  const newRecord = game.status === "gameover" && isNewRecord(game.streak);

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
        {game.status === "gameover" && game.currentLand && (
          <div className="flex flex-col items-center gap-4 w-full">
            <FlagImage src={game.currentLand.vlag} alt={game.currentLand.land} />

            <ResultFeedback correct={false} correctAnswer={game.currentLand.land} />

            <div className="text-center mt-2">
              {newRecord && game.streak > 0 && (
                <div className="text-2xl font-bold text-yellow-300 mb-2">
                  🎉 Nieuw record!
                </div>
              )}
              <div className="text-4xl font-bold text-white">
                🔥 {game.streak}
              </div>
              <p className="text-blue-200 mt-1">
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
            </div>

            <div className="flex gap-3 mt-4">
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
          </div>
        )}
      </main>
    </div>
  );
}
