import type { RoleEnum } from "../../chat/types";
import ChefMarkdown from "./ChefMarkdown";
import { isRecipeContent } from "./parseRecipe";
import { personas } from "../../chat/types";
/**
 * A chat bubble for a chef response: avatar + label above the rendered
 * markdown. Recipe content widens the bubble into a full-width card.
 */
export default function ChefBubble({
  content,
  role,
}: {
  content: string;
  role: RoleEnum;
}) {
  // Recipe cards go full width so ingredients/steps can sit side by side;
  // @container enables the column switch to track the bubble's own width.
  const isRecipe = isRecipeContent(content);

  const persona = personas.find((p) => p.id === role);

  return (
    <div className="flex flex-col items-start gap-2">
      {/* Avatar + label */}
      <div className="flex items-center gap-2 pl-1">
        <div className="w-8 h-8 rounded-full bg-terracotta-soft flex items-center justify-center text-sm text-terracotta">
          {persona?.emoji || "🧑‍🍳"}
        </div>
        <span className="text-sm text-muted">
          {persona?.name || "Chef Masto"}
        </span>
      </div>

      <div
        className={`rounded-2xl border border-border bg-cream px-5 py-4 text-ink ${
          isRecipe ? "@container w-full" : "max-w-[75%]"
        }`}
      >
        <ChefMarkdown content={content} />
      </div>
    </div>
  );
}
