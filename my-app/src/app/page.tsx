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

const SOUND: Record<string, string> = {
  A: "Ah",
  S: "Sss",
  H: "Hh",
};

export default function Home() {
  const [screen, setScreen] = useState<Screen>("intro");
  const [spelled, setSpelled] = useState<string[]>([]);
  const { speak, stop } = useSpeak();

  useEffect(() => {
    return stop;
  }, [screen, stop]);

  return (
    <div className="flex min-h-screen flex-1 items-center justify-center bg-zinc-100 px-4 py-10 font-sans text-zinc-900">
      <div className="w-full max-w-md rounded-xl border border-zinc-300 bg-white p-6 shadow-sm">
        {screen === "intro" && (
          <IntroScreen speak={speak} onStart={() => setScreen("world")} />
        )}
        {screen === "world" && (
          <WorldScreen speak={speak} onEnter={() => setScreen("letterA")} />
        )}
        {screen === "letterA" && (
          <LetterScreen
            speak={speak}
            label="You found a letter!"
            letter="A"
            onConfirm={() => setScreen("letterS")}
          />
        )}
        {screen === "letterS" && (
          <LetterScreen
            speak={speak}
            label="Another letter!"
            letter="S"
            onConfirm={() => setScreen("letterH")}
          />
        )}
        {screen === "letterH" && (
          <LetterScreen
            speak={speak}
            label="The final letter!"
            letter="H"
            onConfirm={() => setScreen("blending")}
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
            onWin={() => setScreen("victory")}
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
      </div>
    </div>
  );
}

// --- Shared bits ---

function Illustration({ label }: { label?: string }) {
  return (
    <div className="flex h-40 items-center justify-center rounded-md border border-dashed border-zinc-300 bg-zinc-50 text-xs text-zinc-400">
      {label ?? "illustration"}
    </div>
  );
}

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
      className="w-full rounded-md bg-zinc-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-zinc-700 disabled:cursor-not-allowed disabled:bg-zinc-300"
    >
      {children}
    </button>
  );
}

function SecondaryButton({
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
      className="w-full rounded-md border border-zinc-400 bg-white px-4 py-3 text-sm font-medium text-zinc-900 transition hover:bg-zinc-50"
    >
      {children}
    </button>
  );
}

function BrailleCell({
  dots,
  size = "md",
}: {
  dots: number[];
  size?: "sm" | "md" | "lg";
}) {
  const cell = size === "lg" ? "h-6 w-6" : size === "sm" ? "h-3 w-3" : "h-4 w-4";
  const gap = size === "lg" ? "gap-3" : "gap-2";
  return (
    <div className={`grid grid-cols-2 ${gap}`}>
      {[1, 4, 2, 5, 3, 6].map((n) => (
        <div
          key={n}
          className={`${cell} rounded-full border border-zinc-400 ${
            dots.includes(n) ? "bg-zinc-900" : "bg-white"
          }`}
        />
      ))}
    </div>
  );
}

// --- Screens ---

type Speak = (text: string) => Promise<void>;

const INTRO_NARRATION =
  "Defeat seven creatures. Restore the world.";

