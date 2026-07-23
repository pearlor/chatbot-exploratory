export type ChatRole = "user" | "chef";

export type Persona = "teacher" | "tv-host" | "pirate";

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
}

export enum RoleEnum {
  User = "user",
  Teacher = "teacher",
  TvHost = "tv-host",
  Pirate = "pirate",
}

export interface Message {
  id: number;
  role: RoleEnum;
  content: string;
}

export interface Conversation {
  previousInteractionId: string;
  title: string;
  messages: Message[];
}
