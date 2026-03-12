interface Milestone {
  streak: number;
  title: string;
  message: string;
  emoji: string;
}

const milestonesByMode: Record<string, Milestone[]> = {
  vlaggen: [
    { streak: 3, title: "Ontdekker!", message: "De vlaggen worden moeilijker!", emoji: "🧭" },
    { streak: 6, title: "Kenner!", message: "Jij kent er al aardig wat — nu wordt het pas echt lastig!", emoji: "🧠" },
    { streak: 10, title: "Expert!", message: "10 op een rij! De moeilijkste vlaggen komen eraan...", emoji: "🔥" },
    { streak: 15, title: "Meester!", message: "15 op een rij — ongelooflijk!", emoji: "💎" },
    { streak: 25, title: "Koning!", message: "Alle landen, maximale moeilijkheid. Jij bent een ware Vlaggenkoning!", emoji: "👑" },
    { streak: 50, title: "Vlaggenlegende!", message: "50 op een rij — waanzinnig!", emoji: "🏆" },
    { streak: 100, title: "Vlaggen-superheld!", message: "100 op een rij — dit is historisch!", emoji: "🦸" },
    { streak: 194, title: "VLAGGENKONING!", message: "Alle 194 landen! Je bent de ultieme Vlaggenkoning!", emoji: "🎉" },
  ],
  kaart: [
    { streak: 3, title: "Ontdekker!", message: "De landen worden moeilijker te vinden!", emoji: "🧭" },
    { streak: 6, title: "Navigator!", message: "Jij kent de kaart al aardig — nu wordt het pas echt lastig!", emoji: "🗺️" },
    { streak: 10, title: "Cartograaf!", message: "10 op een rij! De lastigste landen komen eraan...", emoji: "🔥" },
    { streak: 15, title: "Wereldreiziger!", message: "15 op een rij — indrukwekkend!", emoji: "💎" },
    { streak: 25, title: "Kaartkoning!", message: "Alle landen, maximale moeilijkheid. Jij bent de Kaartkoning!", emoji: "👑" },
    { streak: 50, title: "Kaartlegende!", message: "50 op een rij — fenomenaal!", emoji: "🏆" },
    { streak: 100, title: "Kaart-superheld!", message: "100 op een rij — dit is historisch!", emoji: "🦸" },
    { streak: 194, title: "KAARTKONING!", message: "Alle 194 landen! Je kent de hele wereld!", emoji: "🎉" },
  ],
  inwoners: [
    { streak: 3, title: "Ontdekker!", message: "De verschillen worden kleiner!", emoji: "🧭" },
    { streak: 6, title: "Kenner!", message: "Jij weet al aardig wat — nu wordt het pas echt lastig!", emoji: "🧠" },
    { streak: 10, title: "Expert!", message: "10 op een rij! Moeilijke landparen komen eraan...", emoji: "🔥" },
    { streak: 15, title: "Meester!", message: "15 op een rij — ongelooflijk!", emoji: "💎" },
    { streak: 25, title: "Inwonerkoning!", message: "Je kent de bevolkingscijfers als geen ander!", emoji: "👑" },
    { streak: 50, title: "Inwonerslegende!", message: "50 op een rij — waanzinnig!", emoji: "🏆" },
  ],
  hoofdstad: [
    { streak: 3, title: "Ontdekker!", message: "De hoofdsteden worden moeilijker!", emoji: "🧭" },
    { streak: 6, title: "Kenner!", message: "Jij kent er al aardig wat — nu wordt het pas echt lastig!", emoji: "🧠" },
    { streak: 10, title: "Expert!", message: "10 op een rij! De lastigste landen komen eraan...", emoji: "🔥" },
    { streak: 15, title: "Meester!", message: "15 op een rij — ongelooflijk!", emoji: "💎" },
    { streak: 25, title: "Hoofdstadkoning!", message: "Jij kent de hoofdsteden als geen ander!", emoji: "👑" },
    { streak: 50, title: "Hoofdstadlegende!", message: "50 op een rij — waanzinnig!", emoji: "🏆" },
    { streak: 100, title: "Hoofdstad-superheld!", message: "100 op een rij — dit is historisch!", emoji: "🦸" },
    { streak: 194, title: "HOOFDSTADKENNER!", message: "Alle 194 landen! Je kent elke hoofdstad!", emoji: "🎉" },
  ],
  ikzie: [
    { streak: 3, title: "Speurder!", message: "Je hebt al 3 landen geraden!", emoji: "🔎" },
    { streak: 6, title: "Detective!", message: "6 op een rij — je hints-instinct is sterk!", emoji: "🕵️" },
    { streak: 10, title: "Raadmeester!", message: "10 op een rij! Je hebt minder hints nodig...", emoji: "🔥" },
    { streak: 15, title: "Ziener!", message: "15 op een rij — ongelooflijk scherp!", emoji: "💎" },
    { streak: 25, title: "Orakel!", message: "25 op een rij — jij ziet alles!", emoji: "👑" },
    { streak: 50, title: "Alwetende!", message: "50 op een rij — legendarisch!", emoji: "🏆" },
  ],
  steden: [
    { streak: 5, title: "Toerist!", message: "5 steden goed — je kent de weg!", emoji: "🧭" },
    { streak: 10, title: "Reiziger!", message: "10 steden! Je kent Nederland aardig!", emoji: "🚂" },
    { streak: 20, title: "Navigator!", message: "20 steden — indrukwekkend!", emoji: "🗺️" },
    { streak: 35, title: "Topograaf!", message: "35 steden — jij bent een echte kenner!", emoji: "🔥" },
    { streak: 50, title: "Stedenmeester!", message: "50 steden — de helft! Ongelooflijk!", emoji: "💎" },
    { streak: 75, title: "Stedenlegende!", message: "75 steden — je kent bijna heel Nederland!", emoji: "🏆" },
    { streak: 100, title: "STEDENSLIMMERD!", message: "Alle 100 steden! Je bent de ultieme Stedenslimmerd!", emoji: "👑" },
  ],
};

// Default fallback (same as vlaggen)
const defaultMilestones = milestonesByMode.vlaggen;

export function getMilestone(streak: number, mode: string = "vlaggen"): Milestone | null {
  const milestones = milestonesByMode[mode] || defaultMilestones;
  return milestones.find((m) => m.streak === streak) ?? null;
}
