interface Milestone {
  streak: number;
  title: string;
  message: string;
  emoji: string;
}

const milestones: Milestone[] = [
  { streak: 3, title: "Ontdekker!", message: "De vlaggen worden moeilijker!", emoji: "🧭" },
  { streak: 6, title: "Kenner!", message: "Jij kent er al aardig wat — nu wordt het pas echt lastig!", emoji: "🧠" },
  { streak: 10, title: "Expert!", message: "10 op een rij! De moeilijkste vlaggen komen eraan...", emoji: "🔥" },
  { streak: 15, title: "Meester!", message: "15 op een rij — ongelooflijk!", emoji: "💎" },
  { streak: 25, title: "Koning!", message: "Alle landen, maximale moeilijkheid. Jij bent een ware Vlaggenkoning!", emoji: "👑" },
  { streak: 50, title: "Vlaggenlegende!", message: "50 op een rij — waanzinnig!", emoji: "🏆" },
  { streak: 100, title: "Vlaggen-superheld!", message: "100 op een rij — dit is historisch!", emoji: "🦸" },
  { streak: 194, title: "VLAGGENKONING!", message: "Alle 194 landen! Je bent de ultieme Vlaggenkoning!", emoji: "🎉" },
];

export function getMilestone(streak: number): Milestone | null {
  return milestones.find((m) => m.streak === streak) ?? null;
}
