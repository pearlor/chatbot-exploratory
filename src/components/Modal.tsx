import type { ReactNode } from "react";
import Button from "./Button";
import { MODAL_CLOSE_TITLE } from "../content";

type ModalAction = {
  label: string;
  onClick: () => void;
};

export default function Modal({
  header,
  children,
  primaryAction,
  secondaryAction,
  onClose,
}: {
  header: ReactNode;
  children: ReactNode;
  primaryAction?: ModalAction;
  secondaryAction?: ModalAction;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center"
      onClick={onClose}
    >
      <div
        className="bg-cream rounded-3xl p-6 w-full max-w-lg shadow-xl flex flex-col gap-5"
        onClick={(event) => event.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-xl font-bold text-ink">{header}</h2>
          <button
            onClick={onClose}
            title={MODAL_CLOSE_TITLE}
            className="w-8 h-8 rounded-lg text-muted flex items-center justify-center hover:bg-black/5 hover:text-terracotta transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div>{children}</div>

        {/* Footer actions */}
        {(primaryAction || secondaryAction) && (
          <div className="flex items-center justify-end gap-3">
            {secondaryAction && (
              <Button
                onClick={secondaryAction.onClick}
                label={secondaryAction.label}
                className="border border-border bg-white/60 text-ink rounded-xl px-4 py-2 text-sm hover:bg-white transition-colors"
              />
            )}
            {primaryAction && (
              <Button
                onClick={primaryAction.onClick}
                label={primaryAction.label}
                className="bg-terracotta text-white rounded-xl px-4 py-2 text-sm font-medium hover:brightness-95 transition"
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
