import { RoleEnum } from "../chat/types";
import type { ChatMessage } from "../chat/types";

export const MAIN_USER_PROMPT = "How to make a grilled cheese sandwich?";

export const MAIN_USER_FOLLOWUP = "Which is better: gouda or cheddar?";

// Sent when "My fridge" mode is selected in demo mode. Deliberately shorter and
// more conversational than FRIDGE_PROMPT (the suggestion chip / "Ask the chef"
// wording), since here the mode already says the question is about the fridge.
export const DEMO_FRIDGE_PROMPT = "Recommend something from my fridge";

/**
 * The prompt the composer is pinned to in demo mode, derived from the messages
 * so far and the selected chat mode. An empty string means the script is
 * finished and the composer stays empty and locked.
 */
export function getDemoPrompt(
  messages: ChatMessage[],
  isFridgeSelected: boolean = false,
): string {
  const userMessages = messages.filter(
    (message) => message.role === RoleEnum.User,
  );

  // "My fridge" mode takes over the composer for as long as it's selected. Like
  // the suggestion chips it's a one-shot: there is only one canned fridge reply,
  // so once it has been asked the composer goes empty until the mode changes.
  if (isFridgeSelected) {
    const alreadyAsked = userMessages.some(
      (message) => message.content === DEMO_FRIDGE_PROMPT,
    );
    return alreadyAsked ? "" : DEMO_FRIDGE_PROMPT;
  }

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
