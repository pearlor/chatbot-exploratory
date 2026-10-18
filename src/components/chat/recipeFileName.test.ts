import { describe, expect, it } from "vitest";
import { recipeFileName } from "./recipeFileName";

describe("recipeFileName", () => {
  it("names the file after the dish", () => {
    expect(recipeFileName("Hi!\n\n## Homemade Egg Tarts\n\n1. x", "png")).toBe(
      "Homemade Egg Tarts.png",
    );
  });

  it("replaces characters that aren't allowed in file names", () => {
    expect(recipeFileName("## Mac & Cheese: 2/3 Batch?", "png")).toBe(
      "Mac & Cheese 2 3 Batch.png",
    );
  });

  it("falls back to recipe when there is no usable title", () => {
    expect(recipeFileName("Just a chat about basil.", "png")).toBe(
      "recipe.png",
    );
    expect(recipeFileName("## ///", "png")).toBe("recipe.png");
  });
});
