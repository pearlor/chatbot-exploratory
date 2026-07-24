import {
  getRoleFromPersona,
  type ChatMessage,
  personas,
} from "../../chat/types";
import UserBubble from "./UserBubble";
import ChefBubble from "./ChefBubble";
import ThinkingBubble from "./ThinkingBubble";
import { useUserPreferences } from "../../context/UserPreferencesContext";
import { CHAT_EMPTY_GREETING, CHEF_FALLBACK_NAME } from "../../content";

export default function ChatHistory({
  messages,
  isLoading,
  retry,
  messageIdWithError,
  numRetries,
}: {
  messages: ChatMessage[];
  isLoading: boolean;
  retry: (promptOverride?: string) => void;
  messageIdWithError?: string | null;
  numRetries: number;
}) {
  const { preferences } = useUserPreferences();

  // Empty state: greeting shown only when there are no messages yet.
  if (messages.length === 0) {
    return (
      <div className="flex-1 overflow-y-auto">
        <div className="flex flex-col items-center pt-24 gap-4">
          <div className="w-16 h-16 rounded-full bg-terracotta-soft flex items-center justify-center text-3xl text-terracotta">
            🥘
          </div>
          <p className="font-serif italic text-lg text-muted">
            {CHAT_EMPTY_GREETING}
          </p>
        </div>
      </div>
    );
  }

  const role = getRoleFromPersona(preferences.persona);
  const iconForLoading = personas.find((p) => p.id === role)?.emoji || "🧑‍🍳";
  const nameForLoading =
    personas.find((p) => p.id === role)?.name || CHEF_FALLBACK_NAME;

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-3xl mx-auto flex flex-col gap-6 px-6 py-8">
        {messages.map((message) =>
          message.role === "user" ? (
            <UserBubble
              key={message.id}
              content={message.content}
              hasError={message.id === messageIdWithError}
              retry={retry}
              numRetries={numRetries}
            />
          ) : (
            <ChefBubble
              key={message.id}
              content={message.content}
              role={message.role}
            />
          ),
        )}
        {isLoading && (
          <ThinkingBubble icon={iconForLoading} name={nameForLoading} />
        )}
      </div>
    </div>
  );
}
