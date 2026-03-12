"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useMapGame } from "@/hooks/useMapGame";
import { useHighScores } from "@/hooks/useHighScores";
import StreakBadge from "@/components/StreakBadge";
import ConfettiEffect from "@/components/ConfettiEffect";
import MilestoneOverlay from "@/components/MilestoneOverlay";
import LevelBar from "@/components/LevelBar";
import NameInput from "@/components/NameInput";
import { isNewRecord, getPlayerName } from "@/lib/storage";
import { getLevel } from "@/lib/levels";

// Dynamic import to avoid SSR issues with D3/react-simple-maps
const WorldMap = dynamic(() => import("@/components/WorldMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full aspect-[2/1] bg-white/10 rounded-2xl animate-pulse flex items-center justify-center">
      <span className="text-white/60 text-lg">Kaart laden...</span>
    </div>
  ),
});

export default function KaartPage() {
  const [availableCodes, setAvailableCodes] = useState<Set<string>>(new Set());
  const [mapReady, setMapReady] = useState(false);
  const game = useMapGame(availableCodes);
  const { scores, addScore } = useHighScores("kaart");
  const scoreSaved = useRef(false);
  const [nameEntered, setNameEntered] = useState(false);
  const feedbackTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleGeographiesLoaded = useCallback((codes: Set<string>) => {
    if (!mapReady) {
      setAvailableCodes(codes);
      setMapReady(true);
    }
  }, [mapReady]);

  // Start game once map is ready
  useEffect(() => {
    if (mapReady && game.status === "idle") {
      game.startGame();
    }
  }, [mapReady, game.status, game.startGame]);

  // Auto-save score if player already has a saved name
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

  const handleNameSubmit = useCallback((name: string) => {
    if (!scoreSaved.current) {
      addScore(game.streak, game.totalAnswered, name);
      scoreSaved.current = true;
    }
    setNameEntered(true);
  }, [addScore, game.streak, game.totalAnswered]);

  // Auto-advance after correct answer (longer if milestone)
  useEffect(() => {
    if (game.status === "feedback" && !game.milestone) {
      feedbackTimer.current = setTimeout(() => game.nextRound(), 1500);
      return () => {
        if (feedbackTimer.current) clearTimeout(feedbackTimer.current);
      };
    }
  }, [game.status, game.milestone, game.nextRound]);

  const handleMilestoneDismiss = useCallback(() => {
    game.nextRound();
  }, [game]);

  const newRecord = game.status === "gameover" && isNewRecord(game.streak, "kaart");
  const position = game.status === "gameover"
    ? scores.findIndex(s => s.streak <= game.streak) + 1
    : 0;

  return (
    <div className="min-h-dvh bg-gradient-to-b from-teal-500 to-teal-700 flex flex-col items-center">
      <main className="w-full max-w-3xl flex flex-col items-center gap-3 px-4 py-6">
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

        {/* Current country prompt */}
        {game.currentLand && game.status !== "gameover" && (
          <div className="text-center">
            <p className="text-white/70 text-sm">Waar ligt...</p>
            <h2 className="text-3xl font-bold text-white">
              {game.currentLand.land}
            </h2>
          </div>
        )}

        {/* Map */}
        <div className="w-full aspect-[2/1] bg-blue-400/30 rounded-2xl overflow-hidden shadow-lg">
          <WorldMap
            status={game.status}
            currentAlpha2={game.currentAlpha2}
            clickedAlpha2={game.clickedAlpha2}
            lastCorrect={game.lastCorrect}
            answeredCorrectly={game.answeredCorrectly}
            onCountryClick={game.handleClick}
            onGeographiesLoaded={handleGeographiesLoaded}
          />
        </div>

        {/* Feedback after correct answer */}
        {game.status === "feedback" && game.currentLand && (
          <>
            <ConfettiEffect trigger={true} />
            {!game.milestone && (
              <div className="rounded-xl bg-green-400/30 px-6 py-2 text-lg font-bold text-green-100">
                ✓ Goed! {game.currentLand.land}
              </div>
            )}
            <MilestoneOverlay
              milestone={game.milestone}
              onDismiss={handleMilestoneDismiss}
            />
          </>
        )}

        {/* Game over */}
        {game.status === "gameover" && game.currentLand && (
          <div className="flex flex-col items-center gap-4 w-full">
            <div className="text-center">
              <p className="text-red-200 text-lg font-bold">
                ✗ Je klikte op {game.clickedLandName || "een onbekend land"}
              </p>
              <p className="text-white/70 text-sm mt-1">
                Het juiste antwoord was <strong className="text-green-300">{game.currentLand.land}</strong> (groen op de kaart)
              </p>
            </div>

            <div className="text-center mt-2">
              {newRecord && game.streak > 0 && (
                <div className="text-2xl font-bold text-yellow-300 mb-2">
                  🎉 Nieuw record!
                </div>
              )}
              <div className="text-4xl font-bold text-white">
                🔥 {game.streak}
              </div>
              <p className="text-teal-200 mt-1">
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
