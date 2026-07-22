# Codebase Context

A chat app where users talk to "Chef Masto," an AI chef persona. Recipe
responses render as rich cards (metadata pills, side-by-side
ingredients/steps, an ending callout) instead of plain markdown.

**Stack:** React 19 + TypeScript + Vite, Tailwind CSS v4, `react-markdown`,
`@google/genai` (Gemini), Vitest for unit tests, Playwright configured for
e2e.

## Directory map

```
src/
├── chat/                     # AI side (no React)
│   ├── ChatUtils.ts          # generateResponse(): calls Gemini or the mock
│   ├── types.ts              # ChatMessage / ChatRole
│   ├── prompts/              # System prompt halves (imported as ?raw text)
│   │   ├── format_prompt.txt         # Output-format contract (see below)
│   │   ├── pirate_chef_prompt.txt    # Active persona
│   │   ├── food_tv_host_prompt.txt   # Alternate persona
│   │   └── culinary_teacher_prompt.txt
│   └── mock/example_response.md      # Canned recipe reply for useMock
├── components/
│   ├── chat/                 # Message rendering
│   │   ├── ChatHistory.tsx   # Maps messages to bubbles
│   │   ├── UserBubble.tsx / ChefBubble.tsx / ThinkingBubble.tsx
│   │   ├── parseRecipe.ts    # ★ The parser (see "Parsing logic")
│   │   ├── parseRecipe.test.ts
│   │   ├── ChefMarkdown.tsx  # Segments → react-markdown UI
│   │   ├── RecipePills.tsx   # Time / Difficulty / Serves chips
│   │   └── ChefCallout.tsx   # Dark-green ending-comment box
│   ├── Composer.tsx / ChatInput.tsx / SuggestionChips.tsx / Button.tsx
├── sections/ChatHome.tsx     # Chat state: messages, loading, interaction id
├── sidebar/Sidebar.tsx
└── index.css                 # Tailwind theme tokens (terracotta, cream, forest…)
```

## Data flow

```
ChatHome.handleSubmit
  └─► generateResponse(prompt, previousInteractionId [, useMock])
        └─► Gemini with system_instruction = format_prompt + persona prompt
              └─► markdown reply stored as a ChatMessage (role "chef")
                    └─► ChefBubble
                          ├─► isRecipeContent()  → full-width card or 75% bubble
                          └─► ChefMarkdown
                                └─► parseRecipeSegments() → pills / columns /
                                    callout / markdown segments → rendered
```

Conversation continuity is the `previousInteractionId` returned by each call
and passed back on the next one — there is no local transcript re-sending.

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
- **The persona prompt** (pirate chef, TV host, teacher) controls _voice
  only_. Swap personas by changing one import in `ChatUtils.ts`; the parser
  is unaffected because structure and personality are decoupled.

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

**Escape hatch:** no metadata _and_ no tagged sections → the entire reply is
returned as a single `markdown` segment (normal chat answer).

`parseRecipe.test.ts` (17 tests) documents the accepted input shapes — read
it as executable examples of the contract. Run with `npx vitest run`.

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

## Working without the API

`generateResponse(prompt, id, /* useMock */ true)` skips Gemini and returns
`src/chat/mock/example_response.md` after a 600 ms delay (so the thinking
bubble is visible). The mock file is a full contract-compliant recipe —
useful for UI work and as a reference for what the model output looks like.

## Gotchas for future changes

- **Prompt and parser must move together.** Changing marker syntax in
  `format_prompt.txt` (tags, metadata field names, pro/con prefixes) breaks
  `parseRecipe.ts` and `escapeSentimentPrefixes`, and vice versa. Update
  both, plus the mock response and the tests.
- The parser is tolerant by design — prefer widening a regex over demanding
  stricter model output; the model will not reliably comply.
- Section tags are matched case-insensitively and only special-cased for
  `ingredients`, `steps`, and `ending comment`; new tags render flat until
  you add handling in both `parseRecipeSegments` and `ChefMarkdown`.
