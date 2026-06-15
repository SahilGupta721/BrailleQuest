"use client";

import { Fragment, useEffect, useRef, useState } from "react";
import { useSpeak } from "@/lib/useSpeak";
import { useBrailleInput, dotsMatch } from "@/lib/useBrailleInput";

type Screen =
  | "intro"
  | "world"
  | "letterA"
  | "letterS"
  | "letterH"
  | "blending"
  | "battle"
  | "victory";

// Standard Braille cell:
//   1 4
//   2 5
//   3 6
const BRAILLE: Record<string, number[]> = {
  A: [1],
  B: [1, 2],
  C: [1, 4],
  D: [1, 4, 5],
  E: [1, 5],
  F: [1, 2, 4],
  G: [1, 2, 4, 5],
  H: [1, 2, 5],
  I: [2, 4],
  J: [2, 4, 5],
  K: [1, 3],
  L: [1, 2, 3],
  M: [1, 3, 4],
  N: [1, 3, 4, 5],
  O: [1, 3, 5],
  P: [1, 2, 3, 4],
  Q: [1, 2, 3, 4, 5],
  R: [1, 2, 3, 5],
  S: [2, 3, 4],
  T: [2, 3, 4, 5],
  U: [1, 3, 6],
  V: [1, 2, 3, 6],
  W: [2, 4, 5, 6],
  X: [1, 3, 4, 6],
  Y: [1, 3, 4, 5, 6],
  Z: [1, 3, 5, 6],
};

const TOTAL_WORLDS = 7;
const CURRENT_WORLD_INDEX = 0; // 0-based — only world 1 unlocked

const WORLDS: {
  name: string;
  subtitle: string;
  tone: "forest" | "ember";
  emoji: string;
}[] = [
    {
      name: "Scorched Plains",
      subtitle: "Spell ASH",
      tone: "ember",
      emoji: "🔥",
    },
    { name: "Frozen Tundra", subtitle: "Spell ICE", tone: "forest", emoji: "❄" },
    {
      name: "Whispering Woods",
      subtitle: "Spell OAK",
      tone: "forest",
      emoji: "🌲",
    },
    { name: "Sunken Reef", subtitle: "Spell SEA", tone: "forest", emoji: "🌊" },
    { name: "Ember Caves", subtitle: "Spell ORE", tone: "ember", emoji: "🪨" },
    { name: "Sky Citadel", subtitle: "Spell SKY", tone: "forest", emoji: "☁" },
    { name: "Star's End", subtitle: "Final boss", tone: "forest", emoji: "✦" },
  ];

export default function Home() {
  const [screen, setScreen] = useState<Screen>("intro");
  const [spelled, setSpelled] = useState<string[]>([]);
  const { speak, stop } = useSpeak();

  useEffect(() => {
    return stop;
  }, [screen, stop]);

  return (
    <div className="relative flex h-[100dvh] flex-col overflow-hidden bg-white text-black">
      <main className="mx-auto flex w-full max-w-xl flex-1 min-h-0 flex-col justify-center overflow-hidden px-5 py-2">
        {screen === "intro" && (
          <IntroScreen speak={speak} onStart={() => setScreen("world")} />
        )}
        {screen === "world" && (
          <WorldScreen speak={speak} onEnter={() => setScreen("letterA")} />
        )}
        {screen === "letterA" && (
          <LetterScreen
            speak={speak}
            letter="A"
            onConfirm={() => setScreen("letterS")}
          />
        )}
        {screen === "letterS" && (
          <LetterScreen
            speak={speak}
            letter="S"
            onConfirm={() => setScreen("letterH")}
          />
        )}
        {screen === "letterH" && (
          <LetterScreen
            speak={speak}
            letter="H"
            onConfirm={() => setScreen("blending")}
          />
        )}
        {screen === "blending" && (
          <BlendingScreen
            speak={speak}
            onContinue={() => setScreen("battle")}
          />
        )}
        {screen === "battle" && (
          <BattleScreen
            speak={speak}
            spelled={spelled}
            setSpelled={setSpelled}
            onWin={() => setScreen("victory")}
          />
        )}
        {screen === "victory" && (
          <VictoryScreen
            speak={speak}
            onNext={() => {
              setSpelled([]);
              setScreen("world");
            }}
          />
        )}
      </main>
    </div>
  );
}

// ============================================================================
// PRIMITIVES
// ============================================================================

