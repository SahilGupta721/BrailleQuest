"use client";

import { useEffect, useState } from "react";
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
  A: [1], B: [1, 2], C: [1, 4], D: [1, 4, 5], E: [1, 5], F: [1, 2, 4],
  G: [1, 2, 4, 5], H: [1, 2, 5], I: [2, 4], J: [2, 4, 5], K: [1, 3],
  L: [1, 2, 3], M: [1, 3, 4], N: [1, 3, 4, 5], O: [1, 3, 5], P: [1, 2, 3, 4],
  Q: [1, 2, 3, 4, 5], R: [1, 2, 3, 5], S: [2, 3, 4], T: [2, 3, 4, 5],
  U: [1, 3, 6], V: [1, 2, 3, 6], W: [2, 4, 5, 6], X: [1, 3, 4, 6],
  Y: [1, 3, 4, 5, 6], Z: [1, 3, 5, 6],
};

const TOTAL_WORLDS = 7;
const CURRENT_WORLD_INDEX = 0; // 0-based
const WORLD_NAME = "Scorched Plains";

export default function Home() {
  const [screen, setScreen] = useState<Screen>("intro");
  const [spelled, setSpelled] = useState<string[]>([]);
  const [streak, setStreak] = useState(3);
  const [xp, setXp] = useState(240);
  const { speak, stop } = useSpeak();

  useEffect(() => {
    return stop;
  }, [screen, stop]);

  return (
    <div className="relative flex h-[100dvh] flex-col overflow-hidden">
      <TopBar streak={streak} xp={xp} />

      <main className="mx-auto flex w-full max-w-xl flex-1 min-h-0 flex-col justify-center overflow-hidden px-5 py-2">
        {screen === "intro" && (
          <IntroScreen
            speak={speak}
            onStart={() => setScreen("world")}
          />
        )}
        {screen === "world" && (
          <WorldScreen speak={speak} onEnter={() => setScreen("letterA")} />
        )}
        {screen === "letterA" && (
          <LetterScreen
            speak={speak}
            label="You found a letter"
            letter="A"
            onConfirm={() => {
              setXp((x) => x + 10);
              setScreen("letterS");
            }}
          />
        )}
        {screen === "letterS" && (
          <LetterScreen
            speak={speak}
            label="Another letter"
            letter="S"
            onConfirm={() => {
              setXp((x) => x + 10);
              setScreen("letterH");
            }}
          />
        )}
        {screen === "letterH" && (
          <LetterScreen
            speak={speak}
            label="The final letter"
            letter="H"
            onConfirm={() => {
              setXp((x) => x + 10);
              setScreen("blending");
            }}
          />
        )}
        {screen === "blending" && (
          <BlendingScreen speak={speak} onContinue={() => setScreen("battle")} />
        )}
        {screen === "battle" && (
          <BattleScreen
            speak={speak}
            spelled={spelled}
            setSpelled={setSpelled}
            onWin={() => {
              setStreak((s) => s + 1);
              setXp((x) => x + 50);
              setScreen("victory");
            }}
          />
        )}
        {screen === "victory" && (
          <VictoryScreen
            speak={speak}
            onNext={() => {
              setSpelled([]);
              setScreen("intro");
            }}
          />
        )}
      </main>

      <BottomNav active={screen === "intro" ? "home" : "letters"} />
    </div>
  );
}

// ============================================================================
// CHROME
// ============================================================================

function TopBar({ streak, xp }: { streak: number; xp: number }) {
  return (
    <header className="mx-auto flex w-full max-w-xl shrink-0 items-center justify-between px-5 pt-3 pb-1 sm:pt-4">
      <div className="font-display text-xl font-bold text-[var(--accent)]">
        BrailleQuest
      </div>
      <div className="flex items-center gap-2">
        <div className="badge-streak" aria-label={`Streak ${streak}`}>
          <span className="icon" aria-hidden />
          <span>{streak}</span>
        </div>
        <div className="badge-xp" aria-label={`${xp} experience points`}>
          <span className="icon" aria-hidden />
          <span>{xp} XP</span>
        </div>
      </div>
    </header>
  );
}

