import { expect, type Locator, type Page } from "@playwright/test";
import { TEST_IDS } from "../src/testIds";
import {
  CHAT_INPUT_PLACEHOLDER,
  FRIDGE_HEADING,
  FRIDGE_NAV_LABEL,
  SEND_MESSAGE_LABEL,
  SETTINGS_CANCEL_LABEL,
  SETTINGS_LABEL,
  THINKING_LABEL,
} from "../src/content";

/**
 * Shared setup and locators for the end-to-end specs.
 *
 * User-facing strings come from src/content.ts and test ids from src/testIds.ts
 * rather than being duplicated here, matching the convention those files exist
 * to serve: the copy lives in one place and the specs follow it.
 */

/** The settings modal's `<h2>`. Its text is `⚙️ Your settings`; role-name
 *  matching is substring-based, so the label alone finds it. */
export const settingsHeading = (page: Page): Locator =>
  page.getByRole("heading", { name: SETTINGS_LABEL });

/**
 * Demo mode opens the settings modal on every page load. Its overlay is
 * `fixed inset-0`, so any click made before dismissing it lands on the backdrop
 * instead — every spec that isn't about the modal has to close it first.
 */
export async function dismissSettings(page: Page) {
  await expect(settingsHeading(page)).toBeVisible();
  await page
    .getByRole("button", { name: SETTINGS_CANCEL_LABEL, exact: true })
    .click();
  await expect(settingsHeading(page)).toBeHidden();
}

/** Load the app and get past the settings modal, landing on an empty chat. */
export async function gotoApp(page: Page) {
  await page.goto("/");
  await dismissSettings(page);
}

/** Load the app and navigate to the fridge via the sidebar. */
export async function gotoFridge(page: Page) {
  await gotoApp(page);
  // Scoped to `button`: the fridge page's own <h1> has the same text.
  await page.getByRole("button", { name: FRIDGE_NAV_LABEL }).click();
  await expect(
    page.getByRole("heading", { name: FRIDGE_HEADING, level: 1 }),
  ).toBeVisible();
}

export const sidebar = (page: Page): Locator =>
  page.getByTestId(TEST_IDS.sidebar);

/** The Recent Creations entries. Scoped to the sidebar because chef replies
 *  render their own markdown lists, which are listitems too. */
export const conversations = (page: Page): Locator =>
  sidebar(page).getByRole("listitem");

export const modalOverlay = (page: Page): Locator =>
  page.getByTestId(TEST_IDS.modalOverlay);

export const chatInput = (page: Page): Locator =>
  page.getByPlaceholder(CHAT_INPUT_PLACEHOLDER);

export const sendButton = (page: Page): Locator =>
  page.getByRole("button", { name: SEND_MESSAGE_LABEL });

export const modeSelector = (page: Page): Locator =>
  page.getByTestId(TEST_IDS.chatModeSelector);

/** The scrolling chat pane, and the per-message wrappers inside it that the
 *  scroll-to-latest-message behaviour anchors on. */
export const chatScrollContainer = (page: Page): Locator =>
  page.getByTestId(TEST_IDS.chatScrollContainer);

export const chatMessages = (page: Page): Locator =>
  page.locator("[data-message-id]");

/**
 * How far the top of the last message sits below the top of the chat pane.
 * Polled rather than read once: the scroll can animate, and markdown lays out
 * over a frame or two after the message appears.
 */
export async function distanceFromPaneTop(page: Page): Promise<number> {
  const pane = await chatScrollContainer(page).boundingBox();
  const lastMessage = await chatMessages(page).last().boundingBox();
  if (!pane || !lastMessage) throw new Error("chat pane or message not laid out");
  return lastMessage.y - pane.y;
}

export const ingredientCards = (page: Page): Locator =>
  page.getByTestId(TEST_IDS.ingredientCard);

export const ingredientCard = (page: Page, name: string): Locator =>
  ingredientCards(page).filter({ hasText: name });

/**
 * Send whatever prompt the demo script has pinned to the composer, then wait
 * for the chef to finish. Waits on the thinking bubble *disappearing* rather
 * than appearing — the reply lands after a fixed 600ms, which is not enough of
 * a margin to assert the bubble was ever on screen.
 */
export async function sendScriptedPrompt(page: Page) {
  await sendButton(page).click();
  await expect(page.getByText(THINKING_LABEL)).toHaveCount(0);
}
