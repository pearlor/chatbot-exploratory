import { useState } from "react";
import type { KeyboardEvent } from "react";
import type { IngredientQuantity, MeasureName } from "../quantity";
import { MEASURES, measureForUnit, unitOptionsFor } from "../quantity";
import {
  INGREDIENT_QUANTITY_PLACEHOLDER,
  INGREDIENT_QUANTITY_SHORT_PLACEHOLDER,
  MEASURE_LABELS,
  MEASURE_SELECT_LABEL,
  NO_MEASURE_OPTION_LABEL,
  UNIT_SELECT_LABEL,
} from "../content";

export type QuantityFieldsProps = {
  /** The quantity being edited, or undefined for an empty one. */
  value: IngredientQuantity | undefined;
  onChange: (next: IngredientQuantity | undefined) => void;
  /** Enter pressed in any of the three controls — used to submit. */
  onEnter?: () => void;
  /** Escape pressed in any of the three controls — used to cancel. */
  onEscape?: () => void;
  /** "compact" fits the controls inside an ingredient card or a modal row. */
  size?: "default" | "compact";
  disabled?: boolean;
  autoFocus?: boolean;
};

/**
 * Three controls for entering a quantity: an amount, a unit of measure, and a
 * specific unit within that measure. The unit list comes from convert-units,
 * so only units it can actually convert between are offerable.
 *
 * The three are internal state rather than derived from `value`, because a
 * half-finished entry has no `value` to derive from: "mass" with no unit yet,
 * or a measure chosen before the amount is typed. `value` seeds that state on
 * mount, so a parent that needs to reset the fields — the add row, after
 * adding — remounts this component with a changed `key`.
 */
export default function QuantityFields({
  value,
  onChange,
  onEnter,
  onEscape,
  size = "default",
  disabled = false,
  autoFocus = false,
}: QuantityFieldsProps) {
  const [amount, setAmount] = useState(
    value === undefined ? "" : String(value.quantity),
  );
  const [measure, setMeasure] = useState<MeasureName | "">(
    value === undefined ? "" : (measureForUnit(value.unit) ?? ""),
  );
  const [unit, setUnit] = useState(value?.unit ?? "");

  // A quantity needs a number; the unit is optional, so an amount on its own is
  // a complete entry.
  const emitChange = (nextAmount: string, nextUnit: string) => {
    const parsedAmount = Number(nextAmount);
    const hasAmount = nextAmount.trim() !== "" && Number.isFinite(parsedAmount);
    onChange(
      hasAmount ? { quantity: parsedAmount, unit: nextUnit } : undefined,
    );
  };

  const handleAmountChange = (nextAmount: string) => {
    setAmount(nextAmount);
    emitChange(nextAmount, unit);
  };

  // Units don't carry across measures, so switching measure clears the unit
  // rather than leaving "g" selected under volume.
  const handleMeasureChange = (nextMeasure: MeasureName | "") => {
    setMeasure(nextMeasure);
    setUnit("");
    emitChange(amount, "");
  };

  const handleUnitChange = (nextUnit: string) => {
    setUnit(nextUnit);
    emitChange(amount, nextUnit);
  };

  const isCompact = size === "compact";
  const fieldClasses = isCompact
    ? "border border-border rounded-lg bg-white px-2 py-1 text-xs text-ink focus:outline-none focus:border-terracotta transition-colors disabled:text-muted"
    : // text-base below sm keeps iOS Safari from zooming in on focus, the same
      // reason the ingredient name field has it.
      "border border-border rounded-xl bg-white/60 px-4 py-3 text-base sm:text-sm text-ink placeholder:text-muted focus:outline-none focus:border-terracotta transition-colors disabled:text-muted";

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === "Enter") onEnter?.();
    if (event.key === "Escape") onEscape?.();
  };

  return (
    <>
      <input
        type="number"
        inputMode="decimal"
        min="1"
        step="any"
        autoFocus={autoFocus}
        disabled={disabled}
        value={amount}
        onChange={(event) => handleAmountChange(event.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={
          isCompact
            ? INGREDIENT_QUANTITY_SHORT_PLACEHOLDER
            : INGREDIENT_QUANTITY_PLACEHOLDER
        }
        className={`${fieldClasses} ${isCompact ? "w-16" : "w-24"} min-w-0`}
      />

      <select
        aria-label={MEASURE_SELECT_LABEL}
        disabled={disabled}
        value={measure}
        onChange={(event) =>
          handleMeasureChange(event.target.value as MeasureName | "")
        }
        onKeyDown={handleKeyDown}
        className={`${fieldClasses} ${isCompact ? "" : "flex-1 sm:flex-none"} min-w-0`}
      >
        <option value="">{NO_MEASURE_OPTION_LABEL}</option>
        {MEASURES.map((measureName) => (
          <option key={measureName} value={measureName}>
            {MEASURE_LABELS[measureName]}
          </option>
        ))}
      </select>

      {measure !== "" && (
        <select
          aria-label={UNIT_SELECT_LABEL}
          value={unit}
          onChange={(event) => handleUnitChange(event.target.value)}
          onKeyDown={handleKeyDown}
          className={`${fieldClasses} ${isCompact ? "" : "flex-1 sm:flex-none"} min-w-0 disabled:opacity-50`}
        >
          {unitOptionsFor(measure).map((option) => (
            <option key={option.abbr} value={option.abbr}>
              {option.label}
            </option>
          ))}
        </select>
      )}
    </>
  );
}