function BottomNav({
  active,
}: {
  active: "home" | "letters" | "progress" | "profile";
}) {
  const items: {
    id: "home" | "letters" | "progress" | "profile";
    label: string;
    icon: React.ReactNode;
  }[] = [
      { id: "home", label: "home", icon: <IconHome /> },
      { id: "letters", label: "letters", icon: <IconCheck /> },
      { id: "progress", label: "progress", icon: <IconStar /> },
      { id: "profile", label: "profile", icon: <IconUser /> },
    ];
  return (
    <nav className="bottom-nav z-20 shrink-0">
      <ul className="mx-auto flex max-w-xl items-center justify-around px-4 py-1.5">
        {items.map((it) => (
          <li key={it.id}>
            <button
              type="button"
              className={`nav-item ${active === it.id ? "active" : ""}`}
            >
              <span aria-hidden>{it.icon}</span>
              <span>{it.label}</span>
            </button>
          </li>
        ))}
      </ul>
    </nav>
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
  const set =
    dots instanceof Set ? dots : new Set(dots);
  const cell =
    size === "lg" ? "h-7 w-7" : size === "sm" ? "h-3.5 w-3.5" : "h-5 w-5";
  const gap = size === "lg" ? "gap-3" : "gap-2";
  return (
    <div className={`grid grid-cols-2 ${gap}`}>
      {[1, 4, 2, 5, 3, 6].map((n) => (
        <div
          key={n}
          className={`dot-cell ${cell} ${set.has(n) ? "on" : ""}`}
        />
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
    <div className={`hero-card relative w-full ${compact ? "h-28" : "h-32"}`}>
      <svg
        viewBox="0 0 600 200"
        preserveAspectRatio="none"
        className="absolute inset-0 h-full w-full"
        aria-hidden
      >
        <defs>
          <linearGradient id="ground" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1d3a26" />
            <stop offset="100%" stopColor="#0f2418" />
          </linearGradient>
          <linearGradient id="emberGround" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3a1a14" />
            <stop offset="100%" stopColor="#1a0a08" />
          </linearGradient>
        </defs>

        {/* far hill */}
        <path
          d="M0 150 Q 150 110 300 140 T 600 130 L600 200 L0 200 Z"
          fill={tone === "ember" ? "url(#emberGround)" : "url(#ground)"}
          opacity={0.85}
        />

        {/* trees */}
        {[
          [70, 150], [130, 145], [200, 152], [260, 142],
          [340, 150], [400, 140], [470, 152], [540, 145],
        ].map(([x, y], i) => (
          <g key={i} transform={`translate(${x},${y})`}>
            <polygon
              points="0,0 -22,40 22,40"
              fill={tone === "ember" ? "#1c0d09" : "#0a1a10"}
            />
            <polygon
              points="0,-12 -18,28 18,28"
              fill={tone === "ember" ? "#2a140e" : "#10261a"}
            />
            <rect x="-3" y="36" width="6" height="10" fill="#070d0a" />
          </g>
        ))}

        {/* fireflies */}
        <g>
          <circle cx="120" cy="80" r="2" fill="#ffd95a">
            <animate attributeName="opacity" values="0.3;1;0.3" dur="2.4s" repeatCount="indefinite" />
          </circle>
          <circle cx="380" cy="60" r="2" fill="#ffd95a">
            <animate attributeName="opacity" values="1;0.3;1" dur="3.1s" repeatCount="indefinite" />
          </circle>
          <circle cx="500" cy="90" r="2" fill="#ffd95a">
            <animate attributeName="opacity" values="0.4;1;0.4" dur="2.7s" repeatCount="indefinite" />
          </circle>
        </g>
      </svg>
    </div>
  );
}

function CreatureIllustration({ defeated = false }: { defeated?: boolean }) {
  return (
    <div className="hero-card relative h-32 w-full">
      <svg
        viewBox="0 0 600 200"
        preserveAspectRatio="xMidYMid meet"
        className="absolute inset-0 h-full w-full"
        aria-hidden
      >
        <defs>
          <radialGradient id="ember" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={defeated ? "#ffd95a" : "#ff6b3d"} />
            <stop offset="60%" stopColor={defeated ? "#f5c842" : "#b83820"} stopOpacity="0.6" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
        </defs>
        <ellipse cx="300" cy="120" rx="220" ry="60" fill="url(#ember)" opacity="0.6" />
        {/* creature silhouette */}
        <g transform="translate(300,120)">
          <ellipse cx="0" cy="0" rx="70" ry="44" fill={defeated ? "#2a3a6a" : "#1a0d08"} opacity={defeated ? 0.6 : 1} />
          <circle cx="-22" cy="-10" r="5" fill={defeated ? "#5fe3a1" : "#ffd95a"} />
          <circle cx="22" cy="-10" r="5" fill={defeated ? "#5fe3a1" : "#ffd95a"} />
          <path d="M-30 14 Q 0 30 30 14" stroke={defeated ? "#5fe3a1" : "#ffd95a"} strokeWidth="3" fill="none" strokeLinecap="round" />
          {/* horns */}
          <path d="M-50 -30 Q -60 -55 -40 -50" stroke={defeated ? "#2a3a6a" : "#1a0d08"} strokeWidth="6" fill="none" strokeLinecap="round" />
          <path d="M50 -30 Q 60 -55 40 -50" stroke={defeated ? "#2a3a6a" : "#1a0d08"} strokeWidth="6" fill="none" strokeLinecap="round" />
        </g>
      </svg>
    </div>
  );
}

// ============================================================================
// SCREENS
// ============================================================================

type Speak = (text: string) => Promise<void>;

const INTRO_NARRATION =
  "Seven sun thieves have stolen the light. People are cold. Plants are dying. Travel through seven worlds, learn each creature's name, and defeat them.";

function IntroScreen({
  speak,
  onStart,
}: {
  speak: Speak;
  onStart: () => void;
}) {
  const progress = ((CURRENT_WORLD_INDEX + 1) / TOTAL_WORLDS) * 100;
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col items-center gap-1.5">
        <span className="pill">
          <span className="dot" aria-hidden />
          <span>WORLD 1 — SCORCHED PLAINS</span>
        </span>
        <h1 className="font-display title-glow text-center text-5xl font-bold leading-none text-[var(--accent)]">
          BrailleQuest
        </h1>
        <p className="text-center text-xs text-[var(--muted)]">
          learn its name · speak its name · defeat it
        </p>
      </div>

      <div className="relative">
        <HeroIllustration compact />
        <div className="surface-inset absolute inset-x-4 -bottom-6 p-3">
          <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--muted-2)]">
            Your Quest
          </p>
          <p className="text-xs leading-snug text-[var(--text)]">
            <span className="font-bold">Seven sun thieves</span>{" "}
            <span className="text-[var(--muted)]">
              have stolen the light. Travel 7 worlds — learn each creature&apos;s
              name and defeat them.
            </span>
          </p>
          <div className="mt-2 flex items-center gap-1">
            {Array.from({ length: TOTAL_WORLDS }).map((_, i) => (
              <div
                key={i}
                className={`threat-dot ${i < CURRENT_WORLD_INDEX + 1 ? "done" : ""}`}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="px-1 pt-6">
        <div className="mb-1 flex items-center justify-between text-[11px] font-semibold text-[var(--muted)]">
          <span>{CURRENT_WORLD_INDEX + 1} of {TOTAL_WORLDS}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <PrimaryButton onClick={onStart}>Begin Your Quest →</PrimaryButton>
        <GhostButton onClick={() => speak(INTRO_NARRATION)}>
          Continue Journey
        </GhostButton>
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
  useEffect(() => {
    speak("Scorched plains. Find all the letters. Spell its name to defeat it.");
  }, [speak]);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col items-center gap-1.5">
        <span className="pill">
          <span className="dot" aria-hidden />
          <span>WORLD 1</span>
        </span>
        <h2 className="font-display title-glow text-center text-3xl font-bold text-[var(--accent)]">
          The {WORLD_NAME}
        </h2>
      </div>

      <HeroIllustration tone="ember" compact />

      <div className="card p-4">
        <p className="text-xs leading-snug text-[var(--text)]">
          The ground is cracked. Embers drift through the air.{" "}
          <span className="text-[var(--muted)]">
            Something here feeds on what little fire remains.
          </span>
        </p>
        <p className="mt-2 text-xs font-semibold text-[var(--accent)]">
          Find all the letters and spell the creature&apos;s name.
        </p>
      </div>

      <PrimaryButton onClick={onEnter}>Enter the World →</PrimaryButton>
      <p className="px-2 text-center text-[11px] leading-snug text-[var(--muted-2)]">
        Find the letters. Learn the sounds. When you know them all — you will
        know its name.
      </p>
    </div>
  );
}

function LetterScreen({
  speak,
  label,
  letter,
  onConfirm,
}: {
  speak: Speak;
  label: string;
  letter: string;
  onConfirm: () => void;
}) {
  const [confirmed, setConfirmed] = useState(false);
  const [wrongFeedback, setWrongFeedback] = useState<string | null>(null);
  const [shakeKey, setShakeKey] = useState(0);
  const targetDots = BRAILLE[letter];
  const { dots: pressedDots } = useBrailleInput(!confirmed);

  useEffect(() => {
    speak(
      `You found a letter. It is ${letter}. Make the letter ${letter} on your device.`,
    );
  }, [speak, letter]);

  useEffect(() => {
    setWrongFeedback(null);
  }, [pressedDots]);

  function checkLetter() {
    if (dotsMatch(pressedDots, targetDots)) {
      speak(`Correct. That is ${letter}.`);
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
    <div className="flex flex-col gap-3">
      <div className="flex flex-col items-center gap-1.5">
        <span className="pill">
          <span className="dot" aria-hidden />
          <span>LETTER FOUND</span>
        </span>
        <h2 className="font-display text-center text-xl font-bold text-[var(--text)]">
          {label}
        </h2>
      </div>

      <div className="card flex items-center justify-center gap-5 px-4 py-3">
        <p className="font-display title-glow text-[5rem] leading-none font-bold text-[var(--accent)]">
          {letter}
        </p>
        <p className="max-w-[10rem] text-left text-[11px] leading-snug text-[var(--muted)]">
          Make the pattern on your device — keys{" "}
          <span className="font-bold text-[var(--text)]">W A S D F G</span>{" "}
          map to dots 1 – 6
        </p>
      </div>

      <div key={shakeKey} className={`grid grid-cols-2 gap-2.5 ${wrongFeedback ? "shake" : ""}`}>
        <div className="surface-inset flex flex-col items-center gap-2 p-3">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--muted-2)]">
            Target
          </p>
          <BrailleCell dots={targetDots} size="md" />
        </div>
        <div className="surface-inset flex flex-col items-center gap-2 p-3">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--muted-2)]">
            You pressed
          </p>
          <BrailleCell dots={pressedDots} size="md" />
        </div>
      </div>

      {wrongFeedback && (
        <p className="text-center text-xs font-semibold text-[var(--bad)]">
          {wrongFeedback}
        </p>
      )}

      {!confirmed ? (
        <PrimaryButton onClick={checkLetter}>Check my letter</PrimaryButton>
      ) : (
        <>
          <div className="glow-pulse flex items-center justify-center gap-2 rounded-2xl border border-[var(--good)] bg-[rgba(95,227,161,0.1)] px-4 py-2.5 text-sm font-bold text-[var(--good)]">
            ✓ Confirmed — {letter}
          </div>
          <PrimaryButton onClick={onConfirm}>Continue →</PrimaryButton>
        </>
      )}
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
      "You found all the letters. The word is Ash. Say it back to me. Ash.",
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
    <div className="flex flex-col gap-3">
      <div className="flex flex-col items-center gap-1">
        <span className="pill">
          <span className="dot" aria-hidden />
          <span>BLENDING</span>
        </span>
        <h2 className="font-display text-center text-xl font-bold text-[var(--text)]">
          You found all the letters!
        </h2>
        <p className="text-xs text-[var(--muted)]">Your word is</p>
      </div>

      <div className="card p-4">
        <p className="font-display title-glow text-center text-5xl font-bold leading-none text-[var(--accent)]">
          Ash
        </p>
        <div className="mt-4 flex justify-center gap-5">
          {letters.map((l) => (
            <div key={l} className="flex flex-col items-center gap-1.5">
              <BrailleCell dots={BRAILLE[l]} size="sm" />
              <span className="font-display text-sm font-bold text-[var(--text)]">
                {l}
              </span>
            </div>
          ))}
        </div>
      </div>

      <p className="text-center text-xs font-semibold text-[var(--accent)]">
        Say the word back: &quot;Ash&quot;
      </p>
      <PrimaryButton
        onClick={async () => {
          await speak("Ash.");
          onContinue();
        }}
      >
        Continue →
      </PrimaryButton>
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
    <div className="flex flex-col gap-2.5">
      <div className="flex flex-col items-center gap-1">
        <span className="pill">
          <span className="dot" aria-hidden />
          <span>BATTLE</span>
        </span>
        <h2 className="font-display text-center text-xl font-bold text-[var(--text)]">
          Spell its name!
        </h2>
      </div>

      <CreatureIllustration />

      <div className="flex justify-center gap-2.5">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={`letter-tile ${spelled[i]
              ? "filled"
              : i === spelled.length
                ? "active"
                : ""
              }`}
          >
            {spelled[i] ?? ""}
          </div>
        ))}
      </div>

      {!isComplete && (
        <>
          <p className="text-center text-[11px] text-[var(--muted)]">
            Make the letter for{" "}
            <span className="font-display text-sm font-bold text-[var(--accent)]">
              {target[spelled.length]}
            </span>{" "}
            on your device
          </p>
          <div key={shakeKey} className={`grid grid-cols-2 gap-2 ${feedback ? "shake" : ""}`}>
            <div className="surface-inset flex flex-col items-center gap-1.5 p-2.5">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--muted-2)]">
                Hint: {target[spelled.length]}
              </p>
              <BrailleCell
                dots={BRAILLE[target[spelled.length]]}
                size="md"
              />
            </div>
            <div className="surface-inset flex flex-col items-center gap-1.5 p-2.5">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--muted-2)]">
                You pressed
              </p>
              <BrailleCell dots={dots} size="md" />
            </div>
          </div>
          {feedback && (
            <p className="text-center text-xs font-semibold text-[var(--bad)]">
              {feedback}
            </p>
          )}
          <PrimaryButton onClick={submitLetter}>Submit letter</PrimaryButton>
        </>
      )}

      {isComplete && isCorrect && (
        <PrimaryButton
          onClick={async () => {
            await speak("Ash!");
            onWin();
          }}
        >
          Say the word: &quot;ASH&quot; →
        </PrimaryButton>
      )}
      {isComplete && !isCorrect && (
        <>
          <p className="text-center text-sm font-semibold text-[var(--bad)]">
            Not quite. Try again.
          </p>
          <GhostButton onClick={reset}>Reset</GhostButton>
        </>
      )}
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
  const defeated = 1;
  const total = TOTAL_WORLDS;
  const progress = (defeated / total) * 100;

  useEffect(() => {
    speak("Congratulations. You defeated Ash.");
  }, [speak]);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col items-center gap-1">
        <span className="pill">
          <span className="dot" aria-hidden />
          <span>VICTORY</span>
        </span>
        <h2 className="font-display title-glow text-center text-3xl font-bold text-[var(--accent)]">
          ASH defeated!
        </h2>
      </div>

      <CreatureIllustration defeated />

      <div className="card p-3">
        <p className="text-center text-xs text-[var(--muted)]">
          <span className="font-bold text-[var(--text)]">+50 XP</span> · Streak
          extended
        </p>
        <div className="mt-2 flex items-center justify-center gap-1">
          {Array.from({ length: total }).map((_, i) => (
            <div
              key={i}
              className={`threat-dot ${i < defeated ? "done" : ""}`}
            />
          ))}
        </div>
        <p className="mt-2 text-center text-[11px] font-semibold text-[var(--muted)]">
          {defeated} of {total} threats defeated
        </p>
        <div className="mt-2">
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </div>

      <PrimaryButton onClick={onNext}>Next World →</PrimaryButton>
    </div>
  );
}

// ============================================================================
// ICONS — minimal stroke icons matching the bottom nav in the mock
// ============================================================================

function IconHome() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 11l9-8 9 8" />
      <path d="M5 10v10h14V10" />
    </svg>
  );
}
function IconCheck() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M8 12.5l2.5 2.5L16 9.5" />
    </svg>
  );
}
function IconStar() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 3 14.6 9 21 9.7 16 14 17.4 20.5 12 17.3 6.6 20.5 8 14 3 9.7 9.4 9 12 3" />
    </svg>
  );
}
function IconUser() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c1.5-4 5-6 8-6s6.5 2 8 6" />
    </svg>
  );
}
