import { useState } from "react";
import type { ReactNode } from "react";

type TooltipSide = "top" | "bottom" | "left" | "right";

// Position classes for the tooltip bubble relative to the wrapped element.
const sidePositionClasses: Record<TooltipSide, string> = {
  top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
  bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
  left: "right-full top-1/2 -translate-y-1/2 mr-2",
  right: "left-full top-1/2 -translate-y-1/2 ml-2",
};

// A reusable tooltip that shows `content` when the wrapped element is hovered
// or focused. Wrap any button or clickable element (or anything needing more
// context) with it.
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

  const show = () => setIsVisible(true);
  const hide = () => setIsVisible(false);

  return (
    <span
      className={`relative inline-flex ${className}`}
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
    >
      {children}
      {isVisible && (
        <span
          role="tooltip"
          className={`absolute z-50 pointer-events-none whitespace-nowrap rounded-lg bg-ink px-2.5 py-1.5 text-xs font-medium text-cream shadow-lg ${sidePositionClasses[side]}`}
        >
          {content}
        </span>
      )}
    </span>
  );
}
