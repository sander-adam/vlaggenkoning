"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { useHighScores } from "@/hooks/useHighScores";
import ScoreBoard from "@/components/ScoreBoard";

const gameModes = [
  {
    id: "vlaggen" as const,
    href: "/speel/vlaggen",
    icon: "🏳️",
    title: "Vlaggenkoning",
    subtitle: "Herken de vlag",
    description:
      "Je ziet een vlag — typ zo snel mogelijk het juiste land. Hoe verder je komt, hoe moeilijker de vlaggen worden. Eén fout en het is game over!",
    gradient: "from-blue-500 to-indigo-600",
    shadow: "shadow-blue-500/30",
    previewFlags: ["nl.png", "de.png", "jp.png", "br.png"],
    stats: "194 landen",
  },
  {
    id: "inwoners" as const,
    href: "/speel/inwoners",
    icon: "👥",
    title: "Inwonerteller",
    subtitle: "Wie heeft meer?",
    description:
      "Twee landen, twee vlaggen — kies welk land meer inwoners heeft. Makkelijker dan je denkt? Wacht maar tot ronde 10...",
    gradient: "from-emerald-500 to-teal-600",
    shadow: "shadow-emerald-500/30",
    previewFlags: ["cn.png", "in.png", "us.png", "id.png"],
    stats: "194 landen",
  },
  {
    id: "steden" as const,
    href: "/speel/steden",
    icon: "🏙️",
    title: "Stedenslimmerd",
    subtitle: "Klik de juiste stad!",
    description:
      "100 Nederlandse steden op de kaart — klik op de juiste stip. Goede steden worden groen. Hoe ver kom jij?",
    gradient: "from-amber-500 to-orange-600",
    shadow: "shadow-amber-500/30",
    previewFlags: ["nl.png", "nl.png", "nl.png", "nl.png"],
    stats: "100 steden",
  },
  {
    id: "hoofdstad" as const,
    href: "/speel/hoofdstad",
    icon: "🏛️",
    title: "Hoofdstadkenner",
    subtitle: "Ken jij de hoofdstad?",
    description:
      "Je ziet een land en vier steden — welke is de hoofdstad? Hoe verder je komt, hoe lastiger de landen. Eén fout en het is game over!",
    gradient: "from-purple-500 to-indigo-600",
    shadow: "shadow-purple-500/30",
    previewFlags: ["fr.png", "de.png", "br.png", "jp.png"],
    stats: "194 landen",
  },
  {
    id: "ikzie" as const,
    href: "/speel/ikzie",
    icon: "\u{1F50D}",
    title: "Ik zie, ik zie...",
    subtitle: "Raad het mysterieland!",
    description:
      "Hints verschijnen \u00e9\u00e9n voor \u00e9\u00e9n, van moeilijk naar makkelijk. Typ je antwoord wanneer je denkt het te weten. Fout? Game over!",
    gradient: "from-amber-500 to-rose-600",
    shadow: "shadow-amber-500/30",
    previewFlags: ["ke.png", "br.png", "jp.png", "eg.png"],
    stats: "194 landen",
  },
  {
    id: "kaart" as const,
    href: "/speel/kaart",
    icon: "🗺️",
    title: "Kaartkoning",
    subtitle: "Wijs het aan!",
    description:
      "Je krijgt een landnaam — klik op de juiste plek op de wereldkaart. Na elke klik zie je waar het land echt ligt. Hoe goed ken jij de kaart?",
    gradient: "from-teal-500 to-cyan-600",
    shadow: "shadow-teal-500/30",
    previewFlags: ["fr.png", "au.png", "eg.png", "mx.png"],
    stats: "170+ landen",
  },
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function Home() {
  const vlaggenScores = useHighScores("vlaggen");
  const inwonersScores = useHighScores("inwoners");
  const stedenScores = useHighScores("steden");
  const hoofdstadScores = useHighScores("hoofdstad");
  const kaartScores = useHighScores("kaart");
  const ikzieScores = useHighScores("ikzie");

  const scoresByMode = {
    vlaggen: vlaggenScores.scores,
    inwoners: inwonersScores.scores,
    steden: stedenScores.scores,
    hoofdstad: hoofdstadScores.scores,
    kaart: kaartScores.scores,
    ikzie: ikzieScores.scores,
  };

  return (
    <div className="min-h-dvh bg-gradient-to-b from-slate-900 via-blue-950 to-slate-900 flex flex-col items-center">
      <main className="w-full max-w-[393px] flex flex-col items-center px-5 py-10">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <div className="text-7xl mb-3">👑</div>
          <h1 className="text-5xl font-bold text-white drop-shadow-lg leading-tight">
            Vlaggen&shy;koning
          </h1>
          <p className="mt-3 text-lg text-blue-300/90 max-w-[280px] mx-auto">
            Test je kennis van alle landen ter wereld!
          </p>
        </motion.div>

        {/* Game mode cards */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="w-full flex flex-col gap-5"
        >
          {gameModes.map((mode) => (
            <motion.div key={mode.id} variants={fadeUp}>
              <Link
                href={mode.href}
                className={`group block rounded-3xl bg-gradient-to-br ${mode.gradient}
                  p-[2px] shadow-xl ${mode.shadow} transition-transform active:scale-[0.97]`}
              >
                <div className="rounded-3xl bg-white/10 backdrop-blur-sm p-5">
                  {/* Header row */}
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-2xl">{mode.icon}</span>
                        <h2 className="text-2xl font-bold text-white">
                          {mode.title}
                        </h2>
                      </div>
                      <p className="text-sm font-semibold text-white/70 uppercase tracking-wide">
                        {mode.subtitle}
                      </p>
                    </div>
                    <div className="rounded-full bg-white/20 px-3 py-1 text-xs font-bold text-white/80">
                      {mode.stats}
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-white/80 leading-relaxed mb-4">
                    {mode.description}
                  </p>

                  {/* Preview flags row */}
                  <div className="flex items-center justify-between">
                    <div className="flex -space-x-2">
                      {mode.previewFlags.map((flag) => (
                        <div
                          key={flag}
                          className="w-10 h-7 rounded-md overflow-hidden border-2 border-white/20 shadow-md"
                        >
                          <Image
                            src={`/vlaggen/${flag}`}
                            alt=""
                            width={40}
                            height={28}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                    <div
                      className="flex items-center gap-1 rounded-full bg-white/20
                        px-4 py-2 text-sm font-bold text-white
                        group-hover:bg-white/30 transition-colors"
                    >
                      Spelen
                      <span className="group-hover:translate-x-0.5 transition-transform">
                        →
                      </span>
                    </div>
                  </div>
                </div>
              </Link>

              {/* Inline high score for this mode */}
              {scoresByMode[mode.id].length > 0 && (
                <div className="mt-2 flex items-center justify-center gap-2 text-sm text-white/50">
                  <span>🏆</span>
                  <span>
                    Beste score: <strong className="text-white/80">{scoresByMode[mode.id][0].streak}</strong>
                    {scoresByMode[mode.id][0].name && (
                      <span className="text-white/40"> — {scoresByMode[mode.id][0].name}</span>
                    )}
                  </span>
                </div>
              )}
            </motion.div>
          ))}
        </motion.div>

        {/* Full scoreboards (collapsed behind "meer") */}
        {(scoresByMode.vlaggen.length > 0 || scoresByMode.inwoners.length > 0 || scoresByMode.steden.length > 0 || scoresByMode.kaart.length > 0) && (
          <div className="w-full mt-8 flex flex-col gap-4">
            <h3 className="text-center text-lg font-bold text-white/40 uppercase tracking-wider text-sm">
              Alle scores
            </h3>
            {gameModes.map(
              (mode) =>
                scoresByMode[mode.id].length > 0 && (
                  <div key={mode.id}>
                    <ScoreBoard scores={scoresByMode[mode.id]} title={mode.title} />
                  </div>
                )
            )}
          </div>
        )}
      </main>
    </div>
  );
}
