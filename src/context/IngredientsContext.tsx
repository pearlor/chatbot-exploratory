import { createContext, useContext, useReducer } from "react";
import type { Dispatch, ReactNode } from "react";
import type { Ingredient } from "../components/IngredientCard";

// Ingredients are keyed by their lowercase name so the same ingredient can't be
// added twice under different casing. The value keeps the name as typed so the
// original display casing (e.g. "Pecorino Romano") is preserved in the UI.
export type IngredientsState = Record<string, Ingredient>;

export type IngredientsAction =
  | { type: "addIngredient"; ingredient: Ingredient }
  | { type: "removeIngredient"; name: string }
  | { type: "updateIngredient"; name: string; quantity?: string };

const toKey = (name: string) => name.trim().toLowerCase();

// Flattens the fridge into a single line for grounding the chef AI, e.g.
// "Eggs (6), Guanciale (100g), Olive Oil, …". Quantity is omitted when unknown.
export function formatFridgeContents(ingredients: IngredientsState): string {
  return Object.values(ingredients)
    .map((ingredient) =>
      ingredient.quantity
        ? `${ingredient.name} (${ingredient.quantity})`
        : ingredient.name,
    )
    .join(", ");
}

// Seed contents. Real persistence comes later.
const initialIngredients: IngredientsState = {};
/*{
  eggs: { name: "Eggs", quantity: "6" },
  guanciale: { name: "Guanciale", quantity: "100g" },
  "pecorino romano": { name: "Pecorino Romano", quantity: "50g" },
  spaghetti: { name: "Spaghetti", quantity: "200g" },
  butter: { name: "Butter", quantity: "50g" },
  garlic: { name: "Garlic", quantity: "3 cloves" },
  parmesan: { name: "Parmesan", quantity: "30g" },
  "olive oil": { name: "Olive Oil" },
  "cherry tomatoes": { name: "Cherry Tomatoes", quantity: "handful" },
  onion: { name: "Onion", quantity: "2" },
};*/

function ingredientsReducer(
  state: IngredientsState,
  action: IngredientsAction,
): IngredientsState {
  switch (action.type) {
    case "addIngredient": {
      const key = toKey(action.ingredient.name);
      if (key === "") return state; // Ignore blank names.

      const existing = state[key];
      // Adding an ingredient that already exists just updates its quantity,
      // keeping the originally stored name.
      const updated: Ingredient = existing
        ? { ...existing, quantity: action.ingredient.quantity }
        : {
            name: action.ingredient.name.trim(),
            quantity: action.ingredient.quantity,
          };

      return { ...state, [key]: updated };
    }
    case "removeIngredient": {
      const { [toKey(action.name)]: _removed, ...rest } = state;
      return rest;
    }
    case "updateIngredient": {
      const key = toKey(action.name);
      if (!state[key]) return state; // Nothing to update.

      return {
        ...state,
        [key]: { ...state[key], quantity: action.quantity },
      };
    }
    default:
      return state;
  }
}

const IngredientsContext = createContext<{
  ingredients: IngredientsState;
  dispatch: Dispatch<IngredientsAction>;
} | null>(null);

export function IngredientsProvider({ children }: { children: ReactNode }) {
  const [ingredients, dispatch] = useReducer(
    ingredientsReducer,
    initialIngredients,
  );

  return (
    <IngredientsContext.Provider value={{ ingredients, dispatch }}>
      {children}
    </IngredientsContext.Provider>
  );
}

export function useIngredients() {
  const context = useContext(IngredientsContext);
  if (!context) {
    throw new Error(
      "useIngredients must be used within an IngredientsProvider",
    );
  }
  return context;
}
