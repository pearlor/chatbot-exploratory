import { expect, test } from "@playwright/test";
import {
  ADD_INGREDIENT_LABEL,
  ASK_CHEF_WITH_FRIDGE_LABEL,
  EDIT_QUANTITY_LABEL,
  EMPTY_FRIDGE_MESSAGE,
  EMPTY_FRIDGE_TITLE,
  FRIDGE_HEADING,
  FRIDGE_SUBHEADING,
  INGREDIENT_NAME_PLACEHOLDER,
  INGREDIENT_OPTIONS_TITLE,
  INGREDIENT_QUANTITY_PLACEHOLDER,
  INGREDIENT_QUANTITY_SHORT_PLACEHOLDER,
  REMOVE_INGREDIENT_LABEL,
  THINKING_LABEL,
} from "../src/content";
import { FRIDGE_PROMPT } from "../src/chat/prompts";
import {
  conversations,
  gotoFridge,
  ingredientCard,
  ingredientCards,
} from "./helpers";

// IngredientsContext seeds the fridge with these in demo mode.
const SEEDED_INGREDIENT_COUNT = 11;
// The `## ` heading of teacher/Fridge_Teacher.txt.
const FRIDGE_RECIPE_TITLE = "Citrus-Infused Blueberry Dutch Baby";

test.beforeEach(async ({ page }) => {
  await gotoFridge(page);
});

test("renders the header and the seeded ingredients", async ({ page }) => {
  // level 1 is what distinguishes this from the sidebar button of the same text.
  await expect(
    page.getByRole("heading", { name: FRIDGE_HEADING, level: 1 }),
  ).toBeVisible();
  await expect(page.getByText(FRIDGE_SUBHEADING)).toBeVisible();

  await expect(ingredientCards(page)).toHaveCount(SEEDED_INGREDIENT_COUNT);
  await expect(ingredientCard(page, "Eggs").getByText("12")).toBeVisible();
  // Whole-string matching, so this doesn't also count "Rice flour".
  await expect(page.getByText("Flour", { exact: true })).toHaveCount(1);
});

test("adds an ingredient with a quantity", async ({ page }) => {
  await page.getByPlaceholder(INGREDIENT_NAME_PLACEHOLDER).fill("Butter");
  await page.getByPlaceholder(INGREDIENT_QUANTITY_PLACEHOLDER).fill("200g");
  await page.getByRole("button", { name: ADD_INGREDIENT_LABEL }).click();

  await expect(ingredientCard(page, "Butter").getByText("200g")).toBeVisible();
  await expect(ingredientCards(page)).toHaveCount(SEEDED_INGREDIENT_COUNT + 1);
  await expect(
    page.getByPlaceholder(INGREDIENT_NAME_PLACEHOLDER),
  ).toHaveValue("");
  await expect(
    page.getByPlaceholder(INGREDIENT_QUANTITY_PLACEHOLDER),
  ).toHaveValue("");
});

test("Enter in either field adds the ingredient", async ({ page }) => {
  const nameField = page.getByPlaceholder(INGREDIENT_NAME_PLACEHOLDER);
  const quantityField = page.getByPlaceholder(INGREDIENT_QUANTITY_PLACEHOLDER);

  await nameField.fill("Kimchi");
  await nameField.press("Enter");

  // No quantity given, so the card renders the name alone with no pill.
  await expect(ingredientCard(page, "Kimchi")).toHaveText("Kimchi");

  await nameField.fill("Miso");
  await quantityField.fill("1 tbsp");
  await quantityField.press("Enter");

  await expect(ingredientCard(page, "Miso").getByText("1 tbsp")).toBeVisible();
  await expect(ingredientCards(page)).toHaveCount(SEEDED_INGREDIENT_COUNT + 2);
});

test("re-adding an ingredient updates its quantity, ignoring case", async ({
  page,
}) => {
  await page.getByPlaceholder(INGREDIENT_NAME_PLACEHOLDER).fill("eggs");
  await page.getByPlaceholder(INGREDIENT_QUANTITY_PLACEHOLDER).fill("6");
  await page.getByRole("button", { name: ADD_INGREDIENT_LABEL }).click();

  // Keyed by the lowercased name, so no duplicate card is created...
  await expect(ingredientCards(page)).toHaveCount(SEEDED_INGREDIENT_COUNT);
  // ...and the originally stored display casing is preserved.
  await expect(page.getByText("Eggs", { exact: true })).toBeVisible();

  const eggs = ingredientCard(page, "Eggs");
  await expect(eggs.getByText("6")).toBeVisible();
  await expect(eggs.getByText("12")).toHaveCount(0);
});

