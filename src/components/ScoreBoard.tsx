"use client";

import type { HighScore } from "@/lib/types";

interface ScoreBoardProps {
  scores: HighScore[];
  title?: string;
}

const medals = ["🥇", "🥈", "🥉"];

export default function ScoreBoard({ scores, title }: ScoreBoardProps) {
  if (scores.length === 0) {
    return null;
  }

  const top5 = scores.slice(0, 5);

  return (
    <div className="rounded-2xl bg-white/50 p-4">
      <h3 className="text-lg font-bold text-gray-700 mb-3 text-center">
        🏆 {title ? `${title}` : "Top Scores"}
      </h3>
      <div className="space-y-2">
        {top5.map((score, i) => (
          <div
            key={`${score.date}-${score.streak}-${i}`}
            className="flex items-center justify-between rounded-xl bg-white px-4 py-2 shadow-sm"
          >
            <div className="flex items-center gap-3">
              <span className="text-lg w-6 text-center">
                {i < 3 ? medals[i] : <span className="text-sm font-bold text-gray-400">{i + 1}.</span>}
              </span>
              <div className="flex flex-col">
                <span className="font-bold text-gray-700">
                  🔥 {score.streak}
                </span>
                {score.name && (
                  <span className="text-xs text-gray-500">{score.name}</span>
                )}
              </div>
            </div>
            <span className="text-sm text-gray-400">{score.date}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
