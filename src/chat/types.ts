export type ChatRole = "user" | "chef";

export type Persona = "teacher" | "tv-host" | "pirate";

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
}
