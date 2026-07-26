# Codebase Context

A chat app where users cook with an AI chef. The chef has three
interchangeable personas (a culinary teacher, a TV host, a pirate) that the
user picks in settings. Recipe responses render as rich cards (metadata
pills, side-by-side ingredients/steps, an ending callout) instead of plain
markdown. A "Fridge" view tracks the user's ingredients and grounds the
chef's suggestions in them.

**Stack:** React 19 + TypeScript + Vite, Tailwind CSS v4, `react-markdown`,
`@google/genai` (Gemini), Vitest for unit tests, Playwright for e2e.

## Directory map

```
src/
├── chat/                     # AI side (no React)
│   ├── ChatUtils.ts          # generateResponse(): calls Gemini or the mock
│   ├── types.ts              # ChatMessage / RoleEnum / Persona / personas[]
│   ├── prompts.ts            # FRIDGE_PROMPT (shared by chip + fridge button)
│   ├── prompts/              # System prompt halves (imported as ?raw text)
│   │   ├── format_prompt.txt         # Output-format contract (see below)
│   │   ├── culinary_teacher_prompt.txt
│   │   ├── food_tv_host_prompt.txt
│   │   └── pirate_chef_prompt.txt
│   └── mock/example_response.md      # Canned recipe reply for useMock
├── demo/                     # Demo mode: scripted prompts + canned replies
│   ├── DemoUserPrompts.ts    # The prompt the composer is pinned to
│   ├── DemoResponses.ts      # generateDemoResponse(): prompt+persona → reply
│   └── pirate/ teacher/ tvShow/      # One .txt fixture per script per persona
├── components/
│   ├── chat/                 # Message rendering
│   │   ├── ChatHistory.tsx   # Maps messages to bubbles; empty-state greeting
│   │   ├── UserBubble.tsx    # Also owns the Retry affordance
│   │   ├── ChefBubble.tsx / ThinkingBubble.tsx
│   │   ├── parseRecipe.ts    # ★ The parser (see "Parsing logic")
│   │   ├── parseRecipe.test.ts
│   │   ├── ChefMarkdown.tsx  # Segments → react-markdown UI
│   │   ├── RecipePills.tsx   # Time / Difficulty / Serves chips
│   │   └── ChefCallout.tsx   # Dark-green ending-comment box
│   ├── Composer.tsx / ChatInput.tsx / SuggestionChips.tsx
│   ├── Button.tsx / Modal.tsx / Tooltip.tsx
│   ├── SettingsModal.tsx     # Persona picker
│   └── IngredientCard.tsx    # One fridge item + its kebab menu
├── context/                  # All app state (useReducer + context, no store)
│   ├── UserPreferencesContext.tsx  # persona, isDemoMode  ← IS_DEMO_MODE flag
│   ├── ChatHistoryContext.tsx      # Conversations + active id
│   ├── IngredientsContext.tsx      # The fridge
│   └── NavigationContext.tsx       # view + pendingPrompt hand-off
├── sections/
│   ├── ChatHome.tsx          # Chat state: messages, loading, retries
│   ├── ChatHomeConstants.ts  # MAX_RETRIES
│   └── Fridge.tsx            # The fridge view
├── sidebar/Sidebar.tsx       # Nav, recent conversations, settings entry point
├── assets/icons.tsx          # Every icon and emoji the UI uses
├── content.ts                # Every user-facing string
├── testIds.ts                # data-testid values shared with the e2e specs
└── index.css                 # Tailwind theme tokens (terracotta, cream, forest…)

tests/                        # Playwright e2e specs + shared helpers
```

## Data flow

```
ChatHome.handleSubmit
  ├─► demo mode? generateDemoResponse(prompt, persona, previousInteractionId)
  └─► otherwise generateResponse(prompt, previousInteractionId, persona,
                                 fridgeContents?)
        └─► Gemini with system_instruction =
              format_prompt + persona prompt [+ fridge grounding block]
              └─► markdown reply stored as a ChatMessage (role = the persona)
                    └─► ChefBubble
                          ├─► isRecipeContent()  → full-width card or 75% bubble
                          └─► ChefMarkdown
                                └─► parseRecipeSegments() → pills / columns /
                                    callout / markdown segments → rendered
```

Conversation continuity is the `previousInteractionId` returned by each call
and passed back on the next one — there is no local transcript re-sending.
Each reply is also dispatched into `ChatHistoryContext`; the first reply of a
new conversation supplies the sidebar title via `extractRecipeTitle`.

## The core idea: a prompt ↔ parser contract

