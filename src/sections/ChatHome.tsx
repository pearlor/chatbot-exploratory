export default function ChatHome() {
  return (
    <div className="h-full flex flex-col items-center pt-24 gap-4">
      <div className="w-16 h-16 rounded-full bg-terracotta-soft flex items-center justify-center text-3xl text-terracotta">
        🧑‍🍳
      </div>
      <p className="font-serif italic text-lg text-muted">
        The kitchen is open. What shall we prepare today?
      </p>
    </div>
  );
}
