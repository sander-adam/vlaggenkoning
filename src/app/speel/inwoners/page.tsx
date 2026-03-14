"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { usePopulationGame } from "@/hooks/usePopulationGame";
import { useHighScores } from "@/hooks/useHighScores";
import { formatInwoners } from "@/lib/formatNumber";
import { isNewRecord, getPlayerName } from "@/lib/storage";
import StreakBadge from "@/components/StreakBadge";
import ConfettiEffect from "@/components/ConfettiEffect";
import NameInput from "@/components/NameInput";
import type { Land } from "@/lib/types";

function populationToPeople(n: number): number {
  const count = Math.round(n / 5_000_000);
  return Math.max(count, 1);
}

function PopulationComparison({
  landA,
  landB,
}: {
  landA: Land;
  landB: Land;
}) {
  const max = Math.max(landA.inwoners, landB.inwoners);
  const pctA = Math.max((landA.inwoners / max) * 100, 6);
  const pctB = Math.max((landB.inwoners / max) * 100, 6);
  const peopleA = Math.min(populationToPeople(landA.inwoners), 30);
  const peopleB = Math.min(populationToPeople(landB.inwoners), 30);
  const maxPeople = Math.max(peopleA, peopleB);
  const aWins = landA.inwoners > landB.inwoners;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full rounded-2xl bg-white/90 p-4 shadow-lg"
    >
      {/* Two columns, always aligned */}
      <div className="grid grid-cols-2 gap-3">
        {/* Column A */}
        <div className="flex flex-col items-center">
          <span className="text-xs font-bold text-gray-400 mb-2 truncate max-w-full">
            {landA.land}
          </span>

          {/* People grid — fixed height based on max */}
          <div
            className="flex flex-wrap justify-center gap-[2px] w-full mb-2"
            style={{ minHeight: `${Math.ceil(maxPeople / 6) * 18}px` }}
          >
            {Array.from({ length: peopleA }).map((_, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                  delay: 0.2 + i * 0.04,
                  type: "spring",
                  stiffness: 500,
                  damping: 20,
                }}
                className="text-[13px] leading-none"
              >
                👤
              </motion.span>
            ))}
          </div>

          {/* Bar */}
          <div className="w-full h-4 rounded-full bg-gray-100 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${pctA}%` }}
              transition={{ duration: 0.8, delay: 0.15, ease: "easeOut" }}
              className={`h-full rounded-full ${aWins ? "bg-green-400" : "bg-red-300"}`}
            />
          </div>

          {/* Number */}
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className={`text-sm font-bold mt-1.5 ${aWins ? "text-green-600" : "text-red-400"}`}
          >
            {formatInwoners(landA.inwoners)}
          </motion.span>
        </div>

        {/* Column B */}
        <div className="flex flex-col items-center">
          <span className="text-xs font-bold text-gray-400 mb-2 truncate max-w-full">
            {landB.land}
          </span>

          {/* People grid — same fixed height */}
          <div
            className="flex flex-wrap justify-center gap-[2px] w-full mb-2"
            style={{ minHeight: `${Math.ceil(maxPeople / 6) * 18}px` }}
          >
            {Array.from({ length: peopleB }).map((_, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                  delay: 0.2 + i * 0.04,
                  type: "spring",
                  stiffness: 500,
                  damping: 20,
                }}
                className="text-[13px] leading-none"
              >
                👤
              </motion.span>
            ))}
          </div>

          {/* Bar */}
          <div className="w-full h-4 rounded-full bg-gray-100 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${pctB}%` }}
              transition={{ duration: 0.8, delay: 0.15, ease: "easeOut" }}
              className={`h-full rounded-full ${!aWins ? "bg-green-400" : "bg-red-300"}`}
            />
          </div>

          {/* Number */}
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className={`text-sm font-bold mt-1.5 ${!aWins ? "text-green-600" : "text-red-400"}`}
          >
            {formatInwoners(landB.inwoners)}
          </motion.span>
        </div>
      </div>
    </motion.div>
  );
}

