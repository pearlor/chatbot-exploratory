import { useState } from "react";
import Modal from "./Modal";
import type { Persona } from "../chat/types";
import { useUserPreferences } from "../context/UserPreferencesContext";

const personas: { id: Persona; label: string; emoji: string }[] = [
  { id: "teacher", label: "Teacher", emoji: "🧑‍🍳" },
  { id: "tv-host", label: "TV host", emoji: "📺" },
  { id: "pirate", label: "Pirate", emoji: "🦜" },
];

export default function SettingsModal({ onClose }: { onClose: () => void }) {
  const { preferences, dispatch } = useUserPreferences();
  // Draft selection; only committed on Save so Cancel discards it.
  const [selectedPersona, setSelectedPersona] = useState<Persona>(
    preferences.persona,
  );

  const handleSave = () => {
    dispatch({ type: "setPersona", persona: selectedPersona });
    onClose();
  };

  return (
    <Modal
      header="⚙️ Your settings"
      primaryAction={{ label: "Save", onClick: handleSave }}
      secondaryAction={{ label: "Cancel", onClick: onClose }}
      onClose={onClose}
    >
      <p className="text-ink mb-5">Choose your chef persona:</p>
      <div className="flex justify-center gap-6">
        {personas.map((persona) => {
          const isSelected = selectedPersona === persona.id;
          return (
            <button
              key={persona.id}
              onClick={() => setSelectedPersona(persona.id)}
              className="flex flex-col items-center gap-2"
            >
              <span
                className={`w-24 h-24 rounded-full bg-terracotta-soft flex items-center justify-center text-4xl transition-colors ${
                  isSelected
                    ? "border-2 border-terracotta"
                    : "border border-border hover:border-terracotta/50"
                }`}
              >
                {persona.emoji}
              </span>
              <span
                className={`text-sm ${
                  isSelected ? "font-medium text-terracotta" : "text-ink"
                }`}
              >
                {persona.label}
              </span>
            </button>
          );
        })}
      </div>
    </Modal>
  );
}
