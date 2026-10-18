import { createPortal } from "react-dom";
import RecipeExportCard from "./RecipeExportCard";
import { TEST_IDS } from "../../testIds";

/**
 * The recipe card to print when saving as PDF. It is portaled next to #root
 * and hidden on screen; the print styles in index.css hide #root instead, so
 * only this card is printed.
 */
export default function RecipePrintView({ content }: { content: string }) {
  return createPortal(
    <div
      data-print-view
      data-testid={TEST_IDS.recipePrintView}
      className="hidden print:block"
    >
      <RecipeExportCard content={content} />
    </div>,
    document.body,
  );
}
