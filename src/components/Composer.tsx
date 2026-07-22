import SuggestionChips from "./SuggestionChips";
import ChatInput from "./ChatInput";

export default function Composer() {
  return (
    <div className="px-6 pb-6">
      <div className="max-w-3xl mx-auto flex flex-col gap-3">
        <SuggestionChips />
        <ChatInput />
      </div>
    </div>
  );
}
