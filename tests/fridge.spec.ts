import { expect, test, type Locator, type Page } from "@playwright/test";
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
  REMOVE_INGREDIENT_LABEL,
  THINKING_LABEL,
} from "../src/content";
import { FRIDGE_PROMPT } from "../src/chat/prompts";
import {
  conversations,
  fillQuantity,
  gotoFridge,
  ingredientCard,
  ingredientCards,
  measureSelect,
  quantityAmount,
  unitSelect,
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
  await fillQuantity(page, { amount: "200", measure: "mass", unit: "g" });
  await page.getByRole("button", { name: ADD_INGREDIENT_LABEL }).click();

  // The pill joins the amount and the unit abbreviation with no space.
  await expect(ingredientCard(page, "Butter").getByText("200g")).toBeVisible();
  await expect(ingredientCards(page)).toHaveCount(SEEDED_INGREDIENT_COUNT + 1);
  await expect(
    page.getByPlaceholder(INGREDIENT_NAME_PLACEHOLDER),
  ).toHaveValue("");
  // The quantity controls remount empty, so the measure and unit reset too.
  await expect(quantityAmount(page)).toHaveValue("");
  await expect(measureSelect(page)).toHaveValue("");
  await expect(unitSelect(page)).toBeDisabled();
});

test("the unit choices follow the selected measure", async ({ page }) => {
  await expect(unitSelect(page)).toBeDisabled();

  await measureSelect(page).selectOption("mass");
  await expect(unitSelect(page)).toBeEnabled();
  await unitSelect(page).selectOption("g");

  // Grams are meaningless under volume, so switching measure clears the unit
  // and offers the volume units instead.
  await measureSelect(page).selectOption("volume");
  await expect(unitSelect(page)).toHaveValue("");
  await unitSelect(page).selectOption("cup");
  await expect(unitSelect(page)).toHaveValue("cup");
});

test("Enter in either field adds the ingredient", async ({ page }) => {
  const nameField = page.getByPlaceholder(INGREDIENT_NAME_PLACEHOLDER);

  await nameField.fill("Kimchi");
  await nameField.press("Enter");

  // No quantity given, so the card renders the name alone with no pill.
  await expect(ingredientCard(page, "Kimchi")).toHaveText("Kimchi");

  await nameField.fill("Miso");
  await fillQuantity(page, { amount: "30", measure: "volume", unit: "ml" });
  await quantityAmount(page).press("Enter");

  await expect(ingredientCard(page, "Miso").getByText("30ml")).toBeVisible();
  await expect(ingredientCards(page)).toHaveCount(SEEDED_INGREDIENT_COUNT + 2);
});

test("re-adding an ingredient updates its quantity, ignoring case", async ({
  page,
}) => {
  await page.getByPlaceholder(INGREDIENT_NAME_PLACEHOLDER).fill("eggs");
  // Eggs are counted, not measured, so the amount stands on its own.
  await fillQuantity(page, { amount: "6" });
  await page.getByRole("button", { name: ADD_INGREDIENT_LABEL }).click();

  // Keyed by the lowercased name, so no duplicate card is created...
  await expect(ingredientCards(page)).toHaveCount(SEEDED_INGREDIENT_COUNT);
  // ...and the originally stored display casing is preserved.
  await expect(page.getByText("Eggs", { exact: true })).toBeVisible();

  const eggs = ingredientCard(page, "Eggs");
  await expect(eggs.getByText("6")).toBeVisible();
  await expect(eggs.getByText("12")).toHaveCount(0);
});

/** Open a card's quantity editor via its kebab menu. */
async function startEditingQuantity(page: Page, card: Locator) {
  await card.getByTitle(INGREDIENT_OPTIONS_TITLE).click();
  await page.getByRole("button", { name: EDIT_QUANTITY_LABEL }).click();
}

test("edits a quantity from the kebab menu", async ({ page }) => {
  const apples = ingredientCard(page, "Apples");
  await startEditingQuantity(page, apples);

  // Locators are scoped to the card, which has its own set of the three
  // controls while editing.
  await expect(quantityAmount(apples)).toBeFocused();
  await expect(quantityAmount(apples)).toHaveValue("5");

  await fillQuantity(apples, { amount: "3", measure: "mass", unit: "kg" });
  await unitSelect(apples).press("Enter");

  await expect(apples.getByText("3kg")).toBeVisible();
  await expect(quantityAmount(apples)).toHaveCount(0);
});

test("moving between the three controls doesn't end the edit", async ({
  page,
}) => {
  const apples = ingredientCard(page, "Apples");
  await startEditingQuantity(page, apples);

  // Saving happens on blur, and focus leaving the amount field for the measure
  // select is a blur — so the editor has to stay open until focus leaves all
  // three.
  await quantityAmount(apples).fill("3");
  await measureSelect(apples).focus();
  await expect(measureSelect(apples)).toBeVisible();
  await unitSelect(apples).focus();
  await expect(quantityAmount(apples)).toHaveValue("3");
});

test("blur saves an in-progress quantity edit", async ({ page }) => {
  const oranges = ingredientCard(page, "Oranges");
  await startEditingQuantity(page, oranges);

  await quantityAmount(oranges).fill("4");
  await page.getByRole("heading", { name: FRIDGE_HEADING, level: 1 }).click();

  await expect(oranges.getByText("4")).toBeVisible();
  await expect(quantityAmount(oranges)).toHaveCount(0);
});

test("Escape cancels a quantity edit", async ({ page }) => {
  const onion = ingredientCard(page, "Onion");
  await startEditingQuantity(page, onion);

  await quantityAmount(onion).fill("99");
  await quantityAmount(onion).press("Escape");

  // Escape unmounts the controls, and React doesn't fire onBlur on unmount, so
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
