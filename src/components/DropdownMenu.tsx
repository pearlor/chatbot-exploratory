import { useEffect, useRef, useState } from "react";

export type DropdownMenuItem = {
  label: string;
  onSelect: () => void;
  disabled?: boolean;
};

/**
 * A button that opens a small list of actions below it. Picking an item,
 * clicking outside, or pressing Escape closes the list.
 */
export default function DropdownMenu({
  label,
  items,
}: {
  label: string;
  items: DropdownMenuItem[];
}) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  const selectItem = (item: DropdownMenuItem) => {
    setIsOpen(false);
    item.onSelect();
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen((open) => !open)}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        // Same chevron, size, and spacing as the full-size selects in
        // QuantityFields.
        className="select-chevron rounded-xl border border-border bg-cream bg-position-[right_0.75rem_center] bg-size-[1rem] py-2 pr-10 pl-4 text-sm font-medium text-ink transition hover:bg-sidebar"
      >
        {label}
      </button>

      {isOpen && (
        <div
          role="menu"
          className="absolute left-0 top-full z-10 mt-1 min-w-full rounded-lg border border-border bg-white py-1 shadow-lg"
        >
          {items.map((item) => (
            <button
              key={item.label}
              role="menuitem"
              disabled={item.disabled}
              onClick={() => selectItem(item)}
              className="w-full whitespace-nowrap px-3 py-1.5 text-left text-sm text-ink transition-colors hover:bg-black/5 disabled:cursor-not-allowed disabled:text-muted"
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
