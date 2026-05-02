"use client";

import { useEffect, useState } from "react";
import { useSpeak } from "@/lib/useSpeak";

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
  S: [2, 3, 4],
  H: [1, 2, 5],
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
  const sound = SOUND[letter];
  const dots = BRAILLE[letter];

  useEffect(() => {
    speak(
      `You found a letter. It is ${letter}. Make the letter ${letter} on your device.`,
    );
  }, [speak, letter]);

  return (
    <div className="flex flex-col gap-5">
      <p className="text-center text-xs uppercase tracking-widest text-zinc-400">
        Letter Found ({letter})
      </p>
      <Illustration />
      <h2 className="text-center text-xl font-semibold">{label}</h2>
      <p className="text-center text-sm text-zinc-600">
        Feel the pattern on your device
      </p>
      <div className="flex justify-center py-2">
        <BrailleCell dots={dots} size="lg" />
      </div>
      <p className="text-center text-6xl font-bold tracking-wider">{letter}</p>
      {!confirmed ? (
        <PrimaryButton
          onClick={() => {
            speak(`Correct. That is ${letter}.`);
            setConfirmed(true);
          }}
        >
          Check my letter
        </PrimaryButton>
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
  const [step, setStep] = useState(0); // 0..2 individual, 3 blended
  const letters = ["A", "S", "H"];

  // intentionally silent on entry to save credits

  return (
    <div className="flex flex-col gap-5">
      <p className="text-center text-xs uppercase tracking-widest text-zinc-400">
        Screen 3D — Blending
      </p>
      <h2 className="text-center text-lg font-semibold">
        Let&apos;s say them one at a time
      </h2>
      <div className="flex flex-col gap-3">
        {letters.map((l, i) => (
          <div
            key={l}
            className={`flex items-center gap-4 rounded-md border p-3 ${
              i < step
                ? "border-emerald-300 bg-emerald-50"
                : i === step
                  ? "border-zinc-900 bg-white"
                  : "border-zinc-200 bg-zinc-50 opacity-60"
            }`}
          >
            <BrailleCell dots={BRAILLE[l]} />
            <span className="flex-1 text-sm font-medium">
              Say &quot;{SOUND[l]}&quot;
            </span>
            {i < step && <span className="text-xs text-emerald-700">✓</span>}
          </div>
        ))}
      </div>
      {step < 3 ? (
        <PrimaryButton
          onClick={() => {
            speak(`Correct. That is ${letters[step]}.`);
            setStep((s) => s + 1);
          }}
        >
          Check my letter
        </PrimaryButton>
      ) : (
        <>
          <div className="rounded-md border border-zinc-300 bg-zinc-50 p-4 text-center">
            <p className="text-xs text-zinc-500">
              Now say them together — slowly
            </p>
            <p className="mt-2 text-lg text-zinc-700">Ah… Sss… Hh</p>
            <p className="mt-2 text-xs text-zinc-500">Faster:</p>
            <p className="mt-1 text-4xl font-bold tracking-wider">Ash</p>
          </div>
          <PrimaryButton
            onClick={async () => {
              await speak("Ash.");
              onContinue();
            }}
          >
            Continue
          </PrimaryButton>
        </>
      )}
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
  const options = ["A", "S", "H"];
  const isComplete = spelled.length === 3;
  const isCorrect =
    isComplete && spelled.every((l, i) => l === target[i]);

  // silent on entry

  function pick(letter: string) {
    if (spelled.length >= 3) return;
    speak(SOUND[letter]);
    setSpelled([...spelled, letter]);
  }

  function reset() {
    setSpelled([]);
  }

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
            className="flex h-14 w-14 items-center justify-center rounded-md border-2 border-zinc-400 bg-white text-2xl font-bold"
          >
            {spelled[i] ?? ""}
          </div>
        ))}
      </div>
      <div className="flex justify-center gap-3">
        {options.map((l) => (
          <button
            key={l}
            type="button"
            onClick={() => pick(l)}
            disabled={isComplete}
            className="rounded-md border border-zinc-300 bg-white p-3 transition hover:border-zinc-900 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <BrailleCell dots={BRAILLE[l]} />
          </button>
        ))}
      </div>
      {isComplete ? (
        isCorrect ? (
          <PrimaryButton
            onClick={async () => {
              await speak("Ash!");
              onWin();
            }}
          >
            Say the word: &quot;ASH&quot;
          </PrimaryButton>
        ) : (
          <>
            <p className="text-center text-sm text-rose-600">
              Not quite. Try again.
            </p>
            <SecondaryButton onClick={reset}>Reset</SecondaryButton>
          </>
        )
      ) : (
        <p className="text-center text-xs italic text-zinc-500">
          Creature approaching…
        </p>
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
    speak("Defeated.");
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
