import { useMemo, useState } from "react";
import Modal from "./Modal";
import QuantityFields from "./QuantityFields";
import type { Ingredient } from "./IngredientCard";
import type { RecipeIngredient } from "./chat/parseRecipe";
import { useIngredients } from "../context/IngredientsContext";
import type { IngredientQuantity } from "../quantity";
import { parseQuantity } from "../quantity";
import {
  UPDATE_FRIDGE_CANCEL_LABEL,
  UPDATE_FRIDGE_MODAL_HEADER,
  UPDATE_FRIDGE_REMOVE_LABEL,
  UPDATE_FRIDGE_REMOVED_LABEL,
  UPDATE_FRIDGE_SAVE_LABEL,
  UPDATE_FRIDGE_UNDO_REMOVE_LABEL,
} from "../content";

/**
 * Lets the user reconcile a recipe's ingredient list with their fridge:
 * each row starts from the recipe's amount (or the fridge's, when the recipe
 * doesn't name a unit) and can be edited or removed before saving.
 */
export default function UpdateFridgeModal({
  recipeIngredients,
  onClose,
}: {
  recipeIngredients: RecipeIngredient[];
  onClose: () => void;
}) {
  const { ingredients, dispatch } = useIngredients();
  // Draft amounts, keyed by recipe ingredient name; only committed on Save.
  const [quantities, setQuantities] = useState<
    Record<string, IngredientQuantity | undefined>
  >({});
  // Ingredients removed while the modal is open, keyed by recipe name. The
  // value is the fridge entry that was removed so Undo can restore its
  // original name and quantity, or null when the fridge had no such entry.
  const [removedIngredients, setRemovedIngredients] = useState<
    Record<string, Ingredient | null>
  >({});

  const normalizedIngredients = useMemo(() => {
    return recipeIngredients.map((ingredient) => {
      const fridgeMatch = Object.values(ingredients).find(
        (item) => item.name.toLowerCase() === ingredient.name.toLowerCase(),
      );
      // The recipe's own amount wins when it names a unit, since that's the
      // more specific of the two; otherwise fall back to what the fridge
      // already holds.
      const recipeQuantity = parseQuantity(ingredient.quantity);
      const fridgeQuantity = fridgeMatch?.quantity;
      const initialQuantity = recipeQuantity?.unit
        ? recipeQuantity
        : (fridgeQuantity ?? recipeQuantity);

      return {
        ...ingredient,
        initialQuantity,
      };
    });
  }, [ingredients, recipeIngredients]);

  const handleRemove = (ingredientName: string) => {
    const fridgeEntry = Object.values(ingredients).find(
      (item) => item.name.toLowerCase() === ingredientName.toLowerCase(),
    );
    dispatch({ type: "removeIngredient", name: ingredientName });
    setRemovedIngredients((current) => ({
      ...current,
      [ingredientName]: fridgeEntry ?? null,
    }));
  };

  const handleUndoRemove = (ingredientName: string) => {
    const removedEntry = removedIngredients[ingredientName];
    if (removedEntry) {
      dispatch({ type: "addIngredient", ingredient: removedEntry });
    }
    setRemovedIngredients((current) => {
      const next = { ...current };
      delete next[ingredientName];
      return next;
    });
  };

  const updateQuantity = (
    ingredientName: string,
    quantity: IngredientQuantity | undefined,
  ) => {
    setQuantities((current) => ({ ...current, [ingredientName]: quantity }));
    dispatch({
      type: "updateIngredient",
      name: ingredientName,
      quantity,
    });
  };

  const handleSaveAll = () => {
    Object.entries(quantities).forEach(([ingredientName, quantity]) => {
      updateQuantity(ingredientName, quantity);
    });
    onClose();
  };

  const handleCancel = () => {
    setQuantities({});
    onClose();
  };

  return (
    <Modal
      header={UPDATE_FRIDGE_MODAL_HEADER}
      primaryAction={{
        label: UPDATE_FRIDGE_SAVE_LABEL,
        onClick: handleSaveAll,
      }}
      secondaryAction={{
        label: UPDATE_FRIDGE_CANCEL_LABEL,
        onClick: handleCancel,
      }}
      onClose={handleCancel}
    >
      <div className="flex flex-col gap-3">
        {normalizedIngredients.map((ingredient) => {
          const quantity =
            ingredient.name in quantities
              ? quantities[ingredient.name]
              : ingredient.initialQuantity;
          const isRemoved = ingredient.name in removedIngredients;

          return (
            <div
              key={ingredient.name}
              className={`flex items-center justify-between gap-3 rounded-xl border border-border px-3 py-3 ${
                isRemoved ? "bg-white/40 opacity-60" : "bg-white/70"
              }`}
            >
              <div className="min-w-0 flex-1">
                <p
                  className={`text-sm font-medium ${
                    isRemoved ? "text-muted line-through" : "text-ink"
                  }`}
                >
                  {ingredient.name}
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <QuantityFields
                    size="compact"
                    disabled={isRemoved}
                    value={quantity}
                    onChange={(next) =>
                      setQuantities((current) => ({
                        ...current,
                        [ingredient.name]: next,
                      }))
                    }
                    onEnter={() => updateQuantity(ingredient.name, quantity)}
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleRemove(ingredient.name)}
                  disabled={isRemoved}
                  className={`rounded-lg border border-border px-3 py-2 text-sm ${
                    isRemoved
                      ? "cursor-not-allowed text-muted"
                      : "text-terracotta"
                  }`}
                >
                  {isRemoved
                    ? UPDATE_FRIDGE_REMOVED_LABEL
                    : UPDATE_FRIDGE_REMOVE_LABEL}
                </button>
                {isRemoved && (
                  <button
                    onClick={() => handleUndoRemove(ingredient.name)}
                    className="rounded-lg border border-terracotta px-3 py-2 text-sm text-terracotta transition hover:bg-terracotta/10"
                  >
                    {UPDATE_FRIDGE_UNDO_REMOVE_LABEL}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </Modal>
  );
}
