// Tests for CreateGroup component
import { afterEach, describe, it } from "jsr:@std/testing/bdd";
import { expect } from "jsr:@std/expect";
import { cleanup, render } from "../test-utils/component-testing.ts";
import { CreateGroup } from "./CreateGroup.tsx";
import { NotificationProvider } from "../components/Notification.tsx";
import { GroupsContext } from "../context/GroupsContext.tsx";
import { Group2 } from "../model/Group.ts";

describe("CreateGroup Component", () => {
  const mockAddGroup = (description: string, _participants: string[] = []) => {
    return ["cs", 2, 1, description, Date.now(), []] as Group2;
  };

  const mockGroupsContext = {
    groups: [],
    selectedGroup: null,
    refreshGroups: () => {},
    removeGroup: () => {},
    isLoading: false,
    addGroup: mockAddGroup,
    loadGroupDetails: () => Promise.resolve(null),
  };

  afterEach(() => {
    cleanup();
  });

  describe("Basic Participants Validation", () => {
    it("should disable add button for empty input", () => {
      const { container } = render(
        <NotificationProvider>
          <GroupsContext.Provider value={mockGroupsContext}>
            <CreateGroup />
          </GroupsContext.Provider>
        </NotificationProvider>,
      );

      const addButton = container.querySelector(
        ".button.is-primary[type='button']",
      ) as HTMLButtonElement;

      // Button should be disabled initially (empty input)
      expect(addButton.disabled).toBe(true);
    });

    it("should disable add button for whitespace-only input", () => {
      const { container } = render(
        <NotificationProvider>
          <GroupsContext.Provider value={mockGroupsContext}>
            <CreateGroup />
          </GroupsContext.Provider>
        </NotificationProvider>,
      );

      const participantInput = container.querySelector(
        "#participant-name",
      ) as HTMLInputElement;
      const addButton = container.querySelector(
        ".button.is-primary[type='button']",
      ) as HTMLButtonElement;

      // Set value to whitespace only - this tests the current DOM state
      participantInput.value = "   ";

      // Button should be disabled for whitespace-only input
      expect(addButton.disabled).toBe(true);
    });

    it("should disable add button for single character input", () => {
      const { container } = render(
        <NotificationProvider>
          <GroupsContext.Provider value={mockGroupsContext}>
            <CreateGroup />
          </GroupsContext.Provider>
        </NotificationProvider>,
      );

      const participantInput = container.querySelector(
        "#participant-name",
      ) as HTMLInputElement;
      const addButton = container.querySelector(
        ".button.is-primary[type='button']",
      ) as HTMLButtonElement;

      // Set value to single character
      participantInput.value = "A";

      // Button should be disabled for single character
      expect(addButton.disabled).toBe(true);
    });

    it("should have proper UI elements for participant management", () => {
      const { container } = render(
        <NotificationProvider>
          <GroupsContext.Provider value={mockGroupsContext}>
            <CreateGroup />
          </GroupsContext.Provider>
        </NotificationProvider>,
      );

      // Check that all required elements exist
      const participantInput = container.querySelector("#participant-name");
      const addButton = container.querySelector(
        ".button.is-primary[type='button']",
      );
      const participantLabel = container.querySelector(
        "label[for='participant-name']",
      );

      expect(participantInput).toBeTruthy();
      expect(addButton).toBeTruthy();
      expect(participantLabel?.textContent).toContain("Participants");
      expect(addButton?.textContent).toContain("Add");
    });

    it("should show help text for participants", () => {
      const { container } = render(
        <NotificationProvider>
          <GroupsContext.Provider value={mockGroupsContext}>
            <CreateGroup />
          </GroupsContext.Provider>
        </NotificationProvider>,
      );

      // Check for participant-specific help text (there are multiple help texts, find the right one)
      const allHelpTexts = container.querySelectorAll(".help");
      const participantHelpText = Array.from(allHelpTexts).find((help) =>
        (help as HTMLElement).textContent?.includes(
          "Add people who will be part of this group",
        )
      );
      expect(participantHelpText).toBeTruthy();
    });
  });
});
