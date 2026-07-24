import { useState, useRef, useEffect } from "react";
import Tooltip from "./Tooltip";
import {
  ASK_MODE_LABEL,
  ASK_MODE_TOOLTIP,
  CHAT_INPUT_PLACEHOLDER,
  FRIDGE_MODE_LABEL,
  FRIDGE_MODE_TOOLTIP,
  SEND_MESSAGE_LABEL,
} from "../content";
export default function ChatInput({
  userPrompt,
  setUserPrompt,
  handleSubmit,
  isLoading,
}: {
  userPrompt: string;
  setUserPrompt: (prompt: string) => void;
  handleSubmit: (promptOverride?: string, isFridgeSelected?: boolean) => void;
  isLoading: boolean;
}) {
  const isSubmitDisabled = isLoading || userPrompt.trim() === "";

  // The "Ask" selector: "My fridge" mode grounds the chef in the user's fridge
  // contents. isMenuOpen controls the dropdown; isFridgeSelected is the mode and
  // persists until switched back to "Ask".
  const [isFridgeSelected, setIsFridgeSelected] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const selectorRef = useRef<HTMLDivElement>(null);

  // Close the dropdown when clicking anywhere outside the selector.
  useEffect(() => {
    if (!isMenuOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (
        selectorRef.current &&
        !selectorRef.current.contains(event.target as Node)
      ) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMenuOpen]);

  const selectAsk = () => {
    setIsFridgeSelected(false);
    setIsMenuOpen(false);
  };

  const selectFridge = () => {
    setIsFridgeSelected(true);
    setIsMenuOpen(false);
  };

  return (
    <div className="flex items-center gap-2 rounded-2xl border border-border bg-white px-3 py-2 shadow-sm">
      {/* "Ask" / "My fridge" selector */}
      <div ref={selectorRef} className="relative shrink-0">
        <button
          type="button"
          onClick={() => setIsMenuOpen((open) => !open)}
          className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-sm text-muted hover:bg-black/[0.03] transition-colors"
        >
          <span>{isFridgeSelected ? "🧊" : "🍳"}</span>
          {isFridgeSelected ? FRIDGE_MODE_LABEL : ASK_MODE_LABEL}
          <span className="text-xs">⌄</span>
        </button>

        {isMenuOpen && (
          <div className="absolute bottom-full left-0 mb-2 w-40 rounded-xl border border-border bg-white p-1 shadow-md">
            <Tooltip content={ASK_MODE_TOOLTIP} side="right">
              <button
                type="button"
                onClick={selectAsk}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-ink hover:bg-black/[0.03] transition-colors"
              >
                <span>🍳</span>
                {ASK_MODE_LABEL}
              </button>
            </Tooltip>
            <Tooltip content={FRIDGE_MODE_TOOLTIP} side="right">
              <button
                type="button"
                onClick={selectFridge}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-ink hover:bg-black/[0.03] transition-colors"
              >
                <span>🧊</span>
                {FRIDGE_MODE_LABEL}
              </button>
            </Tooltip>
          </div>
        )}
      </div>

      <input
        type="text"
        placeholder={CHAT_INPUT_PLACEHOLDER}
        className="flex-1 min-w-0 bg-transparent outline-none text-sm text-ink placeholder:text-muted"
        value={userPrompt}
        onChange={(e) => setUserPrompt(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !isSubmitDisabled) {
            handleSubmit(undefined, isFridgeSelected);
          }
        }}
      />

      {/* Send button */}
      <Tooltip content={SEND_MESSAGE_LABEL} side="top" className="shrink-0">
        <button
          className="w-9 h-9 rounded-full bg-terracotta text-white flex items-center justify-center shrink-0 transition hover:brightness-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:brightness-100"
          onClick={() => handleSubmit(undefined, isFridgeSelected)}
          aria-label={SEND_MESSAGE_LABEL}
          disabled={isSubmitDisabled}
        >
          {isLoading ? (
            <span className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
          ) : (
            "➤"
          )}
        </button>
      </Tooltip>
    </div>
  );
}
