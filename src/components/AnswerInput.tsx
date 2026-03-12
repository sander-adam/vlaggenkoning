"use client";

import { useState, useRef, useEffect } from "react";

interface AnswerInputProps {
  onSubmit: (answer: string) => void;
  disabled?: boolean;
}

export default function AnswerInput({ onSubmit, disabled }: AnswerInputProps) {
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!disabled) {
      inputRef.current?.focus();
    }
  }, [disabled]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim() && !disabled) {
      onSubmit(value.trim());
      setValue("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 w-full">
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Welk land is dit?"
        disabled={disabled}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
        className="flex-1 rounded-xl border-2 border-blue-200 bg-white px-4 py-3 text-lg
          font-medium text-gray-800 placeholder-gray-400
          focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200
          disabled:opacity-50"
      />
      <button
        type="submit"
        disabled={disabled || !value.trim()}
        className="rounded-xl bg-blue-500 px-6 py-3 text-lg font-bold text-white
          shadow-md active:scale-95 transition-transform
          disabled:opacity-50 disabled:active:scale-100"
      >
        Check!
      </button>
    </form>
  );
}
