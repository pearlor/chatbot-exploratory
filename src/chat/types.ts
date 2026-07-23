export type Persona = "teacher" | "tv-host" | "pirate";

export interface ChatMessage {
  id: string;
  role: RoleEnum;
  content: string;
}

export enum RoleEnum {
  User = "user",
  Teacher = "teacher",
  TvHost = "tv-host",
  Pirate = "pirate",
}

export function getRoleFromPersona(persona: Persona): RoleEnum {
  switch (persona) {
    case "teacher":
      return RoleEnum.Teacher;
    case "tv-host":
      return RoleEnum.TvHost;
    case "pirate":
      return RoleEnum.Pirate;
  }
}

export const personas: {
  id: Persona;
  label: string;
  emoji: string;
  name: string;
}[] = [
  { id: RoleEnum.Teacher, label: "Teacher", emoji: "🧑‍🍳", name: "Chef Kale" },
  { id: RoleEnum.TvHost, label: "TV host", emoji: "📺", name: "Rosemary" },
  { id: RoleEnum.Pirate, label: "Pirate", emoji: "🦜", name: "Cane" },
];

export interface Conversation {
  previousInteractionId: string | undefined;
  title: string;
  messages: ChatMessage[];
}
