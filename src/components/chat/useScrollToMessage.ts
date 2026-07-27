import { useEffect, useRef } from "react";
import type { RefObject } from "react";

// Breathing room left above the anchored message so it isn't flush with the
// top edge of the chat pane.
const SCROLL_MESSAGE_TOP_GAP_PX = 16;

/**
 * Scrolls `containerRef` so the top of the message tagged with
 * `data-message-id={messageId}` sits at the top of the pane.
 *
 * Runs once per message id, so ordinary re-renders (loading flips, persona
 * changes) never yank the view back after the user has scrolled away.
 *
 * `listStartMessageId` — the id of the first message on screen — is how a
 * conversation being opened is told apart from a reply being appended: opening
 * one swaps the whole list, and lands instantly rather than animating the whole
 * way down from the top.
 */
export function useScrollToMessage(
  containerRef: RefObject<HTMLDivElement | null>,
  messageId: string | undefined,
  listStartMessageId: string | undefined,
) {
  const scrolledMessageIdRef = useRef<string | undefined>(undefined);
  const listStartMessageIdRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    // Recorded before the early returns: the swap to another conversation's
    // messages lands one render before its last message can be scrolled to.
    const isNewList = listStartMessageId !== listStartMessageIdRef.current;
    listStartMessageIdRef.current = listStartMessageId;

    const container = containerRef.current;
    if (!container || !messageId) return;
    if (messageId === scrolledMessageIdRef.current) return;
    scrolledMessageIdRef.current = messageId;

    // One frame lets the freshly rendered markdown lay out before we measure it.
    const frame = requestAnimationFrame(() => {
      const target = container.querySelector<HTMLElement>(
        `[data-message-id="${CSS.escape(messageId)}"]`,
      );
      if (!target) return;

      const messageTopWithinContainer =
        target.getBoundingClientRect().top -
        container.getBoundingClientRect().top +
        container.scrollTop;

      // A short message can't reach the top; the browser clamps the offset,
      // which still leaves the whole message in view.
      container.scrollTo({
        top: messageTopWithinContainer - SCROLL_MESSAGE_TOP_GAP_PX,
        behavior: isNewList ? "auto" : "smooth",
      });
    });

    return () => cancelAnimationFrame(frame);
  }, [containerRef, messageId, listStartMessageId]);
}
