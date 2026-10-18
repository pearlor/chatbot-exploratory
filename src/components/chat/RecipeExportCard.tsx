import type { Ref } from "react";
import ChefMarkdown from "./ChefMarkdown";
import { stripRecipeGreeting } from "./parseRecipe";

/**
 * The recipe card as it appears in an exported PDF or PNG: the same
 * ChefMarkdown card as the chat, without the avatar, buttons, or greeting.
 * `ref` points at the card itself, which is what the PNG export captures.
 */
export default function RecipeExportCard({
  content,
  ref,
}: {
  content: string;
  ref?: Ref<HTMLDivElement>;
}) {
  return (
    <div
      ref={ref}
      className="@container rounded-2xl border border-border bg-cream px-5 py-4 text-ink"
    >
      <ChefMarkdown content={stripRecipeGreeting(content)} />
    </div>
  );
}
