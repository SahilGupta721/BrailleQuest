"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type SpeakState = "idle" | "loading" | "playing" | "error";

export function useSpeak() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const urlRef = useRef<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const requestIdRef = useRef(0);
  const [state, setState] = useState<SpeakState>("idle");

  const stop = useCallback(() => {
    requestIdRef.current += 1;
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
      audioRef.current = null;
    }
    if (urlRef.current) {
      URL.revokeObjectURL(urlRef.current);
      urlRef.current = null;
    }
    setState("idle");
  }, []);

  const speak = useCallback(
    async (text: string) => {
      stop();
      const myId = ++requestIdRef.current;
      const controller = new AbortController();
      abortRef.current = controller;
      setState("loading");
      try {
        const res = await fetch("/api/speak", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text }),
          signal: controller.signal,
        });
        if (myId !== requestIdRef.current) return;
        if (!res.ok) {
          const errBody = await res.text();
          console.error("Speak failed:", res.status, errBody);
          throw new Error(`Speak failed: ${res.status} ${errBody}`);
        }
        const blob = await res.blob();
        if (myId !== requestIdRef.current) return;
        const url = URL.createObjectURL(blob);
        urlRef.current = url;
        const audio = new Audio(url);
        audioRef.current = audio;
        audio.onended = () => setState("idle");
        audio.onerror = () => setState("error");
        setState("playing");
        await audio.play();
      } catch (err) {
        if ((err as Error)?.name === "AbortError") return;
        console.error(err);
        setState("error");
      }
    },
    [stop],
  );

  useEffect(() => stop, [stop]);

  return { speak, stop, state };
}