The design splits the system prompt in two:

- **`format_prompt.txt`** is the _structural contract_. It tells the model to
  emit machine-parseable markers; the client parser depends on these exactly:
  - A metadata bullet block: `- **Time:** …`, `- **Difficulty:** …`,
    `- **Serves:** …`
  - The dish title as an `##` heading
  - Tagged `###` sections where the bracket tag is fixed but the display
    title is personalized by the model:
    `### [Ingredients] The Canvas`, `### [Steps] The Method`,
    `### [Ending comment] Chef's Secret`
  - Pros/cons written as `* + text` / `* - text`
  - A topic constraint (culinary questions only)
- **The persona prompt** (teacher, TV host, pirate) controls _voice only_.
  The persona is a user preference, so the prompt is selected at call time
  from `personaPrompts` in `ChatUtils.ts`; the parser is unaffected because
  structure and personality are decoupled.

The bracket tags are **parse markers, never UI**: the parser strips them
(known _and_ unknown tags) so users only ever see the personalized titles.

Every rule in the parser has a fallback, so when the model deviates from the
contract the reply degrades to ordinary markdown instead of breaking.

## Parsing logic (`src/components/chat/parseRecipe.ts`)

`parseRecipeSegments(markdown)` converts a reply into an **ordered list of
typed segments** that `ChefMarkdown` maps straight to components:

| Segment kind | Rendered as                                                    |
| ------------ | -------------------------------------------------------------- |
| `markdown`   | Plain `react-markdown` (greeting, stories, non-recipe answers) |
| `pills`      | `RecipePills` — Time / Difficulty / Serves chips               |
| `columns`    | Ingredients and steps in a side-by-side grid                   |
| `callout`    | `ChefCallout` — the dark-green ending box                      |

Pipeline, in order:

1. **`extractMeta`** scans every line against `META_LINE` and pulls the
   metadata bullets out wherever they appear. The regex is deliberately
   loose — it accepts `- **Time:** 90 min`, `**Time**: …`, bare `Time: …`,
   any bullet marker, any field order — because the model varies. It
   _requires a colon_ so prose that merely starts with "Time" doesn't match.
   First occurrence of each field wins. A `---` divider directly below the
   bullets is treated as part of the block and removed with them.
