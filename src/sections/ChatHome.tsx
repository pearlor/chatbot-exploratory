import { useState, useCallback } from "react";
import Composer from "../components/Composer";
import ChatHistory from "../components/chat/ChatHistory";
import { generateResponse } from "../chat/ChatUtils";
import type { ChatMessage } from "../chat/types";
import { useUserPreferences } from "../context/UserPreferencesContext";

export default function ChatHome() {
  const { preferences } = useUserPreferences();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [userPrompt, setUserPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [previousInteractionId, setPreviousInteractionId] = useState<
    string | undefined
  >(undefined);

  const handleSubmit = useCallback(async () => {
    const prompt = userPrompt.trim();
    if (!prompt) return;

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: prompt,
    };
    setMessages((prev) => [...prev, userMessage]);
    setUserPrompt("");
    setIsLoading(true);

    try {
      const chatOutput = await generateResponse(
        prompt,
        previousInteractionId,
        preferences.persona,
      );
      setMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), role: "chef", content: chatOutput.text },
      ]);
      setPreviousInteractionId(chatOutput.previousInteractionId);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Something went wrong.";
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "chef",
          content: `Sorry, something went wrong: ${message}`,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [userPrompt, previousInteractionId, preferences.persona]);

  return (
    <div className="h-full flex flex-col">
      <ChatHistory messages={messages} isLoading={isLoading} />

      <Composer
        userPrompt={userPrompt}
        setUserPrompt={setUserPrompt}
        handleSubmit={handleSubmit}
        isLoading={isLoading}
        showSuggestions={messages.length === 0}
      />
    </div>
  );
}
