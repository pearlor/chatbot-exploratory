export default function ChatInput({
  userPrompt,
  setUserPrompt,
  handleSubmit,
  isLoading,
}: {
  userPrompt: string;
  setUserPrompt: (prompt: string) => void;
  handleSubmit: () => void;
  isLoading: boolean;
}) {
  return (
    <div className="flex items-center gap-2 rounded-2xl border border-border bg-white px-3 py-2 shadow-sm">
      {/* "Ask" selector (stub — no dropdown yet) */}
      <button className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-sm text-muted hover:bg-black/[0.03] transition-colors shrink-0">
        <span>🍳</span>
        Ask
        <span className="text-xs">⌄</span>
      </button>

      <input
        type="text"
        placeholder="Ask the Chef for a recipe, technique, or pairing…"
        className="flex-1 min-w-0 bg-transparent outline-none text-sm text-ink placeholder:text-muted"
        value={userPrompt}
        onChange={(e) => setUserPrompt(e.target.value)}
      />

      {/* Send button (stub — no handler yet) */}
      <button
        className="w-9 h-9 rounded-full bg-terracotta text-white flex items-center justify-center shrink-0 hover:brightness-95 transition"
        onClick={handleSubmit}
        disabled={isLoading}
      >
        ➤
      </button>
    </div>
  );
}
