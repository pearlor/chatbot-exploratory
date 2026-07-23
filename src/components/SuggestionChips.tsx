import { FRIDGE_PROMPT } from "../chat/prompts";

const suggestions = [
  {
    emoji: "✨",
    label: "Surprise me",
    prompt: "Surprise me with a recipe that I'll like",
  },
  {
    emoji: "🌿",
    label: "Vegetarian options",
    prompt: "Recommend a vegetarian dish I can make",
  },
  {
    emoji: "5️⃣",
    label: "5-ingredient meals",
    prompt: "Suggest a recipe using 5 or fewer ingredients",
  },
  {
    emoji: "🧊",
    label: "From my fridge",
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
