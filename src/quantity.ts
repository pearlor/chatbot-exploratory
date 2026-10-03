import configureMeasurements from "convert-units";
import mass from "convert-units/definitions/mass";
import volume from "convert-units/definitions/volume";
import type { MassUnits } from "convert-units/definitions/mass";
import type { VolumeUnits } from "convert-units/definitions/volume";

export const MEASURES = ["mass", "volume"] as const;

export type MeasureName = (typeof MEASURES)[number];

/** Every unit abbreviation the fridge can offer. */
export type UnitAbbr = MassUnits | VolumeUnits;

/**
 * convert-units is configured with only the two measures that make sense for
 * food. It knows about two dozen (length, temperature, digital storage, …);
 * leaving the rest out keeps them out of the dropdowns and out of the bundle.
 *
 * The generics are spelled out because inference takes the unit type from the
 * first measure alone, and then rejects the second for not being made of mass
 * units.
 */
const convert = configureMeasurements<MeasureName, UnitSystem, UnitAbbr>({
  mass,
  volume,
});

/** Both configured measures use these two systems. */
type UnitSystem = "metric" | "imperial";

/**
 * An ingredient amount: a number plus a unit abbreviation.
 *
 * The unit is `""` for a countable item — 12 eggs has an amount but no unit of
 * measure — which is why it's a plain string rather than `UnitAbbr`.
 */
export type IngredientQuantity = {
  quantity: number;
  unit: string;
};

export type UnitOption = {
  abbr: string;
  label: string;
};

/**
 * The unit choices for a measure, in convert-units' own order (metric first,
 * then imperial). `list()` rather than `possibilities()`: it returns the same
 * abbreviations, but also the human-readable names the dropdown labels need.
 */
export function unitOptionsFor(measure: MeasureName): UnitOption[] {
  return convert()
    .list(measure)
    .map((unit) => ({
      abbr: unit.abbr,
      label: `${unit.abbr} — ${unit.plural}`,
    }));
}

// Built once at module load: which measure each unit abbreviation belongs to,
// so an existing quantity can be reopened in the editor with its measure
// dropdown already on the right entry.
const measuresByUnit: Record<string, MeasureName> = Object.fromEntries(
  MEASURES.flatMap((measure) =>
    convert()
      .list(measure)
      .map((unit) => [unit.abbr, measure]),
  ),
);

/** The measure a unit belongs to, or undefined for an unknown abbreviation. */
export function measureForUnit(unit: string): MeasureName | undefined {
  return measuresByUnit[unit];
}

// Rounds to at most two decimals and drops trailing zeros, so a parsed "1/2
// cup" reads as "0.5cup" rather than "0.50cup".
function roundAmount(amount: number): number {
  return Math.round(amount * 100) / 100;
}

/**
 * The single read path for a quantity: everything that displays one or sends
 * one to the chef AI goes through here.
 *
 * Renders with no space between amount and unit ("200g", "5oz"), matching how
 * the fridge has always shown quantities. Returns "" when there is none, so
 * callers can test for emptiness without unpacking the value.
 */
export function formatQuantity(value: IngredientQuantity | undefined): string {
  if (value === undefined) return "";

  return `${roundAmount(value.quantity)}${value.unit}`;
}

// Recipe text writes units as words, convert-units wants abbreviations. Only
// mass and volume units are mapped: a recipe's "3 cloves" or "2 slices" has a
// number but no unit this app can convert, so those keep the number and drop
// the word.
//
// The values are typed as `UnitAbbr`, so a mistyped abbreviation — "tbsp"
// where convert-units wants "Tbs" — is a compile error rather than a unit it
// rejects at runtime.
const UNIT_ALIASES: Record<string, UnitAbbr> = {
  // Volume
  tsp: "tsp",
  teaspoon: "tsp",
  teaspoons: "tsp",
  tbs: "Tbs",
  tbsp: "Tbs",
  tablespoon: "Tbs",
  tablespoons: "Tbs",
  cup: "cup",
  cups: "cup",
  "fl-oz": "fl-oz",
  "fl oz": "fl-oz",
  "fluid ounce": "fl-oz",
  "fluid ounces": "fl-oz",
  pt: "pnt",
  pint: "pnt",
  pints: "pnt",
  qt: "qt",
  quart: "qt",
  quarts: "qt",
  gal: "gal",
  gallon: "gal",
  gallons: "gal",
  ml: "ml",
  milliliter: "ml",
  milliliters: "ml",
  l: "l",
  liter: "l",
  liters: "l",
  litre: "l",
  litres: "l",
  // Mass
  g: "g",
  gram: "g",
  grams: "g",
  kg: "kg",
  kilogram: "kg",
  kilograms: "kg",
  mg: "mg",
  milligram: "mg",
  milligrams: "mg",
  oz: "oz",
  ounce: "oz",
  ounces: "oz",
  lb: "lb",
  lbs: "lb",
  pound: "lb",
  pounds: "lb",
};

const UNICODE_FRACTIONS: Record<string, number> = {
  "½": 0.5,
  "⅓": 1 / 3,
  "⅔": 2 / 3,
  "¼": 0.25,
  "¾": 0.75,
  "⅛": 0.125,
};

// Everything up to the first space is the candidate unit, except "fl oz" and
// "fluid ounce(s)", which are two words — so the two-word form is tried first.
function parseUnit(text: string): string {
  const normalized = text.toLowerCase().replace(/\./g, "").trim();
  const words = normalized.split(/\s+/);
  const candidates = [words.slice(0, 2).join(" "), words[0]];

  for (const candidate of candidates) {
    const abbr = UNIT_ALIASES[candidate];
    if (abbr) return abbr;
  }
  return "";
}

/**
 * Reads a free-text amount into an `IngredientQuantity`.
 *
 * This is the one place free text still enters the app, because recipe
 * quantities arrive as prose from the chef AI — "1/2 cup", "3 tablespoons",
 * "2". Text with no leading number ("a pinch", "to taste") can't be
 * represented and returns undefined, leaving that ingredient without a
 * quantity.
 */
export function parseQuantity(
  text: string | undefined,
): IngredientQuantity | undefined {
  if (!text) return undefined;

  const trimmed = text.trim();

  // "1 1/2 cups", then "1/2 cup", then "200 g", then "½ cup".
  const mixedFraction = trimmed.match(/^(\d+)\s+(\d+)\/(\d+)\s*(.*)$/);
  const fraction = trimmed.match(/^(\d+)\/(\d+)\s*(.*)$/);
  const decimal = trimmed.match(/^(\d+(?:\.\d+)?)\s*(.*)$/);
  const unicodeFraction = trimmed.match(/^(.)\s*(.*)$/);

  let amount: number;
  let rest: string;

  if (mixedFraction) {
    amount =
      Number(mixedFraction[1]) +
      Number(mixedFraction[2]) / Number(mixedFraction[3]);
    rest = mixedFraction[4];
  } else if (fraction) {
    amount = Number(fraction[1]) / Number(fraction[2]);
    rest = fraction[3];
  } else if (decimal) {
    amount = Number(decimal[1]);
    rest = decimal[2];
  } else if (unicodeFraction && unicodeFraction[1] in UNICODE_FRACTIONS) {
    amount = UNICODE_FRACTIONS[unicodeFraction[1]];
    rest = unicodeFraction[2];
  } else {
    return undefined;
  }

  if (!Number.isFinite(amount)) return undefined;

  return { quantity: roundAmount(amount), unit: parseUnit(rest) };
}
