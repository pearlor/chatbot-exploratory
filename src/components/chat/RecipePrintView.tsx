import { createPortal } from "react-dom";
import ChefMarkdown from "./ChefMarkdown";
import { stripRecipeGreeting } from "./parseRecipe";
import { TEST_IDS } from "../../testIds";

/**
 * The recipe card as it appears in a saved PDF: the same ChefMarkdown card
 * without the avatar, buttons, or greeting. It is portaled next to #root and
 * hidden on screen; the print styles in index.css hide #root instead, so only
 * this card is printed.
 */
export default function RecipePrintView({ content }: { content: string }) {
  return createPortal(
    <div
      data-print-view
      data-testid={TEST_IDS.recipePrintView}
      className="@container hidden rounded-2xl border border-border bg-cream px-5 py-4 text-ink print:block"
    >
      <ChefMarkdown content={stripRecipeGreeting(content)} />
    </div>,
    document.body,
  );
}
