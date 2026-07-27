import { expect, test } from "@playwright/test";
import {
  AI_DISCLAIMER,
  ASK_MODE_LABEL,
  CHAT_EMPTY_GREETING,
  FRIDGE_MODE_LABEL,
  FRIDGE_NAV_LABEL,
  FRIDGE_HEADING,
  PERSONA_TEACHER_NAME,
  SUGGESTION_FIVE_INGREDIENT_LABEL,
  SUGGESTION_FRIDGE_LABEL,
  SUGGESTION_SURPRISE_LABEL,
  SUGGESTION_SURPRISE_PROMPT,
  SUGGESTION_VEGETARIAN_LABEL,
  THINKING_LABEL,
} from "../src/content";
import { FRIDGE_PROMPT } from "../src/chat/prompts";
import {
  DEMO_FRIDGE_PROMPT,
  MAIN_USER_FOLLOWUP,
  MAIN_USER_PROMPT,
} from "../src/demo/DemoUserPrompts";
import {
  chatInput,
  conversations,
  distanceFromPaneTop,
  gotoApp,
  modeSelector,
  sendButton,
  sendScriptedPrompt,
} from "./helpers";

// The `## ` headings of the demo fixtures under src/demo/teacher. Each script
// has a distinct dish name, which is what makes them usable as assertions.
const MAIN_RECIPE_TITLE = "The Ultimate Golden Grilled Cheese";
const FOLLOW_UP_TITLE = "Gouda vs. Cheddar: The Ultimate Cheese Showdown";
const SURPRISE_RECIPE_TITLE = "Chef Kale's Crispy Gochujang Honey Brussels Sprouts";
const FRIDGE_RECIPE_TITLE = "Citrus-Infused Blueberry Dutch Baby";

// The seeded conversation in ChatHistoryContext, whose chef reply is the
// example_response.md fixture. Its title and `## ` heading are the same text.
const MOCK_CONVERSATION_TITLE = "Homemade Egg Tarts";

test.beforeEach(async ({ page }) => {
  await gotoApp(page);
});

test("renders the empty state, suggestion chips, and composer", async ({
  page,
}) => {
  await expect(page.getByText(CHAT_EMPTY_GREETING)).toBeVisible();

  for (const label of [
    SUGGESTION_SURPRISE_LABEL,
    SUGGESTION_VEGETARIAN_LABEL,
    SUGGESTION_FIVE_INGREDIENT_LABEL,
    SUGGESTION_FRIDGE_LABEL,
  ]) {
    await expect(page.getByRole("button", { name: label })).toBeVisible();
  }

  await expect(chatInput(page)).toBeVisible();
  await expect(sendButton(page)).toBeEnabled();
  await expect(page.getByText(AI_DISCLAIMER)).toBeVisible();
});

test("the composer is read-only and pinned to the scripted prompt", async ({
  page,
}) => {
  await expect(chatInput(page)).toHaveValue(MAIN_USER_PROMPT);
  await expect(chatInput(page)).toHaveAttribute("readonly", "");

  // Typed via the keyboard rather than fill()/type(), which would fail the
  // editability actionability check on a readOnly input and time out.
  await chatInput(page).click();
  await page.keyboard.type("pizza");

  await expect(chatInput(page)).toHaveValue(MAIN_USER_PROMPT);
});

test("sending the scripted prompt renders the user bubble and recipe card", async ({
  page,
}) => {
  await sendScriptedPrompt(page);

  await expect(page.getByText(MAIN_USER_PROMPT)).toBeVisible();
  await expect(
    page.getByRole("heading", { name: MAIN_RECIPE_TITLE, level: 2 }),
  ).toBeVisible();
  await expect(page.getByText(PERSONA_TEACHER_NAME).first()).toBeVisible();

  // Recipe pills parsed out of the fixture's metadata block.
  await expect(page.getByText("10 minutes")).toBeVisible();
  await expect(page.getByText("Easy Difficulty")).toBeVisible();
  await expect(page.getByText("Serves 1")).toBeVisible();

  // The section heading with its `[Ingredients]` parse tag stripped off.
  await expect(
    page.getByRole("heading", {
      name: "Chef Kale's Go-To Melty Ingredients",
      level: 3,
    }),
  ).toBeVisible();

  await expect(page.getByText(THINKING_LABEL)).toHaveCount(0);
  // The script has advanced to its second line.
  await expect(chatInput(page)).toHaveValue(MAIN_USER_FOLLOWUP);
});

test("the follow-up finishes the script and locks the composer", async ({
  page,
}) => {
  await sendScriptedPrompt(page);
  await sendScriptedPrompt(page);

  await expect(
    page.getByRole("heading", { name: FOLLOW_UP_TITLE, level: 2 }),
  ).toBeVisible();
  await expect(chatInput(page)).toHaveValue("");
  await expect(sendButton(page)).toBeDisabled();
});

