export default function ThinkingBubble({
  icon,
  name,
}: {
  icon: string;
  name: string;
}) {
  return (
    <div className="flex flex-col items-start gap-2">
      {/* Avatar + label */}
      <div className="flex items-center gap-2 pl-1">
        <div className="w-8 h-8 rounded-full bg-terracotta-soft flex items-center justify-center text-sm text-terracotta">
          {icon}
        </div>
        <span className="text-sm text-muted">{name}</span>
      </div>

      <div className="max-w-[75%] rounded-2xl border border-border bg-cream px-5 py-4">
        <span className="font-serif italic text-muted">Chef is thinking</span>
        <span className="ml-1 inline-flex gap-1 align-middle">
          <span className="w-1.5 h-1.5 rounded-full bg-muted animate-bounce [animation-delay:-0.3s]" />
          <span className="w-1.5 h-1.5 rounded-full bg-muted animate-bounce [animation-delay:-0.15s]" />
          <span className="w-1.5 h-1.5 rounded-full bg-muted animate-bounce" />
        </span>
      </div>
    </div>
  );
}
