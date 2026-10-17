import { useState } from "react";
import type { ChatMessage } from "../../chat/types";
import ChefMarkdown from "./ChefMarkdown";
import { extractRecipeIngredients, isRecipeContent } from "./parseRecipe";
import { ChatFollowUpOption, personas } from "../../chat/types";
import {
  CHEF_FALLBACK_NAME,
  UPDATE_FRIDGE_BUTTON_LABEL,
  UPDATE_FRIDGE_DONE_TOOLTIP,
} from "../../content";
import { CHEF_ICON } from "../../assets/icons";
import Tooltip from "../Tooltip";
import UpdateFridgeModal from "../UpdateFridgeModal";
/**
 * A chat bubble for a chef response: avatar + label above the rendered
 * markdown. Recipe content widens the bubble into a full-width card.
 */
export default function ChefBubble({
  message,
  setFollowUpOption,
}: {
  message: ChatMessage;
  setFollowUpOption: (
    messageId: string,
    remove: ChatFollowUpOption,
    add: ChatFollowUpOption,
  ) => void;
}) {
  const { content, role, followUpOptions } = message;
  const [isUpdatingFridge, setIsUpdatingFridge] = useState(false);
  // Recipe cards go full width so ingredients/steps can sit side by side;
  // @container enables the column switch to track the bubble's own width.
  const isRecipe = isRecipeContent(content);
  const recipeIngredients = isRecipe ? extractRecipeIngredients(content) : [];

  // Whether the response offers the fridge update is decided when the message
  // is created; here we only need to know if the user has already done it.
  const hasUpdatedFridge =
    followUpOptions?.includes(ChatFollowUpOption.UpdateFridgeDisabled) ?? false;
  const canUpdateFridge =
    followUpOptions?.includes(ChatFollowUpOption.UpdateFridgeEnabled) ?? false;

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

      {/* Once used, the button stays in place but disabled, with a tooltip
          explaining why, so the recipe's history is still visible. */}
      {canUpdateFridge && (
        <button
          onClick={() => setIsUpdatingFridge(true)}
          className="rounded-xl border border-terracotta bg-terracotta-soft px-4 py-2 text-sm font-medium text-terracotta transition hover:bg-terracotta/10"
        >
          {UPDATE_FRIDGE_BUTTON_LABEL}
        </button>
      )}
      {hasUpdatedFridge && (
        <Tooltip content={UPDATE_FRIDGE_DONE_TOOLTIP}>
          <button
            disabled
            className="cursor-not-allowed rounded-xl border border-border px-4 py-2 text-sm font-medium text-muted"
          >
            {UPDATE_FRIDGE_BUTTON_LABEL}
          </button>
        </Tooltip>
      )}

      {isUpdatingFridge && (
        <UpdateFridgeModal
          recipeIngredients={recipeIngredients}
          onSaved={() =>
            setFollowUpOption(
              message.id,
              ChatFollowUpOption.UpdateFridgeEnabled,
              ChatFollowUpOption.UpdateFridgeDisabled,
            )
          }
          onClose={() => setIsUpdatingFridge(false)}
        />
      )}
    </div>
  );
}
