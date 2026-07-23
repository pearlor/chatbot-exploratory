import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";

export type View = "chat" | "fridge";

const NavigationContext = createContext<{
  view: View;
  setView: (view: View) => void;
} | null>(null);

export function NavigationProvider({ children }: { children: ReactNode }) {
  const [view, setView] = useState<View>("chat");

  return (
    <NavigationContext.Provider value={{ view, setView }}>
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
