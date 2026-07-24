import { CHEF_ICON, PIRATE_ICON, TV_ICON } from "../assets/icons";
import {
  PERSONA_PIRATE_LABEL,
  PERSONA_PIRATE_NAME,
  PERSONA_TEACHER_LABEL,
  PERSONA_TEACHER_NAME,
  PERSONA_TV_HOST_LABEL,
  PERSONA_TV_HOST_NAME,
} from "../content";

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
  {
    id: RoleEnum.Teacher,
    label: PERSONA_TEACHER_LABEL,
    emoji: CHEF_ICON,
    name: PERSONA_TEACHER_NAME,
  },
  {
    id: RoleEnum.TvHost,
    label: PERSONA_TV_HOST_LABEL,
    emoji: TV_ICON,
    name: PERSONA_TV_HOST_NAME,
  },
  {
    id: RoleEnum.Pirate,
    label: PERSONA_PIRATE_LABEL,
    emoji: PIRATE_ICON,
    name: PERSONA_PIRATE_NAME,
  },
];

export interface Conversation {
  lastResponseTime: number;
  previousInteractionId: string | undefined;
  title: string;
  messages: ChatMessage[];
}
