import { useCallback, useEffect, useState } from "react";
import type { ChatMessage } from "../../chat/types";
import ChefMarkdown from "./ChefMarkdown";
import {
  extractRecipeIngredients,
  extractRecipeTitle,
  isRecipeContent,
} from "./parseRecipe";
import RecipePrintView from "./RecipePrintView";
import RecipeImageRenderer from "./RecipeImageRenderer";
import { ChatFollowUpOption, personas } from "../../chat/types";
import {
  CHEF_FALLBACK_NAME,
  EXPORT_MENU_LABEL,
  EXPORT_PDF_LABEL,
  EXPORT_PNG_LABEL,
  UPDATE_FRIDGE_BUTTON_LABEL,
  UPDATE_FRIDGE_DONE_TOOLTIP,
} from "../../content";
import { CHEF_ICON } from "../../assets/icons";
import DropdownMenu from "../DropdownMenu";
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
  const [isPrinting, setIsPrinting] = useState(false);
  const [isSavingImage, setIsSavingImage] = useState(false);
  // Stable, so RecipeImageRenderer's effect doesn't re-run on every render.
  const finishSavingImage = useCallback(() => setIsSavingImage(false), []);
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

  // Runs once RecipePrintView is on the page. The browser suggests the page
  // title as the PDF's file name, so it is swapped for the dish name while
  // the print dialog is open.
  useEffect(() => {
    if (!isPrinting) return;

    const previousTitle = document.title;
    document.title = extractRecipeTitle(content) ?? previousTitle;

    const finishPrinting = () => {
      document.title = previousTitle;
      setIsPrinting(false);
    };
    window.addEventListener("afterprint", finishPrinting);
    window.print();

    return () => {
      window.removeEventListener("afterprint", finishPrinting);
      document.title = previousTitle;
    };
  }, [isPrinting, content]);

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

      <div className="flex flex-wrap gap-2">
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

        {isRecipe && (
          <DropdownMenu
            label={EXPORT_MENU_LABEL}
            items={[
              { label: EXPORT_PDF_LABEL, onSelect: () => setIsPrinting(true) },
              {
                label: EXPORT_PNG_LABEL,
                onSelect: () => setIsSavingImage(true),
                // One image at a time, so a double click can't save twice.
                disabled: isSavingImage,
              },
            ]}
          />
        )}
      </div>

      {isPrinting && <RecipePrintView content={content} />}
      {isSavingImage && (
        <RecipeImageRenderer content={content} onDone={finishSavingImage} />
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
