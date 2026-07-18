import "./App.css";

import { useEffect, useState } from "react";
import Sidebar from "./sidebar/Sidebar";
import ChatHome from "./sections/ChatHome";

function App() {
  const prompt = "Explain how to make a peanut butter and jelly sandwich.";
  const [output, setOutput] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  /*
  TODO: Update this to use a button click instead of automatically generating a response on load. For now, we can just call the function directly in useEffect to demonstrate functionality.
  useEffect(() => {
    generateResponse(setOutput, setIsLoading, setError, prompt);
  }, []);
  */

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <Sidebar />
      <div style={{ flex: 1 }}>
        <ChatHome />
      </div>
    </div>
  );
}

export default App;
