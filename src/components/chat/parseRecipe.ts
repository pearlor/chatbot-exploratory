// Parses chef AI markdown into ordered segments so recipe responses can get
// special treatment (metadata pills, side-by-side ingredients/steps, ending
// callout) while everything else renders as plain markdown.
//
// The system prompt (src/chat/prompts/format_prompt.txt) makes recipes start
// with a bullet metadata block (- **Time:** … / - **Difficulty:** … /
// - **Serves:** …) and tags key sections with bracket markers that carry a
// personalized display title, e.g. `### [Ingredients] The Canvas`. The bracket
// tags are parse markers only and are never rendered.

export type RecipeMeta = {
  time?: string;
  difficulty?: string;
  serves?: string;
};

export type Segment =
  | { kind: "markdown"; text: string }
  | { kind: "pills"; meta: RecipeMeta }
  | { kind: "columns"; ingredients: string; steps: string }
  | { kind: "callout"; title: string; body: string };

// Matches a metadata line in the forms the model actually produces:
// `- **Time:** 90 minutes`, `**Time**: 90 minutes`, `Time: 90 minutes`,
// with any bullet marker (or none) and any field order. A colon is required
// so prose lines that merely start with a field name don't match.
const META_LINE =
  /^\s*(?:[*+-]\s+)?(?:\*\*)?(Time|Difficulty|Serves)(?::\s*\*\*|\*\*\s*:|:)\s*(.*\S)\s*$/i;

// Matches the bracket tag at the start of a `###` heading's text.
const SECTION_TAG = /^\[\s*(Ingredients|Steps|Ending comment)\s*\]\s*(.*)$/i;

// A tagged heading anywhere in the document also marks a recipe, so tag
// stripping and columns still work when the model skips the metadata block.
const TAGGED_HEADING = /^###\s*\[\s*(Ingredients|Steps|Ending comment)\s*\]/im;

/** True when the content carries the recipe metadata block or tagged
 *  sections. ChefBubble uses this to switch to a full-width recipe card. */
export function isRecipeContent(markdown: string): boolean {
  return (
    markdown.split("\n").some((line) => META_LINE.test(line)) ||
    TAGGED_HEADING.test(markdown)
  );
}

type MetaSplit = { meta: RecipeMeta | null; before: string; after: string };

// Pull the metadata bullets out of the document. `before` keeps everything
// above the first metadata line (greeting + ## title) so the pill row lands
// exactly where the bullets were.
function extractMeta(markdown: string): MetaSplit {
  const lines = markdown.split("\n");
  const meta: RecipeMeta = {};
  let firstMetaIndex = -1;
  const kept: string[] = [];

  for (const line of lines) {
    const match = line.match(META_LINE);
    if (!match) {
      kept.push(line);
      continue;
    }
    if (firstMetaIndex === -1) firstMetaIndex = kept.length;
    const key = match[1].toLowerCase() as keyof RecipeMeta;
    meta[key] ??= match[2];
  }

  if (firstMetaIndex === -1) {
    return { meta: null, before: markdown, after: "" };
  }
  return {
    meta,
    before: kept.slice(0, firstMetaIndex).join("\n"),
    after: kept.slice(firstMetaIndex).join("\n"),
  };
}

type Section = { tag: string | null; title: string; body: string };

// Split on `### ` headings; the chunk before the first heading gets tag null
// and an empty title.
function splitSections(markdown: string): Section[] {
  const sections: Section[] = [];
  let current: Section = { tag: null, title: "", body: "" };
  let hasContent = false;

  for (const line of markdown.split("\n")) {
    const heading = line.match(/^###\s+(.*)$/);
    if (heading && !heading[1].startsWith("#")) {
      if (hasContent || current.title) sections.push(current);
      const tagMatch = heading[1].match(SECTION_TAG);
      current = tagMatch
        ? { tag: tagMatch[1].toLowerCase(), title: tagMatch[2], body: "" }
        : { tag: null, title: heading[1], body: "" };
      hasContent = true;
      continue;
    }
    current.body += (current.body ? "\n" : "") + line;
    hasContent ||= line.trim() !== "";
  }
  if (hasContent || current.title) sections.push(current);
  return sections;
}

function sectionToMarkdown(section: Section): string {
  const heading = section.title ? `### ${section.title}\n` : "";
  return heading + section.body;
}

function pushMarkdown(segments: Segment[], text: string) {
  if (!text.trim()) return;
  const last = segments[segments.length - 1];
  if (last?.kind === "markdown") {
    last.text += "\n" + text;
  } else {
    segments.push({ kind: "markdown", text });
  }
}

// The `##` dish title line; `(?!#)` keeps `###` section headings from matching.
const TITLE_LINE = /^##(?!#).*$/m;

export function parseRecipeSegments(markdown: string): Segment[] {
  const { meta, before, after } = extractMeta(markdown);

  // Pills always render directly under the ## dish title, wherever the model
  // put the metadata lines. Without a title they stay at the metadata's spot.
  let head = before;
  let tail = after;
  if (meta) {
    const rest = [before, after].filter((part) => part.trim()).join("\n");
    const title = rest.match(TITLE_LINE);
    if (title?.index !== undefined) {
      const cut = title.index + title[0].length;
      head = rest.slice(0, cut);
      tail = rest.slice(cut);
    }
  }

  const sections = splitSections(meta ? tail : markdown);
  const hasTaggedSection = sections.some((section) => section.tag !== null);
  if (!meta && !hasTaggedSection) {
    return [{ kind: "markdown", text: markdown }];
  }

  const segments: Segment[] = [];
  if (meta) {
    pushMarkdown(segments, head);
    segments.push({ kind: "pills", meta });
  }

  const ingredients = sections.find((s) => s.tag === "ingredients");
  const steps = sections.find((s) => s.tag === "steps");
  const pairFound = Boolean(ingredients && steps);

  for (const section of sections) {
    if (pairFound && section === ingredients) {
      // The grid is emitted at the ingredients section's position; the steps
      // section is skipped when reached.
      segments.push({
        kind: "columns",
        ingredients: sectionToMarkdown(ingredients),
        steps: sectionToMarkdown(steps!),
      });
    } else if (pairFound && section === steps) {
      continue;
    } else if (section.tag === "ending comment") {
      segments.push({ kind: "callout", title: section.title, body: section.body });
    } else {
      // Untagged sections — and a solo [Ingredients]/[Steps] without its
      // partner — render flat, with any bracket tag already stripped.
      pushMarkdown(segments, sectionToMarkdown(section));
    }
  }
  return segments;
}