function PrimaryButton({
  children,
  onClick,
  disabled,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="btn-primary w-full px-5 py-3 text-sm"
    >
      {children}
    </button>
  );
}

function GhostButton({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="btn-ghost w-full px-5 py-2.5 text-sm"
    >
      {children}
    </button>
  );
}

function BrailleCell({
  dots,
  size = "md",
}: {
  dots: number[] | Set<number>;
  size?: "sm" | "md" | "lg";
}) {
  const set = dots instanceof Set ? dots : new Set(dots);
  const cell =
    size === "lg" ? "h-7 w-7" : size === "sm" ? "h-3.5 w-3.5" : "h-5 w-5";
  const gap = size === "lg" ? "gap-3" : "gap-2";
  return (
    <div className={`grid grid-cols-2 ${gap}`}>
      {[1, 4, 2, 5, 3, 6].map((n) => (
        <div key={n} className={`dot-cell ${cell} ${set.has(n) ? "on" : ""}`} />
      ))}
    </div>
  );
}

function HeroIllustration({
  tone = "forest",
  compact = false,
}: {
  tone?: "forest" | "ember";
  compact?: boolean;
}) {
  // Stylized layered SVG: hills + tree silhouettes + a few fireflies
  return (
    <div className={`hero-card relative w-full ${compact ? "h-44" : "h-48"}`}>
      <svg
        viewBox="0 0 600 220"
        preserveAspectRatio="xMidYMax slice"
        className="absolute inset-0 h-full w-full"
        aria-hidden
      >
        <defs>
          <linearGradient id="ground" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#21422c" />
            <stop offset="100%" stopColor="#0a1a10" />
          </linearGradient>
          <linearGradient id="emberGround" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#4a201a" />
            <stop offset="100%" stopColor="#1a0a08" />
          </linearGradient>
        </defs>

        {/* ground hill */}
        <path
          d="M0 165 Q 150 125 300 155 T 600 145 L600 220 L0 220 Z"
          fill={tone === "ember" ? "url(#emberGround)" : "url(#ground)"}
        />

        {/* trees — taller, varied heights, two clusters */}
        {[
          [55, 165, 1.0],
          [100, 170, 0.8],
          [148, 162, 1.15],
          [205, 168, 0.95],
          [395, 168, 1.0],
          [445, 172, 0.85],
          [498, 160, 1.2],
          [552, 170, 0.9],
        ].map(([x, y, s], i) => (
          <g key={i} transform={`translate(${x},${y}) scale(${s})`}>
            <polygon
              points="0,-15 -28,55 28,55"
              fill={tone === "ember" ? "#1c0d09" : "#0a1a10"}
            />
            <polygon
              points="0,-35 -22,38 22,38"
              fill={tone === "ember" ? "#2a140e" : "#10261a"}
            />
            <polygon
              points="0,-52 -16,18 16,18"
              fill={tone === "ember" ? "#3a1c12" : "#163522"}
            />
            <rect x="-3" y="50" width="6" height="14" fill="#050a06" />
          </g>
        ))}

        {/* fireflies — clustered in the gap between tree groups */}
        <g>
          <circle cx="280" cy="100" r="2" fill="#ffd95a">
            <animate
              attributeName="opacity"
              values="0.3;1;0.3"
              dur="2.4s"
              repeatCount="indefinite"
            />
          </circle>
          <circle cx="320" cy="130" r="1.8" fill="#ffd95a">
            <animate
              attributeName="opacity"
              values="1;0.3;1"
              dur="3.1s"
              repeatCount="indefinite"
            />
          </circle>
          <circle cx="370" cy="115" r="2" fill="#ffd95a">
            <animate
              attributeName="opacity"
              values="0.4;1;0.4"
              dur="2.7s"
              repeatCount="indefinite"
            />
          </circle>
        </g>
      </svg>
    </div>
  );
}

function CreatureIllustration({ defeated = false }: { defeated?: boolean }) {
  return (
    <div className="relative flex h-44 w-full items-center justify-center">
      <img
        src={defeated ? "/bossImages/defeatedboss.png" : "/bossImages/boss.png"}
        alt=""
        aria-hidden
        className="h-full w-auto object-contain transition-all duration-500"
        style={{
          filter: defeated
            ? "drop-shadow(0 18px 22px rgba(0,0,0,0.2))"
            : "drop-shadow(0 24px 28px rgba(0,0,0,0.28))",
          animation: defeated
            ? undefined
            : "islandFloat 3.2s ease-in-out infinite",
        }}
      />
    </div>
  );
}

