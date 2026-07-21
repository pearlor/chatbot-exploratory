const suggestions = [
  { emoji: "✨", label: "Surprise me" },
  { emoji: "🌿", label: "Vegetarian options" },
  { emoji: "5️⃣", label: "5-ingredient meals" },
  { emoji: "🧊", label: "From my fridge" },
];

export default function SuggestionChips() {
  return (
    <div className="flex flex-wrap gap-2 justify-center">
      {suggestions.map((suggestion) => (
        <button
          key={suggestion.label}
          className="flex items-center gap-2 rounded-full border border-border bg-white px-4 py-2 text-sm text-ink hover:bg-black/[0.03] transition-colors"
        >
          <span className="text-muted">{suggestion.emoji}</span>
          {suggestion.label}
        </button>
      ))}
    </div>
  );
}
