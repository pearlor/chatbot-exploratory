import { useState } from "react";
import Button from "../components/Button";
import SettingsModal from "../components/SettingsModal";
import { useChatHistory } from "../context/ChatHistoryContext";
import { useNavigation } from "../context/NavigationContext";

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const { chatHistory, activeConversationId, dispatch } = useChatHistory();
  const { setView } = useNavigation();

  const settingsModal = isSettingsOpen && (
    <SettingsModal onClose={() => setIsSettingsOpen(false)} />
  );

  if (isCollapsed) {
    return (
      <div className="w-[72px] shrink-0 h-screen bg-sidebar border-r border-border flex flex-col items-center px-3 py-5 gap-4">
        {/* Brand icon */}
        <div className="w-10 h-10 rounded-xl bg-terracotta text-white flex items-center justify-center text-lg">
          🍳
        </div>

        <div className="w-8 border-t border-border" />

        {/* Primary actions */}
        <button
          onClick={() => setView("fridge")}
          title="Your Fridge"
          className="w-10 h-10 rounded-xl bg-terracotta-soft text-terracotta flex items-center justify-center text-lg hover:brightness-95 transition"
        >
          🧊
        </button>

        <button
          onClick={() => {
            setView("chat");
            dispatch({ type: "newConversation" });
          }}
          title="New Conversation"
          className="w-10 h-10 rounded-xl bg-terracotta text-white flex items-center justify-center text-lg hover:brightness-95 transition"
        >
          ＋
        </button>

        {/* Settings */}
        <button
          onClick={() => setIsSettingsOpen(true)}
          title="Your settings"
          className="mt-auto w-9 h-9 rounded-lg text-muted flex items-center justify-center hover:bg-black/5 transition-colors"
        >
          ⚙️
        </button>

        {/* Expand */}
        <button
          onClick={() => setIsCollapsed(false)}
          title="Expand sidebar"
          className="w-9 h-9 rounded-lg text-muted flex items-center justify-center hover:bg-black/5 transition-colors"
        >
          ⇥
        </button>

        {settingsModal}
      </div>
    );
  }

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
          onClick={() => setView("fridge")}
          className="flex items-center justify-between border border-border rounded-xl px-3 py-2.5 bg-white/60 text-sm text-ink hover:bg-white transition-colors"
        >
          <span className="flex items-center gap-2">
            <span>🧊</span>
            Your Fridge
          </span>
          <span className="text-muted">›</span>
        </button>

        <Button
          onClick={() => {
            setView("chat");
            dispatch({ type: "newConversation" });
          }}
          label="＋  New Conversation"
          className="w-full bg-terracotta text-white rounded-xl px-3 py-2.5 text-sm font-medium flex items-center justify-center gap-2 hover:brightness-95 transition"
        />
      </section>

      {/* Recent creations */}
      <section className="flex flex-col gap-1">
        <h3 className="text-xs font-semibold tracking-wider text-muted uppercase px-2 mb-1">
          Recent Creations
        </h3>
        {chatHistory && Object.keys(chatHistory).length === 0 ? (
          <p className="text-sm text-muted/80 px-2">
            No recent conversations. Start a new one to see it here!
          </p>
        ) : (
          <ul className="flex flex-col">
            {Object.entries(chatHistory).map(
              ([conversationId, conversation]) => (
                <li
                  key={conversationId}
                  onClick={() => {
                    setView("chat");
                    dispatch({ type: "selectConversation", conversationId });
                  }}
                  className={`text-sm text-ink/80 py-1.5 px-2 rounded-lg hover:bg-black/5 cursor-pointer transition-colors ${
                    conversationId === activeConversationId ? "bg-black/5" : ""
                  }`}
                >
                  {conversation.title}
                </li>
              ),
            )}
          </ul>
        )}
      </section>

      {/* Settings + collapse footer */}
      <div className="mt-auto pt-4 border-t border-border flex flex-col gap-1">
        <button
          onClick={() => setIsSettingsOpen(true)}
          className="flex items-center gap-2 text-sm text-muted px-2 py-1.5 rounded-lg hover:bg-black/5 transition-colors w-full"
        >
          <span>⚙️</span>
          Your settings
        </button>

        <button
          onClick={() => setIsCollapsed(true)}
          className="flex items-center gap-2 text-sm text-muted px-2 py-1.5 rounded-lg hover:bg-black/5 transition-colors w-full"
        >
          <span>⇤</span>
          Collapse
        </button>
      </div>

      {settingsModal}
    </div>
  );
}
