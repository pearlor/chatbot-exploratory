export type ChatRole = "user" | "chef";

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
}
