"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type SpeakState = "idle" | "loading" | "playing" | "error";

export function useSpeak() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const urlRef = useRef<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const requestIdRef = useRef(0);
  const activeTextRef = useRef<string | null>(null);
  const [state, setState] = useState<SpeakState>("idle");

  const stop = useCallback(() => {
    requestIdRef.current += 1;
    activeTextRef.current = null;
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
      if (activeTextRef.current === text) return;
      stop();
      activeTextRef.current = text;
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
        const audio = new Audio();
        audio.preload = "auto";
        audio.src = url;
        audioRef.current = audio;

        await new Promise<void>((resolve) => {
          if (audio.readyState >= 4) {
            resolve();
            return;
          }
          const onReady = () => {
            audio.removeEventListener("canplaythrough", onReady);
            resolve();
          };
          audio.addEventListener("canplaythrough", onReady);
          audio.load();
        });
        if (myId !== requestIdRef.current) return;

        setState("playing");
        await audio.play();
        // Resolve `speak()` only when playback actually completes (or is
        // cancelled / errors), so callers can `await speak(...)` to chain
        // navigation after the narration has finished.
        await new Promise<void>((resolve) => {
          audio.onended = () => resolve();
          audio.onerror = () => resolve();
          audio.onpause = () => resolve(); // stop() pauses the audio
        });
        if (myId === requestIdRef.current) {
          activeTextRef.current = null;
          setState("idle");
        }
      } catch (err) {
        const e = err as Error;
        if (e?.name === "AbortError") return;
        // Browser autoplay policy: play() is rejected until the user
        // interacts with the page. Reset state and re-throw so callers
        // can retry on the first user gesture.
        if (e?.name === "NotAllowedError") {
          setState("idle");
          activeTextRef.current = null;
          throw e;
        }
        console.error(err);
        setState("error");
      }
    },
    [stop],
  );

  useEffect(() => stop, [stop]);

  return { speak, stop, state };
}
