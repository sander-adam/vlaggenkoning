export interface Level {
  name: string;
  emoji: string;
  minStreak: number;
  color: string;        // tailwind bg gradient
  textColor: string;    // tailwind text color
  barColor: string;     // tailwind bg for progress bar
}

const levels: Level[] = [
  { name: "Beginner",   emoji: "🌱", minStreak: 0,  color: "from-green-400 to-green-500",   textColor: "text-green-100",  barColor: "bg-green-300" },
  { name: "Ontdekker",  emoji: "🧭", minStreak: 3,  color: "from-blue-400 to-blue-500",     textColor: "text-blue-100",   barColor: "bg-blue-300" },
  { name: "Kenner",     emoji: "🧠", minStreak: 6,  color: "from-purple-400 to-purple-500", textColor: "text-purple-100", barColor: "bg-purple-300" },
  { name: "Expert",     emoji: "🔥", minStreak: 10, color: "from-orange-400 to-orange-500", textColor: "text-orange-100", barColor: "bg-orange-300" },
  { name: "Meester",    emoji: "💎", minStreak: 15, color: "from-red-400 to-red-500",       textColor: "text-red-100",    barColor: "bg-red-300" },
  { name: "Koning",     emoji: "👑", minStreak: 25, color: "from-yellow-400 to-amber-500",  textColor: "text-yellow-100", barColor: "bg-yellow-300" },
];

export function getLevel(streak: number): Level {
  let current = levels[0];
  for (const level of levels) {
    if (streak >= level.minStreak) current = level;
  }
  return current;
}

export function getNextLevel(streak: number): Level | null {
  for (const level of levels) {
    if (level.minStreak > streak) return level;
  }
  return null;
}

export function getLevelProgress(streak: number): number {
  const current = getLevel(streak);
  const next = getNextLevel(streak);
  if (!next) return 1; // max level
  const range = next.minStreak - current.minStreak;
  const progress = streak - current.minStreak;
  return progress / range;
}

export function isLevelUp(streak: number): boolean {
  return levels.some((l) => l.minStreak === streak && streak > 0);
}
