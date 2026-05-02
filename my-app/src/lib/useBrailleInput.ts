"use client";

import { useCallback, useEffect, useRef, useState } from "react";

// How long after a key release to actually clear the dot. Filters Makey Makey
// contact chatter where a held key briefly drops then re-fires.
const RELEASE_DEBOUNCE_MS = 2000;

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
  const releaseTimersRef = useRef<Record<number, number>>({});

  useEffect(() => {
    if (!enabled) return;

    function cancelRelease(dot: number) {
      const t = releaseTimersRef.current[dot];
      if (t !== undefined) {
        window.clearTimeout(t);
        delete releaseTimersRef.current[dot];
      }
    }

    function onKeyDown(e: KeyboardEvent) {
      const dot = KEY_TO_DOT[e.key.toLowerCase()];
      if (!dot) return;
      e.preventDefault();
      if (e.repeat) return;
      cancelRelease(dot);
      setDots((prev) => {
        if (prev.has(dot)) return prev;
        const next = new Set(prev);
        next.add(dot);
        return next;
      });
    }

    function onKeyUp(e: KeyboardEvent) {
      const dot = KEY_TO_DOT[e.key.toLowerCase()];
      if (!dot) return;
      e.preventDefault();
      cancelRelease(dot);
      releaseTimersRef.current[dot] = window.setTimeout(() => {
        delete releaseTimersRef.current[dot];
        setDots((prev) => {
          if (!prev.has(dot)) return prev;
          const next = new Set(prev);
          next.delete(dot);
          return next;
        });
      }, RELEASE_DEBOUNCE_MS);
    }

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      for (const t of Object.values(releaseTimersRef.current)) {
        window.clearTimeout(t);
      }
      releaseTimersRef.current = {};
    };
  }, [enabled]);

  const clear = useCallback(() => {
    setDots(new Set());
    for (const t of Object.values(releaseTimersRef.current)) {
      window.clearTimeout(t);
    }
    releaseTimersRef.current = {};
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
