// Stable hooks for the end-to-end tests in /tests. Kept in one place — the same
// way content.ts centralizes copy — so renaming a hook is a single edit and a
// typo is a type error rather than a selector that silently never matches.
//
// Only the few spots where a role or text selector would be ambiguous or too
// brittle get one; everything else is located by role, text, or placeholder.
export const TEST_IDS = {
  ingredientCard: "ingredient-card",
  modalOverlay: "modal-overlay",
  sidebar: "sidebar",
  chatModeSelector: "chat-mode-selector",
  chatScrollContainer: "chat-scroll-container",
} as const;
