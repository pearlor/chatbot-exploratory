import SuggestionChips from "./SuggestionChips";
import ChatInput from "./ChatInput";
import { AI_DISCLAIMER } from "../content";

export default function Composer({
  userPrompt,
  setUserPrompt,
  handleSubmit,
  isLoading,
  showSuggestions,
  onSuggestionClick,
  isReadOnly,
}: {
  userPrompt: string;
  setUserPrompt: (prompt: string) => void;
  handleSubmit: (promptOverride?: string, isFridgeSelected?: boolean) => void;
  isLoading: boolean;
  showSuggestions: boolean;
  onSuggestionClick: (prompt: string) => void;
  isReadOnly?: boolean;
}) {
  return (
    <div className="px-3 pb-3 sm:px-6 sm:pb-6">
      <div className="max-w-3xl mx-auto flex flex-col gap-3">
        {showSuggestions && <SuggestionChips onSelect={onSuggestionClick} />}
        <ChatInput
          userPrompt={userPrompt}
          setUserPrompt={setUserPrompt}
          handleSubmit={handleSubmit}
          isLoading={isLoading}
          isReadOnly={isReadOnly}
        />
        <div className="text-xs text-muted text-center">
          <p>{AI_DISCLAIMER}</p>
        </div>
      </div>
    </div>
  );
}
