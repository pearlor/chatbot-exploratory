import { useEffect, useRef, useState } from "react";
import { useIngredients } from "../context/IngredientsContext";
import {
  EDIT_QUANTITY_LABEL,
  INGREDIENT_OPTIONS_TITLE,
  INGREDIENT_QUANTITY_SHORT_PLACEHOLDER,
  REMOVE_INGREDIENT_LABEL,
} from "../content";

import { KebabIcon } from "../assets/icons";

export type Ingredient = {
  name: string;
  quantity?: string;
};

export default function IngredientCard({
  ingredient,
}: {
  ingredient: Ingredient;
}) {
  const { dispatch } = useIngredients();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [quantityDraft, setQuantityDraft] = useState("");
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
    setQuantityDraft(ingredient.quantity ?? "");
    setIsEditing(true);
    setIsMenuOpen(false);
  };

  const saveQuantity = () => {
    dispatch({
      type: "updateIngredient",
      name: ingredient.name,
      quantity: quantityDraft.trim() || undefined,
    });
    setIsEditing(false);
  };

  const remove = () => {
    dispatch({ type: "removeIngredient", name: ingredient.name });
    setIsMenuOpen(false);
  };

  return (
    <div className="flex items-center justify-between border border-border rounded-xl bg-white/60 px-4 py-3">
      <span className="flex items-center gap-3 text-sm text-ink">
        <span className="w-1.5 h-1.5 rounded-full bg-terracotta" />
        {ingredient.name}
      </span>

      <div className="flex items-center gap-2">
        {isEditing ? (
          <input
            type="text"
            autoFocus
            value={quantityDraft}
            onChange={(event) => setQuantityDraft(event.target.value)}
            onBlur={saveQuantity}
            onKeyDown={(event) => {
              if (event.key === "Enter") saveQuantity();
              if (event.key === "Escape") setIsEditing(false);
            }}
            placeholder={INGREDIENT_QUANTITY_SHORT_PLACEHOLDER}
            className="w-24 border border-terracotta rounded-full bg-white px-2.5 py-1 text-xs text-ink focus:outline-none"
          />
        ) : (
          ingredient.quantity && (
            <span className="text-xs font-medium text-terracotta bg-terracotta-soft rounded-full px-2.5 py-1">
              {ingredient.quantity}
            </span>
          )
        )}

        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setIsMenuOpen((open) => !open)}
            title={INGREDIENT_OPTIONS_TITLE}
            className="w-7 h-7 rounded-lg text-muted flex items-center justify-center hover:bg-black/5 transition-colors"
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
  );
}
