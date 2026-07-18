import "./App.css";

import { useEffect, useState } from "react";
import { generateResponse } from "./chat/ChatUtils";

function App() {
  const prompt = "Explain how to make a peanut butter and jelly sandwich.";
  const [output, setOutput] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    generateResponse(setOutput, setIsLoading, setError, prompt);
  }, []);

  return (
    <div>
      <p>Prompt: {prompt}</p>
      {isLoading && <p>Loading…</p>}
      {error && <p style={{ color: "red" }}>Error: {error}</p>}
      {!isLoading && !error && <p>Response: {output}</p>}
    </div>
  );
}

export default App;
