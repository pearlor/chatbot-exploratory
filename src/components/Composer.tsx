import SuggestionChips from "./SuggestionChips";
import ChatInput from "./ChatInput";

export default function Composer({
  userPrompt,
  setUserPrompt,
  handleSubmit,
  isLoading,
  showSuggestions,
}: {
  userPrompt: string;
  setUserPrompt: (prompt: string) => void;
  handleSubmit: () => void;
  isLoading: boolean;
  showSuggestions: boolean;
}) {
  return (
    <div className="px-6 pb-6">
      <div className="max-w-3xl mx-auto flex flex-col gap-3">
        {showSuggestions && <SuggestionChips />}
        <ChatInput
          userPrompt={userPrompt}
          setUserPrompt={setUserPrompt}
          handleSubmit={handleSubmit}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
