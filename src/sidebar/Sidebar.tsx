import Button from "../components/Button";

const recentCreations = [
  "Risotto alla Milanese",
  "Duck Confit",
  "Classic Beef Tartare",
  "Lemon Soufflé",
];

export default function Sidebar() {
  return (
    <div className="w-[260px] shrink-0 h-screen bg-sidebar border-r border-border flex flex-col px-4 py-5 gap-5">
      {/* Brand header */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-terracotta text-white flex items-center justify-center text-lg">
          🍳
        </div>
        <h2 className="font-serif text-xl font-bold text-ink">Recipe Helper</h2>
      </div>

      {/* Primary actions */}
      <section className="flex flex-col gap-3">
        <button
          onClick={() => {}}
          className="flex items-center justify-between border border-border rounded-xl px-3 py-2.5 bg-white/60 text-sm text-ink hover:bg-white transition-colors"
        >
          <span className="flex items-center gap-2">
            <span>🧊</span>
            Your Fridge
          </span>
          <span className="text-muted">›</span>
        </button>

        <Button
          onClick={() => {}}
          label="＋  New Conversation"
          className="w-full bg-terracotta text-white rounded-xl px-3 py-2.5 text-sm font-medium flex items-center justify-center gap-2 hover:brightness-95 transition"
        />
      </section>

      {/* Recent creations */}
      <section className="flex flex-col gap-1">
        <h3 className="text-xs font-semibold tracking-wider text-muted uppercase px-2 mb-1">
          Recent Creations
        </h3>
        <ul className="flex flex-col">
          {recentCreations.map((recipe) => (
            <li
              key={recipe}
              className="text-sm text-ink/80 py-1.5 px-2 rounded-lg hover:bg-black/5 cursor-pointer transition-colors"
            >
              {recipe}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
