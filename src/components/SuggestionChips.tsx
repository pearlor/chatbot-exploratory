import { FRIDGE_PROMPT } from "../chat/prompts";
import {
  SUGGESTION_FIVE_INGREDIENT_LABEL,
  SUGGESTION_FIVE_INGREDIENT_PROMPT,
  SUGGESTION_FIVE_INGREDIENT_TOOLTIP,
  SUGGESTION_FRIDGE_LABEL,
  SUGGESTION_FRIDGE_TOOLTIP,
  SUGGESTION_SURPRISE_LABEL,
  SUGGESTION_SURPRISE_PROMPT,
  SUGGESTION_SURPRISE_TOOLTIP,
  SUGGESTION_VEGETARIAN_LABEL,
  SUGGESTION_VEGETARIAN_PROMPT,
  SUGGESTION_VEGETARIAN_TOOLTIP,
} from "../content";
import Tooltip from "./Tooltip";

const suggestions = [
  {
    emoji: "✨",
    label: SUGGESTION_SURPRISE_LABEL,
    prompt: SUGGESTION_SURPRISE_PROMPT,
    tooltip: SUGGESTION_SURPRISE_TOOLTIP,
  },
  {
    emoji: "🌿",
    label: SUGGESTION_VEGETARIAN_LABEL,
    prompt: SUGGESTION_VEGETARIAN_PROMPT,
    tooltip: SUGGESTION_VEGETARIAN_TOOLTIP,
  },
  {
    emoji: "5️⃣",
    label: SUGGESTION_FIVE_INGREDIENT_LABEL,
    prompt: SUGGESTION_FIVE_INGREDIENT_PROMPT,
    tooltip: SUGGESTION_FIVE_INGREDIENT_TOOLTIP,
  },
  {
    emoji: "🧊",
    label: SUGGESTION_FRIDGE_LABEL,
    prompt: FRIDGE_PROMPT,
    tooltip: SUGGESTION_FRIDGE_TOOLTIP,
  },
];

export default function SuggestionChips({
  onSelect,
}: {
  onSelect: (prompt: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2 justify-center">
      {suggestions.map((suggestion) => (
        <Tooltip content={suggestion.tooltip} side="top">
          <button
            key={suggestion.label}
            onClick={() => onSelect(suggestion.prompt)}
            className="flex items-center gap-2 rounded-full border border-border bg-white px-4 py-2 text-sm text-ink hover:bg-black/[0.03] transition-colors"
          >
            <span className="text-muted">{suggestion.emoji}</span>
            {suggestion.label}
          </button>
        </Tooltip>
      ))}
    </div>
  );
}
