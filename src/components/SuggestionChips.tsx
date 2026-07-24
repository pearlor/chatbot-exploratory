import { FRIDGE_PROMPT } from "../chat/prompts";
import {
  SUGGESTION_FIVE_INGREDIENT_LABEL,
  SUGGESTION_FIVE_INGREDIENT_PROMPT,
  SUGGESTION_FRIDGE_LABEL,
  SUGGESTION_SURPRISE_LABEL,
  SUGGESTION_SURPRISE_PROMPT,
  SUGGESTION_VEGETARIAN_LABEL,
  SUGGESTION_VEGETARIAN_PROMPT,
} from "../content";

const suggestions = [
  {
    emoji: "✨",
    label: SUGGESTION_SURPRISE_LABEL,
    prompt: SUGGESTION_SURPRISE_PROMPT,
  },
  {
    emoji: "🌿",
    label: SUGGESTION_VEGETARIAN_LABEL,
    prompt: SUGGESTION_VEGETARIAN_PROMPT,
  },
  {
    emoji: "5️⃣",
    label: SUGGESTION_FIVE_INGREDIENT_LABEL,
    prompt: SUGGESTION_FIVE_INGREDIENT_PROMPT,
  },
  {
    emoji: "🧊",
    label: SUGGESTION_FRIDGE_LABEL,
    prompt: FRIDGE_PROMPT,
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
        <button
          key={suggestion.label}
          onClick={() => onSelect(suggestion.prompt)}
          className="flex items-center gap-2 rounded-full border border-border bg-white px-4 py-2 text-sm text-ink hover:bg-black/[0.03] transition-colors"
        >
          <span className="text-muted">{suggestion.emoji}</span>
          {suggestion.label}
        </button>
      ))}
    </div>
  );
}
