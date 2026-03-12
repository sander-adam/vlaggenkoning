"use client";

import { useEffect } from "react";
import confetti from "canvas-confetti";

interface ConfettiEffectProps {
  trigger: boolean;
}

export default function ConfettiEffect({ trigger }: ConfettiEffectProps) {
  useEffect(() => {
    if (trigger) {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.7 },
        colors: ["#f97316", "#eab308", "#3b82f6", "#22c55e", "#ef4444"],
      });
    }
  }, [trigger]);

  return null;
}
