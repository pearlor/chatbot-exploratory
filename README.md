# AI Recipe Helper

A chat app for cooking with an AI chef. Ask for a recipe, a technique or a
pairing, and the reply comes back as a **recipe card** — time / difficulty /
serves pills, ingredients and steps side by side, and a closing tip from the
chef — rather than a wall of markdown.

- **Three chef personas.** Chef Kale (a patient culinary teacher), Rosemary (a
  TV cooking-show host) and Cane (a pirate with a parrot and too many sea
  stories). Pick one in settings; it changes the voice, not the format.
- **A fridge.** Track what you actually have, then ask the chef what to cook
  with it. Fridge-related questions are grounded in your ingredient list.
- **Demo mode.** The app ships with a scripted walkthrough and canned replies,
  so it runs end to end with no API key and no network.

Built with React 19, TypeScript, Vite and Tailwind CSS v4, talking to Gemini
via `@google/genai`.

## Quick start

```bash
npm install
npm run dev
```

Then open http://localhost:5173. **Demo mode is on by default**, so there is
nothing else to configure — the settings modal opens first, pick a chef, and
the composer walks you through a scripted conversation. The suggestion chips
and the fridge each have their own canned replies in every persona's voice.

## Running against the real API

Demo mode is a single flag in
[src/context/UserPreferencesContext.tsx](src/context/UserPreferencesContext.tsx):

```ts
export const IS_DEMO_MODE = true; // set to false for the live chef
```

With it off, `generateResponse` calls Gemini, which needs an API key. The
client is currently constructed with an empty one in
[src/chat/ChatUtils.ts](src/chat/ChatUtils.ts):

```ts
const ai = new GoogleGenAI({ apiKey: "" });
```

Drop a key in to try it locally. Before this goes anywhere real that should
move to an env var (`import.meta.env.VITE_GEMINI_API_KEY`) — and note that a
browser-side key is visible to anyone using the app, so a production build
wants a small server proxy rather than a direct call from the client.

There is also a mock path that returns one canned recipe without touching the
network: `generateResponse(prompt, id, persona, undefined, /* useMock */ true)`.
It is handy for UI work on the recipe card.

## Scripts

| Command                    | What it does                                     |
| -------------------------- | ------------------------------------------------ |
| `npm run dev`              | Vite dev server on port 5173                     |
| `npm run build`            | Type-check (`tsc -b`) and build to `dist/`       |
| `npm run preview`          | Serve the production build                       |
| `npm run lint`             | ESLint                                           |
| `npm test`                 | Vitest in watch mode                             |
| `npm run test:unit`        | Vitest once                                      |
| `npm run test:e2e`         | Playwright (starts the dev server itself)        |
| `npm run test:e2e:ui`      | Playwright's UI mode, for debugging a spec       |
| `npm run test:e2e:report`  | Open the last HTML report                        |

First e2e run only:

```bash
npx playwright install
```

## Testing

- **Unit** — 20 tests over the recipe parser in
  [src/components/chat/parseRecipe.test.ts](src/components/chat/parseRecipe.test.ts).
  They double as executable documentation of the model-output shapes the
  parser accepts.
- **End-to-end** — 35 Playwright tests in [tests/](tests/), covering the chat,
  the fridge, the sidebar and the settings modal, on Chromium and WebKit.

The e2e suite runs against demo mode, which is what makes it deterministic:
no network, no API key, and the chef's replies are fixture files the specs can
assert on by name.

## How it fits together

```
src/
├── chat/          AI calls, prompts, types          (no React)
├── demo/          Scripted prompts + canned replies
├── components/    Chat bubbles, recipe card, composer, modals
├── context/       All app state (useReducer + context)
├── sections/      ChatHome and Fridge
├── sidebar/       Nav, recent conversations, settings
├── content.ts     Every user-facing string
└── testIds.ts     data-testid values shared with the e2e specs
```

Two ideas explain most of the codebase:

**The prompt ↔ parser contract.** The system prompt is split in two. A format
prompt tells the model to emit machine-parseable markers — a metadata bullet
block, tagged headings like `### [Ingredients] The Canvas` — and the client
parser turns those into typed segments the UI renders as pills, columns and a
callout. The persona prompt controls voice only. Because structure and
personality are decoupled, swapping chefs never touches the parser, and the
bracket tags are stripped before anything reaches the screen. Every parsing
rule has a fallback, so a reply that ignores the contract degrades to ordinary
markdown instead of breaking.

**Copy and test ids live in one file each.** `content.ts` holds every string
the UI shows; `testIds.ts` holds the handful of `data-testid`s. The Playwright
specs import from both rather than hardcoding text, so rewording a button
updates the tests instead of breaking them.

[CONTEXT.md](CONTEXT.md) is the detailed tour — the parser pipeline
step by step, the demo-mode plumbing, the retry flow, and the gotchas worth
knowing before you change the prompt.

## Notes and limitations

- **Nothing persists.** Conversations, the chosen persona and the fridge all
  live in memory and reset on reload.
- The sidebar starts with one seeded conversation and the fridge with a
  seeded shelf of ingredients, so the app is never empty on first load. Both
  are flags in their contexts.
- Conversation continuity relies on the `previousInteractionId` returned by
  each API call rather than re-sending the transcript.
