import type { Land } from "./types";

export interface Hint {
  label: string;
  text: string;
}

function getPopulationRange(inwoners: number): string {
  if (inwoners < 1_000_000) return "minder dan 1 miljoen";
  if (inwoners < 5_000_000) return "tussen 1 en 5 miljoen";
  if (inwoners < 10_000_000) return "tussen 5 en 10 miljoen";
  if (inwoners < 50_000_000) return "tussen 10 en 50 miljoen";
  if (inwoners < 100_000_000) return "tussen 50 en 100 miljoen";
  if (inwoners < 500_000_000) return "tussen 100 en 500 miljoen";
  return "meer dan 500 miljoen";
}

function getProminenteStad(land: Land): string | null {
  const nonCapital = land.prominente_steden.filter(
    (s) => s.toLowerCase() !== land.hoofdstad.toLowerCase()
  );
  if (nonCapital.length === 0) return null;
  return nonCapital[Math.floor(Math.random() * nonCapital.length)];
}

export function generateHints(land: Land): Hint[] {
  const hints: Hint[] = [
    {
      label: "Continent",
      text: `Dit land ligt in ${land.continent}`,
    },
    {
      label: "Inwoners",
      text: `Dit land heeft ${getPopulationRange(land.inwoners)} inwoners`,
    },
    {
      label: "Letters",
      text: `De naam heeft ${land.land.length} letters`,
    },
    {
      label: "Eerste letter",
      text: `De naam begint met een ${land.land[0].toUpperCase()}`,
    },
    {
      label: "Stad",
      text: (() => {
        const stad = getProminenteStad(land);
        return stad
          ? `In dit land ligt de stad ${stad}`
          : `De hoofdstad is ook de grootste stad`;
      })(),
    },
    {
      label: "Hoofdstad",
      text: `De hoofdstad is ${land.hoofdstad}`,
    },
  ];

  return hints;
}
