import { useState } from "react";
import type { RoleEnum } from "../../chat/types";
import ChefMarkdown from "./ChefMarkdown";
import { extractRecipeIngredients, isRecipeContent } from "./parseRecipe";
import { personas } from "../../chat/types";
import { CHEF_FALLBACK_NAME, UPDATE_FRIDGE_BUTTON_LABEL } from "../../content";
import { CHEF_ICON } from "../../assets/icons";
import UpdateFridgeModal from "../UpdateFridgeModal";
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
  const [isUpdatingFridge, setIsUpdatingFridge] = useState(false);
  // Recipe cards go full width so ingredients/steps can sit side by side;
  // @container enables the column switch to track the bubble's own width.
  const isRecipe = isRecipeContent(content);
  const recipeIngredients = isRecipe ? extractRecipeIngredients(content) : [];

  const persona = personas.find((p) => p.id === role);

  return (
    <div className="flex flex-col items-start gap-2">
      {/* Avatar + label */}
      <div className="flex items-center gap-2 pl-1">
        <div className="w-8 h-8 rounded-full bg-terracotta-soft flex items-center justify-center text-sm text-terracotta">
          {persona?.emoji || CHEF_ICON}
        </div>
        <span className="text-sm text-muted">
          {persona?.name || CHEF_FALLBACK_NAME}
        </span>
      </div>

      <div
        className={`rounded-2xl border border-border bg-cream px-5 py-4 text-ink ${
          isRecipe ? "@container w-full" : "max-w-[90%] sm:max-w-[75%]"
        }`}
      >
        <ChefMarkdown content={content} />
      </div>

      {recipeIngredients.length > 0 && (
        <button
          onClick={() => setIsUpdatingFridge(true)}
          className="rounded-xl border border-terracotta bg-terracotta-soft px-4 py-2 text-sm font-medium text-terracotta transition hover:bg-terracotta/10"
        >
          {UPDATE_FRIDGE_BUTTON_LABEL}
        </button>
      )}

      {isUpdatingFridge && (
        <UpdateFridgeModal
          recipeIngredients={recipeIngredients}
          onClose={() => setIsUpdatingFridge(false)}
        />
      )}
    </div>
  );
}
