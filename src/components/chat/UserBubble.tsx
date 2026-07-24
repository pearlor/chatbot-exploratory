import {
  CHAT_NO_RETRIES_TOOLTIP,
  CHAT_RETRY_LABEL,
  USER_BUBBLE_LABEL,
} from "../../content";
import Tooltip from "../Tooltip";
import { RetryIcon } from "../../assets/icons";

export default function UserBubble({
  content,
  hasError,
  retry,
  numRetries,
}: {
  content: string;
  hasError: boolean;
  retry: (promptOverride?: string) => void;
  numRetries: number;
}) {
  return (
    <div className="flex flex-col items-end gap-2">
      {/* Label + avatar */}
      <div className="flex items-center gap-2 pr-1">
        <span className="text-sm text-muted">{USER_BUBBLE_LABEL}</span>
        <div className="w-8 h-8 rounded-full bg-terracotta-soft flex items-center justify-center text-sm text-terracotta">
          🧑
        </div>
      </div>

      <div className="max-w-[75%] rounded-2xl bg-terracotta px-5 py-4 text-white">
        {content}
      </div>

      {hasError && (
        <div className="flex items-center gap-2">
          {numRetries === 0 ? (
            <Tooltip content={CHAT_NO_RETRIES_TOOLTIP} side="bottom">
              <span className="flex items-center gap-1 text-sm text-muted cursor-not-allowed">
                <RetryIcon />
                {CHAT_RETRY_LABEL}
              </span>
            </Tooltip>
          ) : (
            <a
              href="#"
              onClick={() => retry(content)}
              className="flex items-center gap-1 text-sm text-terracotta hover:underline"
            >
              <RetryIcon />
              {CHAT_RETRY_LABEL}
            </a>
          )}
        </div>
      )}
    </div>
  );
}
