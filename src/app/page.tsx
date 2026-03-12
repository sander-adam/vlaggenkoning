"use client";

import Link from "next/link";
import { useHighScores } from "@/hooks/useHighScores";
import ScoreBoard from "@/components/ScoreBoard";

export default function Home() {
  const { scores } = useHighScores();

  return (
    <div className="min-h-dvh bg-gradient-to-b from-blue-500 to-blue-700 flex flex-col items-center">
      <main className="w-full max-w-[393px] flex flex-col items-center gap-6 px-6 py-12">
        {/* Title */}
        <div className="text-center">
          <div className="text-6xl mb-2">👑</div>
          <h1 className="text-5xl font-bold text-white drop-shadow-lg">
            Vlaggen&shy;koning
          </h1>
          <p className="mt-3 text-xl text-blue-100">
            Ken jij alle vlaggen van de wereld?
          </p>
        </div>

        {/* Play button */}
        <Link
          href="/speel"
          className="mt-4 rounded-2xl bg-gradient-to-r from-orange-400 to-orange-500
            px-12 py-4 text-2xl font-bold text-white shadow-lg
            active:scale-95 transition-transform hover:from-orange-500 hover:to-orange-600"
        >
          Spelen!
        </Link>

        {/* High scores */}
        <div className="w-full mt-4">
          <ScoreBoard scores={scores} />
        </div>
      </main>
    </div>
  );
}
