import { describe, expect, it } from "vitest";
import { isRecipeContent, parseRecipeSegments } from "./parseRecipe";

const fullRecipe = `Hello there, fellow chef!

## Homemade Egg Tarts

- **Time:** 90 Minutes
- **Difficulty:** Medium
- **Serves:** 8

### [Ingredients] The Canvas

* 1/2 cup unsalted butter
* 2 large eggs

### [Steps] The Method

1. **Prepare the dough:** Cream the butter.
2. **Bake:** 375°F for 15 minutes.

### Pros

* + Warm and fresh out of the oven.

### [Ending comment] Chef's Secret

Strain the custard twice.`;

describe("parseRecipeSegments", () => {
  it("splits a full recipe into intro, pills, columns, tail, callout", () => {
    const segments = parseRecipeSegments(fullRecipe);
    expect(segments.map((s) => s.kind)).toEqual([
      "markdown",
      "pills",
      "columns",
      "markdown",
      "callout",
    ]);
  });

  it("extracts metadata fields and keeps the title in the leading segment", () => {
    const segments = parseRecipeSegments(fullRecipe);
    const pills = segments.find((s) => s.kind === "pills");
    expect(pills).toMatchObject({
      meta: { time: "90 Minutes", difficulty: "Medium", serves: "8" },
    });
    const intro = segments[0];
    expect(intro.kind === "markdown" && intro.text).toContain(
      "## Homemade Egg Tarts",
    );
  });

  it("strips bracket tags but keeps personalized titles", () => {
    const segments = parseRecipeSegments(fullRecipe);
    const columns = segments.find((s) => s.kind === "columns");
    expect(columns?.kind === "columns" && columns.ingredients).toContain(
      "### The Canvas",
    );
    expect(columns?.kind === "columns" && columns.steps).toContain(
      "### The Method",
    );
    const allText = JSON.stringify(segments);
    expect(allText).not.toContain("[Ingredients]");
    expect(allText).not.toContain("[Steps]");
    expect(allText).not.toContain("[Ending comment]");
  });

  it("emits the callout with title and body", () => {
    const segments = parseRecipeSegments(fullRecipe);
    const callout = segments.find((s) => s.kind === "callout");
    expect(callout).toMatchObject({ title: "Chef's Secret" });
    expect(callout?.kind === "callout" && callout.body).toContain(
      "Strain the custard twice.",
    );
  });

  it("still parses tagged sections when the metadata block is missing", () => {
    const noMeta = `Intro text.

### [Ingredients] The Lineup

* 6 large eggs

### [Steps] Let's Get Cooking!

1. Boil the eggs.`;
    const segments = parseRecipeSegments(noMeta);
    expect(segments.map((s) => s.kind)).toEqual(["markdown", "columns"]);
    expect(JSON.stringify(segments)).not.toContain("[Ingredients]");
  });

  it("accepts metadata without bullet markers and in any order", () => {
    const markdown = `## Dish

**Serves:** 4
**Time**: 20 minutes

### [Ingredients] A

* x

### [Steps] B

1. y`;
    const pills = parseRecipeSegments(markdown).find((s) => s.kind === "pills");
    expect(pills).toMatchObject({
      meta: { serves: "4", time: "20 minutes" },
    });
  });

  it("accepts plain unbolded metadata lines", () => {
    const markdown = `## Sesame Balls

Time: 45 minutes
Difficulty: Easy
Serves: 6 (makes 12 delicious sesame balls)

### [Ingredients] The Lineup

* glutinous rice flour

### [Steps] The Method

1. Mix the dough.`;
    const segments = parseRecipeSegments(markdown);
    expect(segments.map((s) => s.kind)).toEqual([
      "markdown",
      "pills",
      "columns",
    ]);
    expect(segments[1]).toMatchObject({
      meta: {
        time: "45 minutes",
        difficulty: "Easy",
        serves: "6 (makes 12 delicious sesame balls)",
      },
    });
  });

  it("does not treat prose mentioning a field name without a colon as metadata", () => {
    const chat = "Time flies when you cook! Serves you well to prep early.";
    expect(parseRecipeSegments(chat)).toEqual([
      { kind: "markdown", text: chat },
    ]);
  });

  it("anchors pills under the ## title even when metadata comes first", () => {
    const metaBeforeTitle = `Welcome back to the kitchen!

- **Time:** 30 minutes
- **Difficulty:** Easy

## Garlic Butter Shrimp

### [Ingredients] The Goods

* shrimp

### [Steps] The Moves

1. Sizzle.`;
    const segments = parseRecipeSegments(metaBeforeTitle);
    expect(segments.map((s) => s.kind)).toEqual([
      "markdown",
      "pills",
      "columns",
    ]);
    const intro = segments[0];
    expect(intro.kind === "markdown" && intro.text).toContain(
      "## Garlic Butter Shrimp",
    );
    expect(intro.kind === "markdown" && intro.text).not.toContain("**Time:**");
  });

  it("extracts a --- divider directly after the metadata bullets", () => {
    const withRule = `## Sesame Balls

Time: 45 minutes
Difficulty: Medium
Serves: 12 sesame balls

---

### [Ingredients] The Lineup

* glutinous rice flour

### [Steps] The Method

1. Mix the dough.`;
    const segments = parseRecipeSegments(withRule);
    expect(segments.map((s) => s.kind)).toEqual([
      "markdown",
      "pills",
      "columns",
    ]);
    expect(JSON.stringify(segments)).not.toContain("---");
  });

  it("keeps dividers that are not attached to the metadata block", () => {
    const markdown = `## Dish

- **Time:** 10 minutes

### [Ingredients] A

* x

### [Steps] B

1. y

---

### Pros

* + great`;
    const segments = parseRecipeSegments(markdown);
    // The divider lives in the steps section's body, not the metadata block,
    // so it must survive extraction.
    expect(JSON.stringify(segments)).toContain("---");
  });

  it("strips a trailing --- from the last section before the ending comment", () => {
    const markdown = `## Dish

- **Time:** 10 minutes

### [Ingredients] A

* x

### [Steps] B

1. y

### Tips

Great with tea.

---

### [Ending comment] One Last Thing

Enjoy!`;
    const segments = parseRecipeSegments(markdown);
    const tail = segments.find(
      (s) => s.kind === "markdown" && s.text.includes("Tips"),
    );
    expect(tail?.kind === "markdown" && tail.text).not.toContain("---");
    expect(segments[segments.length - 1]).toMatchObject({
      kind: "callout",
      title: "One Last Thing",
    });
  });

  it("strips a trailing --- from the steps column when it ends the recipe", () => {
    const markdown = `- **Time:** 10 minutes

### [Ingredients] A

* x

### [Steps] B

1. y

---`;
    const segments = parseRecipeSegments(markdown);
    const columns = segments.find((s) => s.kind === "columns");
    expect(columns?.kind === "columns" && columns.steps).not.toContain("---");
  });

  it("strips unknown bracket tags like [Pros and Cons] from headings", () => {
    const markdown = `## Dish

- **Time:** 10 minutes

### [Ingredients] A

* x

### [Steps] B

1. y

### [Pros and Cons] The Trade-Offs

* + quick to make
* - needs a wok`;
    const segments = parseRecipeSegments(markdown);
    const tail = segments.find(
      (s) => s.kind === "markdown" && s.text.includes("Trade-Offs"),
    );
    expect(tail?.kind === "markdown" && tail.text).toContain(
      "### The Trade-Offs",
    );
    expect(JSON.stringify(segments)).not.toContain("[Pros and Cons]");
  });

  it("renders a solo tagged section flat with the tag stripped", () => {
    const solo = `- **Time:** 5 minutes

### [Ingredients] Only Section

* x`;
    const segments = parseRecipeSegments(solo);
    expect(segments.map((s) => s.kind)).toEqual(["pills", "markdown"]);
    const tail = segments[1];
    expect(tail.kind === "markdown" && tail.text).toContain(
      "### Only Section",
    );
    expect(tail.kind === "markdown" && tail.text).not.toContain(
      "[Ingredients]",
    );
  });

  it("returns a single markdown segment for non-recipe content", () => {
    const chat = "Hello! Basil pairs beautifully with tomatoes.";
    expect(parseRecipeSegments(chat)).toEqual([
      { kind: "markdown", text: chat },
    ]);
  });
});

describe("isRecipeContent", () => {
  it("is true with metadata, true with tags only, false for plain chat", () => {
    expect(isRecipeContent(fullRecipe)).toBe(true);
    expect(isRecipeContent("### [Steps] Go\n\n1. x")).toBe(true);
    expect(isRecipeContent("Just a chat about basil.")).toBe(false);
  });
});
