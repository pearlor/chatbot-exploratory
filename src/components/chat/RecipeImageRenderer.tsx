import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import RecipeExportCard from "./RecipeExportCard";
import { recipeFileName } from "./recipeFileName";

// Every PNG gets the same width, whatever the window size, wide enough for
// the ingredients and steps to sit side by side.
const IMAGE_WIDTH = 800;
// Drawn at 2x so text stays sharp on high-density screens.
const PIXEL_RATIO = 2;
// Safari won't draw a canvas larger than this many pixels in total. Very
// tall recipes drop to 1x rather than failing.
const MAX_CANVAS_PIXELS = 16_777_216;

/**
 * Renders the recipe card off screen, saves it as a PNG download named after
 * the dish, then calls onDone. The card has to be laid out (not
 * display: none) for html-to-image to capture it.
 */
export default function RecipeImageRenderer({
  content,
  onDone,
}: {
  content: string;
  onDone: () => void;
}) {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    let isCancelled = false;

    const saveImage = async () => {
      try {
        // Loaded on demand so the library isn't in the main bundle.
        const { toPng } = await import("html-to-image");
        // Without this, text could be drawn in a fallback font.
        await document.fonts.ready;

        const canvasPixels =
          card.offsetWidth * card.offsetHeight * PIXEL_RATIO ** 2;
        const pixelRatio = canvasPixels > MAX_CANVAS_PIXELS ? 1 : PIXEL_RATIO;
        const imageUrl = await toPng(card, { pixelRatio });
        if (isCancelled) return;

        const link = document.createElement("a");
        link.href = imageUrl;
        link.download = recipeFileName(content, "png");
        link.click();
      } finally {
        if (!isCancelled) onDone();
      }
    };
    saveImage();

    return () => {
      isCancelled = true;
    };
  }, [content, onDone]);

  return createPortal(
    <div
      aria-hidden
      className="pointer-events-none fixed top-0 -left-[10000px]"
      style={{ width: IMAGE_WIDTH }}
    >
      <RecipeExportCard ref={cardRef} content={content} />
    </div>,
    document.body,
  );
}
