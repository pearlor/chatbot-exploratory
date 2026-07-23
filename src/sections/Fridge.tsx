import { useState } from "react";
import IngredientCard from "../components/IngredientCard";
import { useIngredients } from "../context/IngredientsContext";
import { useNavigation } from "../context/NavigationContext";
import { FRIDGE_PROMPT } from "../chat/prompts";
import {
  ADD_INGREDIENT_LABEL,
  ASK_CHEF_WITH_FRIDGE_LABEL,
  FRIDGE_HEADING,
  FRIDGE_SUBHEADING,
  INGREDIENT_NAME_PLACEHOLDER,
  INGREDIENT_QUANTITY_PLACEHOLDER,
} from "../content";

function FridgeIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="6" y="2" width="12" height="20" rx="2" />
      <path d="M6 10h12" />
      <path d="M9 6v1.5" />
      <path d="M9 13.5V15" />
    </svg>
  );
}

function ChefHatIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M6 18h12v2H6z" />
      <path d="M17 18a5 5 0 0 0 1-9.9A4 4 0 0 0 12 5a4 4 0 0 0-6 3.1A5 5 0 0 0 7 18" />
    </svg>
  );
}

export default function Fridge() {
  const { ingredients, dispatch } = useIngredients();
  const { requestChat } = useNavigation();
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("");

  const handleAdd = () => {
    if (!name.trim()) return;
    dispatch({
      type: "addIngredient",
      ingredient: { name, quantity: quantity.trim() || undefined },
    });
    setName("");
    setQuantity("");
  };

  return (
    <div className="h-full overflow-y-auto px-8 py-8">
      <div className="mx-auto max-w-3xl flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-terracotta-soft text-terracotta flex items-center justify-center shrink-0">
            <FridgeIcon />
          </div>
          <div>
            <h1 className="font-serif text-2xl font-bold text-ink">
              {FRIDGE_HEADING}
            </h1>
            <p className="text-sm text-muted">{FRIDGE_SUBHEADING}</p>
          </div>
        </div>

        {/* Add ingredient row */}
        <div className="flex gap-3">
          <input
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            onKeyDown={(event) => event.key === "Enter" && handleAdd()}
            placeholder={INGREDIENT_NAME_PLACEHOLDER}
            className="flex-1 border border-border rounded-xl bg-white/60 px-4 py-3 text-sm text-ink placeholder:text-muted focus:outline-none focus:border-terracotta transition-colors"
          />
          <input
            type="text"
            value={quantity}
            onChange={(event) => setQuantity(event.target.value)}
            onKeyDown={(event) => event.key === "Enter" && handleAdd()}
            placeholder={INGREDIENT_QUANTITY_PLACEHOLDER}
            className="w-40 border border-border rounded-xl bg-white/60 px-4 py-3 text-sm text-ink placeholder:text-muted focus:outline-none focus:border-terracotta transition-colors"
          />
          <button
            onClick={handleAdd}
            className="flex items-center gap-2 bg-terracotta text-white rounded-xl px-5 py-3 text-sm font-medium hover:brightness-95 transition"
          >
            <span>＋</span>
            {ADD_INGREDIENT_LABEL}
          </button>
        </div>

        {/* Ingredient grid */}
        <div className="grid grid-cols-2 gap-3">
          {Object.values(ingredients).map((ingredient) => (
            <IngredientCard key={ingredient.name} ingredient={ingredient} />
          ))}
        </div>

        <div className="border-t border-border" />

        {/* Ask the chef */}
        <button
          onClick={() => requestChat(FRIDGE_PROMPT)}
          className="flex items-center justify-center gap-2 w-full bg-terracotta text-white rounded-xl px-4 py-3.5 text-sm font-medium hover:brightness-95 transition"
        >
          <ChefHatIcon />
          {ASK_CHEF_WITH_FRIDGE_LABEL}
        </button>
      </div>
    </div>
  );
}
