import { useEffect, useRef, useState } from "react";
import { useIngredients } from "../context/IngredientsContext";

export type Ingredient = {
  name: string;
  quantity?: string;
};

function KebabIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <circle cx="12" cy="5" r="1.6" />
      <circle cx="12" cy="12" r="1.6" />
      <circle cx="12" cy="19" r="1.6" />
    </svg>
  );
}

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
            placeholder="Qty"
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
            title="Options"
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
                Edit quantity
              </button>
              <button
                onClick={remove}
                className="w-full text-left px-3 py-1.5 text-sm text-terracotta hover:bg-black/5 transition-colors"
              >
                Remove
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
