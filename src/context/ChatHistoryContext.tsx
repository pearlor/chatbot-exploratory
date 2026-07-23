import { createContext, useContext, useReducer } from "react";
import type { Dispatch, ReactNode } from "react";
import { RoleEnum } from "../chat/types";
import type { ChatMessage, Conversation } from "../chat/types";
import mockChefResponse from "../chat/mock/example_response.md?raw";

export type ChatHistoryState = {
  chatHistory: Record<string, Conversation>;
  activeConversationId: string | null;
};

export type ChatHistoryAction =
  | {
      type: "selectConversation";
      conversationId: string;
    }
  | {
      type: "newConversation";
    }
  | {
      type: "addMessage";
      conversationId: string;
      title: string | undefined; // Optional title for new conversations
      isNewConversation: boolean; // Flag to indicate if this is a new conversation
      message: ChatMessage;
    };

const ENABLE_MOCK_HISTORY = true; // Set to false to start with an empty history

// Mock history so we can verify that a past conversation can be recreated
// in the chat view. Real appending during a live chat comes later.
const mockChatHistory: Record<string, Conversation> = {
  "conv-egg-tarts": {
    lastResponseTime: Date.now() - 1000 * 60 * 60, // 1 hour ago
    previousInteractionId: "mock-interaction-egg-tarts",
    title: "Homemade Egg Tarts",
    messages: [
      {
        id: "1",
        role: RoleEnum.User,
        content: "How do I make bakery-style egg tarts at home?",
      },
      {
        id: "2",
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
    case "newConversation":
      return { ...state, activeConversationId: null };
    case "addMessage": {
      const { conversationId, message, title, isNewConversation } = action;
      const existingConversation = state.chatHistory[conversationId];

      const updatedConversation: Conversation = existingConversation
        ? {
            ...existingConversation,
            lastResponseTime: Date.now(),
            // For a new conversation, a later message may bring the real title
            // (e.g. extracted from the recipe response).
            title: isNewConversation
              ? title || "New Conversation"
              : existingConversation.title,
            messages: [...existingConversation.messages, message],
          }
        : {
            lastResponseTime: Date.now(),
            previousInteractionId: undefined, // No previous interaction for a new conversation
            title: title || "New Conversation",
            messages: [message],
          };

      return {
        ...state,
        chatHistory: {
          ...state.chatHistory,
          [conversationId]: updatedConversation,
        },
        // A freshly started chat becomes the active conversation so it is
        // highlighted in the sidebar and can be reset via "newConversation".
        activeConversationId: isNewConversation
          ? conversationId
          : state.activeConversationId,
      };
    }
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
