import {
  FIVE_ICON,
  FridgeIcon,
  SALAD_ICON,
  SPARKLE_ICON,
} from "../assets/icons";
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
    emoji: SPARKLE_ICON,
    label: SUGGESTION_SURPRISE_LABEL,
    prompt: SUGGESTION_SURPRISE_PROMPT,
    tooltip: SUGGESTION_SURPRISE_TOOLTIP,
  },
  {
    emoji: SALAD_ICON,
    label: SUGGESTION_VEGETARIAN_LABEL,
    prompt: SUGGESTION_VEGETARIAN_PROMPT,
    tooltip: SUGGESTION_VEGETARIAN_TOOLTIP,
  },
  {
    emoji: FIVE_ICON,
    label: SUGGESTION_FIVE_INGREDIENT_LABEL,
    prompt: SUGGESTION_FIVE_INGREDIENT_PROMPT,
    tooltip: SUGGESTION_FIVE_INGREDIENT_TOOLTIP,
  },
  {
    emoji: <FridgeIcon />,
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
    // On phones the chips are a single scrollable row — wrapping four of them
    // would eat most of a short screen. They wrap and centre from sm up.
    <div className="flex gap-2 overflow-x-auto pb-1 sm:flex-wrap sm:justify-center sm:overflow-visible sm:pb-0">
      {suggestions.map((suggestion) => (
        <Tooltip
          key={suggestion.label}
          content={suggestion.tooltip}
          side="top"
          className="shrink-0"
        >
          <button
            onClick={() => onSelect(suggestion.prompt)}
            className={`flex items-center whitespace-nowrap ${suggestion.label === SUGGESTION_FRIDGE_LABEL ? "gap-1" : "gap-2"} rounded-full border border-border bg-white px-4 py-2.5 sm:py-2 text-sm text-ink hover:bg-black/[0.03] transition-colors`}
          >
            <span className="text-muted">{suggestion.emoji}</span>
            {suggestion.label}
          </button>
        </Tooltip>
      ))}
    </div>
  );
}
