import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";

export type View = "chat" | "fridge";

const NavigationContext = createContext<{
  view: View;
  setView: (view: View) => void;
  // A prompt queued from another view (e.g. the Fridge "Ask the chef" button)
  // for the chat to pick up and submit once it mounts.
  pendingPrompt: string | null;
  requestChat: (prompt: string) => void;
  clearPendingPrompt: () => void;
} | null>(null);

export function NavigationProvider({ children }: { children: ReactNode }) {
  const [view, setView] = useState<View>("chat");
  const [pendingPrompt, setPendingPrompt] = useState<string | null>(null);

  // Switch to the chat view and queue a prompt for it to submit on mount.
  const requestChat = (prompt: string) => {
    setPendingPrompt(prompt);
    setView("chat");
  };

  const clearPendingPrompt = () => setPendingPrompt(null);

  return (
    <NavigationContext.Provider
      value={{ view, setView, pendingPrompt, requestChat, clearPendingPrompt }}
    >
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error("useNavigation must be used within a NavigationProvider");
  }
  return context;
}