test("a suggestion chip submits its prompt and hides the chips", async ({
  page,
}) => {
  await page.getByRole("button", { name: SUGGESTION_SURPRISE_LABEL }).click();
  await expect(page.getByText(THINKING_LABEL)).toHaveCount(0);

  await expect(page.getByText(SUGGESTION_SURPRISE_PROMPT)).toBeVisible();
  await expect(
    page.getByRole("heading", { name: SURPRISE_RECIPE_TITLE, level: 2 }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: SUGGESTION_VEGETARIAN_LABEL }),
  ).toBeHidden();

  // A chip conversation ends after its one exchange: the follow-up only makes
  // sense as an answer to the main prompt, so getDemoPrompt returns "".
  await expect(sendButton(page)).toBeDisabled();
});

test("the From my fridge chip grounds the reply in the fridge contents", async ({
  page,
}) => {
  await page.getByRole("button", { name: SUGGESTION_FRIDGE_LABEL }).click();
  await expect(page.getByText(THINKING_LABEL)).toHaveCount(0);

  await expect(page.getByText(FRIDGE_PROMPT)).toBeVisible();
  await expect(
    page.getByRole("heading", { name: FRIDGE_RECIPE_TITLE, level: 2 }),
  ).toBeVisible();
});

test("the Ask / My fridge selector switches modes and closes on outside click", async ({
  page,
}) => {
  await expect(modeSelector(page)).toHaveText(new RegExp(ASK_MODE_LABEL));

  await modeSelector(page).click();
  // While the mode is "Ask" the selector itself is named "🍳 Ask ⌄", so the
  // fridge item is the unambiguous one to click.
  await page
    .getByRole("button", { name: FRIDGE_MODE_LABEL, exact: true })
    .click();

  await expect(modeSelector(page)).toHaveText(new RegExp(FRIDGE_MODE_LABEL));

  // Now that the selector reads "My fridge", "Ask" identifies the dropdown item
  // alone. It can't be matched exactly — its accessible name carries an emoji.
  const askItem = page.getByRole("button", { name: ASK_MODE_LABEL });

  // Reopen, then click well outside: the dropdown closes on outside mousedown.
  await modeSelector(page).click();
  await expect(askItem).toBeVisible();
  await page.getByText(AI_DISCLAIMER).click();

  await expect(askItem).toBeHidden();
});

test("selecting My fridge pins the composer to the fridge prompt", async ({
  page,
}) => {
  await modeSelector(page).click();
  await page
    .getByRole("button", { name: FRIDGE_MODE_LABEL, exact: true })
    .click();

  await expect(chatInput(page)).toHaveValue(DEMO_FRIDGE_PROMPT);

  await sendScriptedPrompt(page);

  await expect(page.getByText(DEMO_FRIDGE_PROMPT)).toBeVisible();
  await expect(
    page.getByRole("heading", { name: FRIDGE_RECIPE_TITLE, level: 2 }),
  ).toBeVisible();

  // One canned fridge reply, so the composer empties once it has been asked.
  await expect(chatInput(page)).toHaveValue("");
  await expect(sendButton(page)).toBeDisabled();
});

// The scroll lands the message top a fixed gap below the pane top; the margin
// absorbs sub-pixel layout and the tail of the smooth-scroll animation.
const MAX_DISTANCE_FROM_PANE_TOP = 32;

test("a chef reply scrolls to the top of its bubble", async ({ page }) => {
  await sendScriptedPrompt(page);

  await expect
    .poll(() => distanceFromPaneTop(page))
    .toBeLessThan(MAX_DISTANCE_FROM_PANE_TOP);
});

test("opening a past conversation scrolls to its last message", async ({
  page,
}) => {
  await conversations(page).filter({ hasText: MOCK_CONVERSATION_TITLE }).click();

  await expect(
    page.getByRole("heading", { name: MOCK_CONVERSATION_TITLE, level: 2 }),
  ).toBeVisible();
  await expect
    .poll(() => distanceFromPaneTop(page))
    .toBeLessThan(MAX_DISTANCE_FROM_PANE_TOP);
});

test("a conversation survives navigating to the fridge and back", async ({
  page,
}) => {
  await sendScriptedPrompt(page);

  await page.getByRole("button", { name: FRIDGE_NAV_LABEL }).click();
  await expect(
    page.getByRole("heading", { name: FRIDGE_HEADING, level: 1 }),
  ).toBeVisible();

  await conversations(page).filter({ hasText: MAIN_RECIPE_TITLE }).click();

  await expect(page.getByText(MAIN_USER_PROMPT)).toBeVisible();
  await expect(
    page.getByRole("heading", { name: MAIN_RECIPE_TITLE, level: 2 }),
  ).toBeVisible();
});
