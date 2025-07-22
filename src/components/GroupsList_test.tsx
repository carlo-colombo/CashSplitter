// Tests for GroupsList component
import { afterEach, describe, it } from "@std/testing/bdd";
import { expect } from "@std/expect";
import { cleanup, render } from "../test-utils/component-testing.ts";
import { GroupsList } from "./GroupsList.tsx";
import { GroupsContext } from "../context/GroupsContext.tsx";
import { Group } from "../model/Group.ts";

// Mock navigation function
let mockNavigate: (path: string) => void;
let mockLocation: string;

// Mock wouter-preact
// @ts-ignore: Mock implementation
globalThis["wouter-preact"] = {
  useLocation: () => [mockLocation, mockNavigate],
};

describe("GroupsList Component", () => {
  afterEach(() => {
    cleanup();
    mockLocation = "/";
    mockNavigate = () => {};
  });

  describe("loading state", () => {
    it("should display loading message when isLoading is true", () => {
      const mockContext = {
        groups: [],
        selectedGroup: null,
        refreshGroups: () => {},
        removeGroup: () => {},
        isLoading: true,
        addGroup: () => ["cs", 1, 1, "", Date.now(), [], []] as Group,
        loadGroupDetails: () => Promise.resolve(null),
      };

      const { container } = render(
        <GroupsContext.Provider value={mockContext}>
          <GroupsList />
        </GroupsContext.Provider>,
      );

      const loadingElement = container.querySelector(".loading");
      expect(loadingElement).toBeTruthy();
      expect(loadingElement?.textContent).toContain("Loading groups...");
    });
  });

  describe("empty state", () => {
    it("should display empty state when no groups exist", () => {
      const mockContext = {
        groups: [],
        selectedGroup: null,
        refreshGroups: () => {},
        removeGroup: () => {},
        isLoading: false,
        addGroup: () => ["cs", 1, 1, "", Date.now(), [], []] as Group,
        loadGroupDetails: () => Promise.resolve(null),
      };

      const { container } = render(
        <GroupsContext.Provider value={mockContext}>
          <GroupsList />
        </GroupsContext.Provider>,
      );

      const emptyState = container.querySelector(".empty-state");
      expect(emptyState).toBeTruthy();
      expect(emptyState?.textContent).toContain(
        "You don't have any groups yet.",
      );

      const createButton = container.querySelector("button.primary");
      expect(createButton?.textContent).toContain("Create Your First Group");
    });

    it("should navigate to create page when create button is clicked", () => {
      let navigatedTo = "";
      mockNavigate = (path: string) => {
        navigatedTo = path;
      };

      const mockContext = {
        groups: [],
        selectedGroup: null,
        refreshGroups: () => {},
        removeGroup: () => {},
        isLoading: false,
        addGroup: () => ["cs", 1, 1, "", Date.now(), [], []] as Group,
        loadGroupDetails: () => Promise.resolve(null),
      };

      const { container } = render(
        <GroupsContext.Provider value={mockContext}>
          <GroupsList />
        </GroupsContext.Provider>,
      );

      const createButton = container.querySelector(
        "button.primary",
      ) as HTMLButtonElement;
      createButton.click();

      expect(navigatedTo).toBe("/create");
    });
  });

  describe("groups list display", () => {
    const mockGroups = [
      {
        description: "Trip to Paris",
        timestamp: 1672531200000, // Jan 1, 2023
        storageKey: "group_1672531200000",
      },
      {
        description: "Dinner with friends",
        timestamp: 1672617600000, // Jan 2, 2023
        storageKey: "group_1672617600000",
      },
    ];

    it("should display list of groups when groups exist", () => {
      const mockContext = {
        groups: mockGroups,
        selectedGroup: null,
        refreshGroups: () => {},
        removeGroup: () => {},
        isLoading: false,
        addGroup: () => ["cs", 1, 1, "", Date.now(), [], []] as Group,
        loadGroupDetails: () => Promise.resolve(null),
      };

      const { container } = render(
        <GroupsContext.Provider value={mockContext}>
          <GroupsList />
        </GroupsContext.Provider>,
      );

      const groupsList = container.querySelector(".groups-list");
      expect(groupsList).toBeTruthy();

      const groupItems = container.querySelectorAll("li");
      expect(groupItems.length).toBe(2);

      // Check first group
      expect(groupItems[0].textContent).toContain("Trip to Paris");
      expect(groupItems[0].textContent).toContain("1/1/2023");

      // Check second group
      expect(groupItems[1].textContent).toContain("Dinner with friends");
      expect(groupItems[1].textContent).toContain("1/2/2023");
    });

    it("should show delete buttons when showActions is true (default)", () => {
      const mockContext = {
        groups: mockGroups,
        selectedGroup: null,
        refreshGroups: () => {},
        removeGroup: () => {},
        isLoading: false,
        addGroup: () => ["cs", 1, 1, "", Date.now(), [], []] as Group,
        loadGroupDetails: () => Promise.resolve(null),
      };

      const { container } = render(
        <GroupsContext.Provider value={mockContext}>
          <GroupsList />
        </GroupsContext.Provider>,
      );

      const deleteButtons = container.querySelectorAll("button.danger");
      expect(deleteButtons.length).toBe(2);
    });

    it("should hide actions when showActions is false", () => {
      const mockContext = {
        groups: mockGroups,
        selectedGroup: null,
        refreshGroups: () => {},
        removeGroup: () => {},
        isLoading: false,
        addGroup: () => ["cs", 1, 1, "", Date.now(), [], []] as Group,
        loadGroupDetails: () => Promise.resolve(null),
      };

      const { container } = render(
        <GroupsContext.Provider value={mockContext}>
          <GroupsList showActions={false} />
        </GroupsContext.Provider>,
      );

      const deleteButtons = container.querySelectorAll("button.danger");
      expect(deleteButtons.length).toBe(0);

      const actionsSection = container.querySelector(".actions");
      expect(actionsSection).toBeNull();
    });
  });

  describe("navigation", () => {
    const mockGroups = [
      {
        description: "Trip to Paris",
        timestamp: 1672531200000,
        storageKey: "group_1672531200000",
      },
    ];

    it("should navigate to group detail when group is clicked", () => {
      let navigatedTo = "";
      mockNavigate = (path: string) => {
        navigatedTo = path;
      };

      const mockContext = {
        groups: mockGroups,
        selectedGroup: null,
        refreshGroups: () => {},
        removeGroup: () => {},
        isLoading: false,
        addGroup: () => ["cs", 1, 1, "", Date.now(), [], []] as Group,
        loadGroupDetails: () => Promise.resolve(null),
      };

      const { container } = render(
        <GroupsContext.Provider value={mockContext}>
          <GroupsList />
        </GroupsContext.Provider>,
      );

      const groupItem = container.querySelector("li") as HTMLLIElement;
      groupItem.click();

      expect(navigatedTo).toBe("/group/1672531200000");
    });
  });

  describe("group deletion", () => {
    const mockGroups = [
      {
        description: "Trip to Paris",
        timestamp: 1672531200000,
        storageKey: "group_1672531200000",
      },
    ];

    it("should call removeGroup when delete is confirmed", () => {
      let removedTimestamp: number | null = null;
      const mockRemoveGroup = (timestamp: number) => {
        removedTimestamp = timestamp;
      };

      // Mock window.confirm to return true
      const originalConfirm = globalThis.confirm;
      globalThis.confirm = () => true;

      const mockContext = {
        groups: mockGroups,
        selectedGroup: null,
        refreshGroups: () => {},
        removeGroup: mockRemoveGroup,
        isLoading: false,
        addGroup: () => ["cs", 1, 1, "", Date.now(), [], []] as Group,
        loadGroupDetails: () => Promise.resolve(null),
      };

      const { container } = render(
        <GroupsContext.Provider value={mockContext}>
          <GroupsList />
        </GroupsContext.Provider>,
      );

      const deleteButton = container.querySelector(
        "button.danger",
      ) as HTMLButtonElement;
      deleteButton.click();

      expect(removedTimestamp).toBe(1672531200000);

      // Restore original confirm
      globalThis.confirm = originalConfirm;
    });

    it("should not call removeGroup when delete is cancelled", () => {
      let removedTimestamp: number | null = null;
      const mockRemoveGroup = (timestamp: number) => {
        removedTimestamp = timestamp;
      };

      // Mock window.confirm to return false
      const originalConfirm = globalThis.confirm;
      globalThis.confirm = () => false;

      const mockContext = {
        groups: mockGroups,
        selectedGroup: null,
        refreshGroups: () => {},
        removeGroup: mockRemoveGroup,
        isLoading: false,
        addGroup: () => ["cs", 1, 1, "", Date.now(), [], []] as Group,
        loadGroupDetails: () => Promise.resolve(null),
      };

      const { container } = render(
        <GroupsContext.Provider value={mockContext}>
          <GroupsList />
        </GroupsContext.Provider>,
      );

      const deleteButton = container.querySelector(
        "button.danger",
      ) as HTMLButtonElement;
      deleteButton.click();

      expect(removedTimestamp).toBeNull();

      // Restore original confirm
      globalThis.confirm = originalConfirm;
    });
  });
});
