"use client";

import { useCallback, useEffect, useState } from "react";

// Keyboard layout mirrors the braille cell visually:
//   Y U      1 4
//   H J  =   2 5
//   N M      3 6
const KEY_TO_DOT: Record<string, number> = {
  y: 1,
  h: 2,
  n: 3,
  u: 4,
  j: 5,
  m: 6,
};

export function useBrailleInput(enabled = true) {
  const [dots, setDots] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (!enabled) return;

    function onKeyDown(e: KeyboardEvent) {
      const dot = KEY_TO_DOT[e.key.toLowerCase()];
      if (!dot) return;
      if (e.repeat) return;
      e.preventDefault();
      setDots((prev) => {
        const next = new Set(prev);
        if (next.has(dot)) next.delete(dot);
        else next.add(dot);
        return next;
      });
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [enabled]);

  const clear = useCallback(() => setDots(new Set()), []);

  return { dots, clear };
}

export function dotsMatch(a: Set<number> | number[], b: number[]): boolean {
  const aArr = Array.isArray(a) ? a : Array.from(a);
  if (aArr.length !== b.length) return false;
  const sortedA = [...aArr].sort();
  const sortedB = [...b].sort();
  return sortedA.every((v, i) => v === sortedB[i]);
}
