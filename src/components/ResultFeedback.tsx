"use client";

import { motion } from "framer-motion";

interface ResultFeedbackProps {
  correct: boolean;
  correctAnswer: string;
  onNext?: () => void;
}

export default function ResultFeedback({ correct, correctAnswer, onNext }: ResultFeedbackProps) {
  if (correct) {
    return (
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full rounded-2xl bg-green-100 border-2 border-green-400 p-4 text-center"
      >
        <div className="text-2xl font-bold text-green-700 mb-1">
          ✓ Goed!
        </div>
        <p className="text-green-600 font-medium">{correctAnswer}</p>
        <button
          onClick={onNext}
          autoFocus
          className="mt-3 rounded-xl bg-green-500 px-8 py-2.5 text-lg font-bold text-white
            shadow-md active:scale-95 transition-transform"
        >
          Volgende →
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ x: -20 }}
      animate={{ x: 0 }}
      transition={{ type: "spring", stiffness: 500, damping: 15 }}
      className="w-full rounded-2xl bg-red-100 border-2 border-red-400 p-4 text-center shake"
    >
      <div className="text-2xl font-bold text-red-700 mb-1">
        ✗ Helaas!
      </div>
      <p className="text-red-600">
        Het juiste antwoord was: <strong>{correctAnswer}</strong>
      </p>
    </motion.div>
  );
}
