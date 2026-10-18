import { readFile } from "node:fs/promises";
import { expect, test, type Page } from "@playwright/test";
import {
  EXPORT_MENU_LABEL,
  EXPORT_PDF_LABEL,
  EXPORT_PNG_LABEL,
} from "../src/content";
import { TEST_IDS } from "../src/testIds";
import { conversations, gotoApp } from "./helpers";

// The seeded conversation in ChatHistoryContext, whose chef reply is the
// example_response.md fixture.
const MOCK_CONVERSATION_TITLE = "Homemade Egg Tarts";
const MOCK_GREETING = "Hello there, fellow chef!";

// The 800px export width drawn at 2x.
const EXPECTED_IMAGE_WIDTH = 1600;
const PNG_SIGNATURE = Buffer.from([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
]);

test.beforeEach(async ({ page }) => {
  // The real print dialog would block the test, so window.print only records
  // the document title it was called with. Without a dialog the browser never
  // fires afterprint, so the tests dispatch it themselves.
  await page.addInitScript(() => {
    const printedTitles: string[] = [];
    Object.assign(window, { printedTitles });
    window.print = () => {
      printedTitles.push(document.title);
    };
  });
  await gotoApp(page);
  await conversations(page)
    .filter({ hasText: MOCK_CONVERSATION_TITLE })
    .click();
});

const printedTitles = (page: Page) =>
  page.evaluate(
    () => (window as unknown as { printedTitles: string[] }).printedTitles,
  );

/** Open the Export menu and pick one of its items. */
async function chooseExport(page: Page, itemLabel: string) {
  await page.getByRole("button", { name: EXPORT_MENU_LABEL }).click();
  await page.getByRole("menuitem", { name: itemLabel }).click();
}

test("the Export menu opens, and closes on Escape", async ({ page }) => {
  await page.getByRole("button", { name: EXPORT_MENU_LABEL }).click();
  await expect(page.getByRole("menuitem")).toHaveText([
    EXPORT_PDF_LABEL,
    EXPORT_PNG_LABEL,
  ]);

  await page.keyboard.press("Escape");
  await expect(page.getByRole("menu")).toHaveCount(0);
});

test("Save as PDF prints the recipe card titled with the dish name", async ({
  page,
}) => {
  const appTitle = await page.title();
  const printView = page.getByTestId(TEST_IDS.recipePrintView);

  await chooseExport(page, EXPORT_PDF_LABEL);

  await expect
    .poll(() => printedTitles(page))
    .toEqual([MOCK_CONVERSATION_TITLE]);

  // On screen the print view stays hidden; in print media it replaces the app.
  await expect(printView).toBeHidden();
  await page.emulateMedia({ media: "print" });
  await expect(page.locator("#root")).toBeHidden();
  await expect(
    printView.getByRole("heading", { name: MOCK_CONVERSATION_TITLE, level: 2 }),
  ).toBeVisible();
  await expect(printView.getByText(MOCK_GREETING)).toHaveCount(0);

  await page.emulateMedia({ media: "screen" });
  await page.evaluate(() => window.dispatchEvent(new Event("afterprint")));

  await expect(printView).toHaveCount(0);
  await expect(page).toHaveTitle(appTitle);
});

test("Save as PDF can be used again after the dialog closes", async ({
  page,
}) => {
  await chooseExport(page, EXPORT_PDF_LABEL);
  await expect.poll(() => printedTitles(page)).toHaveLength(1);
  await page.evaluate(() => window.dispatchEvent(new Event("afterprint")));

  await chooseExport(page, EXPORT_PDF_LABEL);
  await expect.poll(() => printedTitles(page)).toHaveLength(2);
});

test("Save as PNG downloads an 800px-wide 2x image named after the dish", async ({
  page,
}) => {
  const downloadPromise = page.waitForEvent("download");
  await chooseExport(page, EXPORT_PNG_LABEL);
  const download = await downloadPromise;

  expect(download.suggestedFilename()).toBe(`${MOCK_CONVERSATION_TITLE}.png`);

  const image = await readFile(await download.path());
  expect(image.subarray(0, 8)).toEqual(PNG_SIGNATURE);
  // The width is the first field of the IHDR chunk, right after the signature.
  expect(image.readUInt32BE(16)).toBe(EXPECTED_IMAGE_WIDTH);
});
