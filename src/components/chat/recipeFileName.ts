import { extractRecipeTitle } from "./parseRecipe";

const FALLBACK_FILE_NAME = "recipe";

// Characters Windows or macOS won't accept in a file name.
const INVALID_FILE_NAME_CHARACTERS = /[/\\:*?"<>|]/g;

/**
 * The file name for an exported recipe, named after the dish, e.g.
 * "Homemade Egg Tarts.png". Falls back to "recipe" when the reply has no
 * dish title or the title is made only of characters that aren't allowed.
 */
export function recipeFileName(content: string, extension: string): string {
  const title = extractRecipeTitle(content) ?? "";
  const safeTitle = title
    .replace(INVALID_FILE_NAME_CHARACTERS, " ")
    .replace(/\s+/g, " ")
    .trim();
  return `${safeTitle || FALLBACK_FILE_NAME}.${extension}`;
}