function IntroScreen({
  speak,
  onStart,
}: {
  speak: Speak;
  onStart: () => void;
}) {
  return (
    <div className="flex flex-col gap-5">
      <p className="text-center text-xs uppercase tracking-widest text-zinc-400">
        Screen 1 — Intro / Title
      </p>
      <Illustration />
      <h1 className="text-center text-2xl font-bold">[Game Title TBD]</h1>
      <p className="text-center text-xs italic text-zinc-500">
        Seven-syllable name under the logo
      </p>
      <div className="flex flex-col gap-2">
        <PrimaryButton onClick={onStart}>Begin Your Quest!</PrimaryButton>
        <SecondaryButton onClick={() => speak(INTRO_NARRATION)}>
          Hear the story
        </SecondaryButton>
      </div>
      <p className="text-xs leading-relaxed text-zinc-500">
        Plants are dying. People are cold. It is your job to travel through 7
        worlds and defeat the creature in each. Learn each one&apos;s name.
        Defeat them. Restore the world.
      </p>
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
    <div className="flex flex-col gap-5">
      <p className="text-center text-xs uppercase tracking-widest text-zinc-400">
        Screen 2 — World Intro
      </p>
      <Illustration label="scorched plains, smoke" />
      <h2 className="text-center text-2xl font-bold tracking-wide">
        The Scorched Plains
      </h2>
      <p className="text-center text-sm text-zinc-700">
        The ground is cracked. Embers drift through the air. Something here
        feeds on what little fire remains.
      </p>
      <p className="text-center text-sm font-medium text-zinc-900">
        Find all the letters and spell the creature&apos;s name to defeat it.
      </p>
      <PrimaryButton onClick={onEnter}>Enter the World</PrimaryButton>
      <p className="text-xs leading-relaxed text-zinc-500">
        A creature lurks here. Its name is hidden in the world. Find the
        letters. Learn the sounds. When you know them all — you will know its
        name.
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
  const targetDots = BRAILLE[letter];
  const { dots: pressedDots, clear } = useBrailleInput(!confirmed);

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
    <div className="flex flex-col gap-5">
      <p className="text-center text-xs uppercase tracking-widest text-zinc-400">
        Letter Found ({letter})
      </p>
      <Illustration />
      <h2 className="text-center text-xl font-semibold">{label}</h2>
      <p className="text-center text-6xl font-bold tracking-wider">{letter}</p>
      <p className="text-center text-xs text-zinc-500">
        Make the pattern on your device — keys W A S D F G map to dots 1 – 6
      </p>
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col items-center gap-2 rounded-md border border-zinc-200 bg-zinc-50 p-3">
          <p className="text-xs uppercase tracking-wider text-zinc-500">
            Target
          </p>
          <BrailleCell dots={targetDots} size="lg" />
        </div>
        <div className="flex flex-col items-center gap-2 rounded-md border border-zinc-200 bg-white p-3">
          <p className="text-xs uppercase tracking-wider text-zinc-500">
            You pressed
          </p>
          <BrailleCell dots={Array.from(pressedDots)} size="lg" />
        </div>
      </div>
      {wrongFeedback && (
        <p className="text-center text-sm text-rose-600">{wrongFeedback}</p>
      )}
      {!confirmed ? (
        <div className="flex flex-col gap-2">
          <PrimaryButton onClick={checkLetter}>Check my letter</PrimaryButton>
          <SecondaryButton onClick={clear}>Clear</SecondaryButton>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-center gap-2 rounded-md border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
            ✓ Confirmed
          </div>
          <PrimaryButton onClick={onConfirm}>Continue</PrimaryButton>
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
    <div className="flex flex-col gap-5">
      <p className="text-center text-xs uppercase tracking-widest text-zinc-400">
        Screen 3D — Blending
      </p>
      <h2 className="text-center text-lg font-semibold">
        You found all the letters!
      </h2>
      <p className="text-center text-sm text-zinc-700">
        Your word is:
      </p>
      <p className="text-center text-6xl font-bold tracking-wider">Ash</p>
      <div className="flex justify-center gap-4">
        {letters.map((l) => (
          <div key={l} className="flex flex-col items-center gap-2">
            <BrailleCell dots={BRAILLE[l]} />
            <span className="text-xs font-medium text-zinc-600">{l}</span>
          </div>
        ))}
      </div>
      <p className="text-center text-sm font-medium text-zinc-900">
        Say the word back: &quot;Ash&quot;
      </p>
      <PrimaryButton
        onClick={async () => {
          await speak("Ash.");
          onContinue();
        }}
      >
        Continue
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
      return;
    }
    const expected = target[spelled.length];
    if (match !== expected) {
      setFeedback(`That is ${match}. Not the next letter. Try again.`);
      speak("Try again.");
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
    <div className="flex flex-col gap-5">
      <p className="text-center text-xs uppercase tracking-widest text-zinc-400">
        Screen 4 — Battle
      </p>
      <Illustration label="creature charging" />
      <h2 className="text-center text-lg font-semibold">Spell its name!</h2>
      <div className="flex justify-center gap-2">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={`flex h-14 w-14 items-center justify-center rounded-md border-2 text-2xl font-bold ${
              spelled[i]
                ? "border-emerald-400 bg-emerald-50 text-emerald-700"
                : i === spelled.length
                  ? "border-zinc-900 bg-white"
                  : "border-zinc-300 bg-white text-zinc-300"
            }`}
          >
            {spelled[i] ?? ""}
          </div>
        ))}
      </div>
      {!isComplete && (
        <>
          <p className="text-center text-xs text-zinc-500">
            Make the letter for{" "}
            <span className="font-bold text-zinc-900">
              {target[spelled.length]}
            </span>{" "}
            on your device
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col items-center gap-2 rounded-md border border-zinc-200 bg-zinc-50 p-3">
              <p className="text-xs uppercase tracking-wider text-zinc-500">
                Hint: {target[spelled.length]}
              </p>
              <BrailleCell
                dots={BRAILLE[target[spelled.length]]}
                size="lg"
              />
            </div>
            <div className="flex flex-col items-center gap-2 rounded-md border border-zinc-200 bg-white p-3">
              <p className="text-xs uppercase tracking-wider text-zinc-500">
                You pressed
              </p>
              <BrailleCell dots={Array.from(dots)} size="lg" />
            </div>
          </div>
          {feedback && (
            <p className="text-center text-sm text-rose-600">{feedback}</p>
          )}
          <div className="flex flex-col gap-2">
            <PrimaryButton onClick={submitLetter}>Submit letter</PrimaryButton>
            <SecondaryButton onClick={clear}>Clear</SecondaryButton>
          </div>
          <p className="text-center text-xs italic text-zinc-500">
            Creature approaching…
          </p>
        </>
      )}
      {isComplete && isCorrect && (
        <PrimaryButton
          onClick={async () => {
            await speak("Ash!");
            onWin();
          }}
        >
          Say the word: &quot;ASH&quot;
        </PrimaryButton>
      )}
      {isComplete && !isCorrect && (
        <>
          <p className="text-center text-sm text-rose-600">
            Not quite. Try again.
          </p>
          <SecondaryButton onClick={reset}>Reset</SecondaryButton>
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
  const total = 7;

  useEffect(() => {
    speak("Congratulations. You defeated Ash.");
  }, [speak]);

  return (
    <div className="flex flex-col gap-5">
      <p className="text-center text-xs uppercase tracking-widest text-zinc-400">
        Screen 5 — Victory
      </p>
      <Illustration label="creature dissolving, light" />
      <h2 className="text-center text-2xl font-bold">ASH defeated!</h2>
      <p className="text-center text-sm text-zinc-600">
        {defeated} of {total} threats defeated
      </p>
      <div className="flex justify-center gap-2">
        {Array.from({ length: total }).map((_, i) => (
          <div
            key={i}
            className={`flex h-8 w-8 items-center justify-center rounded-md border text-xs font-semibold ${
              i < defeated
                ? "border-zinc-900 bg-zinc-900 text-white"
                : "border-zinc-300 bg-white text-zinc-300"
            }`}
          >
            {i < defeated ? "✓" : ""}
          </div>
        ))}
      </div>
      <PrimaryButton onClick={onNext}>Next World →</PrimaryButton>
    </div>
  );
}
