# BrailleQuest

**BrailleQuest** is an audio story game that helps visually impaired kids learn braille using a physical braille device to turn letters into words, cast spells, solve puzzles, and move the story forward.

---

## 🏆 Awards

- **Best Reach** — [HuskyHack 2026](https://huskyhack-2026.devpost.com/)

---

## 🔗 Links

- **Devpost:** https://devpost.com/software/braillequest
- **Demo Video:** https://www.youtube.com/watch?v=DxrkzQoPOzA

---

## Inspiration

BrailleQuest was inspired by accessibility issues in our world. A lot of visually impaired people are overlooked, and we wanted to fix that by providing tools for kids to learn and navigate the world at a young age through braille — making it engaging and fun.

---

## What It Does

BrailleQuest is an audio story game in which kids complete quests using a physical braille device. Each level introduces letters through a story moment. Players press the correct braille pattern, build letters into words, unlock spells, solve puzzles, and move the adventure forward.

---

## How We Built It

We built BrailleQuest using Next.js, TypeScript, HTML, and Tailwind CSS for the web experience. The interface was designed in Figma with accessibility in mind, using large buttons, high contrast colors, readable text, and audio-first story prompts.

For the physical side, we used Onshape to design a 2×3 braille controller, then 3D printed the board and added conductive tape and a Makey Makey so players could interact with the story through touch. The web app connects story progression to the braille input, so each correct letter helps unlock the next part of the quest. AI-generated narration is powered by ElevenLabs.

---

## Challenges We Ran Into

One challenge was balancing accessibility with a fun fantasy game feel — playful, but still clear and easy to understand for visually impaired kids. Building the physical controller was also challenging because we had to think about button size, spacing, touch feedback, and how a child would actually use it. We also had to keep the scope small enough to finish during the hackathon while still making the concept feel complete.

---

## Accomplishments We're Proud Of

We built more than just a screen-based game. BrailleQuest combines audio storytelling, tactile input, physical hardware, and visual design into one experience. The story connects directly to learning — letters are not random lessons, they become clues, spells, and tools that help the player save the world.

---

## What We Learned

Accessibility is not just an extra feature — it changes how a product should be designed from the beginning. We also learned how important physical interaction can be in storytelling. For this project, touch is not just a control method, it is part of the story itself.

---

## What's Next for BrailleQuest

We would expand BrailleQuest with more worlds, more letters, and full word-building challenges. We would also improve the physical controller with better tactile buttons, audio feedback, and support for different difficulty levels. In the future, BrailleQuest could become a full learning adventure where kids build confidence with braille one story at a time.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js, TypeScript, Tailwind CSS, HTML |
| Audio | ElevenLabs |
| Design | Figma |
| Hardware | Makey Makey, 3D-printed braille controller |
| CAD | Onshape |

---

## Getting Started

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the result.