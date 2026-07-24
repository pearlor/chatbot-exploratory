import { useState, useCallback, useEffect, useRef } from "react";
import Composer from "../components/Composer";
import ChatHistory from "../components/chat/ChatHistory";
import { generateResponse } from "../chat/ChatUtils";
import { RoleEnum } from "../chat/types";
import type { ChatMessage } from "../chat/types";
import { useUserPreferences } from "../context/UserPreferencesContext";
import { useChatHistory } from "../context/ChatHistoryContext";
import { useNavigation } from "../context/NavigationContext";
import {
  useIngredients,
  formatFridgeContents,
} from "../context/IngredientsContext";
import { FRIDGE_PROMPT } from "../chat/prompts";
import { getRoleFromPersona } from "../chat/types";
import { extractRecipeTitle } from "../components/chat/parseRecipe";

export default function ChatHome() {
  const { preferences } = useUserPreferences();
  const { chatHistory, activeConversationId, dispatch } = useChatHistory();
  const { pendingPrompt, clearPendingPrompt } = useNavigation();
  const { ingredients } = useIngredients();
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
  useEffect(() => {
    if (activeConversationId && activeConversationId !== loadedConversationId) {
      setLoadedConversationId(activeConversationId);
      const conversation = chatHistory[activeConversationId];
      if (conversation) {
        setMessages(conversation.messages);
        setPreviousInteractionId(conversation.previousInteractionId);
      }
    } else if (activeConversationId === null && loadedConversationId !== null) {
      // "New Conversation" was clicked: return to the empty starting state.
      setLoadedConversationId(null);
      setMessages([]);
      setPreviousInteractionId(undefined);
      setUserPrompt("");
    }
  }, [activeConversationId, loadedConversationId]);

  const handleSubmit = useCallback(
    async (promptOverride?: string) => {
    const prompt = (promptOverride ?? userPrompt).trim();
    if (!prompt) return;

    const isNewConversation = !activeConversationId;
    const conversationId = activeConversationId || crypto.randomUUID();
    if (isNewConversation) {
      // The reducer will mark this conversation active; record it as already
      // loaded so the sync effect doesn't reload it over our local state.
      setLoadedConversationId(conversationId);
    }

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: RoleEnum.User,
      content: prompt,
    };
    setMessages((prev) => [...prev, userMessage]);
    dispatch({
      type: "addMessage",
      conversationId: conversationId,
      title: isNewConversation ? "New Conversation" : undefined,
      isNewConversation: isNewConversation,
      message: userMessage,
    });
    setUserPrompt("");
    setIsLoading(true);
    const role = getRoleFromPersona(preferences.persona);

    try {
      // Ground the chef in the fridge contents when the prompt is about the
      // fridge (the "From my fridge" chip / button, or any typed mention).
      const isFridgePrompt =
        prompt === FRIDGE_PROMPT || prompt.toLowerCase().includes("fridge");
      const fridgeContents = isFridgePrompt
        ? formatFridgeContents(ingredients)
        : undefined;
      const chatOutput = await generateResponse(
        prompt,
        previousInteractionId,
        preferences.persona,
        fridgeContents,
      );
      const chefMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role,
        content: chatOutput.text,
      };
      setMessages((prev) => [...prev, chefMessage]);
      dispatch({
        type: "addMessage",
        conversationId: conversationId,
        title: isNewConversation
          ? (extractRecipeTitle(chatOutput.text) ?? undefined)
          : undefined,
        isNewConversation: isNewConversation,
        message: chefMessage,
      });
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
    },
    [
      userPrompt,
      previousInteractionId,
      preferences.persona,
      activeConversationId,
      ingredients,
    ],
  );

  // Clicking a suggestion chip auto-fills the input and submits it. The prompt is
  // passed to handleSubmit explicitly because setUserPrompt is async — reading it
  // back from state on this same tick would still see the old (empty) value.
  const handleSuggestionClick = useCallback(
    (prompt: string) => {
      setUserPrompt(prompt);
      handleSubmit(prompt);
    },
    [handleSubmit],
  );

  // A prompt queued from another view (the Fridge "Ask the chef" button) is
  // submitted once, when the chat mounts. The ref guards against React
  // StrictMode invoking this effect twice in development.
  const consumedPendingPrompt = useRef(false);
  useEffect(() => {
    if (pendingPrompt && !consumedPendingPrompt.current) {
      consumedPendingPrompt.current = true;
      handleSubmit(pendingPrompt);
      clearPendingPrompt();
    }
  }, [pendingPrompt, handleSubmit, clearPendingPrompt]);

  return (
    <div className="h-full flex flex-col">
      <ChatHistory messages={messages} isLoading={isLoading} />

      <Composer
        userPrompt={userPrompt}
        setUserPrompt={setUserPrompt}
        handleSubmit={handleSubmit}
        isLoading={isLoading}
        showSuggestions={messages.length === 0}
        onSuggestionClick={handleSuggestionClick}
      />
    </div>
  );
}
