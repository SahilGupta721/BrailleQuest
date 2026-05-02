"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const DEBOUNCE_MS = 2000;

// Makey Makey back-board defaults map to W A S D F G.
// Braille cell numbering:
//   1 4
//   2 5
//   3 6
const KEY_TO_DOT: Record<string, number> = {
  w: 1,
  a: 2,
  s: 3,
  d: 4,
  f: 5,
  g: 6,
};

export function useBrailleInput(enabled = true) {
  const [dots, setDots] = useState<Set<number>>(new Set());
  const lastFiredRef = useRef<Record<number, number>>({});

  useEffect(() => {
    if (!enabled) return;
    lastFiredRef.current = {};

    function onKeyDown(e: KeyboardEvent) {
      const dot = KEY_TO_DOT[e.key.toLowerCase()];
      if (!dot) return;
      if (e.repeat) return;
      const now = performance.now();
      const last = lastFiredRef.current[dot] ?? 0;
      if (now - last < DEBOUNCE_MS) {
        e.preventDefault();
        return;
      }
      lastFiredRef.current[dot] = now;
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

  const clear = useCallback(() => {
    setDots(new Set());
    lastFiredRef.current = {};
  }, []);

  return { dots, clear };
}

export function dotsMatch(a: Set<number> | number[], b: number[]): boolean {
  const aArr = Array.isArray(a) ? a : Array.from(a);
  if (aArr.length !== b.length) return false;
  const sortedA = [...aArr].sort();
  const sortedB = [...b].sort();
  return sortedA.every((v, i) => v === sortedB[i]);
}
