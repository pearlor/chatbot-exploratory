import { RoleEnum } from "../chat/types";
import type { ChatMessage } from "../chat/types";

export const MAIN_USER_PROMPT = "How to make a grilled cheese sandwich?";

export const MAIN_USER_FOLLOWUP = "Which is better: gouda or cheddar?";

/**
 * The prompt the composer is pinned to in demo mode, derived from the messages
 * so far. An empty string means the script is finished and the composer stays
 * empty and locked.
 */
export function getDemoPrompt(messages: ChatMessage[]): string {
  const userMessages = messages.filter(
    (message) => message.role === RoleEnum.User,
  );

  if (userMessages.length === 0) return MAIN_USER_PROMPT;

  // The follow-up only makes sense as an answer to the main prompt, so a
  // conversation started from a suggestion chip ends after its one exchange.
  if (
    userMessages.length === 1 &&
    userMessages[0].content === MAIN_USER_PROMPT
  ) {
    return MAIN_USER_FOLLOWUP;
  }

  return "";
}
