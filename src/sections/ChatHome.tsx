import { useState, useCallback } from "react";
import Composer from "../components/Composer";
import { generateResponse } from "../chat/ChatUtils";

export default function ChatHome() {
  const [userPrompt, setUserPrompt] = useState("");
  const [output, setOutput] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const handleSubmit = useCallback(async () => {
    if (!userPrompt.trim()) return;

    await generateResponse(setOutput, setIsLoading, setError, userPrompt);

    if (!error) {
      setIsLoading(false);
    } else {
      setUserPrompt("");
      setIsLoading(false);
    }
  }, [userPrompt, setOutput, setIsLoading, setError]);
  console.log(output);
  return (
    <div className="h-full flex flex-col">
      {/* Greeting */}
      <div className="flex-1 flex flex-col items-center pt-24 gap-4">
        <div className="w-16 h-16 rounded-full bg-terracotta-soft flex items-center justify-center text-3xl text-terracotta">
          🧑‍🍳
        </div>
        <p className="font-serif italic text-lg text-muted">
          The kitchen is open. What shall we prepare today?
        </p>
      </div>

      {/* Composer */}
      <Composer
        userPrompt={userPrompt}
        setUserPrompt={setUserPrompt}
        handleSubmit={handleSubmit}
        isLoading={isLoading}
      />
    </div>
  );
}
