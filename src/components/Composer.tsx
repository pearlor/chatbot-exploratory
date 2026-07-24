import SuggestionChips from "./SuggestionChips";
import ChatInput from "./ChatInput";

export default function Composer({
  userPrompt,
  setUserPrompt,
  handleSubmit,
  isLoading,
  showSuggestions,
  onSuggestionClick,
}: {
  userPrompt: string;
  setUserPrompt: (prompt: string) => void;
  handleSubmit: () => void;
  isLoading: boolean;
  showSuggestions: boolean;
  onSuggestionClick: (prompt: string) => void;
}) {
  return (
    <div className="px-6 pb-6">
      <div className="max-w-3xl mx-auto flex flex-col gap-3">
        {showSuggestions && <SuggestionChips onSelect={onSuggestionClick} />}
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