// ============================================================================
// SCREENS
// ============================================================================

type Speak = (text: string) => Promise<void>;

const INTRO_NARRATION =
  "Travel seven worlds. Learn each creature's name. Defeat them.";

const WELCOME_NARRATION =
  "Welcome to BrailleQuest. This is an audio adventure where braille becomes magic. Listen carefully, press the correct braille dots, and cast spells to defeat each creature. Let's begin your quest.";

const LETTER_IMAGES: Record<string, string> = {
  A: "/letter%20images/imageA.png",
  S: "/letter%20images/ImageS.png",
  H: "/letter%20images/ImageH.png",
};

const ISLANDS: { name: string; subtitle: string; image: string }[] = [
  {
    name: "Fire Pit",
    subtitle: "Spell ASH",
    image: "/island%20images/Image_(Island_quest_map)-2.png",
  },
  {
    name: "Frostpoint",
    subtitle: "Spell ICE",
    image: "/island%20images/Image_(Island_quest_map)-1.png",
  },
  {
    name: "Tide Hollow",
    subtitle: "Spell SEA",
    image: "/island%20images/Image_(Island_quest_map)-3.png",
  },
];

function IntroScreen({
  speak,
  onStart,
}: {
  speak: Speak;
  onStart: () => void;
}) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setActive((i) => (i + 1) % ISLANDS.length);
    }, 1500);
    return () => clearInterval(id);
  }, []);

  function begin() {
    onStart();
  }

  function playWelcome() {
    speak(WELCOME_NARRATION);
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Enter") {
        e.preventDefault();
        begin();
        return;
      }
      if (e.key === "ArrowRight") {
        e.preventDefault();
        setActive((i) => (i + 1) % ISLANDS.length);
      }
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        setActive((i) => (i - 1 + ISLANDS.length) % ISLANDS.length);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  return (
    <div className="fixed inset-0 z-20 flex flex-col items-center justify-between gap-6 bg-white px-6 py-10 text-black">
      <div className="flex flex-col items-center gap-2">
        <p className="text-center text-[11px] tracking-[0.24em] uppercase text-neutral-500">

        </p>
        <h1 className="font-display text-center text-5xl font-bold leading-none tracking-tight text-black">
          BrailleQuest
        </h1>
      </div>

      <div
        className="relative w-full max-w-3xl"
        style={{
          height: 520,
          perspective: 1800,
          transform: "rotateX(14deg) rotateZ(-2deg)",
          transformStyle: "preserve-3d",
        }}
      >
        {ISLANDS.map((isle, i) => {
          const isFire = isle.name === "Fire Pit";
          const offset = (i - active + ISLANDS.length) % ISLANDS.length;
          const pos = offset === 2 ? -1 : offset; // -1 left, 0 center, 1 right
          const isActive = pos === 0;
          const transform =
            pos === 0
              ? "translate(-50%, -50%) translateZ(40px) scale(1)"
              : pos === 1
                ? "translate(-50%, -50%) translateX(300px) translateZ(-60px) rotateY(-22deg) scale(0.78)"
                : "translate(-50%, -50%) translateX(-300px) translateZ(-60px) rotateY(22deg) scale(0.78)";
          return (
            <div
              key={isle.name}
              aria-hidden
              className="absolute top-1/2 left-1/2 flex flex-col items-center gap-3 pointer-events-none"
              style={{
                transform,
                opacity: isActive ? 1 : 0.55,
                filter: isActive ? "none" : "saturate(0.85)",
                zIndex: isActive ? 3 : 2,
                transition:
                  "transform 700ms cubic-bezier(0.22,1,0.36,1), opacity 500ms ease, filter 500ms ease",
              }}
            >
              <div
                className="flex flex-col items-center gap-0.5 transition-opacity duration-300"
                style={{ opacity: isActive ? 1 : 0 }}
              >
                <span className="font-display text-sm font-bold tracking-tight text-black">
                  {isle.name}
                </span>
              </div>
              <div
                className="bg-contain bg-center bg-no-repeat"
                style={{
                  width: 400,
                  height: 400,
                  backgroundImage: `url('${isle.image}')`,
                  mixBlendMode: "multiply",
                  filter: `${isFire ? "sepia(1) saturate(6) hue-rotate(-30deg) " : ""}${isActive
                    ? "drop-shadow(0 32px 40px rgba(0,0,0,0.28))"
                    : "drop-shadow(0 16px 24px rgba(0,0,0,0.18))"
                    }`,
                  animation: isActive
                    ? "islandFloat 6s ease-in-out infinite"
                    : undefined,
                }}
              />
            </div>
          );
        })}
      </div>

      <div className="flex w-full max-w-xs flex-col items-center gap-3">
        <p className="text-center text-sm text-neutral-600">
          Press{" "}
          <kbd className="rounded-md border border-neutral-300 bg-neutral-100 px-1.5 py-0.5 font-mono text-xs font-semibold text-black">
            Enter
          </kbd>{" "}
          to continue to level select
        </p>
        <button
          type="button"
          onClick={playWelcome}
          className="w-full rounded-full border border-black bg-white px-6 py-3.5 text-sm font-semibold tracking-wide text-black transition hover:bg-neutral-100"
        >
          🔊 Play Welcome
        </button>
        <button
          type="button"
          onClick={begin}
          className="w-full rounded-full border border-black bg-black px-6 py-3.5 text-sm font-semibold tracking-wide text-white transition hover:bg-neutral-800"
        >
          Continue →
        </button>
      </div>
    </div>
  );
}

