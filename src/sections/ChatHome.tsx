import { useState, useCallback } from "react";
import Composer from "../components/Composer";
import ChatHistory from "../components/chat/ChatHistory";
import { generateResponse } from "../chat/ChatUtils";
import { RoleEnum } from "../chat/types";
import type { ChatMessage, Message } from "../chat/types";
import { useUserPreferences } from "../context/UserPreferencesContext";
import { useChatHistory } from "../context/ChatHistoryContext";
import { getRoleFromPersona } from "../chat/types";

function toChatMessage(message: Message): ChatMessage {
  return {
    id: String(message.id),
    role: message.role,
    content: message.content,
  };
}

export default function ChatHome() {
  const { preferences } = useUserPreferences();
  const { chatHistory, activeConversationId } = useChatHistory();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [userPrompt, setUserPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [previousInteractionId, setPreviousInteractionId] = useState<
    string | undefined
  >(undefined);
  const [loadedConversationId, setLoadedConversationId] = useState<
    string | null
  >(null);

  // When a conversation is selected in the sidebar, recreate its messages in
  // the chat view. Adjusting state during render (guarded by the id check) is
  // React's recommended alternative to a setState-in-effect.
  if (activeConversationId && activeConversationId !== loadedConversationId) {
    setLoadedConversationId(activeConversationId);
    const conversation = chatHistory[activeConversationId];
    if (conversation) {
      setMessages(conversation.messages.map(toChatMessage));
      setPreviousInteractionId(conversation.previousInteractionId);
    }
  }

  const handleSubmit = useCallback(async () => {
    const prompt = userPrompt.trim();
    if (!prompt) return;

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: RoleEnum.User,
      content: prompt,
    };
    setMessages((prev) => [...prev, userMessage]);
    setUserPrompt("");
    setIsLoading(true);
    const role = getRoleFromPersona(preferences.persona);

    try {
      const chatOutput = await generateResponse(
        prompt,
        previousInteractionId,
        preferences.persona,
      );
      setMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), role, content: chatOutput.text },
      ]);
      setPreviousInteractionId(chatOutput.previousInteractionId);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Something went wrong.";
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role,
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
