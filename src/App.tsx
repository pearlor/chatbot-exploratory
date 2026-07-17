import "./App.css";

import { useEffect, useState } from "react";
import { GoogleGenAI } from "@google/genai";

function App() {
  const prompt = "Explain how to make a peanut butter and jelly sandwich.";
  const [output, setOutput] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const ai = new GoogleGenAI({});

    async function generateResponse() {
      setIsLoading(true);
      setError("");
      try {
        const interaction = await ai.interactions.create({
          model: "gemini-3.5-flash",
          input: prompt,
        });
        console.log(interaction);
        setOutput(interaction.output_text ?? "");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong.");
      } finally {
        setIsLoading(false);
      }
    }

    generateResponse();
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