function WorldScreen({
  speak,
  onEnter,
}: {
  speak: Speak;
  onEnter: () => void;
}) {
  const currentRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    speak("Choose an island. Tab to browse, enter to begin.");
    currentRef.current?.focus();
  }, [speak]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key !== "Enter") return;
      e.preventDefault();
      onEnter();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onEnter]);

  return (
    <div className="fixed inset-0 z-20 flex flex-col overflow-y-auto overscroll-y-contain bg-white px-4 py-6 text-black sm:px-6 sm:py-10">
      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col items-center gap-6 sm:gap-8">
        <div className="flex shrink-0 flex-col items-center gap-2">
          <p className="text-center text-[11px] tracking-[0.24em] uppercase text-neutral-500">
            level select
          </p>
          <h2 className="font-display text-center text-2xl font-bold leading-none tracking-tight text-black sm:text-3xl">
            Choose an Island
          </h2>
        </div>

        <ul className="flex w-full min-w-0 flex-1 flex-row flex-wrap content-center items-end justify-center gap-x-6 gap-y-10 sm:gap-x-10 lg:gap-x-16">
          {ISLANDS.map((isle, i) => {
            const isCurrent = i === 0;
            const isLocked = i > 0;
            const isFire = isle.name === "Fire Pit";
            const tile = "min(92vw, 400px)";
            const islandH = `min(50dvh, ${tile})`;
            return (
              <li
                key={isle.name}
                className="flex w-full max-w-[400px] min-w-0 flex-[1_1_260px] flex-col items-center sm:max-w-none sm:flex-[1_1_280px]"
              >
                <button
                  ref={isCurrent ? currentRef : undefined}
                  type="button"
                  disabled={isLocked}
                  onClick={isLocked ? undefined : onEnter}
                  aria-label={`Island ${i + 1}: ${isle.name}. ${isLocked ? "Locked." : "Available."
                    }`}
                  className={`group relative flex w-full flex-col items-center gap-3 border-0 bg-transparent p-0 outline-none transition ${isCurrent
                    ? "cursor-pointer hover:-translate-y-1"
                    : "cursor-not-allowed"
                    }`}
                  style={{
                    transitionDuration: "300ms",
                    transitionTimingFunction:
                      "cubic-bezier(0.22,1,0.36,1)",
                  }}
                >
                  <div
                    className="mx-auto bg-contain bg-center bg-no-repeat"
                    style={{
                      width: tile,
                      height: islandH,
                      maxWidth: "100%",
                      backgroundImage: `url('${isle.image}')`,
                      mixBlendMode: "multiply",
                      opacity: isLocked ? 0.45 : 1,
                      filter: isLocked
                        ? "grayscale(1) drop-shadow(0 18px 24px rgba(0,0,0,0.14))"
                        : `${isFire ? "sepia(1) saturate(6) hue-rotate(-30deg) " : ""}drop-shadow(0 32px 38px rgba(0,0,0,0.28))`,
                      animation: isCurrent
                        ? "islandFloat 5s ease-in-out infinite"
                        : undefined,
                    }}
                  />
                  <div className="flex flex-col items-center gap-1.5">
                    <span
                      className={`font-display text-center text-sm font-bold tracking-tight sm:text-base ${isLocked ? "text-neutral-400" : "text-black"
                        }`}
                    >
                      {isle.name}
                    </span>
                    {isLocked ? (
                      <span className="text-[10px] font-semibold tracking-[0.22em] uppercase text-neutral-400">
                        🔒 Locked
                      </span>
                    ) : (
                      <span className="rounded-full border border-black bg-black px-3 py-1 text-[10px] font-bold tracking-[0.18em] uppercase text-white">
                        Play
                      </span>
                    )}
                  </div>
                </button>
              </li>
            );
          })}
        </ul>

        <p className="shrink-0 pb-2 text-center text-sm text-neutral-600 sm:pb-0">
          Press{" "}
          <kbd className="rounded-md border border-neutral-300 bg-neutral-100 px-1.5 py-0.5 font-mono text-xs font-semibold text-black">
            Enter
          </kbd>{" "}
          to begin {ISLANDS[0].name}
        </p>
      </div>
    </div>
  );
}

