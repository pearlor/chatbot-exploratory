import type { ReactNode } from "react";

/**
 * The dark-green ending-comment box (e.g. "Chef's Secret"). Negative margins
 * bleed it to the bubble edges so it rounds into the bubble's bottom corners
 * when it is the last segment.
 */
export default function ChefCallout({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="mt-4 -mx-5 -mb-4 rounded-b-2xl bg-forest px-5 py-4 text-cream">
      <div className="mb-1 flex items-center gap-2 font-serif font-semibold">
        ✨ {title}
      </div>
      <div className="italic opacity-90">{children}</div>
    </div>
  );
}
