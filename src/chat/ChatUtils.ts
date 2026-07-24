import { GoogleGenAI } from "@google/genai";
import culinaryTeacherPrompt from "./prompts/culinary_teacher_prompt.txt?raw";
import foodTVHostPrompt from "./prompts/food_tv_host_prompt.txt?raw";
import pirateChefPrompt from "./prompts/pirate_chef_prompt.txt?raw";
import systemPrompt from "./prompts/format_prompt.txt?raw";
import type { Persona } from "./types";

import mockResponse from "./mock/example_response.md?raw";

const personaPrompts: Record<Persona, string> = {
  teacher: culinaryTeacherPrompt,
  "tv-host": foodTVHostPrompt,
  pirate: pirateChefPrompt,
};

const fridgeSystemPrompt =
  "Ingredients currently in the user's fridge that you need to find a recipe for. Recommend any ingredients they need to buy:";

const ai = new GoogleGenAI({
  apiKey: "",
});

type ChatOutput = {
  text: string;
  previousInteractionId: string | undefined;
};

/**
 * Sends a prompt to the chef AI and returns its markdown reply. The system
 * instruction combines the format contract (format_prompt.txt) with the
 * active persona prompt, plus — for fridge-related prompts — a grounding block
 * listing the ingredients the user has (`fridgeContents`). Pass the returned
 * `previousInteractionId` back in to continue the same conversation. With
 * `useMock` the canned example_response.md is returned after a short delay
 * instead of calling the API.
 */
export async function generateResponse(
  prompt: string,
  previousInteractionId: string | undefined,
  persona: Persona,
  fridgeContents?: string,
  useMock: boolean = false,
): Promise<ChatOutput> {
  if (useMock) {
    // Short delay so the thinking bubble stays visible, like a real call.
    await new Promise((resolve) => setTimeout(resolve, 600));
    return { text: mockResponse, previousInteractionId };
  }

  const fridgeBlock = fridgeContents
    ? `\n\n## ${fridgeSystemPrompt}\n${fridgeContents}`
    : "";

  const interaction = await ai.interactions.create({
    model: "gemini-3.5-flash",
    system_instruction:
      systemPrompt + "\n\n" + personaPrompts[persona] + fridgeBlock,
    input: prompt,
    previous_interaction_id: previousInteractionId,
  });
  return {
    text: interaction.output_text ?? "",
    previousInteractionId: interaction.id,
  };
}
