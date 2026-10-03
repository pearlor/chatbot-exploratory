import { describe, expect, it } from "vitest";
import {
  formatQuantity,
  measureForUnit,
  parseQuantity,
  unitOptionsFor,
} from "./quantity";

describe("unitOptionsFor", () => {
  it("lists only the mass units a recipe writes, with readable labels", () => {
    const options = unitOptionsFor("mass");

    expect(options.map((option) => option.abbr)).toEqual([
      "mg",
      "g",
      "kg",
      "oz",
      "lb",
    ]);
    expect(options[1]).toEqual({ abbr: "g", label: "g — Grams" });
  });

  it("lists only the volume units a recipe writes", () => {
    const options = unitOptionsFor("volume");

    expect(options.map((option) => option.abbr)).toEqual([
      "ml",
      "l",
      "tsp",
      "Tbs",
      "fl-oz",
      "cup",
      "pnt",
      "qt",
      "gal",
    ]);
    expect(options[5]).toEqual({ abbr: "cup", label: "cup — Cups" });
  });
});

describe("measureForUnit", () => {
  it("finds the measure a unit belongs to", () => {
    expect(measureForUnit("g")).toBe("mass");
    expect(measureForUnit("cup")).toBe("volume");
  });

  it("returns undefined for a unit outside mass and volume", () => {
    // 'ft' is a length unit, which the fridge doesn't offer.
    expect(measureForUnit("ft")).toBeUndefined();
    expect(measureForUnit("")).toBeUndefined();
  });

  it("returns undefined for a unit the dropdown leaves out", () => {
    // Both are units of a measure the fridge uses, but not ones it offers, so
    // there would be no entry for the unit dropdown to select.
    expect(measureForUnit("m3")).toBeUndefined();
    expect(measureForUnit("mcg")).toBeUndefined();
  });
});

describe("formatQuantity", () => {
  it("joins the amount and unit with no space", () => {
    expect(formatQuantity({ quantity: 200, unit: "g" })).toBe("200g");
  });

  it("renders a unit-less amount on its own", () => {
    expect(formatQuantity({ quantity: 12, unit: "" })).toBe("12");
  });

  it("trims a fractional amount to two decimals", () => {
    expect(formatQuantity({ quantity: 0.5, unit: "cup" })).toBe("0.5cup");
    expect(formatQuantity({ quantity: 1 / 3, unit: "cup" })).toBe("0.33cup");
  });

  it("returns an empty string when there is no quantity", () => {
    expect(formatQuantity(undefined)).toBe("");
  });
});

describe("parseQuantity", () => {
  it("reads an amount with a unit word", () => {
    expect(parseQuantity("200 g")).toEqual({ quantity: 200, unit: "g" });
    expect(parseQuantity("3 tablespoons")).toEqual({
      quantity: 3,
      unit: "Tbs",
    });
    expect(parseQuantity("2 fluid ounces")).toEqual({
      quantity: 2,
      unit: "fl-oz",
    });
  });

  it("reads an amount run together with its unit", () => {
    expect(parseQuantity("5oz")).toEqual({ quantity: 5, unit: "oz" });
  });

  it("reads fractions, mixed numbers, and decimals", () => {
    expect(parseQuantity("1/2 cup")).toEqual({ quantity: 0.5, unit: "cup" });
    expect(parseQuantity("1 1/2 cups")).toEqual({ quantity: 1.5, unit: "cup" });
    expect(parseQuantity("½ cup")).toEqual({ quantity: 0.5, unit: "cup" });
    expect(parseQuantity("1.5 l")).toEqual({ quantity: 1.5, unit: "l" });
  });

  it("keeps the amount but drops a unit it can't convert", () => {
    expect(parseQuantity("2")).toEqual({ quantity: 2, unit: "" });
    expect(parseQuantity("3 cloves")).toEqual({ quantity: 3, unit: "" });
  });

  it("returns undefined for text with no leading number", () => {
    expect(parseQuantity("a pinch")).toBeUndefined();
    expect(parseQuantity("to taste")).toBeUndefined();
    expect(parseQuantity("")).toBeUndefined();
    expect(parseQuantity(undefined)).toBeUndefined();
  });
});
