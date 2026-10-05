import { describe, expect, it } from "vitest";
import { ChatFollowUpOption, RoleEnum, swapFollowUpOption } from "./types";
import type { ChatMessage } from "./types";

const chefMessage = (followUpOptions?: ChatFollowUpOption[]): ChatMessage => ({
  id: "1",
  role: RoleEnum.Teacher,
  content: "A recipe.",
  followUpOptions,
});

describe("swapFollowUpOption", () => {
  it("replaces the enabled option with the disabled one", () => {
    const message = chefMessage([ChatFollowUpOption.UpdateFridgeEnabled]);

    const updated = swapFollowUpOption(
      message,
      ChatFollowUpOption.UpdateFridgeEnabled,
      ChatFollowUpOption.UpdateFridgeDisabled,
    );

    expect(updated.followUpOptions).toEqual([
      ChatFollowUpOption.UpdateFridgeDisabled,
    ]);
  });

  it("leaves the message itself untouched", () => {
    const message = chefMessage([ChatFollowUpOption.UpdateFridgeEnabled]);

    swapFollowUpOption(
      message,
      ChatFollowUpOption.UpdateFridgeEnabled,
      ChatFollowUpOption.UpdateFridgeDisabled,
    );

    expect(message.followUpOptions).toEqual([
      ChatFollowUpOption.UpdateFridgeEnabled,
    ]);
  });

  it("adds the option when the message had none", () => {
    const updated = swapFollowUpOption(
      chefMessage(),
      ChatFollowUpOption.UpdateFridgeEnabled,
      ChatFollowUpOption.UpdateFridgeDisabled,
    );

    expect(updated.followUpOptions).toEqual([
      ChatFollowUpOption.UpdateFridgeDisabled,
    ]);
  });

  // Both halves of a pair must never be present at once, since each is read on
  // its own to decide whether the button shows and whether it's disabled.
  it("doesn't duplicate an option that is already set", () => {
    const updated = swapFollowUpOption(
      chefMessage([ChatFollowUpOption.UpdateFridgeDisabled]),
      ChatFollowUpOption.UpdateFridgeEnabled,
      ChatFollowUpOption.UpdateFridgeDisabled,
    );

    expect(updated.followUpOptions).toEqual([
      ChatFollowUpOption.UpdateFridgeDisabled,
    ]);
  });
});
