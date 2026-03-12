import { compareTwoStrings } from "string-similarity";

function normalize(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // strip diacritics
    .replace(/[''`]/g, "") // remove apostrophes
    .replace(/[-]/g, " ") // hyphens to spaces
    .replace(/\s+/g, " "); // collapse whitespace
}

function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j - 1], dp[i - 1][j], dp[i][j - 1]);
    }
  }
  return dp[m][n];
}

const SHORT_NAME_THRESHOLD = 4;
const SIMILARITY_THRESHOLD = 0.7;

// Countries that are easily confused and must be exact
const CONFUSABLE_PAIRS: Record<string, string[]> = {
  niger: ["nigeria"],
  nigeria: ["niger"],
  iran: ["irak"],
  irak: ["iran"],
  guinea: ["guinee-bissau", "equatoriaal-guinea"],
};

export function checkAnswer(userInput: string, correctAnswer: string): boolean {
  const normalizedInput = normalize(userInput);
  const normalizedCorrect = normalize(correctAnswer);

  if (!normalizedInput) return false;

  // Exact match after normalization
  if (normalizedInput === normalizedCorrect) return true;

  // For very short names (4 chars or less: Laos, Cuba, Irak, Iran, Mali, Oman, Peru, Togo), require exact
  if (normalizedCorrect.length <= SHORT_NAME_THRESHOLD) return false;

  // Check confusable pairs - if the input is closer to a confusable, reject
  const confusables = CONFUSABLE_PAIRS[normalizedCorrect];
  if (confusables) {
    for (const confusable of confusables) {
      const normalizedConfusable = normalize(confusable);
      if (
        compareTwoStrings(normalizedInput, normalizedConfusable) >
        compareTwoStrings(normalizedInput, normalizedCorrect)
      ) {
        return false;
      }
    }
  }

  // Levenshtein distance: allow 1 typo for short-medium names, 2 for longer ones
  const dist = levenshtein(normalizedInput, normalizedCorrect);
  const maxDist = normalizedCorrect.length <= 8 ? 1 : 2;
  if (dist <= maxDist) return true;

  // Dice coefficient as fallback for bigger differences (reorderings, etc.)
  const similarity = compareTwoStrings(normalizedInput, normalizedCorrect);
  return similarity >= SIMILARITY_THRESHOLD;
}
