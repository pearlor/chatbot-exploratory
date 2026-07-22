import { GoogleGenAI } from "@google/genai";

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
): Promise<ChatOutput> {
  const interaction = await ai.interactions.create({
    model: "gemini-3.5-flash",
    input: prompt,
    previous_interaction_id: previousInteractionId,
  });
  return {
    text: interaction.output_text ?? "",
    previousInteractionId: interaction.id,
  };
}
