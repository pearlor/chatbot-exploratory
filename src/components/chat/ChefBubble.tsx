export default function ChefBubble({ content }: { content: string }) {
  return (
    <div className="flex flex-col items-start gap-2">
      {/* Avatar + label */}
      <div className="flex items-center gap-2 pl-1">
        <div className="w-8 h-8 rounded-full bg-terracotta-soft flex items-center justify-center text-sm text-terracotta">
          🧑‍🍳
        </div>
        <span className="text-sm text-muted">Chef Masto</span>
      </div>

      <div className="max-w-[75%] rounded-2xl border border-border bg-cream px-5 py-4 text-ink">
        {content}
      </div>
    </div>
  );
}
