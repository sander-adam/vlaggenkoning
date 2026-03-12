import type { HighScore } from "./types";

const STORAGE_KEY = "vlaggenkoning-highscores";

export function getHighScores(): HighScore[] {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveHighScore(score: HighScore): HighScore[] {
  const scores = getHighScores();
  scores.push(score);
  scores.sort((a, b) => b.streak - a.streak);
  const top10 = scores.slice(0, 10);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(top10));
  return top10;
}

export function isNewRecord(streak: number): boolean {
  const scores = getHighScores();
  if (scores.length === 0) return true;
  return streak > scores[0].streak;
}
