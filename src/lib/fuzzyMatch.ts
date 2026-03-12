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

/** Accepted alternative names → official name in landen.json */
const ALIASES: Record<string, string> = {
  // Verenigde Staten
  "usa": "verenigde staten",
  "vs": "verenigde staten",
  "amerika": "verenigde staten",
  "america": "verenigde staten",
  "united states": "verenigde staten",

  // Verenigd Koninkrijk
  "engeland": "verenigd koninkrijk",
  "uk": "verenigd koninkrijk",
  "groot brittannie": "verenigd koninkrijk",
  "groot-brittannie": "verenigd koninkrijk",
  "england": "verenigd koninkrijk",
  "great britain": "verenigd koninkrijk",

  // Verenigde Arabische Emiraten
  "vae": "verenigde arabische emiraten",
  "uae": "verenigde arabische emiraten",
  "dubai": "verenigde arabische emiraten",
  "emiraten": "verenigde arabische emiraten",

  // Noord/Zuid-Korea
  "korea": "zuid-korea",
  "zuid korea": "zuid-korea",
  "noord korea": "noord-korea",

  // Congo
  "congo": "congo-kinshasa",
  "dr congo": "congo-kinshasa",
  "democratische republiek congo": "congo-kinshasa",

  // Tsjechië
  "tsjechie": "tsjechie",
  "tsjechische republiek": "tsjechie",

  // Centraal-Afrikaanse Republiek
  "car": "centraal-afrikaanse republiek",
  "centraal afrika": "centraal-afrikaanse republiek",

  // Bosnië
  "bosnie": "bosnie en herzegovina",
  "bosnie herzegovina": "bosnie en herzegovina",

  // Noord-Macedonië
  "macedonie": "noord-macedonie",
  "noord macedonie": "noord-macedonie",

  // Eswatini
  "swaziland": "eswatini",

  // Myanmar
  "birma": "myanmar",
  "burma": "myanmar",

  // Ivoorkust
  "ivoorkust": "ivoorkust",
  "cote divoire": "ivoorkust",
  "ivory coast": "ivoorkust",

  // Cabo Verde
  "kaapverdie": "cabo verde",
  "kaap verde": "cabo verde",
  "cape verde": "cabo verde",

  // Oost-Timor
  "timor leste": "oost-timor",
  "oost timor": "oost-timor",
  "east timor": "oost-timor",

  // Saoedi-Arabië
  "saudi arabie": "saoedi-arabie",
  "saudi-arabie": "saoedi-arabie",
  "saoedi arabie": "saoedi-arabie",

  // Sri Lanka
  "sri lanka": "sri lanka",
  "ceylon": "sri lanka",

  // Marshalleilanden
  "marshall eilanden": "marshalleilanden",

  // Salomonseilanden
  "salomons eilanden": "salomonseilanden",
  "solomon eilanden": "salomonseilanden",

  // Papoea-Nieuw-Guinea
  "papoea nieuw guinea": "papoea-nieuw-guinea",
  "papua nieuw guinea": "papoea-nieuw-guinea",

  // Nieuw-Zeeland
  "nieuw zeeland": "nieuw-zeeland",
  "new zealand": "nieuw-zeeland",

  // Antigua en Barbuda
  "antigua": "antigua en barbuda",

  // Trinidad en Tobago
  "trinidad": "trinidad en tobago",

  // Saint Kitts en Nevis
  "saint kitts": "saint kitts en nevis",
  "st kitts": "saint kitts en nevis",

  // Saint Vincent en de Grenadines
  "saint vincent": "saint vincent en de grenadines",
  "st vincent": "saint vincent en de grenadines",

  // Saint Lucia
  "st lucia": "saint lucia",

  // Sao Tomé en Principe
  "sao tome": "sao tome en principe",

  // Dominicaanse Republiek
  "dominicaanse rep": "dominicaanse republiek",

  // Filipijnen
  "philippines": "filipijnen",

  // Zuid-Soedan
  "zuid soedan": "zuid-soedan",

  // Zuid-Afrika
  "zuid afrika": "zuid-afrika",

  // Belarus
  "wit rusland": "belarus",
  "wit-rusland": "belarus",
  "witrusland": "belarus",

  // Bahama's
  "bahamas": "bahamas",

  // Moldavië
  "moldavie": "moldavie",
  "moldova": "moldavie",

  // Micronesië
  "micronesie": "micronesie",

  // Vaticaanstad
  "vaticaan": "vaticaanstad",
  "het vaticaan": "vaticaanstad",

  // Brunei
  "brunei darussalam": "brunei",
};

export function checkAnswer(userInput: string, correctAnswer: string): boolean {
  const normalizedInput = normalize(userInput);
  const normalizedCorrect = normalize(correctAnswer);

  if (!normalizedInput) return false;

  // Exact match after normalization
  if (normalizedInput === normalizedCorrect) return true;

  // Check aliases: if the input is a known alias for this country, accept it
  const aliasTarget = ALIASES[normalizedInput];
  if (aliasTarget && aliasTarget === normalizedCorrect) return true;

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
