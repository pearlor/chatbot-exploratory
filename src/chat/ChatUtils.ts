import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({});

export async function generateResponse(
  setOutput: (output: string) => void,
  setIsLoading: (loading: boolean) => void,
  setError: (error: string) => void,
  prompt: string,
) {
  setIsLoading(true);
  setError("");
  try {
    const interaction = await ai.interactions.create({
      model: "gemini-3.5-flash",
      input: prompt,
    });
    console.log(interaction);
    setOutput(interaction.output_text ?? "");
  } catch (err) {
    setError(err instanceof Error ? err.message : "Something went wrong.");
  } finally {
    setIsLoading(false);
  }
}
