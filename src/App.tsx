import "./App.css";

import Sidebar from "./sidebar/Sidebar";
import ChatHome from "./sections/ChatHome";

function App() {
  return (
    <div className="flex h-screen bg-cream text-ink">
      <Sidebar />
      <div className="flex-1 min-w-0">
        <ChatHome />
      </div>
    </div>
  );
}

export default App;