function LetterScreen({
  speak,
  letter,
  onConfirm,
}: {
  speak: Speak;
  letter: string;
  onConfirm: () => void;
}) {
  const [confirmed, setConfirmed] = useState(false);
  const [wrongFeedback, setWrongFeedback] = useState<string | null>(null);
  const [shakeKey, setShakeKey] = useState(0);
  const targetDots = BRAILLE[letter];
  const { dots: pressedDots } = useBrailleInput(!confirmed);

  useEffect(() => {
    if (letter === "A") {
      speak(
        "You're in the Fire Pit! A big scary monster is hiding here. It stole the sun! Find its three secret letters and learn its name, then you can defeat it! You stumbled upon an old stone! Turn it over... It's a secret letter. This is A. Can you write it?",
      );
    } else if (letter === "S") {
      speak(
        "You hear a whisper from behind a tree. It says, the second letter is S. Can you write S?",
      );
    } else if (letter === "H") {
      speak(
        "One letter is still missing. You follow tiny sparks across the ground until they lead you to a magical flower. The flower shapes itself into the letter H. Can you write H?",
      );
    } else {
      speak(
        `You found a letter. It is ${letter}. Make the letter ${letter} on your device.`,
      );
    }
  }, [speak, letter]);

  useEffect(() => {
    setWrongFeedback(null);
  }, [pressedDots]);

  function checkLetter() {
    if (dotsMatch(pressedDots, targetDots)) {
      if (letter === "A") {
        speak("That's it! You made the letter A!");
      } else if (letter === "S") {
        speak(
          "Nice work! You made the letter S! The creature growls, but it sounds smaller now.",
        );
      } else if (letter === "H") {
        speak("Amazing! You made the letter H!");
      } else {
        speak(`Correct. That is ${letter}.`);
      }
      setConfirmed(true);
      return;
    }
    const made = (Object.keys(BRAILLE) as string[]).find((k) =>
      dotsMatch(pressedDots, BRAILLE[k]),
    );
    if (made) {
      speak(`That is ${made}. Try again.`);
      setWrongFeedback(`That is ${made}. Try again.`);
    } else if (pressedDots.size === 0) {
      speak("No pattern. Try again.");
      setWrongFeedback("No pattern — try again.");
    } else {
      speak("That is not a letter we know. Try again.");
      setWrongFeedback("That is not a letter we know. Try again.");
    }
    setShakeKey((k) => k + 1);
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key !== "Enter") return;
      e.preventDefault();
      if (confirmed) {
        onConfirm();
        return;
      }
      checkLetter();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  return (
    <div className="fixed inset-0 z-20 flex flex-col items-center justify-between gap-6 bg-white px-6 py-10 text-black">
      <div className="flex flex-col items-center gap-2">
        <p className="text-center text-[11px] tracking-[0.24em] uppercase text-neutral-500">
          letter found
        </p>
        <img
          src={LETTER_IMAGES[letter] ?? ""}
          alt={`Letter ${letter}`}
          className="h-72 w-auto object-contain"
          style={{
            mixBlendMode: "multiply",
            filter: "drop-shadow(0 24px 28px rgba(0,0,0,0.18))",
          }}
        />
        <p className="font-display text-2xl font-bold leading-none tracking-tight text-black">
          {letter}
        </p>
      </div>

      <div
        key={shakeKey}
        className={`flex w-full max-w-2xl items-start justify-center gap-10 ${wrongFeedback ? "shake" : ""}`}
      >
        <div className="flex flex-col items-center gap-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-neutral-500">
            Target
          </p>
          <BrailleCell dots={targetDots} size="lg" />
        </div>
        <div className="flex flex-col items-center gap-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-neutral-500">
            You
          </p>
          <BrailleCell dots={pressedDots} size="lg" />
        </div>
        <div className="flex flex-col items-center gap-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-neutral-500">
            Keys
          </p>
          <div
            className="grid grid-cols-2 gap-2"
            aria-label="W A S for dots 1 2 3, D F G for dots 4 5 6"
          >
            {[
              ["W", "D"],
              ["A", "F"],
              ["S", "G"],
            ].map(([left, right]) => (
              <Fragment key={left}>
                <kbd className="flex h-7 w-7 items-center justify-center rounded-md border border-neutral-300 bg-neutral-100 font-mono text-xs font-semibold text-black">
                  {left}
                </kbd>
                <kbd className="flex h-7 w-7 items-center justify-center rounded-md border border-neutral-300 bg-neutral-100 font-mono text-xs font-semibold text-black">
                  {right}
                </kbd>
              </Fragment>
            ))}
          </div>
        </div>
      </div>

      <div className="flex w-full max-w-xs flex-col items-center gap-3">
        {wrongFeedback ? (
          <p className="text-center text-xs font-semibold text-neutral-700">
            {wrongFeedback}
          </p>
        ) : confirmed ? (
          <p className="text-center text-xs font-semibold text-black">
            ✓ Correct — {letter}
          </p>
        ) : (
          <p className="text-center text-xs text-neutral-500">
            Press{" "}
            <kbd className="rounded-md border border-neutral-300 bg-neutral-100 px-1.5 py-0.5 font-mono text-xs font-semibold text-black">
              Enter
            </kbd>{" "}
            to check
          </p>
        )}
        <button
          type="button"
          onClick={confirmed ? onConfirm : checkLetter}
          className="w-full rounded-full border border-black bg-black px-6 py-3.5 text-sm font-semibold tracking-wide text-white transition hover:bg-neutral-800"
        >
          {confirmed ? "Continue →" : "Check"}
        </button>
      </div>
    </div>
  );
}

