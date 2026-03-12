import type { Land } from "./types";
import landen from "@/data/landen.json";

const allLanden: Land[] = landen;

/**
 * Pick a random land appropriate for the current streak.
 * Difficulty ramps up gradually:
 *   streak 0-2:  moeilijkheid 0-30  (easy: Nederland, Duitsland, Frankrijk…)
 *   streak 3-5:  moeilijkheid 0-50
 *   streak 6-9:  moeilijkheid 0-70
 *   streak 10-14: moeilijkheid 10-85
 *   streak 15-24: moeilijkheid 20-95
 *   streak 25+:  alles (0-100)
 */
export function getDifficultyRange(streak: number): [number, number] {
  if (streak <= 2) return [0, 30];
  if (streak <= 5) return [0, 50];
  if (streak <= 9) return [0, 70];
  if (streak <= 14) return [10, 85];
  if (streak <= 24) return [20, 95];
  return [0, 100];
}

export function getRandomLand(streak: number, exclude?: Land | null): Land {
  const [minDiff, maxDiff] = getDifficultyRange(streak);
  const candidates = allLanden.filter(
    (l) =>
      l.moeilijkheid >= minDiff &&
      l.moeilijkheid <= maxDiff &&
      (!exclude || l.land !== exclude.land)
  );

  // Fallback to all landen if filter is too restrictive
  const pool = candidates.length > 0 ? candidates : allLanden.filter(
    (l) => !exclude || l.land !== exclude.land
  );

  return pool[Math.floor(Math.random() * pool.length)];
}

export function getTotalCountries(): number {
  return allLanden.length;
}
