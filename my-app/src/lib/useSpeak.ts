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
        audio.onended = () => {
          activeTextRef.current = null;
          setState("idle");
        };
        audio.onerror = () => {
          activeTextRef.current = null;
          setState("error");
        };

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
      } catch (err) {
        const e = err as Error;
        if (e?.name === "AbortError") return;
        // Browser autoplay policy: play() is rejected until the user
        // interacts with the page. Stay silent — first user gesture will
        // unlock subsequent calls.
        if (e?.name === "NotAllowedError") {
          setState("idle");
          activeTextRef.current = null;
          return;
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
