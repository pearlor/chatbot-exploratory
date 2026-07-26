import { useCallback, useMemo, useState } from "react";
import Button from "../components/Button";
import SettingsModal from "../components/SettingsModal";
import Tooltip from "../components/Tooltip";
import { useChatHistory } from "../context/ChatHistoryContext";
import { useNavigation } from "../context/NavigationContext";
import {
  APP_NAME,
  CLOSE_MENU_LABEL,
  COLLAPSE_SIDEBAR_LABEL,
  EXPAND_SIDEBAR_TITLE,
  FRIDGE_NAV_LABEL,
  NEW_CONVERSATION_BUTTON_LABEL,
  NEW_CONVERSATION_TITLE,
  NO_CONVERSATIONS_MESSAGE,
  RECENT_CONVERSATIONS_HEADING,
  SETTINGS_LABEL,
} from "../content";
import {
  CLOSE_ICON,
  COLLAPSE_ICON,
  EXPAND_ICON,
  FridgeIcon,
  FRIED_EGG_ICON,
  SETTINGS_ICON,
} from "../assets/icons";
import { useIsSmallScreen } from "../hooks/useIsSmallScreen";
import { TEST_IDS } from "../testIds";
import { useUserPreferences } from "../context/UserPreferencesContext";

export default function Sidebar({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const { preferences } = useUserPreferences();
  const isDemoMode = preferences.isDemoMode;

  const [isCollapsed, setIsCollapsed] = useState(false);
  // On start, demo mode has settings open
  const [isSettingsOpen, setIsSettingsOpen] = useState(
    isDemoMode ? true : false,
  );
  const { chatHistory, activeConversationId, dispatch } = useChatHistory();
  const { setView, view } = useNavigation();
  const isSmallScreen = useIsSmallScreen();

  const settingsModal = isSettingsOpen && (
    <SettingsModal onClose={() => setIsSettingsOpen(false)} />
  );

  // order by lastResponseTime descending so the most recent conversation is at the top
  const orderedHistory = useMemo(() => {
    return Object.entries(chatHistory).sort(
      ([, a], [, b]) => b.lastResponseTime - a.lastResponseTime,
    );
  }, [chatHistory]);

  const navigateToFridge = useCallback(() => {
    setView("fridge");
    // clear the selected conversation, so nav highlighting is correct
    dispatch({ type: "selectConversation", conversationId: "" });
    onClose();
  }, [onClose]);

  const startNewConversation = useCallback(() => {
    setView("chat");
    dispatch({ type: "newConversation" });
    onClose();
  }, [onClose]);

  // The narrow rail is a desktop affordance; as a drawer the sidebar is always
  // the full version, so the collapsed state is ignored on small screens.
  if (isCollapsed && !isSmallScreen) {
    return (
      <div
        data-testid={TEST_IDS.sidebar}
        className="w-[72px] shrink-0 h-dvh bg-sidebar border-r border-border flex flex-col items-center px-3 py-5 gap-4"
      >
        {/* Brand icon */}
        <div className="w-10 h-10 rounded-xl bg-terracotta text-white flex items-center justify-center text-lg">
          {FRIED_EGG_ICON}
        </div>

        <div className="w-8 border-t border-border" />

        {/* Primary actions */}
        <Tooltip content={FRIDGE_NAV_LABEL} side="right">
          <button
            onClick={navigateToFridge}
            aria-label={FRIDGE_NAV_LABEL}
            className={`w-10 h-10 rounded-xl bg-terracotta-soft text-terracotta flex items-center justify-center text-lg hover:brightness-95 transition
               ${view == "fridge" && "bg-white"}`}
          >
            <FridgeIcon />
          </button>
        </Tooltip>

        <Tooltip content={NEW_CONVERSATION_TITLE} side="right">
          <button
            onClick={startNewConversation}
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
            {SETTINGS_ICON}
          </button>
        </Tooltip>

        {/* Expand */}
        <Tooltip content={EXPAND_SIDEBAR_TITLE} side="right">
          <button
            onClick={() => setIsCollapsed(false)}
            aria-label={EXPAND_SIDEBAR_TITLE}
            className="w-9 h-9 rounded-lg text-muted flex items-center justify-center hover:bg-black/5 transition-colors"
          >
            {EXPAND_ICON}
          </button>
        </Tooltip>

        {settingsModal}
      </div>
    );
  }

  return (
    // Below `md` this is a drawer: taken out of flow, slid off-canvas until
    // opened. From `md` up it is the static column it has always been.
    <div
      data-testid={TEST_IDS.sidebar}
      inert={isSmallScreen && !isOpen}
      className={`w-[260px] shrink-0 h-dvh bg-sidebar border-r border-border flex flex-col px-4 py-5 gap-5
        fixed inset-y-0 left-0 z-40 transition-transform duration-200 md:static md:translate-x-0
        ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
    >
      {/* Brand header */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-terracotta text-white flex items-center justify-center text-lg">
          {FRIED_EGG_ICON}
        </div>
        <h2 className="text-xl font-bold text-ink">{APP_NAME}</h2>
        <button
          onClick={onClose}
          aria-label={CLOSE_MENU_LABEL}
          className="md:hidden ml-auto w-11 h-11 rounded-lg text-muted flex items-center justify-center hover:bg-black/5 transition-colors"
        >
          {CLOSE_ICON}
        </button>
      </div>

      {/* Primary actions */}
      <section className="flex flex-col gap-3">
        <button
          onClick={navigateToFridge}
          className={`flex items-center justify-between border border-border rounded-xl px-3 py-2.5 bg-terracotta-soft text-terracotta text-sm text-ink hover:bg-white transition-colors
  ${view == "fridge" && "bg-white"}`}
        >
          <span className="flex items-center gap-1">
            <span>
              <FridgeIcon />
            </span>
            {FRIDGE_NAV_LABEL}
          </span>
          <span className="text-muted">›</span>
        </button>

        <Button
          onClick={startNewConversation}
          label={NEW_CONVERSATION_BUTTON_LABEL}
          className="w-full bg-terracotta text-white rounded-xl px-3 py-2.5 text-sm font-medium flex items-center justify-center gap-2 hover:brightness-95 transition"
        />
      </section>

      {/* Recent creations. Scrolls on its own so a long history can't push the
          settings footer off a short screen. */}
      <section className="flex flex-col gap-1 flex-1 min-h-0 overflow-y-auto">
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
                  onClose();
                }}
                className={`text-sm text-ink/80 py-2 px-2 rounded-lg hover:bg-black/5 cursor-pointer transition-colors ${
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
      <div className="shrink-0 pt-4 border-t border-border flex flex-col gap-1">
        <button
          onClick={() => setIsSettingsOpen(true)}
          className="flex items-center gap-2 text-sm text-muted px-2 py-2.5 rounded-lg hover:bg-black/5 transition-colors w-full"
        >
          <span>{SETTINGS_ICON}</span>
          {SETTINGS_LABEL}
        </button>

        {/* Collapsing to the rail only makes sense for the static column. */}
        <button
          onClick={() => setIsCollapsed(true)}
          className="hidden md:flex items-center gap-2 text-sm text-muted px-2 py-1.5 rounded-lg hover:bg-black/5 transition-colors w-full"
        >
          <span>{COLLAPSE_ICON}</span>
          {COLLAPSE_SIDEBAR_LABEL}
        </button>
      </div>

      {settingsModal}
    </div>
  );
}
