import { USER_BUBBLE_LABEL } from "../../content";

export default function UserBubble({ content }: { content: string }) {
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
    </div>
  );
}