2. **Pill placement**: pills always render directly under the `##` dish
   title, wherever the model actually put the metadata lines. The text is
   re-split around the title (`TITLE_LINE` uses `##(?!#)` so `###` headings
   can't match). No title → pills stay at the metadata's original spot.
3. **`splitSections`** splits the remainder on `###` headings. A leading
   `[Tag]` in the heading (matched by `SECTION_TAG`) becomes the section's
   lowercased `tag`; the rest of the heading is the display title. Headings
   without a tag keep `tag: null`. Unknown tags are stripped and the section
   renders flat — this is the safety net for tags the prompt never asked for
   (the model once invented `[Pros and Cons]`).
4. **Segment assembly**:
   - `[Ingredients]` + `[Steps]` present together → one `columns` segment
     emitted at the _ingredients_ section's position; the steps section is
     skipped when reached. A **solo** ingredients or steps section (partner
     missing) falls back to flat markdown.
   - `[Ending comment]` → a `callout` segment with the personalized title.
   - Everything else → merged into `markdown` segments via `pushMarkdown`
     (consecutive markdown collapses into one segment; whitespace-only text
     is dropped).
5. **`stripTrailingRule`** removes a trailing `---` from the last
   non-callout segment so no stray horizontal rule renders at the card
   bottom.

**Recipe detection** (`isRecipeContent`) is intentionally cheaper than a
full parse: any metadata line _or_ any tagged `[Ingredients]`/`[Steps]`/
`[Ending comment]` heading marks the reply as a recipe. `ChefBubble` uses it
to widen the bubble into a full-width `@container` card. The tagged-heading
check matters when the model skips the metadata block.

**Title extraction** (`extractRecipeTitle`) returns the `##` dish title, used
by `ChatHome` to name a new conversation in the sidebar. `null` when the
reply has no title — the conversation keeps the placeholder name.

**Escape hatch:** no metadata _and_ no tagged sections → the entire reply is
returned as a single `markdown` segment (normal chat answer).

## Rendering details (`ChefMarkdown.tsx`)

- **Pro/con bullets:** CommonMark treats `+`/`-` as list markers, so the
  prompt's `* + text` would parse as a _nested list_.
  `escapeSentimentPrefixes` backslash-escapes the inner marker
  (`* \+ text`) so it survives as literal text, and `ChefListItem` detects
  the prefix and swaps the bullet for a green `+` / red `−` badge.
- **Columns** use a container query (`@lg:grid-cols-[2fr_3fr]`) keyed to the
  _bubble's_ width — enabled by `@container` on `ChefBubble` — so they
  stack on narrow bubbles regardless of viewport.
- Tailwind preflight unstyles markdown output, so every element (`h2`, `ol`,
  `hr`, …) has explicit classes in the `components` map, with override maps
  for the column headings and the serif step numerals.
- Theme colors are CSS variables in `index.css` (`--color-terracotta`,
  `--color-cream`, `--color-forest`, …) referenced as Tailwind utilities.

## Chef personas (a user preference)

`Persona` is `"teacher" | "tv-host" | "pirate"`. `personas` in
`chat/types.ts` is the single list every persona-aware surface reads —
id, label, emoji, chef name (Chef Kale / Rosemary / Cane) and the
description shown in settings. Adding a persona means adding an entry here,
a prompt file in `chat/prompts/`, a `RoleEnum` member, and a demo fixture
folder.

- **Where it lives:** `UserPreferencesContext` (`preferences.persona`,
  default `"teacher"`). It is in-memory only — a reload resets it.
- **Where it's chosen:** `SettingsModal`, opened from the sidebar footer (or
  the collapsed rail's gear). The selection is a local draft; **Save**
  dispatches `setPersona`, **Cancel** discards it.
- **What it changes:** the system prompt sent to Gemini (`personaPrompts`),
  which canned fixtures demo mode serves, and the avatar + chef name on the
  thinking bubble and chef bubbles.
- **Why messages carry a role, not just "chef":** `RoleEnum` mirrors the
  persona ids, and each message stores the persona that produced it. Switching
  personas mid-conversation therefore leaves earlier replies attributed to the
  chef who actually said them. `CHEF_FALLBACK_NAME` covers a role that can't
  be resolved.

## The fridge (`sections/Fridge.tsx`)

A separate view — `NavigationContext.view` is `"chat" | "fridge"`, toggled
from the sidebar; there is no router.

- **State:** `IngredientsContext`, a reducer over
  `Record<lowercased name, Ingredient>`. Keying by the lowercased name is what
  makes re-adding "MILK" update the existing "Milk" instead of duplicating
  it; the value keeps the name as originally typed for display. Actions:
  `addIngredient` / `removeIngredient` / `updateIngredient`. Blank names are
  ignored. It is seeded with `DEMO_INGREDIENTS` so the app has something to
  cook with on first load.
- **The view:** a name field, an optional quantity field, and Add (Enter in
  either field also adds), then a grid of `IngredientCard`s. Each card's
  kebab menu offers an inline quantity edit — blur saves, Escape cancels —
  and Remove.
- **Grounding the chef:** `formatFridgeContents` flattens the fridge to one
  line (`"Eggs (12), Flour, Milk, …"`) which `ChatUtils` appends to the
  system instruction under a short header. Quantities are omitted when
  unknown.
- **Two ways in:** the "Ask the chef what to cook with these" button, and the
  "From my fridge" suggestion chip. Both send the same `FRIDGE_PROMPT`
  constant from `chat/prompts.ts` — it lives there precisely so the two can't
  drift apart. The button uses `NavigationContext.requestChat`, which switches
  to the chat view and queues the prompt as `pendingPrompt`; `ChatHome`
  submits it on mount and clears it (a ref guards against StrictMode's double
  effect).
- **When is a prompt a fridge prompt?** `ChatHome` says yes if the composer's
  "My fridge" mode is selected, or the prompt _is_ `FRIDGE_PROMPT`, or the
  text merely mentions "fridge". Only then is `fridgeContents` computed and
  sent — an ordinary recipe question doesn't leak the user's groceries into
  the prompt.
- **Empty fridge:** a fridge prompt with nothing in the fridge short-circuits
  before any API (or demo) call and answers with `EMPTY_FRIDGE_MESSAGE`;
  such a conversation is titled `EMPTY_FRIDGE_TITLE`.

## Suggestion chips (`components/SuggestionChips.tsx`)

Four one-tap starters shown by `Composer` **only while the conversation is
empty** (`showSuggestions={messages.length === 0}`): Surprise me, Vegetarian
options, 5-ingredient meals, From my fridge. Each is `{emoji, label, prompt,
tooltip}` in one local `suggestions` array — add a chip by adding an entry.

- Clicking one calls `handleSuggestionClick`, which passes the prompt to
  `handleSubmit` **explicitly** rather than relying on `setUserPrompt`:
  state updates are async, so reading it back on the same tick would still
  see the empty value.
- The prompts are exported constants (`SUGGESTION_*_PROMPT`, and
  `FRIDGE_PROMPT` for the fridge chip). Demo mode matches on those exact
  strings to pick a fixture, and the e2e specs import them too — so editing
  a chip's prompt text changes which canned reply it maps to. Update
  `getScriptForPrompt` alongside.
- On phones the row scrolls horizontally; from `sm` up it wraps and centres.
  Four wrapped chips would eat most of a short screen.

## Centralized copy (`src/content.ts`)

Every user-facing string is an exported constant here, grouped by area
(sidebar, fridge, composer, errors, settings, personas, chips), imported by
the component that renders it. The point is that wording can be reviewed and
changed in one place — and that the Playwright specs assert against the same
constants instead of hardcoded text, so a copy change updates the tests
automatically rather than breaking them.

Persona descriptions are template strings built from the persona name
constants, so a chef's name is written once.

Two deliberate exceptions: the demo-mode tooltip is assembled in `ChatInput`
because two of its words are bolded, and `SETTINGS_MODAL_HEADER` composes an
icon with its label.

## Icons (`src/assets/icons.tsx`)

One module, two kinds of icon, both named exports:

- **SVG components** — `KebabIcon`, `MenuIcon`, `RetryIcon`, `FridgeIcon`,
  `ChefHatIcon`. Inline `currentColor` strokes with `aria-hidden`, sized in
  the file, so they inherit text color from whatever they sit in and add no
  icon-font dependency.
- **Emoji constants** — `CLOSE_ICON`, `SETTINGS_ICON`, `CHEF_ICON`,
  `TV_ICON`, `PIRATE_ICON`, `SPARKLE_ICON`, `CLOCK_ICON`, … Uppercase
  `SCREAMING_CASE` because they are plain strings, which is also what lets
  them be concatenated into copy (`SETTINGS_MODAL_HEADER`) or stored as data
  (`personas[].emoji`).

`fryingpan.svg` in the same folder is the app favicon, referenced from
`index.html`.

## Errors and retries

There is no error boundary; a failed reply is handled as chat content.

- `handleSubmit` wraps the call in try/catch. On failure it appends a chef
  message reading `CHAT_ERROR_PREFIX + err.message` (or
  `GENERIC_ERROR_MESSAGE` for a non-`Error` throw), records the **user**
  message's id in `messageIdWithError`, and decrements `numRetries`.
- `ChatHistory` passes `messageIdWithError` down, so exactly one
  `UserBubble` — the one whose prompt failed — renders a **Retry** link.
  Clicking it calls `handleSubmit(content)`, resubmitting that same prompt.
- The budget is `MAX_RETRIES` (3, in `sections/ChatHomeConstants.ts`). At
  zero the link becomes disabled text with a "No more retries left" tooltip.
- A success clears `messageIdWithError` and restores the full budget, and so
  does switching conversations (`resetChatState`), so the state never follows
  the user somewhere it doesn't apply.
- Note the retry appends a fresh pair of messages rather than replacing the
  failed reply, and the failed prompt is re-sent with the current
  `previousInteractionId` (unchanged, since the failed call returned none).

## Demo mode

The app ships in demo mode: `IS_DEMO_MODE` in `UserPreferencesContext.tsx`
(read into `preferences.isDemoMode`). It replaces the live API with a
scripted walkthrough so the whole app can be demonstrated — and e2e tested —
with no API key and no network.

What changes when it's on:

- **Responses:** `generateDemoResponse(prompt, persona, previousInteractionId)`
  instead of `generateResponse`. It maps the prompt to a `DemoScript`
  (`main`, `mainFollowUp`, `surprise`, `vegetarian`, `fiveIngredient`,
  `fridge`) and returns that script's `.txt` fixture **in the active
  persona's voice** — 6 scripts × 3 personas = 18 files under `src/demo/`.
  An unrecognised prompt falls back to `main` rather than leaving the chef
  silent. The 600 ms delay matches the mock path so the thinking bubble is
  still visible. `previousInteractionId` is passed straight through, keeping
  the surrounding plumbing identical.
- **The composer is read-only and pinned to the script.**
  `getDemoPrompt(messages)` derives the next line from the conversation so
  far: the main prompt when empty, the follow-up after the main prompt, then
  `""` (composer empty and locked — a conversation started from a chip ends
  after its one exchange). It is *derived on every render* rather than synced
  into `userPrompt`, because submits, retries and conversation switches all
  clear `userPrompt` out from under it. The input uses `readOnly`, not
  `disabled`, so it can still focus and fire Enter-to-send.
- **The settings modal opens on load**, so the persona picker is the first
  thing a viewer sees.
- Fixture imports are written out one by one: Vite's `?raw` needs literal
  paths, and the folder/file naming isn't uniform (`tvShow` vs the `tv-host`
  persona id; `_tvshow` vs `_Pirate`).