function BlendingScreen({
  speak,
  onContinue,
}: {
  speak: Speak;
  onContinue: () => void;
}) {
  const letters = ["A", "S", "H"];

  useEffect(() => {
    speak(
      "You found all three letters. A... S... H. The creature's name is ASH. Spell his name to defeat him!",
    );
  }, [speak]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Enter") {
        e.preventDefault();
        onContinue();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onContinue]);

  return (
    <div className="fixed inset-0 z-20 flex flex-col items-center justify-between gap-6 bg-white px-6 py-10 text-black">
      <div className="flex flex-col items-center gap-2">
        <p className="text-center text-[11px] tracking-[0.24em] uppercase text-neutral-500">
          word complete
        </p>
        <h2 className="font-display text-center text-[18rem] font-bold leading-none tracking-tight text-black">
          Ash
        </h2>
      </div>

      <div className="flex justify-center gap-10">
        {letters.map((l) => (
          <div key={l} className="flex flex-col items-center gap-3">
            <BrailleCell dots={BRAILLE[l]} size="md" />
            <span className="font-display text-base font-bold tracking-tight text-black">
              {l}
            </span>
          </div>
        ))}
      </div>

      <div className="flex w-full max-w-xs flex-col items-center gap-3">
        <p className="text-center text-sm text-neutral-600">
          Say it aloud: &ldquo;Ash&rdquo;
        </p>
        <button
          type="button"
          onClick={async () => {
            await speak("Ash.");
            onContinue();
          }}
          className="w-full rounded-full border border-black bg-black px-6 py-3.5 text-sm font-semibold tracking-wide text-white transition hover:bg-neutral-800"
        >
          Continue →
        </button>
      </div>
    </div>
  );
}

