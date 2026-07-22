import { useState, useCallback } from "react";
import Composer from "../components/Composer";
import ChatHistory from "../components/chat/ChatHistory";
import { generateResponse } from "../chat/ChatUtils";
import type { ChatMessage } from "../chat/types";

// Mock history so the bubbles render before the API is wired up end to end.
const initialMessages: ChatMessage[] = [
  { id: "mock-1", role: "user", content: "What is key to cooking an egg?" },
  {
    id: "mock-2",
    role: "chef",
    content: "Making sure to be able to crack the egg",
  },
];

export default function ChatHome() {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [userPrompt, setUserPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);

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
      const reply = await generateResponse(prompt);
      setMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), role: "chef", content: reply },
      ]);
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
  }, [userPrompt]);

  return (
    <div className="h-full flex flex-col">
      <ChatHistory messages={messages} isLoading={isLoading} />

      <Composer
        userPrompt={userPrompt}
        setUserPrompt={setUserPrompt}
        handleSubmit={handleSubmit}
        isLoading={isLoading}
      />
    </div>
  );
}
