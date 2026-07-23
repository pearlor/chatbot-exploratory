import "./App.css";

import Sidebar from "./sidebar/Sidebar";
import ChatHome from "./sections/ChatHome";
import { UserPreferencesProvider } from "./context/UserPreferencesContext";
import { ChatHistoryProvider } from "./context/ChatHistoryContext";

function App() {
  return (
    <UserPreferencesProvider>
      <ChatHistoryProvider>
        <div className="flex h-screen bg-cream text-ink">
          <Sidebar />
          <div className="flex-1 min-w-0">
            <ChatHome />
          </div>
        </div>
      </ChatHistoryProvider>
    </UserPreferencesProvider>
  );
}

export default App;
