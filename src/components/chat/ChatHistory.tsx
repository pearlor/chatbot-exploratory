import { useRef } from "react";
import {
  getRoleFromPersona,
  type ChatMessage,
  personas,
} from "../../chat/types";
import UserBubble from "./UserBubble";
import ChefBubble from "./ChefBubble";
import ThinkingBubble from "./ThinkingBubble";
import { useScrollToMessage } from "./useScrollToMessage";
import { useUserPreferences } from "../../context/UserPreferencesContext";
import { CHAT_EMPTY_GREETING, CHEF_FALLBACK_NAME } from "../../content";
import { CHEF_ICON, FOOD_ICON } from "../../assets/icons";
import { TEST_IDS } from "../../testIds";

export default function ChatHistory({
  messages,
  isLoading,
  retry,
  messageIdWithError,
  numRetries,
  scrollToMessageId,
}: {
  messages: ChatMessage[];
  isLoading: boolean;
  retry: (promptOverride?: string) => void;
  messageIdWithError?: string | null;
  numRetries: number;
  scrollToMessageId?: string;
}) {
  const { preferences } = useUserPreferences();
  // A single scroll container across the empty and populated states keeps this
  // ref pointing at the same node once the first message arrives.
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  // Opening a conversation updates the stored anchor one render before its
  // messages reach this component, so wait until the anchor is on screen.
  const anchoredMessageId =
    messages.at(-1)?.id === scrollToMessageId ? scrollToMessageId : undefined;
  useScrollToMessage(scrollContainerRef, anchoredMessageId, messages[0]?.id);

  const role = getRoleFromPersona(preferences.persona);
  const iconForLoading =
    personas.find((p) => p.id === role)?.emoji || CHEF_ICON;
  const nameForLoading =
    personas.find((p) => p.id === role)?.name || CHEF_FALLBACK_NAME;

  return (
    <div
      ref={scrollContainerRef}
      data-testid={TEST_IDS.chatScrollContainer}
      className="flex-1 overflow-y-auto"
    >
      {/* Empty state: greeting shown only when there are no messages yet. */}
      {messages.length === 0 ? (
        <div className="flex flex-col items-center px-6 text-center pt-16 sm:pt-24 gap-4">
          <div className="w-16 h-16 rounded-full bg-terracotta-soft flex items-center justify-center text-3xl text-terracotta">
            {FOOD_ICON}
          </div>
          <p className="italic text-lg text-muted">{CHAT_EMPTY_GREETING}</p>
        </div>
      ) : (
        <div className="max-w-3xl mx-auto flex flex-col gap-6 px-4 py-6 sm:px-6 sm:py-8">
          {/* The wrapper carries the anchor used to scroll a message to the top. */}
          {messages.map((message) => (
            <div key={message.id} data-message-id={message.id}>
              {message.role === "user" ? (
                <UserBubble
                  content={message.content}
                  hasError={message.id === messageIdWithError}
                  retry={retry}
                  numRetries={numRetries}
                />
              ) : (
                <ChefBubble content={message.content} role={message.role} />
              )}
            </div>
          ))}
          {isLoading && (
            <ThinkingBubble icon={iconForLoading} name={nameForLoading} />
          )}
        </div>
      )}
    </div>
  );
}
