import { expect, test } from "@playwright/test";
import {
  APP_NAME,
  CHAT_EMPTY_GREETING,
  CLOSE_MENU_LABEL,
  COLLAPSE_SIDEBAR_LABEL,
  EXPAND_SIDEBAR_TITLE,
  FRIDGE_HEADING,
  FRIDGE_NAV_LABEL,
  NEW_CONVERSATION_BUTTON_LABEL,
  OPEN_MENU_LABEL,
  RECENT_CONVERSATIONS_HEADING,
  SETTINGS_LABEL,
  SUGGESTION_SURPRISE_LABEL,
} from "../src/content";
import {
  chatInput,
  conversations,
  gotoApp,
  sendScriptedPrompt,
  sidebar,
} from "./helpers";

// ChatHistoryContext seeds one conversation so a past chat can be reopened.
const SEEDED_CONVERSATION_TITLE = "Homemade Egg Tarts";
const SEEDED_USER_MESSAGE = "How do I make bakery-style egg tarts at home?";
// The `## ` heading of teacher/MainResponse_Teacher.txt.
const TEACHER_RECIPE_TITLE = "The Ultimate Golden Grilled Cheese";

test.beforeEach(async ({ page }) => {
  await gotoApp(page);
});

test("renders the brand, primary actions, and seeded history", async ({
  page,
}) => {
  await expect(
    page.getByRole("heading", { name: APP_NAME, level: 2 }),
  ).toBeVisible();

  // Scoped to `button` because the fridge page's <h1> uses the same text.
  await expect(
    page.getByRole("button", { name: FRIDGE_NAV_LABEL }),
  ).toBeVisible();
  // The label is "＋  New Conversation" — a fullwidth plus and two spaces.
  // Role-name matching normalizes whitespace and matches on substring, so this
  // works as long as it is never made exact.
  await expect(
    page.getByRole("button", { name: NEW_CONVERSATION_BUTTON_LABEL }),
  ).toBeVisible();

  // Rendered uppercase via CSS; the DOM text stays title case.
  await expect(
    page.getByRole("heading", { name: RECENT_CONVERSATIONS_HEADING, level: 3 }),
  ).toBeVisible();
  await expect(
    conversations(page).filter({ hasText: SEEDED_CONVERSATION_TITLE }),
  ).toHaveCount(1);
});

test("Your Fridge navigates to the fridge view", async ({ page }) => {
  await page.getByRole("button", { name: FRIDGE_NAV_LABEL }).click();

  await expect(
    page.getByRole("heading", { name: FRIDGE_HEADING, level: 1 }),
  ).toBeVisible();
  await expect(chatInput(page)).toBeHidden();
});

test("selecting a past conversation replays its messages", async ({ page }) => {
  await page.getByText(SEEDED_CONVERSATION_TITLE).click();

  await expect(page.getByText(SEEDED_USER_MESSAGE)).toBeVisible();
  await expect(
    page.getByRole("heading", { name: SEEDED_CONVERSATION_TITLE, level: 2 }),
  ).toBeVisible();
  // A recipe pill, proving the reply rendered as a recipe card.
  await expect(page.getByText("Serves 8")).toBeVisible();
});

test("New Conversation resets the chat to its empty state", async ({ page }) => {
  await page.getByText(SEEDED_CONVERSATION_TITLE).click();
  await expect(page.getByText(SEEDED_USER_MESSAGE)).toBeVisible();

  await page
    .getByRole("button", { name: NEW_CONVERSATION_BUTTON_LABEL })
    .click();

  await expect(page.getByText(CHAT_EMPTY_GREETING)).toBeVisible();
  // Suggestion chips only render on an empty conversation.
  await expect(
    page.getByRole("button", { name: SUGGESTION_SURPRISE_LABEL }),
  ).toBeVisible();
});

test("a finished conversation appears at the top of Recent Creations", async ({
  page,
}) => {
  await sendScriptedPrompt(page);

  // Ordering is by lastResponseTime descending, and the seeded conversation is
  // stamped an hour ago, so the new one is deterministically first.
  await expect(conversations(page).first()).toHaveText(TEACHER_RECIPE_TITLE);
  await expect(conversations(page)).toHaveCount(2);
});

test("collapses to the icon rail and expands back", async ({ page }) => {
  await page.getByRole("button", { name: COLLAPSE_SIDEBAR_LABEL }).click();

  await expect(
    page.getByRole("heading", { name: APP_NAME, level: 2 }),
  ).toBeHidden();
  for (const label of [FRIDGE_NAV_LABEL, SETTINGS_LABEL, EXPAND_SIDEBAR_TITLE]) {
    await expect(page.getByRole("button", { name: label })).toBeVisible();
  }

  await page.getByRole("button", { name: EXPAND_SIDEBAR_TITLE }).click();

  await expect(
    page.getByRole("heading", { name: APP_NAME, level: 2 }),
  ).toBeVisible();
});

test("the collapsed rail shows a tooltip on hover", async ({ page }) => {
  await page.getByRole("button", { name: COLLAPSE_SIDEBAR_LABEL }).click();

  // `exact` is safe here: the rail button's accessible name comes from its
  // aria-label, with the icon marked aria-hidden.
  await page
    .getByRole("button", { name: FRIDGE_NAV_LABEL, exact: true })
    .hover();

  await expect(page.getByRole("tooltip")).toHaveText(FRIDGE_NAV_LABEL);
});

test.describe("mobile drawer", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  // The closed drawer is only translated off-canvas, so it still has a bounding
  // box and toBeVisible() reports true. `inert` is the attribute that actually
  // makes it unreachable, so that is what these assert on.

  test("stays inert until opened", async ({ page }) => {
    await expect(sidebar(page)).toHaveAttribute("inert", "");
    await expect(
      page.getByRole("button", { name: OPEN_MENU_LABEL }),
    ).toBeVisible();

    await page.getByRole("button", { name: OPEN_MENU_LABEL }).click();

    await expect(sidebar(page)).not.toHaveAttribute("inert", "");
    await expect(
      page.getByRole("button", { name: CLOSE_MENU_LABEL }),
    ).toBeVisible();
  });

  test("closes via the close button, the backdrop, and Escape", async ({
    page,
  }) => {
    const open = () =>
      page.getByRole("button", { name: OPEN_MENU_LABEL }).click();

    await open();
    await page.getByRole("button", { name: CLOSE_MENU_LABEL }).click();
    await expect(sidebar(page)).toHaveAttribute("inert", "");

    await open();
    // x=350 is to the right of the 260px drawer, so this lands on the backdrop.
    await page.mouse.click(350, 500);
    await expect(sidebar(page)).toHaveAttribute("inert", "");

    await open();
    await page.keyboard.press("Escape");
    await expect(sidebar(page)).toHaveAttribute("inert", "");
  });

  test("hides the collapse control", async ({ page }) => {
    await page.getByRole("button", { name: OPEN_MENU_LABEL }).click();

    // Collapsing only applies to the static desktop column (`hidden md:flex`).
    await expect(
      page.getByRole("button", { name: COLLAPSE_SIDEBAR_LABEL }),
    ).toBeHidden();
  });
});
