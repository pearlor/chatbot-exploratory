import { useMemo, useState } from "react";
import Button from "../components/Button";
import SettingsModal from "../components/SettingsModal";
import Tooltip from "../components/Tooltip";
import { useChatHistory } from "../context/ChatHistoryContext";
import { useNavigation } from "../context/NavigationContext";
import {
  APP_NAME,
  COLLAPSE_SIDEBAR_LABEL,
  EXPAND_SIDEBAR_TITLE,
  FRIDGE_NAV_LABEL,
  NEW_CONVERSATION_BUTTON_LABEL,
  NEW_CONVERSATION_TITLE,
  NO_CONVERSATIONS_MESSAGE,
  RECENT_CONVERSATIONS_HEADING,
  SETTINGS_LABEL,
} from "../content";

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const { chatHistory, activeConversationId, dispatch } = useChatHistory();
  const { setView } = useNavigation();

  const settingsModal = isSettingsOpen && (
    <SettingsModal onClose={() => setIsSettingsOpen(false)} />
  );

  // order by lastResponseTime descending so the most recent conversation is at the top
  const orderedHistory = useMemo(() => {
    return Object.entries(chatHistory).sort(
      ([, a], [, b]) => b.lastResponseTime - a.lastResponseTime,
    );
  }, [chatHistory]);

  if (isCollapsed) {
    return (
      <div className="w-[72px] shrink-0 h-screen bg-sidebar border-r border-border flex flex-col items-center px-3 py-5 gap-4">
        {/* Brand icon */}
        <div className="w-10 h-10 rounded-xl bg-terracotta text-white flex items-center justify-center text-lg">
          🍳
        </div>

        <div className="w-8 border-t border-border" />

        {/* Primary actions */}
        <Tooltip content={FRIDGE_NAV_LABEL} side="right">
          <button
            onClick={() => setView("fridge")}
            aria-label={FRIDGE_NAV_LABEL}
            className="w-10 h-10 rounded-xl bg-terracotta-soft text-terracotta flex items-center justify-center text-lg hover:brightness-95 transition"
          >
            🧊
          </button>
        </Tooltip>

        <Tooltip content={NEW_CONVERSATION_TITLE} side="right">
          <button
            onClick={() => {
              setView("chat");
              dispatch({ type: "newConversation" });
            }}
            aria-label={NEW_CONVERSATION_TITLE}
            className="w-10 h-10 rounded-xl bg-terracotta text-white flex items-center justify-center text-lg hover:brightness-95 transition"
          >
            ＋
          </button>
        </Tooltip>

        {/* Settings */}
        <Tooltip content={SETTINGS_LABEL} side="right" className="mt-auto">
          <button
            onClick={() => setIsSettingsOpen(true)}
            aria-label={SETTINGS_LABEL}
            className="w-9 h-9 rounded-lg text-muted flex items-center justify-center hover:bg-black/5 transition-colors"
          >
            ⚙️
          </button>
        </Tooltip>

        {/* Expand */}
        <Tooltip content={EXPAND_SIDEBAR_TITLE} side="right">
          <button
            onClick={() => setIsCollapsed(false)}
            aria-label={EXPAND_SIDEBAR_TITLE}
            className="w-9 h-9 rounded-lg text-muted flex items-center justify-center hover:bg-black/5 transition-colors"
          >
            ⇥
          </button>
        </Tooltip>

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
        <h2 className="font-serif text-xl font-bold text-ink">{APP_NAME}</h2>
      </div>

      {/* Primary actions */}
      <section className="flex flex-col gap-3">
        <button
          onClick={() => setView("fridge")}
          className="flex items-center justify-between border border-border rounded-xl px-3 py-2.5 bg-white/60 text-sm text-ink hover:bg-white transition-colors"
        >
          <span className="flex items-center gap-2">
            <span>🧊</span>
            {FRIDGE_NAV_LABEL}
          </span>
          <span className="text-muted">›</span>
        </button>

        <Button
          onClick={() => {
            setView("chat");
            dispatch({ type: "newConversation" });
          }}
          label={NEW_CONVERSATION_BUTTON_LABEL}
          className="w-full bg-terracotta text-white rounded-xl px-3 py-2.5 text-sm font-medium flex items-center justify-center gap-2 hover:brightness-95 transition"
        />
      </section>

      {/* Recent creations */}
      <section className="flex flex-col gap-1">
        <h3 className="text-xs font-semibold tracking-wider text-muted uppercase px-2 mb-1">
          {RECENT_CONVERSATIONS_HEADING}
        </h3>
        {chatHistory && Object.keys(chatHistory).length === 0 ? (
          <p className="text-sm text-muted/80 px-2">
            {NO_CONVERSATIONS_MESSAGE}
          </p>
        ) : (
          <ul className="flex flex-col">
            {orderedHistory.map(([conversationId, conversation]) => (
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
            ))}
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
          {SETTINGS_LABEL}
        </button>

        <button
          onClick={() => setIsCollapsed(true)}
          className="flex items-center gap-2 text-sm text-muted px-2 py-1.5 rounded-lg hover:bg-black/5 transition-colors w-full"
        >
          <span>⇤</span>
          {COLLAPSE_SIDEBAR_LABEL}
        </button>
      </div>

      {settingsModal}
    </div>
  );
}
