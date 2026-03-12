import type { HighScore } from "./types";

type GameMode = "vlaggen" | "inwoners" | "kaart" | "steden" | "hoofdstad" | "ikzie";

function storageKey(mode: GameMode): string {
  return `vlaggenkoning-highscores-${mode}`;
}

export function getHighScores(mode: GameMode = "vlaggen"): HighScore[] {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem(storageKey(mode));
    if (data) return JSON.parse(data);
    // Migrate old key for vlaggen mode
    if (mode === "vlaggen") {
      const old = localStorage.getItem("vlaggenkoning-highscores");
      if (old) return JSON.parse(old);
    }
    return [];
  } catch {
    return [];
  }
}

export function saveHighScore(score: HighScore, mode: GameMode = "vlaggen"): HighScore[] {
  const scores = getHighScores(mode);
  scores.push(score);
  scores.sort((a, b) => b.streak - a.streak);
  const top10 = scores.slice(0, 10);
  localStorage.setItem(storageKey(mode), JSON.stringify(top10));
  return top10;
}

export function isNewRecord(streak: number, mode: GameMode = "vlaggen"): boolean {
  const scores = getHighScores(mode);
  if (scores.length === 0) return true;
  return streak > scores[0].streak;
}

const PLAYER_NAME_KEY = "vlaggenkoning-player-name";

export function getPlayerName(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(PLAYER_NAME_KEY) || "";
}

export function setPlayerName(name: string): void {
  localStorage.setItem(PLAYER_NAME_KEY, name);
}
