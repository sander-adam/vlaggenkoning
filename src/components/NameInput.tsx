"use client";

import { useState, useEffect, useRef } from "react";
import { getPlayerName, setPlayerName } from "@/lib/storage";

interface NameInputProps {
  onSubmit: (name: string) => void;
}

export default function NameInput({ onSubmit }: NameInputProps) {
  const [name, setName] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const saved = getPlayerName();
    if (saved) setName(saved);
    inputRef.current?.focus();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    setPlayerName(trimmed);
    onSubmit(trimmed);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col items-center gap-2 w-full max-w-xs">
      <label className="text-sm font-bold text-white/80">Jouw naam:</label>
      <div className="flex gap-2 w-full">
        <input
          ref={inputRef}
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={20}
          placeholder="Naam..."
          className="flex-1 rounded-xl px-4 py-2 text-center font-bold text-gray-800
            bg-white/90 outline-none focus:ring-2 focus:ring-yellow-400"
        />
        <button
          type="submit"
          className="rounded-xl bg-yellow-400 px-4 py-2 font-bold text-gray-800
            active:scale-95 transition-transform"
        >
          OK
        </button>
      </div>
    </form>
  );
}
