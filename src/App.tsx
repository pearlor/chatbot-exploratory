import "./App.css";

import Sidebar from "./sidebar/Sidebar";
import ChatHome from "./sections/ChatHome";
import Fridge from "./sections/Fridge";
import { UserPreferencesProvider } from "./context/UserPreferencesContext";
import { ChatHistoryProvider } from "./context/ChatHistoryContext";
import { NavigationProvider, useNavigation } from "./context/NavigationContext";

function MainView() {
  const { view } = useNavigation();
  return view === "fridge" ? <Fridge /> : <ChatHome />;
}

function App() {
  return (
    <UserPreferencesProvider>
      <ChatHistoryProvider>
        <NavigationProvider>
          <div className="flex h-screen bg-cream text-ink">
            <Sidebar />
            <div className="flex-1 min-w-0">
              <MainView />
            </div>
          </div>
        </NavigationProvider>
      </ChatHistoryProvider>
    </UserPreferencesProvider>
  );
}

export default App;
