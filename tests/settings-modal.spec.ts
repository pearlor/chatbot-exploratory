import { expect, test } from "@playwright/test";
import {
  CHAT_EMPTY_GREETING,
  CHOOSE_PERSONA_LABEL,
  MODAL_CLOSE_TITLE,
  PERSONA_PIRATE_LABEL,
  PERSONA_PIRATE_NAME,
  PERSONA_TEACHER_DESCRIPTION,
  PERSONA_TEACHER_LABEL,
  PERSONA_TV_HOST_DESCRIPTION,
  PERSONA_TV_HOST_LABEL,
  SETTINGS_CANCEL_LABEL,
  SETTINGS_LABEL,
  SETTINGS_SAVE_LABEL,
} from "../src/content";
import {
  modalOverlay,
  sendScriptedPrompt,
  settingsHeading,
} from "./helpers";

// Recipe titles are the `## ` headings of the demo fixtures under src/demo.
// They are the strongest available proof of which persona answered, because
// each persona's script has its own dish name.
const TEACHER_RECIPE_TITLE = "The Ultimate Golden Grilled Cheese"; // teacher/MainResponse_Teacher.txt
const PIRATE_RECIPE_TITLE = "The Golden Galleon Grilled Cheese"; // pirate/MainResponse_Pirate.txt

// These specs load the app directly rather than going through gotoApp(): the
// modal opening itself is what's under test.
test.beforeEach(async ({ page }) => {
  await page.goto("/");
});

test("opens automatically on load in demo mode", async ({ page }) => {
  await expect(settingsHeading(page)).toBeVisible();
  await expect(page.getByText(CHOOSE_PERSONA_LABEL)).toBeVisible();

  for (const label of [
    PERSONA_TEACHER_LABEL,
    PERSONA_TV_HOST_LABEL,
    PERSONA_PIRATE_LABEL,
  ]) {
    await expect(page.getByRole("button", { name: label })).toBeVisible();
  }

  // Teacher is the default persona, so its blurb is the one showing.
  await expect(page.getByText(PERSONA_TEACHER_DESCRIPTION)).toBeVisible();
  await expect(
    page.getByRole("button", { name: SETTINGS_SAVE_LABEL, exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: SETTINGS_CANCEL_LABEL, exact: true }),
  ).toBeVisible();
});

test("the close button dismisses the modal", async ({ page }) => {
  await page.getByTitle(MODAL_CLOSE_TITLE).click();

  await expect(settingsHeading(page)).toBeHidden();
  // The app underneath is now reachable.
  await expect(page.getByText(CHAT_EMPTY_GREETING)).toBeVisible();
});

test("clicking the backdrop closes it, clicking the panel does not", async ({
  page,
}) => {
  // The panel stops propagation, so a click inside it must not reach onClose.
  await page.getByText(CHOOSE_PERSONA_LABEL).click();
  await expect(settingsHeading(page)).toBeVisible();

  // Top-left corner of the overlay is outside the centred panel.
  await modalOverlay(page).click({ position: { x: 5, y: 5 } });
  await expect(settingsHeading(page)).toBeHidden();
});

test("Escape does not close the modal", async ({ page }) => {
  // Documents current behaviour: Modal has no Escape handler and no focus
  // trap. If either is added, this test should be flipped rather than deleted.
  await page.keyboard.press("Escape");

  await expect(settingsHeading(page)).toBeVisible();
});

test("choosing a persona is a draft until saved", async ({ page }) => {
  await page.getByRole("button", { name: PERSONA_TV_HOST_LABEL }).click();

  // Selection is styled with Tailwind classes only — no aria-pressed — so the
  // description paragraph is the user-visible signal worth asserting.
  await expect(page.getByText(PERSONA_TV_HOST_DESCRIPTION)).toBeVisible();
  await expect(page.getByText(PERSONA_TEACHER_DESCRIPTION)).toBeHidden();

  await page
    .getByRole("button", { name: SETTINGS_CANCEL_LABEL, exact: true })
    .click();
  await page.getByRole("button", { name: SETTINGS_LABEL }).click();

  await expect(page.getByText(PERSONA_TEACHER_DESCRIPTION)).toBeVisible();
});

test("Save applies the chosen persona to the chef's replies", async ({
  page,
}) => {
  await page.getByRole("button", { name: PERSONA_PIRATE_LABEL }).click();
  await page
    .getByRole("button", { name: SETTINGS_SAVE_LABEL, exact: true })
    .click();
  await expect(settingsHeading(page)).toBeHidden();

  await sendScriptedPrompt(page);

  await expect(
    page.getByRole("heading", { name: PIRATE_RECIPE_TITLE, level: 2 }),
  ).toBeVisible();
  // The bubble label. `.first()` because the reply's prose also names the chef.
  await expect(
    page.getByText(PERSONA_PIRATE_NAME, { exact: true }).first(),
  ).toBeVisible();
});

test("Cancel keeps the previously saved persona", async ({ page }) => {
  await page.getByRole("button", { name: PERSONA_TV_HOST_LABEL }).click();
  await page
    .getByRole("button", { name: SETTINGS_CANCEL_LABEL, exact: true })
    .click();

  await sendScriptedPrompt(page);

  await expect(
    page.getByRole("heading", { name: TEACHER_RECIPE_TITLE, level: 2 }),
  ).toBeVisible();
});
