import { useCallback, useLayoutEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { createPortal } from "react-dom";

type TooltipSide = "top" | "bottom" | "left" | "right";

type TooltipPlacement = {
  top: number;
  left: number;
  maxWidth: number;
};

// Space kept between the tooltip and the viewport edges.
const VIEWPORT_MARGIN = 8;
// Space between the tooltip and the wrapped element.
const TRIGGER_GAP = 8;
// A side narrower than this is not worth trying; the text would wrap too much.
const MIN_TOOLTIP_WIDTH = 120;

// Sides to try, in order, when the preferred side doesn't fit in the viewport.
const sideFallbackOrder: Record<TooltipSide, TooltipSide[]> = {
  top: ["top", "bottom", "right", "left"],
  bottom: ["bottom", "top", "right", "left"],
  left: ["left", "right", "top", "bottom"],
  right: ["right", "left", "top", "bottom"],
};

// How much room the tooltip has when placed on `side` of the trigger.
function getAvailableSpace(side: TooltipSide, triggerRect: DOMRect) {
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const fullWidth = viewportWidth - 2 * VIEWPORT_MARGIN;
  const fullHeight = viewportHeight - 2 * VIEWPORT_MARGIN;

  switch (side) {
    case "top":
      return { width: fullWidth, height: triggerRect.top - TRIGGER_GAP - VIEWPORT_MARGIN };
    case "bottom":
      return {
        width: fullWidth,
        height: viewportHeight - triggerRect.bottom - TRIGGER_GAP - VIEWPORT_MARGIN,
      };
    case "left":
      return { width: triggerRect.left - TRIGGER_GAP - VIEWPORT_MARGIN, height: fullHeight };
    case "right":
      return {
        width: viewportWidth - triggerRect.right - TRIGGER_GAP - VIEWPORT_MARGIN,
        height: fullHeight,
      };
  }
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

// Picks a side that fits and returns where to put the tooltip. The tooltip is
// as wide as its text up to `maxWidth`, so it grows wider when there is
// horizontal room and wraps onto more lines (grows taller) when there isn't.
function computePlacement(
  preferredSide: TooltipSide,
  triggerRect: DOMRect,
  tooltipElement: HTMLElement,
): TooltipPlacement {
  const measureWithMaxWidth = (maxWidth: number) => {
    tooltipElement.style.maxWidth = `${maxWidth}px`;
    return { width: tooltipElement.offsetWidth, height: tooltipElement.offsetHeight };
  };

  let chosenSide: TooltipSide | null = null;
  let chosenMaxWidth = 0;
  let tooltipSize = { width: 0, height: 0 };

  for (const side of sideFallbackOrder[preferredSide]) {
    const space = getAvailableSpace(side, triggerRect);
    if (space.width < MIN_TOOLTIP_WIDTH) continue;

    const size = measureWithMaxWidth(space.width);
    if (size.height <= space.height) {
      chosenSide = side;
      chosenMaxWidth = space.width;
      tooltipSize = size;
      break;
    }
  }

  // Nothing fits cleanly (very small viewport): use whichever of top/bottom
  // has more room, at full width, and let clamping keep it on screen.
  if (chosenSide === null) {
    const spaceAbove = getAvailableSpace("top", triggerRect);
    const spaceBelow = getAvailableSpace("bottom", triggerRect);
    chosenSide = spaceAbove.height > spaceBelow.height ? "top" : "bottom";
    chosenMaxWidth = spaceAbove.width;
    tooltipSize = measureWithMaxWidth(chosenMaxWidth);
  }

  const triggerCenterX = triggerRect.left + triggerRect.width / 2;
  const triggerCenterY = triggerRect.top + triggerRect.height / 2;
  let top = 0;
  let left = 0;

  switch (chosenSide) {
    case "top":
      top = triggerRect.top - TRIGGER_GAP - tooltipSize.height;
      left = triggerCenterX - tooltipSize.width / 2;
      break;
    case "bottom":
      top = triggerRect.bottom + TRIGGER_GAP;
      left = triggerCenterX - tooltipSize.width / 2;
      break;
    case "left":
      top = triggerCenterY - tooltipSize.height / 2;
      left = triggerRect.left - TRIGGER_GAP - tooltipSize.width;
      break;
    case "right":
      top = triggerCenterY - tooltipSize.height / 2;
      left = triggerRect.right + TRIGGER_GAP;
      break;
  }

  return {
    top: clamp(top, VIEWPORT_MARGIN, window.innerHeight - VIEWPORT_MARGIN - tooltipSize.height),
    left: clamp(left, VIEWPORT_MARGIN, window.innerWidth - VIEWPORT_MARGIN - tooltipSize.width),
    maxWidth: chosenMaxWidth,
  };
}

// A reusable tooltip that shows `content` when the wrapped element is hovered
// or focused. Wrap any button or clickable element (or anything needing more
// context) with it. `side` is the preferred side; the tooltip flips to another
// side and wraps its text as needed to stay inside the viewport.
export default function Tooltip({
  content,
  children,
  side = "top",
  className = "",
}: {
  content: ReactNode;
  children: ReactNode;
  side?: TooltipSide;
  className?: string;
}) {
  const [isVisible, setIsVisible] = useState(false);
  const [placement, setPlacement] = useState<TooltipPlacement | null>(null);
  const triggerRef = useRef<HTMLSpanElement>(null);
  const tooltipRef = useRef<HTMLSpanElement>(null);

  const show = () => setIsVisible(true);
  const hide = () => {
    setIsVisible(false);
    setPlacement(null);
  };

  const updatePlacement = useCallback(() => {
    if (!triggerRef.current || !tooltipRef.current) return;
    const triggerRect = triggerRef.current.getBoundingClientRect();
    setPlacement(computePlacement(side, triggerRect, tooltipRef.current));
  }, [side]);

  // Measure before paint so the tooltip never flashes in the wrong spot, and
  // keep it in place if the page scrolls or the window resizes while shown.
  useLayoutEffect(() => {
    if (!isVisible) return;
    updatePlacement();
    window.addEventListener("resize", updatePlacement);
    window.addEventListener("scroll", updatePlacement, true);
    return () => {
      window.removeEventListener("resize", updatePlacement);
      window.removeEventListener("scroll", updatePlacement, true);
    };
  }, [isVisible, content, updatePlacement]);

  return (
    <span
      ref={triggerRef}
      className={`relative inline-flex ${className}`}
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
    >
      {children}
      {isVisible &&
        // Rendered in a portal so parents with `overflow: hidden` can't clip it.
        createPortal(
          <span
            ref={tooltipRef}
            role="tooltip"
            className="fixed z-50 pointer-events-none w-max whitespace-normal break-words rounded-lg bg-ink px-2.5 py-1.5 text-xs font-medium text-cream shadow-lg"
            style={{
              top: placement?.top ?? 0,
              left: placement?.left ?? 0,
              maxWidth: placement?.maxWidth,
              visibility: placement ? "visible" : "hidden",
            }}
          >
            {content}
          </span>,
          document.body,
        )}
    </span>
  );
}