function BattleScreen({
  speak,
  spelled,
  setSpelled,
  onWin,
}: {
  speak: Speak;
  spelled: string[];
  setSpelled: (s: string[]) => void;
  onWin: () => void;
}) {
  const target = ["A", "S", "H"];
  const isComplete = spelled.length === 3;
  const isCorrect = isComplete && spelled.every((l, i) => l === target[i]);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [shakeKey, setShakeKey] = useState(0);
  const { dots, clear } = useBrailleInput(!isComplete);

  useEffect(() => {
    speak("Spell its name!");
  }, [speak]);

  useEffect(() => {
    if (isComplete && isCorrect) {
      speak("Say Ash out loud and press Enter to defeat it.");
    }
  }, [isComplete, isCorrect, speak]);

  useEffect(() => {
    setFeedback(null);
  }, [dots]);

  function reset() {
    setSpelled([]);
    clear();
    setFeedback(null);
  }

  function submitLetter() {
    if (isComplete) return;
    const match = (Object.keys(BRAILLE) as string[]).find((k) =>
      dotsMatch(dots, BRAILLE[k]),
    );
    if (!match) {
      setFeedback("That's not a letter we know. Try again.");
      speak("Try again.");
      setShakeKey((k) => k + 1);
      return;
    }
    const expected = target[spelled.length];
    if (match !== expected) {
      setFeedback(`That is ${match}. Not the next letter. Try again.`);
      speak("Try again.");
      setShakeKey((k) => k + 1);
      clear();
      return;
    }
    speak(`Correct. That is ${match}.`);
    setSpelled([...spelled, match]);
    clear();
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key !== "Enter") return;
      e.preventDefault();
      if (isComplete && isCorrect) {
        speak("Ash!");
        onWin();
      } else if (!isComplete) {
        submitLetter();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  return (
    <div className="fixed inset-0 z-20 flex flex-col items-center justify-between gap-6 bg-white px-6 py-10 text-black">
      <div className="flex flex-col items-center gap-2">
        <p className="text-center text-[11px] tracking-[0.24em] uppercase text-neutral-500">
          battle
        </p>
        <h2 className="font-display text-center text-3xl font-bold leading-none tracking-tight text-black">
          {isComplete ? "Defeat it!" : "Spell its name"}
        </h2>
      </div>

      <div className="flex w-full flex-col items-center gap-2">
        <img
          src="/bossImages/boss.png"
          alt=""
          aria-hidden
          className="h-56 w-auto object-contain transition-all duration-500"
          style={{
            mixBlendMode: "multiply",
            filter: isComplete
              ? "drop-shadow(0 32px 38px rgba(0,0,0,0.35))"
              : "drop-shadow(0 24px 28px rgba(0,0,0,0.25))",
            animation: "islandFloat 2.8s ease-in-out infinite",
            transform: isComplete ? "scale(1.05)" : undefined,
          }}
        />
        <p className="font-display text-2xl font-bold tracking-tight text-black">
          Ash
        </p>
      </div>

      <div className="flex flex-col items-center gap-6">
        <div className="flex justify-center gap-3">
          {[0, 1, 2].map((i) => {
            const isFilled = !!spelled[i];
            const isActive = !isFilled && i === spelled.length;
            return (
              <div
                key={i}
                className={`flex h-14 w-12 items-center justify-center rounded-xl border font-display text-2xl font-bold tracking-tight transition ${isFilled
                  ? "border-black bg-black text-white"
                  : isActive
                    ? "border-black text-black"
                    : "border-neutral-300 text-neutral-300"
                  }`}
              >
                {spelled[i] ?? ""}
              </div>
            );
          })}
        </div>

        {!isComplete && (
          <div
            key={shakeKey}
            className={`flex w-full max-w-2xl items-start justify-center gap-10 ${feedback ? "shake" : ""}`}
          >
            <div className="flex flex-col items-center gap-3">
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-neutral-500">
                {target[spelled.length]}
              </p>
              <BrailleCell dots={BRAILLE[target[spelled.length]]} size="lg" />
            </div>
            <div className="flex flex-col items-center gap-3">
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-neutral-500">
                You
              </p>
              <BrailleCell dots={dots} size="lg" />
            </div>
            <div className="flex flex-col items-center gap-3">
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-neutral-500">
                Keys
              </p>
              <div
                className="grid grid-cols-2 gap-2"
                aria-label="W A S for dots 1 2 3, D F G for dots 4 5 6"
              >
                {[
                  ["W", "D"],
                  ["A", "F"],
                  ["S", "G"],
                ].map(([left, right]) => (
                  <Fragment key={left}>
                    <kbd className="flex h-7 w-7 items-center justify-center rounded-md border border-neutral-300 bg-neutral-100 font-mono text-xs font-semibold text-black">
                      {left}
                    </kbd>
                    <kbd className="flex h-7 w-7 items-center justify-center rounded-md border border-neutral-300 bg-neutral-100 font-mono text-xs font-semibold text-black">
                      {right}
                    </kbd>
                  </Fragment>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex w-full max-w-xs flex-col items-center gap-3">
        {!isComplete && (
          <>
            {feedback ? (
              <p className="text-center text-xs font-semibold text-neutral-700">
                {feedback}
              </p>
            ) : (
              <p className="text-center text-xs text-neutral-500">
                Press{" "}
                <kbd className="rounded-md border border-neutral-300 bg-neutral-100 px-1.5 py-0.5 font-mono text-xs font-semibold text-black">
                  Enter
                </kbd>{" "}
                to submit
              </p>
            )}
            <button
              type="button"
              onClick={submitLetter}
              className="w-full rounded-full border border-black bg-black px-6 py-3.5 text-sm font-semibold tracking-wide text-white transition hover:bg-neutral-800"
            >
              Submit
            </button>
          </>
        )}
        {isComplete && isCorrect && (
          <>
            <p className="text-center text-xs text-neutral-500">
              Say &ldquo;Ash&rdquo; out loud and press{" "}
              <kbd className="rounded-md border border-neutral-300 bg-neutral-100 px-1.5 py-0.5 font-mono text-xs font-semibold text-black">
                Enter
              </kbd>
            </p>
            <button
              type="button"
              onClick={async () => {
                await speak("Ash!");
                onWin();
              }}
              className="w-full rounded-full border border-black bg-black px-6 py-3.5 text-sm font-semibold tracking-wide text-white transition hover:bg-neutral-800"
            >
              Say &ldquo;ASH&rdquo; →
            </button>
          </>
        )}
        {isComplete && !isCorrect && (
          <>
            <p className="text-center text-sm font-semibold text-neutral-700">
              Try again.
            </p>
            <button
              type="button"
              onClick={reset}
              className="w-full rounded-full border border-black bg-white px-6 py-3.5 text-sm font-semibold tracking-wide text-black transition hover:bg-neutral-100"
            >
              Reset
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function VictoryScreen({
  speak,
  onNext,
}: {
  speak: Speak;
  onNext: () => void;
}) {
  useEffect(() => {
    speak(
      "A beam of light flashes. The creature crumbles down. The light returns to the sky, and the Fire Pit cools down. You defeated ASH by learning its name. Quest complete!",
    );
  }, [speak]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key !== "Enter") return;
      e.preventDefault();
      onNext();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onNext]);

  return (
    <div className="fixed inset-0 z-20 flex flex-col items-center justify-between gap-6 bg-white px-6 py-10 text-black">
      <div className="flex flex-col items-center gap-2">
        <p className="text-center text-[11px] tracking-[0.24em] uppercase text-neutral-500">
          victory
        </p>
        <h2 className="font-display text-center text-5xl font-bold leading-none tracking-tight text-black">
          Defeated
        </h2>
      </div>

      <div className="flex w-full flex-col items-center gap-3">
        <img
          src="/bossImages/defeatedboss.png"
          alt=""
          aria-hidden
          className="h-72 w-auto object-contain"
          style={{
            mixBlendMode: "multiply",
            filter: "drop-shadow(0 28px 32px rgba(0,0,0,0.25))",
          }}
        />
        <p className="font-display text-2xl font-bold tracking-tight text-black">
          Ash
        </p>
      </div>

      <div className="flex w-full max-w-xs flex-col items-center gap-3">
        <p className="text-center text-sm text-neutral-600">
          Press{" "}
          <kbd className="rounded-md border border-neutral-300 bg-neutral-100 px-1.5 py-0.5 font-mono text-xs font-semibold text-black">
            Enter
          </kbd>{" "}
          to return to the islands
        </p>
        <button
          type="button"
          onClick={onNext}
          className="w-full rounded-full border border-black bg-black px-6 py-3.5 text-sm font-semibold tracking-wide text-white transition hover:bg-neutral-800"
        >
          Unlock Next Island →
        </button>
      </div>
    </div>
  );
}
