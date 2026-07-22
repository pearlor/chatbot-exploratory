import type { RecipeMeta } from "./parseRecipe";

/** A single rounded icon+label chip; `accent` gets the terracotta tint. */
function Pill({
  icon,
  label,
  tone,
}: {
  icon: string;
  label: string;
  tone: "neutral" | "accent";
}) {
  const tones =
    tone === "accent"
      ? "bg-terracotta-soft text-terracotta"
      : "bg-sidebar text-muted";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium ${tones}`}
    >
      <span aria-hidden>{icon}</span>
      {label}
    </span>
  );
}

/**
 * The row of time / difficulty / serves pills shown under the dish title.
 * Each pill renders only when its metadata field was present.
 */
export default function RecipePills({ meta }: { meta: RecipeMeta }) {
  return (
    <div className="mb-4 flex flex-wrap gap-2">
      {meta.time && <Pill icon="⏰" label={meta.time} tone="neutral" />}
      {meta.difficulty && (
        <Pill icon="🔥" label={`${meta.difficulty} Difficulty`} tone="accent" />
      )}
      {meta.serves && (
        <Pill icon="🍽️" label={`Serves ${meta.serves}`} tone="neutral" />
      )}
    </div>
  );
}
