import { useMemo, useState } from "react";
import type { RoleEnum } from "../../chat/types";
import ChefMarkdown from "./ChefMarkdown";
import { extractRecipeIngredients, isRecipeContent } from "./parseRecipe";
import { personas } from "../../chat/types";
import { CHEF_FALLBACK_NAME } from "../../content";
import { CHEF_ICON } from "../../assets/icons";
import Modal from "../Modal";
import { useIngredients } from "../../context/IngredientsContext";
import type { Ingredient } from "../IngredientCard";
/**
 * A chat bubble for a chef response: avatar + label above the rendered
 * markdown. Recipe content widens the bubble into a full-width card.
 */
export default function ChefBubble({
  content,
  role,
}: {
  content: string;
  role: RoleEnum;
}) {
  const [isUpdatingFridge, setIsUpdatingFridge] = useState(false);
  const [quantities, setQuantities] = useState<Record<string, string>>({});
  // Ingredients removed while the modal is open, keyed by recipe name. The
  // value is the fridge entry that was removed so Undo can restore its
  // original name and quantity, or null when the fridge had no such entry.
  const [removedIngredients, setRemovedIngredients] = useState<
    Record<string, Ingredient | null>
  >({});
  const { ingredients, dispatch } = useIngredients();
  // Recipe cards go full width so ingredients/steps can sit side by side;
  // @container enables the column switch to track the bubble's own width.
  const isRecipe = isRecipeContent(content);
  const recipeIngredients = isRecipe ? extractRecipeIngredients(content) : [];
  const normalizedIngredients = useMemo(() => {
    return recipeIngredients.map((ingredient) => {
      const fridgeMatch = Object.values(ingredients).find(
        (item) => item.name.toLowerCase() === ingredient.name.toLowerCase(),
      );
      const recipeQuantity = ingredient.quantity ?? "";
      const fridgeQuantity = fridgeMatch?.quantity ?? "";
      const initialQuantity =
        recipeQuantity && fridgeQuantity
          ? recipeQuantity.length > fridgeQuantity.length
            ? recipeQuantity
            : fridgeQuantity
          : recipeQuantity || fridgeQuantity;

      return {
        ...ingredient,
        initialQuantity,
      };
    });
  }, [ingredients, recipeIngredients]);

  const persona = personas.find((p) => p.id === role);

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

  const updateQuantity = (ingredientName: string, quantity: string) => {
    setQuantities((current) => ({ ...current, [ingredientName]: quantity }));
    dispatch({
      type: "updateIngredient",
      name: ingredientName,
      quantity: quantity.trim() || undefined,
    });
  };

  const handleSaveAll = () => {
    Object.entries(quantities).forEach(([ingredientName, quantity]) => {
      updateQuantity(ingredientName, quantity);
    });
    setIsUpdatingFridge(false);
  };

  const handleCancel = () => {
    setQuantities((current) => {
      const next = { ...current };
      Object.keys(next).forEach((ingredientName) => {
        delete next[ingredientName];
      });
      return next;
    });
    setIsUpdatingFridge(false);
  };

  return (
    <div className="flex flex-col items-start gap-2">
      {/* Avatar + label */}
      <div className="flex items-center gap-2 pl-1">
        <div className="w-8 h-8 rounded-full bg-terracotta-soft flex items-center justify-center text-sm text-terracotta">
          {persona?.emoji || CHEF_ICON}
        </div>
        <span className="text-sm text-muted">
          {persona?.name || CHEF_FALLBACK_NAME}
        </span>
      </div>

      <div
        className={`rounded-2xl border border-border bg-cream px-5 py-4 text-ink ${
          isRecipe ? "@container w-full" : "max-w-[90%] sm:max-w-[75%]"
        }`}
      >
        <ChefMarkdown content={content} />
      </div>

      {isRecipe && normalizedIngredients.length > 0 && (
        <button
          onClick={() => setIsUpdatingFridge(true)}
          className="rounded-xl border border-terracotta bg-terracotta-soft px-4 py-2 text-sm font-medium text-terracotta transition hover:bg-terracotta/10"
        >
          Update Fridge
        </button>
      )}

      {isUpdatingFridge && (
        <Modal
          header="Update Fridge"
          primaryAction={{ label: "Save", onClick: handleSaveAll }}
          secondaryAction={{ label: "Cancel", onClick: handleCancel }}
          onClose={handleCancel}
        >
          <div className="flex flex-col gap-3">
            {normalizedIngredients.map((ingredient) => {
              const inputValue =
                quantities[ingredient.name] ?? ingredient.initialQuantity;
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
                    <div className="mt-2 flex items-center gap-2">
                      <input
                        type="text"
                        value={inputValue}
                        onChange={(event) => {
                          const nextValue = event.target.value;
                          setQuantities((current) => ({
                            ...current,
                            [ingredient.name]: nextValue,
                          }));
                        }}
                        onKeyDown={(event) => {
                          if (event.key === "Enter") {
                            updateQuantity(
                              ingredient.name,
                              event.currentTarget.value,
                            );
                          }
                        }}
                        disabled={isRemoved}
                        className={`w-full rounded-lg border border-border bg-white px-3 py-2 text-sm focus:outline-none focus:border-terracotta ${
                          isRemoved ? "text-muted line-through" : "text-ink"
                        }`}
                        placeholder="Qty"
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
                      {isRemoved ? "Removed" : "Remove"}
                    </button>
                    {isRemoved && (
                      <button
                        onClick={() => handleUndoRemove(ingredient.name)}
                        className="rounded-lg border border-terracotta px-3 py-2 text-sm text-terracotta transition hover:bg-terracotta/10"
                      >
                        Undo
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Modal>
      )}
    </div>
  );
}
