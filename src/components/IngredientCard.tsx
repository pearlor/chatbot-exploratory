import { useEffect, useRef, useState } from "react";
import type { FocusEvent } from "react";
import { useIngredients } from "../context/IngredientsContext";
import QuantityFields from "./QuantityFields";
import type { IngredientQuantity } from "../quantity";
import { formatQuantity } from "../quantity";
import {
  EDIT_QUANTITY_LABEL,
  INGREDIENT_OPTIONS_TITLE,
  REMOVE_INGREDIENT_LABEL,
} from "../content";

import { KebabIcon } from "../assets/icons";
import { TEST_IDS } from "../testIds";

export type Ingredient = {
  name: string;
  /** Absent when the amount is unknown. Read it through `formatQuantity`. */
  quantity?: IngredientQuantity;
};

export default function IngredientCard({
  ingredient,
}: {
  ingredient: Ingredient;
}) {
  const { dispatch } = useIngredients();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [quantityDraft, setQuantityDraft] = useState<
    IngredientQuantity | undefined
  >(undefined);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close the menu when clicking anywhere outside of it.
  useEffect(() => {
    if (!isMenuOpen) return;

    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMenuOpen]);

  const startEditing = () => {
    setQuantityDraft(ingredient.quantity);
    setIsEditing(true);
    setIsMenuOpen(false);
  };

  const saveQuantity = () => {
    dispatch({
      type: "updateIngredient",
      name: ingredient.name,
      quantity: quantityDraft,
    });
    setIsEditing(false);
  };

  // Clicking away saves, but focus moving between the three quantity controls
  // also fires blur — so only save once focus has left the group entirely.
  const handleEditorBlur = (event: FocusEvent<HTMLDivElement>) => {
    if (event.currentTarget.contains(event.relatedTarget)) return;
    saveQuantity();
  };

  const remove = () => {
    dispatch({ type: "removeIngredient", name: ingredient.name });
    setIsMenuOpen(false);
  };

  return (
    <div
      data-testid={TEST_IDS.ingredientCard}
      data-ingredient={ingredient.name}
      className="flex flex-col gap-3 border border-border rounded-xl bg-white/60 px-4 py-3"
    >
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-3 min-w-0 text-sm text-ink">
          <span className="w-1.5 h-1.5 rounded-full bg-terracotta shrink-0" />
          <span className="truncate">{ingredient.name}</span>
        </span>

        <div className="flex items-center gap-2 shrink-0">
          {!isEditing && formatQuantity(ingredient.quantity) !== "" && (
            <span className="text-xs font-medium text-terracotta bg-terracotta-soft rounded-full px-2.5 py-1">
              {formatQuantity(ingredient.quantity)}
            </span>
          )}

          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setIsMenuOpen((open) => !open)}
              title={INGREDIENT_OPTIONS_TITLE}
              className="w-10 h-10 sm:w-7 sm:h-7 rounded-lg text-muted flex items-center justify-center hover:bg-black/5 transition-colors"
            >
              <KebabIcon />
            </button>

            {isMenuOpen && (
              <div className="absolute right-0 top-full mt-1 z-10 w-32 rounded-lg border border-border bg-white shadow-lg py-1">
                <button
                  onClick={startEditing}
                  className="w-full text-left px-3 py-1.5 text-sm text-ink hover:bg-black/5 transition-colors"
                >
                  {EDIT_QUANTITY_LABEL}
                </button>
                <button
                  onClick={remove}
                  className="w-full text-left px-3 py-1.5 text-sm text-terracotta hover:bg-black/5 transition-colors"
                >
                  {REMOVE_INGREDIENT_LABEL}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* The three quantity controls don't fit beside the name, so editing
          moves them onto their own row below it. */}
      {isEditing && (
        <div className="flex flex-wrap gap-2" onBlur={handleEditorBlur}>
          <QuantityFields
            size="compact"
            autoFocus
            value={quantityDraft}
            onChange={setQuantityDraft}
            onEnter={saveQuantity}
            onEscape={() => setIsEditing(false)}
          />
        </div>
      )}
    </div>
  );
}
