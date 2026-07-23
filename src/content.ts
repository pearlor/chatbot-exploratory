// Centralized user-facing copy. Every string the UI shows to the user lives
// here as an exported constant, imported by the component that renders it, so
// wording can be reviewed and updated in one place.

/* Brand */
export const APP_NAME = "Recipe Helper";

/* Chef */
// Fallback chef name shown when a message's persona can't be resolved.
export const CHEF_FALLBACK_NAME = "Chef Masto";

/* Sidebar */
export const NEW_CONVERSATION_BUTTON_LABEL = "＋  New Conversation";
export const NEW_CONVERSATION_TITLE = "New Conversation";
export const FRIDGE_NAV_LABEL = "Your Fridge";
export const SETTINGS_LABEL = "Your settings";
export const EXPAND_SIDEBAR_TITLE = "Expand sidebar";
export const COLLAPSE_SIDEBAR_LABEL = "Collapse";
export const RECENT_CONVERSATIONS_HEADING = "Recent Creations";
export const NO_CONVERSATIONS_MESSAGE =
  "No recent conversations. Start a new one to see it here!";

/* Fridge */
export const FRIDGE_HEADING = "Your Fridge";
export const FRIDGE_SUBHEADING =
  "The chef will suggest recipes based on what you have.";
export const INGREDIENT_NAME_PLACEHOLDER = "Ingredient name…";
export const INGREDIENT_QUANTITY_PLACEHOLDER = "Qty (optional)";
export const ADD_INGREDIENT_LABEL = "Add";
export const ASK_CHEF_WITH_FRIDGE_LABEL =
  "Ask the chef what to cook with these";

/* Ingredient card */
export const INGREDIENT_OPTIONS_TITLE = "Options";
export const INGREDIENT_QUANTITY_SHORT_PLACEHOLDER = "Qty";
export const EDIT_QUANTITY_LABEL = "Edit quantity";
export const REMOVE_INGREDIENT_LABEL = "Remove";

/* Chat input / composer */
export const ASK_MODE_LABEL = "Ask";
export const FRIDGE_MODE_LABEL = "My fridge";
export const CHAT_INPUT_PLACEHOLDER =
  "Ask the Chef for a recipe, technique, or pairing…";
export const AI_DISCLAIMER =
  "This is an AI, so it's not perfect and can make mistakes. Always double-check the information provided.";

/* Chat history / bubbles */
export const CHAT_EMPTY_GREETING =
  "The kitchen is open. What shall we prepare today?";
export const USER_BUBBLE_LABEL = "You";
export const THINKING_LABEL = "Chef is thinking";

/* Chat errors */
export const GENERIC_ERROR_MESSAGE = "Something went wrong.";
export const CHAT_ERROR_PREFIX = "Sorry, something went wrong: ";

/* Settings modal */
export const SETTINGS_MODAL_HEADER = "⚙️ Your settings";
export const SETTINGS_SAVE_LABEL = "Save";
export const SETTINGS_CANCEL_LABEL = "Cancel";
export const CHOOSE_PERSONA_LABEL = "Choose your chef persona:";

/* Modal */
export const MODAL_CLOSE_TITLE = "Close";

/* Personas */
export const PERSONA_TEACHER_LABEL = "Teacher";
export const PERSONA_TEACHER_NAME = "Chef Kale";
export const PERSONA_TV_HOST_LABEL = "TV host";
export const PERSONA_TV_HOST_NAME = "Rosemary";
export const PERSONA_PIRATE_LABEL = "Pirate";
export const PERSONA_PIRATE_NAME = "Cane";

/* Suggestion chips */
export const SUGGESTION_SURPRISE_LABEL = "Surprise me";
export const SUGGESTION_SURPRISE_PROMPT = "Surprise me with a recipe that I'll like";
export const SUGGESTION_VEGETARIAN_LABEL = "Vegetarian options";
export const SUGGESTION_VEGETARIAN_PROMPT = "Recommend a vegetarian dish I can make";
export const SUGGESTION_FIVE_INGREDIENT_LABEL = "5-ingredient meals";
export const SUGGESTION_FIVE_INGREDIENT_PROMPT =
  "Suggest a recipe using 5 or fewer ingredients";
export const SUGGESTION_FRIDGE_LABEL = "From my fridge";

/* Recipe pills */
export const RECIPE_DIFFICULTY_LABEL = "Difficulty";
export const RECIPE_SERVES_LABEL = "Serves";
