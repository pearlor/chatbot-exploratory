import { useState } from "react";
import IngredientCard from "../components/IngredientCard";
import QuantityFields from "../components/QuantityFields";
import type { IngredientQuantity } from "../quantity";
import { useIngredients } from "../context/IngredientsContext";
import { useNavigation } from "../context/NavigationContext";
import { FRIDGE_PROMPT } from "../chat/prompts";
import {
  ADD_INGREDIENT_LABEL,
  ASK_CHEF_WITH_FRIDGE_LABEL,
  FRIDGE_HEADING,
  FRIDGE_SUBHEADING,
  INGREDIENT_NAME_PLACEHOLDER,
} from "../content";

import { ChefHatIcon, FridgeIcon } from "../assets/icons";

export default function Fridge() {
  const { ingredients, dispatch } = useIngredients();
  const { requestChat } = useNavigation();
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState<IngredientQuantity | undefined>(
    undefined,
  );
  // QuantityFields keeps its own in-progress state, so clearing the row after
  // an add means remounting it with a new key.
  const [quantityFieldsKey, setQuantityFieldsKey] = useState(0);

  const handleAdd = () => {
    if (!name.trim()) return;
    dispatch({
      type: "addIngredient",
      ingredient: { name, quantity },
    });
    setName("");
    setQuantity(undefined);
    setQuantityFieldsKey((key) => key + 1);
  };

  return (
    <div className="h-full overflow-y-auto px-4 py-6 sm:px-8 sm:py-8">
      <div className="mx-auto max-w-3xl flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-terracotta-soft text-terracotta flex items-center justify-center shrink-0">
            <FridgeIcon />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-ink">{FRIDGE_HEADING}</h1>
            <p className="text-sm text-muted">{FRIDGE_SUBHEADING}</p>
          </div>
        </div>

        {/* Add ingredient row: stacks on phones, where the quantity controls
            side by side leave the name field unusably narrow. text-base below
            sm keeps iOS Safari from zooming in on focus. */}
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            onKeyDown={(event) => event.key === "Enter" && handleAdd()}
            placeholder={INGREDIENT_NAME_PLACEHOLDER}
            className="flex-1 min-w-0 border border-border rounded-xl bg-white/60 px-4 py-3 text-base sm:text-sm text-ink placeholder:text-muted focus:outline-none focus:border-terracotta transition-colors"
          />
          {/* Amount, measure and unit wrap together: four controls on one line
              are too cramped even on a wide screen. */}
          <div className="flex flex-wrap gap-3">
            <QuantityFields
              key={quantityFieldsKey}
              value={quantity}
              onChange={setQuantity}
              onEnter={handleAdd}
            />
            <button
              onClick={handleAdd}
              className="flex items-center gap-2 shrink-0 bg-terracotta text-white rounded-xl px-5 py-3 text-sm font-medium hover:brightness-95 transition"
            >
              <span>＋</span>
              {ADD_INGREDIENT_LABEL}
            </button>
          </div>
        </div>

        {/* Ingredient grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
