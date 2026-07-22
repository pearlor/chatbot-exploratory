import { GoogleGenAI } from "@google/genai";
// Alternate persona; swap in for foodTVHostPrompt below to use it.
// import culinaryTeacherPrompt from "./prompts/culinary_teacher_prompt.txt?raw";
import foodTVHostPrompt from "./prompts/food_tv_host_prompt.txt?raw";
import systemPrompt from "./prompts/format_prompt.txt?raw";

import mockResponse from "./mock/example_response.md?raw";

const ai = new GoogleGenAI({
  apiKey: "",
});

type ChatOutput = {
  text: string;
  previousInteractionId: string | undefined;
};

export async function generateResponse(
  prompt: string,
  previousInteractionId: string | undefined,
  useMock: boolean = false,
): Promise<ChatOutput> {
  if (useMock) {
    // Short delay so the thinking bubble stays visible, like a real call.
    await new Promise((resolve) => setTimeout(resolve, 600));
    return { text: mockResponse, previousInteractionId };
  }

  const interaction = await ai.interactions.create({
    model: "gemini-3.5-flash",
    system_instruction: systemPrompt + "\n\n" + foodTVHostPrompt,
    input: prompt,
    previous_interaction_id: previousInteractionId,
  });
  return {
    text: interaction.output_text ?? "",
    previousInteractionId: interaction.id,
  };
}
