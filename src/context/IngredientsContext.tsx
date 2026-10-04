import { createContext, useContext, useReducer } from "react";
import type { Dispatch, ReactNode } from "react";
import type { Ingredient } from "../components/IngredientCard";
import type { IngredientQuantity } from "../quantity";
import { formatQuantity } from "../quantity";

// Ingredients are keyed by their lowercase name so the same ingredient can't be
// added twice under different casing. The value keeps the name as typed so the
// original display casing (e.g. "Pecorino Romano") is preserved in the UI.
export type IngredientsState = Record<string, Ingredient>;

export type IngredientsAction =
  | { type: "addIngredient"; ingredient: Ingredient }
  | { type: "removeIngredient"; name: string }
  | { type: "updateIngredient"; name: string; quantity?: IngredientQuantity };

const toKey = (name: string) => name.trim().toLowerCase();

// Flattens the fridge into a single line for grounding the chef AI, e.g.
// "Eggs (6), Guanciale (100g), Olive Oil, …". Quantity is omitted when unknown.
export function formatFridgeContents(ingredients: IngredientsState): string {
  return Object.values(ingredients)
    .map((ingredient) => {
      const quantity = formatQuantity(ingredient.quantity);
      return quantity ? `${ingredient.name} (${quantity})` : ingredient.name;
    })
    .join(", ");
}

const DEMO_INGREDIENTS = {
  eggs: { name: "Eggs", quantity: { quantity: 12, unit: "" } },
  blueberries: { name: "Blueberries", quantity: { quantity: 5, unit: "oz" } },
  oranges: { name: "Oranges", quantity: { quantity: 8, unit: "" } },
  flour: { name: "Flour" },
  "rice flour": { name: "Rice flour" },
  "glutinous rice flour": { name: "Glutinous rice flour" },
  sugar: { name: "Sugar" },
  "white pepper": { name: "White pepper" },
  milk: { name: "Milk" },
  apples: { name: "Apples", quantity: { quantity: 5, unit: "" } },
  onion: { name: "Onion", quantity: { quantity: 2, unit: "" } },
};

const initialIngredients: IngredientsState = DEMO_INGREDIENTS;

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
      if (key === "") return state; // Ignore blank names.

      const existing = state[key];
      // An ingredient the fridge doesn't hold yet is added rather than
      // ignored, so a recipe can contribute ingredients the user never
      // entered themselves.
      const updated: Ingredient = existing
        ? { ...existing, quantity: action.quantity }
        : { name: action.name.trim(), quantity: action.quantity };

      return { ...state, [key]: updated };
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
