import { createContext, useContext, useReducer } from "react";
import type { Dispatch, ReactNode } from "react";
import type { Persona } from "../chat/types";

// Demo mode replaces the live API with the scripted prompts and canned replies
// in src/demo, so the app can be walked through end to end. Flip to false for
// the real chef.
export const IS_DEMO_MODE = true;

export type UserPreferences = {
  persona: Persona;
  isDemoMode: boolean;
};

export type UserPreferencesAction = {
  type: "setPersona";
  persona: Persona;
};

const defaultPreferences: UserPreferences = {
  persona: "teacher",
  isDemoMode: IS_DEMO_MODE,
};

function userPreferencesReducer(
  state: UserPreferences,
  action: UserPreferencesAction,
): UserPreferences {
  switch (action.type) {
    case "setPersona":
      return { ...state, persona: action.persona };
    default:
      return state;
  }
}

const UserPreferencesContext = createContext<{
  preferences: UserPreferences;
  dispatch: Dispatch<UserPreferencesAction>;
} | null>(null);

export function UserPreferencesProvider({ children }: { children: ReactNode }) {
  const [preferences, dispatch] = useReducer(
    userPreferencesReducer,
    defaultPreferences,
  );

  return (
    <UserPreferencesContext.Provider value={{ preferences, dispatch }}>
      {children}
    </UserPreferencesContext.Provider>
  );
}

export function useUserPreferences() {
  const context = useContext(UserPreferencesContext);
  if (!context) {
    throw new Error(
      "useUserPreferences must be used within a UserPreferencesProvider",
    );
  }
  return context;
}