Turning it off (`IS_DEMO_MODE = false`) restores the live Gemini path — which
needs an API key in `ChatUtils.ts`, currently an empty string — and frees the
composer. Note the e2e suite assumes demo mode is on.

## Testing

Two layers, deliberately separated by config: Vitest owns `src/**`,
Playwright owns `tests/**`. `vitest.config.ts` exists to narrow the include
glob — the default would match the Playwright specs and fail on their
`@playwright/test` import.

- **Unit (`npm run test:unit`, or `npm test` to watch):** 20 tests in
  `src/components/chat/parseRecipe.test.ts`, covering
  `parseRecipeSegments`, `isRecipeContent` and `extractRecipeTitle`. Read
  them as executable examples of the prompt ↔ parser contract — each one
  documents an input shape the parser accepts.
- **E2E (`npm run test:e2e`; `:ui` to debug, `:report` for the last HTML
  report):** 35 tests across `chat-home`, `fridge`, `settings-modal` and
  `sidebar` specs. Playwright starts the Vite dev server itself on a pinned
  port (`--strictPort` so it can't drift to 5174, `localhost` rather than an
  IP because `crypto.randomUUID()` needs a secure context). Runs on Chromium
  **and WebKit** — the app carries Safari-specific workarounds (`h-dvh`, 16px
  inputs to stop iOS zoom, the modal portal that dodges `transform`
  containing blocks) that earn WebKit its runtime.