export default function InwonersPage() {
  const game = usePopulationGame();
  const { scores, addScore } = useHighScores("inwoners");
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

  // Auto-advance on correct (2.2s), auto game-over on wrong (2.5s)
  useEffect(() => {
    if (game.status === "feedback") {
      if (game.lastCorrect) {
        const t = setTimeout(() => game.nextRound(), 2200);
        return () => clearTimeout(t);
      } else {
        const t = setTimeout(() => game.nextRound(), 2500);
        return () => clearTimeout(t);
      }
    }
  }, [game.status, game.lastCorrect, game.nextRound]);

  const handleNameSubmit = useCallback((name: string) => {
    if (!scoreSaved.current) {
      addScore(game.streak, game.totalAnswered, name);
      scoreSaved.current = true;
    }
    setNameEntered(true);
  }, [addScore, game.streak, game.totalAnswered]);

  const newRecord = game.status === "gameover" && isNewRecord(game.streak, "inwoners");
  const position = game.status === "gameover"
    ? scores.findIndex(s => s.streak <= game.streak) + 1
    : 0;

  return (
    <div className="min-h-dvh bg-gradient-to-b from-emerald-500 to-emerald-700 flex flex-col items-center">
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

        <h2 className="text-xl font-bold text-white/90">Wie heeft meer inwoners?</h2>

        {/* Playing / feedback */}
        {(game.status === "playing" || game.status === "feedback") &&
          game.landA &&
          game.landB && (
            <div className="w-full flex flex-col gap-3">
              {/* Two country cards — always same height */}
              <div className="grid grid-cols-2 gap-3 w-full">
                <CountryCard
                  land={game.landA}
                  onChoose={game.status === "playing" ? game.choose : undefined}
                  showResult={game.status === "feedback"}
                  isWinner={game.landA.inwoners > game.landB.inwoners}
                  isChosen={game.chosenLand?.land === game.landA.land}
                />
                <CountryCard
                  land={game.landB}
                  onChoose={game.status === "playing" ? game.choose : undefined}
                  showResult={game.status === "feedback"}
                  isWinner={game.landB.inwoners > game.landA.inwoners}
                  isChosen={game.chosenLand?.land === game.landB.land}
                />
              </div>

              {/* Hint while playing */}
              {game.status === "playing" && (
                <div className="text-center">
                  <span className="text-white/40 font-bold text-sm">Tik op het grootste land</span>
                </div>
              )}

              {/* Population comparison — below both cards, always aligned */}
              {game.status === "feedback" && (
                <>
                  <ConfettiEffect trigger={!!game.lastCorrect} />

                  <PopulationComparison landA={game.landA} landB={game.landB} />

                  {/* Result + next */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={`rounded-2xl p-3 text-center ${
                      game.lastCorrect
                        ? "bg-green-400/20 border-2 border-green-400/40"
                        : "bg-red-400/20 border-2 border-red-400/40"
                    }`}
                  >
                    <span className="text-lg font-bold text-white">
                      {game.lastCorrect ? "✓ Goed!" : "✗ Helaas!"}
                    </span>
                  </motion.div>

                </>
              )}
            </div>
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
            {game.landA && game.landB && game.chosenLand && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="w-full rounded-2xl bg-black/20 backdrop-blur-sm border border-white/10 p-4 text-center"
              >
                <p className="text-white/50 text-sm mb-2">Je koos</p>
                <div className="flex items-center justify-center gap-2 mb-2">
                  <div className="w-10 h-7 rounded overflow-hidden border border-white/20">
                    <Image
                      src={game.chosenLand.vlag.startsWith("/") ? game.chosenLand.vlag : `/${game.chosenLand.vlag}`}
                      alt={game.chosenLand.land}
                      width={40}
                      height={28}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="text-red-300 text-lg font-bold">{game.chosenLand.land}</span>
                  <span className="text-white/40 text-sm">({formatInwoners(game.chosenLand.inwoners)})</span>
                </div>
                <p className="text-white/50 text-sm mb-2">maar het juiste antwoord was</p>
                {(() => {
                  const winner = game.landA.inwoners > game.landB.inwoners ? game.landA : game.landB;
                  return (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-10 h-7 rounded overflow-hidden border border-white/20">
                        <Image
                          src={winner.vlag.startsWith("/") ? winner.vlag : `/${winner.vlag}`}
                          alt={winner.land}
                          width={40}
                          height={28}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <span className="text-green-300 text-lg font-bold">{winner.land}</span>
                      <span className="text-white/40 text-sm">({formatInwoners(winner.inwoners)})</span>
                    </div>
                  );
                })()}
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
              <p className="text-emerald-200 mt-1 text-lg font-semibold">
                {game.streak === 0
                  ? "Volgende keer beter!"
                  : `${game.streak} op een rij!`}
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
      </main>
    </div>
  );
}

function CountryCard({
  land,
  onChoose,
  showResult,
  isWinner,
  isChosen,
}: {
  land: Land;
  onChoose?: (land: Land) => void;
  showResult: boolean;
  isWinner: boolean;
  isChosen: boolean;
}) {
  const imageSrc = land.vlag.startsWith("/") ? land.vlag : `/${land.vlag}`;

  const ring = showResult
    ? isWinner
      ? "ring-4 ring-green-400"
      : isChosen
        ? "ring-4 ring-red-400"
        : "ring-2 ring-gray-200"
    : "";

  const bg = showResult
    ? isWinner
      ? "bg-green-50"
      : isChosen
        ? "bg-red-50"
        : "bg-white"
    : "bg-white";

  return (
    <motion.button
      onClick={() => onChoose?.(land)}
      disabled={!onChoose}
      whileTap={onChoose ? { scale: 0.95 } : undefined}
      className={`rounded-2xl ${bg} ${ring} p-3 shadow-lg
        flex flex-col items-center gap-2 transition-colors
        ${onChoose ? "cursor-pointer" : ""}`}
    >
      <Image
        src={imageSrc}
        alt={land.land}
        width={200}
        height={133}
        className="w-full rounded-xl"
      />
      <span className="font-bold text-gray-800 text-sm leading-tight text-center min-h-[2.5em] flex items-center justify-center">
        {land.land}
      </span>
      {showResult && (
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", delay: 0.2, stiffness: 400 }}
          className={`text-2xl ${isWinner ? "text-green-500" : isChosen ? "text-red-500" : "text-gray-300"}`}
        >
          {isWinner ? "✓" : isChosen ? "✗" : ""}
        </motion.span>
      )}
    </motion.button>
  );
}
