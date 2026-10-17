import { expect, test, type Page } from "@playwright/test";
import { EXPORT_PDF_BUTTON_LABEL } from "../src/content";
import { TEST_IDS } from "../src/testIds";
import { conversations, gotoApp } from "./helpers";

// The seeded conversation in ChatHistoryContext, whose chef reply is the
// example_response.md fixture.
const MOCK_CONVERSATION_TITLE = "Homemade Egg Tarts";
const MOCK_GREETING = "Hello there, fellow chef!";

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

test("Save as PDF prints the recipe card titled with the dish name", async ({
  page,
}) => {
  const appTitle = await page.title();
  const printView = page.getByTestId(TEST_IDS.recipePrintView);

  await page.getByRole("button", { name: EXPORT_PDF_BUTTON_LABEL }).click();

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
  const saveButton = page.getByRole("button", {
    name: EXPORT_PDF_BUTTON_LABEL,
  });

  await saveButton.click();
  await expect.poll(() => printedTitles(page)).toHaveLength(1);
  await page.evaluate(() => window.dispatchEvent(new Event("afterprint")));

  await saveButton.click();
  await expect.poll(() => printedTitles(page)).toHaveLength(2);
});
