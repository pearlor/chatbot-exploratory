import { useCallback, useEffect, useState } from "react";

import "./App.css";

import Sidebar from "./sidebar/Sidebar";
import ChatHome from "./sections/ChatHome";
import Fridge from "./sections/Fridge";
import { UserPreferencesProvider } from "./context/UserPreferencesContext";
import { ChatHistoryProvider } from "./context/ChatHistoryContext";
import { IngredientsProvider } from "./context/IngredientsContext";
import { NavigationProvider, useNavigation } from "./context/NavigationContext";
import { APP_NAME, OPEN_MENU_LABEL } from "./content";
import { MenuIcon } from "./assets/icons";

function MainView() {
  const { view } = useNavigation();
  return view === "fridge" ? <Fridge /> : <ChatHome />;
}

/**
 * The app frame: a permanent sidebar column from `md` up, and below that a
 * drawer that slides over the content, opened from the mobile header.
 */
function AppShell() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const closeSidebar = useCallback(() => setIsSidebarOpen(false), []);

  // Escape closes the drawer, matching the usual overlay behaviour.
  useEffect(() => {
    if (!isSidebarOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeSidebar();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isSidebarOpen, closeSidebar]);

  return (
    // h-dvh rather than h-screen: on mobile browsers 100vh includes the address
    // bar, which pushes the composer below the fold.
    <div className="flex h-dvh bg-cream text-ink">
      <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />

      {isSidebarOpen && (
        <div
          onClick={closeSidebar}
          aria-hidden
          className="fixed inset-0 z-30 bg-black/40 md:hidden"
        />
      )}

      <div className="flex-1 min-w-0 flex flex-col">
        {/* Mobile-only header: the drawer's only opener. */}
        <header className="md:hidden flex items-center gap-1 border-b border-border px-2 py-1.5">
          <button
            onClick={() => setIsSidebarOpen(true)}
            aria-label={OPEN_MENU_LABEL}
            className="w-11 h-11 rounded-lg text-muted flex items-center justify-center hover:bg-black/5 transition-colors"
          >
            <MenuIcon />
          </button>
          <span className="text-lg font-bold text-ink">{APP_NAME}</span>
        </header>

        <div className="flex-1 min-h-0">
          <MainView />
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <UserPreferencesProvider>
      <ChatHistoryProvider>
        <IngredientsProvider>
          <NavigationProvider>
            <AppShell />
          </NavigationProvider>
        </IngredientsProvider>
      </ChatHistoryProvider>
    </UserPreferencesProvider>
  );
}

export default App;