test("edits a quantity from the kebab menu", async ({ page }) => {
  const apples = ingredientCard(page, "Apples");
  await apples.getByTitle(INGREDIENT_OPTIONS_TITLE).click();
  await page.getByRole("button", { name: EDIT_QUANTITY_LABEL }).click();

  // Scoped to the card: "Qty" is also a substring of the add row's
  // "Qty (optional)" placeholder.
  const quantityInput = apples.getByPlaceholder(
    INGREDIENT_QUANTITY_SHORT_PLACEHOLDER,
  );
  await expect(quantityInput).toBeFocused();
  await expect(quantityInput).toHaveValue("5");

  await quantityInput.fill("3");
  await quantityInput.press("Enter");

  await expect(apples.getByText("3")).toBeVisible();
  await expect(quantityInput).toHaveCount(0);
});

test("blur saves an in-progress quantity edit", async ({ page }) => {
  const oranges = ingredientCard(page, "Oranges");
  await oranges.getByTitle(INGREDIENT_OPTIONS_TITLE).click();
  await page.getByRole("button", { name: EDIT_QUANTITY_LABEL }).click();

  await oranges
    .getByPlaceholder(INGREDIENT_QUANTITY_SHORT_PLACEHOLDER)
    .fill("4");
  await page.getByRole("heading", { name: FRIDGE_HEADING, level: 1 }).click();

  await expect(oranges.getByText("4")).toBeVisible();
});

test("Escape cancels a quantity edit", async ({ page }) => {
  const onion = ingredientCard(page, "Onion");
  await onion.getByTitle(INGREDIENT_OPTIONS_TITLE).click();
  await page.getByRole("button", { name: EDIT_QUANTITY_LABEL }).click();

  const quantityInput = onion.getByPlaceholder(
    INGREDIENT_QUANTITY_SHORT_PLACEHOLDER,
  );
  await quantityInput.fill("99");
  await quantityInput.press("Escape");

  // Escape unmounts the input, and React doesn't fire onBlur on unmount, so
  // the blur-saves path can't clobber this.
  await expect(onion.getByText("2")).toBeVisible();
});

test("removes an ingredient", async ({ page }) => {
  await ingredientCard(page, "Milk")
    .getByTitle(INGREDIENT_OPTIONS_TITLE)
    .click();
  await page.getByRole("button", { name: REMOVE_INGREDIENT_LABEL }).click();

  await expect(page.getByText("Milk", { exact: true })).toHaveCount(0);
  await expect(ingredientCards(page)).toHaveCount(SEEDED_INGREDIENT_COUNT - 1);
});

test("Ask the chef submits the fridge prompt exactly once", async ({ page }) => {
  await page.getByRole("button", { name: ASK_CHEF_WITH_FRIDGE_LABEL }).click();
  await expect(page.getByText(THINKING_LABEL)).toHaveCount(0);

  // toHaveCount(1) rather than toBeVisible: this is the regression guard for
  // the ref in ChatHome that stops StrictMode's double effect invocation from
  // submitting the queued prompt twice.
  await expect(page.getByText(FRIDGE_PROMPT)).toHaveCount(1);
  await expect(
    page.getByRole("heading", { name: FRIDGE_RECIPE_TITLE, level: 2 }),
  ).toBeVisible();
  await expect(conversations(page).first()).toHaveText(FRIDGE_RECIPE_TITLE);
});

test("an empty fridge produces the empty-fridge reply", async ({ page }) => {
  const options = page.getByTitle(INGREDIENT_OPTIONS_TITLE);
  while ((await options.count()) > 0) {
    await options.first().click();
    await page.getByRole("button", { name: REMOVE_INGREDIENT_LABEL }).click();
  }
  await expect(ingredientCards(page)).toHaveCount(0);

  await page.getByRole("button", { name: ASK_CHEF_WITH_FRIDGE_LABEL }).click();

  await expect(page.getByText(EMPTY_FRIDGE_MESSAGE)).toBeVisible();
  await expect(conversations(page).first()).toHaveText(EMPTY_FRIDGE_TITLE);
});
