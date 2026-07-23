import { createContext, useContext, useReducer } from "react";
import type { Dispatch, ReactNode } from "react";
import { RoleEnum } from "../chat/types";
import type { Conversation } from "../chat/types";
import mockChefResponse from "../chat/mock/example_response.md?raw";

export type ChatHistoryState = {
  chatHistory: Record<string, Conversation>;
  activeConversationId: string | null;
};

export type ChatHistoryAction = {
  type: "selectConversation";
  conversationId: string;
};

const ENABLE_MOCK_HISTORY = true; // Set to false to start with an empty history

// Mock history so we can verify that a past conversation can be recreated
// in the chat view. Real appending during a live chat comes later.
const mockChatHistory: Record<string, Conversation> = {
  "conv-egg-tarts": {
    previousInteractionId: "mock-interaction-egg-tarts",
    title: "Homemade Egg Tarts",
    messages: [
      {
        id: 1,
        role: RoleEnum.User,
        content: "How do I make bakery-style egg tarts at home?",
      },
      {
        id: 2,
        role: RoleEnum.Teacher,
        content: mockChefResponse,
      },
    ],
  },
};

const initialState: ChatHistoryState = {
  chatHistory: ENABLE_MOCK_HISTORY ? mockChatHistory : {},
  activeConversationId: null,
};

function chatHistoryReducer(
  state: ChatHistoryState,
  action: ChatHistoryAction,
): ChatHistoryState {
  switch (action.type) {
    case "selectConversation":
      return { ...state, activeConversationId: action.conversationId };
    default:
      return state;
  }
}

const ChatHistoryContext = createContext<{
  chatHistory: Record<string, Conversation>;
  activeConversationId: string | null;
  dispatch: Dispatch<ChatHistoryAction>;
} | null>(null);

export function ChatHistoryProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(chatHistoryReducer, initialState);

  return (
    <ChatHistoryContext.Provider
      value={{
        chatHistory: state.chatHistory,
        activeConversationId: state.activeConversationId,
        dispatch,
      }}
    >
      {children}
    </ChatHistoryContext.Provider>
  );
}

export function useChatHistory() {
  const context = useContext(ChatHistoryContext);
  if (!context) {
    throw new Error("useChatHistory must be used within a ChatHistoryProvider");
  }
  return context;
}
