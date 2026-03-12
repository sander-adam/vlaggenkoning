"use client";

import type { HighScore } from "@/lib/types";

interface ScoreBoardProps {
  scores: HighScore[];
}

export default function ScoreBoard({ scores }: ScoreBoardProps) {
  if (scores.length === 0) {
    return (
      <div className="rounded-2xl bg-white/50 p-6 text-center">
        <p className="text-gray-500 font-medium">Nog geen scores — speel je eerste ronde!</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-white/50 p-4">
      <h3 className="text-lg font-bold text-gray-700 mb-3 text-center">🏆 Top Scores</h3>
      <div className="space-y-2">
        {scores.map((score, i) => (
          <div
            key={`${score.date}-${score.streak}-${i}`}
            className="flex items-center justify-between rounded-xl bg-white px-4 py-2 shadow-sm"
          >
            <div className="flex items-center gap-3">
              <span className="text-lg font-bold text-gray-400 w-6 text-right">
                {i + 1}.
              </span>
              <span className="font-bold text-gray-700">
                🔥 {score.streak}
              </span>
            </div>
            <span className="text-sm text-gray-400">{score.date}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