Conventions in the specs:

- **Demo mode is the fixture.** With no network the replies are exactly the
  `src/demo` fixtures, so assertions can name real dish titles. Those titles
  are declared as constants at the top of a spec — they are the fixtures'
  `##` headings, and each script has a distinct dish name, which is what
  makes them usable as assertions at all.
- **No hardcoded strings.** Specs import copy from `src/content.ts`, prompts
  from `src/demo/DemoUserPrompts.ts` and `src/chat/prompts.ts`, and test ids
  from `src/testIds.ts`.
- **`src/testIds.ts`** holds the handful of `data-testid`s (ingredient card,
  modal overlay, sidebar, chat mode selector) for spots where a role or text
  selector would be ambiguous or brittle. Everything else is located by role,
  text or placeholder. One place to rename them, and a typo is a type error
  instead of a selector that silently never matches.
- **`tests/helpers.ts`** holds shared locators and setup. `gotoApp` loads the
  page and dismisses the settings modal — demo mode opens it on every load
  and its `fixed inset-0` overlay swallows any click made first, so every
  spec that isn't about the modal must close it. `sendScriptedPrompt` clicks
  Send and waits for the thinking bubble to *disappear*; the reply lands
  after a fixed 600 ms, too tight a margin to assert the bubble was ever on
  screen.

## Gotchas for future changes

- **Prompt and parser must move together.** Changing marker syntax in
  `format_prompt.txt` (tags, metadata field names, pro/con prefixes) breaks
  `parseRecipe.ts` and `escapeSentimentPrefixes`, and vice versa. Update
  both, plus the mock response, the demo fixtures, and the tests.
- The parser is tolerant by design — prefer widening a regex over demanding
  stricter model output; the model will not reliably comply.
- Section tags are matched case-insensitively and only special-cased for
  `ingredients`, `steps`, and `ending comment`; new tags render flat until
  you add handling in both `parseRecipeSegments` and `ChefMarkdown`.
- **Copy edits are contract edits.** A `SUGGESTION_*_PROMPT` string is
  matched exactly by `getScriptForPrompt`, and the e2e specs assert against
  `content.ts` constants. Changing wording is safe; changing a *prompt*
  constant means updating the demo mapping too.
- **All state is in memory.** Personas, conversations and the fridge reset on
  reload; there is no persistence layer to keep in sync.
- Adding a persona touches five places: `Persona`, `RoleEnum`, `personas[]`,
  `personaPrompts`, and a `src/demo/<persona>/` fixture folder. TypeScript's
  exhaustive switches will point at the first three.
