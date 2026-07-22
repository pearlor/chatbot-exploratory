import { Children, isValidElement, type ReactNode } from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import ChefCallout from "./ChefCallout";
import RecipePills from "./RecipePills";
import { parseRecipeSegments } from "./parseRecipe";

// CommonMark treats `+` and `-` as list markers, so a line like `* + text`
// parses as a NESTED list and the pro/con prefix never reaches the <li> text.
// Backslash-escaping the second marker (`* \+ text`) makes it survive as
// literal text that the custom list item below can detect and strip.
function escapeSentimentPrefixes(markdown: string): string {
  return markdown.replace(/^(\s*[*+-] )([+-])(?= )/gm, "$1\\$2");
}

function SentimentBullet({ kind }: { kind: "pro" | "con" }) {
  const colors =
    kind === "pro" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700";
  return (
    <span
      aria-hidden
      className={`mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${colors}`}
    >
      {kind === "pro" ? "+" : "−"}
    </span>
  );
}

function ChefListItem({ children }: { children?: ReactNode }) {
  let items = Children.toArray(children);

  // Loose lists (blank lines between items) wrap content in a <p>; unwrap it
  // so the prefix check below still sees the leading text.
  const first = items[0];
  if (items.length === 1 && isValidElement(first) && first.type === "p") {
    items = Children.toArray(
      (first.props as { children?: ReactNode }).children,
    );
  }

  const lead = items[0];
  if (typeof lead === "string" && /^[+-] /.test(lead)) {
    const kind = lead.startsWith("+") ? "pro" : "con";
    return (
      <li className="-ml-5 flex list-none items-start gap-2">
        <SentimentBullet kind={kind} />
        <span>
          {lead.slice(2)}
          {items.slice(1)}
        </span>
      </li>
    );
  }

  return <li>{children}</li>;
}

// Tailwind preflight unstyles headings, lists, and rules, so each element
// gets explicit classes here.
const components: Components = {
  h2: ({ children }) => (
    <h2 className="mt-4 mb-2 text-xl font-bold text-terracotta first:mt-0">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="mt-4 mb-2 text-lg font-semibold text-terracotta first:mt-0">
      {children}
    </h3>
  ),
  p: ({ children }) => (
    <p className="my-2 leading-relaxed first:mt-0 last:mb-0">{children}</p>
  ),
  ol: ({ children }) => (
    <ol className="my-2 list-decimal space-y-1 pl-5 marker:font-semibold marker:text-terracotta">
      {children}
    </ol>
  ),
  ul: ({ children }) => (
    <ul className="my-2 list-disc space-y-1 pl-5">{children}</ul>
  ),
  li: ChefListItem,
  hr: () => <hr className="my-4 border-border" />,
};

// Column sections use small uppercase letterspaced labels instead of the
// terracotta h3, matching the recipe-card design.
const columnHeadingOverride: Components = {
  h3: ({ children }) => (
    <h3 className="mt-0 mb-3 text-sm font-bold uppercase tracking-widest text-muted">
      {children}
    </h3>
  ),
};

// Steps column additionally gets large serif italic terracotta numerals.
const stepsOverrides: Components = {
  ...columnHeadingOverride,
  ol: ({ children }) => (
    <ol className="my-2 list-decimal space-y-3 pl-6 marker:font-serif marker:text-lg marker:italic marker:text-terracotta">
      {children}
    </ol>
  ),
};

function Markdown({
  text,
  overrides,
}: {
  text: string;
  overrides?: Components;
}) {
  return (
    <ReactMarkdown components={{ ...components, ...overrides }}>
      {escapeSentimentPrefixes(text)}
    </ReactMarkdown>
  );
}

export default function ChefMarkdown({ content }: { content: string }) {
  const segments = parseRecipeSegments(content);
  return (
    <>
      {segments.map((segment, index) => {
        switch (segment.kind) {
          case "pills":
            return <RecipePills key={index} meta={segment.meta} />;
          case "columns":
            return (
              <div
                key={index}
                className="my-4 grid gap-x-8 gap-y-4 @lg:grid-cols-[2fr_3fr]"
              >
                <div className="min-w-0">
                  <Markdown
                    text={segment.ingredients}
                    overrides={columnHeadingOverride}
                  />
                </div>
                <div className="min-w-0">
                  <Markdown text={segment.steps} overrides={stepsOverrides} />
                </div>
              </div>
            );
          case "callout":
            return (
              <ChefCallout key={index} title={segment.title}>
                <Markdown text={segment.body} />
              </ChefCallout>
            );
          default:
            return <Markdown key={index} text={segment.text} />;
        }
      })}
    </>
  );
}
