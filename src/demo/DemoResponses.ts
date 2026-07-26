import type { ChatOutput } from "../chat/ChatUtils";
import { FRIDGE_PROMPT } from "../chat/prompts";
import type { Persona } from "../chat/types";
import {
  SUGGESTION_FIVE_INGREDIENT_PROMPT,
  SUGGESTION_SURPRISE_PROMPT,
  SUGGESTION_VEGETARIAN_PROMPT,
} from "../content";
import { MAIN_USER_FOLLOWUP } from "./DemoUserPrompts";

// Written out one by one rather than built from the persona id: Vite's ?raw
// imports need literal paths, and the folder and file names don't follow a
// single convention ("tvShow" vs the "tv-host" persona, "_tvshow" vs "_Pirate").
import mainPirate from "./pirate/MainResponse_Pirate.txt?raw";
import followUpPirate from "./pirate/MainResponseFollowUp_Pirate.txt?raw";
import surprisePirate from "./pirate/Surprise_Pirate.txt?raw";
import vegetarianPirate from "./pirate/Vegetarian_Pirate.txt?raw";
import fiveIngredientPirate from "./pirate/5_Pirate.txt?raw";
import fridgePirate from "./pirate/Fridge_Pirate.txt?raw";

import mainTeacher from "./teacher/MainResponse_Teacher.txt?raw";
import followUpTeacher from "./teacher/MainResponseFollowUp_Teacher.txt?raw";
import surpriseTeacher from "./teacher/Surprise_Teacher.txt?raw";
import vegetarianTeacher from "./teacher/Vegetarian_Teacher.txt?raw";
import fiveIngredientTeacher from "./teacher/5_Teacher.txt?raw";
import fridgeTeacher from "./teacher/Fridge_Teacher.txt?raw";

import mainTvHost from "./tvShow/MainResponse_tvshow.txt?raw";
import followUpTvHost from "./tvShow/MainResponseFollowUp_tvshow.txt?raw";
import surpriseTvHost from "./tvShow/Surprise_tvshow.txt?raw";
import vegetarianTvHost from "./tvShow/Vegetarian_tvshow.txt?raw";
import fiveIngredientTvHost from "./tvShow/5_tvshow.txt?raw";
import fridgeTvHost from "./tvShow/Fridge_tvshow.txt?raw";

// Short delay before answering so the thinking bubble stays visible, the same
// way the mock branch of generateResponse does it.
const DEMO_RESPONSE_DELAY_MS = 600;

type DemoScript =
  | "main"
  | "mainFollowUp"
  | "surprise"
  | "vegetarian"
  | "fiveIngredient"
  | "fridge";

const pirateResponses: Record<DemoScript, string> = {
  main: mainPirate,
  mainFollowUp: followUpPirate,
  surprise: surprisePirate,
  vegetarian: vegetarianPirate,
  fiveIngredient: fiveIngredientPirate,
  fridge: fridgePirate,
};

const teacherResponses: Record<DemoScript, string> = {
  main: mainTeacher,
  mainFollowUp: followUpTeacher,
  surprise: surpriseTeacher,
  vegetarian: vegetarianTeacher,
  fiveIngredient: fiveIngredientTeacher,
  fridge: fridgeTeacher,
};

const tvHostResponses: Record<DemoScript, string> = {
  main: mainTvHost,
  mainFollowUp: followUpTvHost,
  surprise: surpriseTvHost,
  vegetarian: vegetarianTvHost,
  fiveIngredient: fiveIngredientTvHost,
  fridge: fridgeTvHost,
};

function getResponsesForPersona(persona: Persona): Record<DemoScript, string> {
  switch (persona) {
    case "pirate":
      return pirateResponses;
    case "teacher":
      return teacherResponses;
    case "tv-host":
      return tvHostResponses;
  }
}

/**
 * Every prompt the user can send in demo mode is one of these fixed strings —
 * the composer is read-only and the suggestion chips send known constants.
 * Anything else (a retry of an older message, say) falls back to the main
 * recipe rather than leaving the chef with nothing to say.
 */
function getScriptForPrompt(prompt: string): DemoScript {
  switch (prompt) {
    case MAIN_USER_FOLLOWUP:
      return "mainFollowUp";
    case SUGGESTION_SURPRISE_PROMPT:
      return "surprise";
    case SUGGESTION_VEGETARIAN_PROMPT:
      return "vegetarian";
    case SUGGESTION_FIVE_INGREDIENT_PROMPT:
      return "fiveIngredient";
    case FRIDGE_PROMPT:
      return "fridge";
    default:
      return "main";
  }
}

/**
 * The demo-mode stand-in for generateResponse: returns the canned reply written
 * for this prompt in the active persona's voice. previousInteractionId is passed
 * straight through so the conversation plumbing behaves the same either way.
 */
export async function generateDemoResponse(
  prompt: string,
  persona: Persona,
  previousInteractionId: string | undefined,
): Promise<ChatOutput> {
  await new Promise((resolve) => setTimeout(resolve, DEMO_RESPONSE_DELAY_MS));

  return {
    text: getResponsesForPersona(persona)[getScriptForPrompt(prompt)],
    previousInteractionId,
  };
}
