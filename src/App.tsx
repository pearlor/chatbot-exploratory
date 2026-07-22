import "./App.css";

import Sidebar from "./sidebar/Sidebar";
import ChatHome from "./sections/ChatHome";
import { UserPreferencesProvider } from "./context/UserPreferencesContext";

function App() {
  return (
    <UserPreferencesProvider>
      <div className="flex h-screen bg-cream text-ink">
        <Sidebar />
        <div className="flex-1 min-w-0">
          <ChatHome />
        </div>
      </div>
    </UserPreferencesProvider>
  );
}

export default App;
