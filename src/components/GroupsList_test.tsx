// Tests for GroupsList component
import { afterEach, describe, it } from "@std/testing/bdd";
import { expect } from "@std/expect";
import { cleanup, render } from "../test-utils/component-testing.ts";
import { GroupsList } from "./GroupsList.tsx";
import { GroupsContext } from "../context/GroupsContext.tsx";
import { Group2 } from "../model/Group.ts";
import { Router } from "wouter-preact";
import { saveGroup } from "../storage/GroupStorage.ts";
import { createGroup } from "../model/CreateGroup.ts";

// Mock navigation function
let mockNavigate: (path: string) => void;
let currentPath: string;

// Create a mock location hook
const mockLocationHook = () => {
  return [currentPath, mockNavigate] as [string, (path: string) => void];
};

describe("GroupsList Component", () => {
  afterEach(() => {
    cleanup();
    currentPath = "/";
    mockNavigate = () => {};
    // Clear localStorage between tests
    localStorage.clear();
  });

  describe("loading state", () => {
    it("should display loading message when isLoading is true", () => {
      const mockContext = {
        groups: [],
        selectedGroup: null,
        refreshGroups: () => {},
        removeGroup: () => {},
        isLoading: true,
        addGroup: () => ["cs", 2, 1, "", Date.now(), []] as Group2,
        loadGroupDetails: () => Promise.resolve(null),
      };

      const { container } = render(
        <Router hook={mockLocationHook}>
          <GroupsContext.Provider value={mockContext}>
            <GroupsList />
          </GroupsContext.Provider>
        </Router>,
      );

      const loadingElement = container.querySelector(".notification.is-info");
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
        addGroup: () => ["cs", 2, 1, "", Date.now(), []] as Group2,
        loadGroupDetails: () => Promise.resolve(null),
      };

      const { container } = render(
        <Router hook={mockLocationHook}>
          <GroupsContext.Provider value={mockContext}>
            <GroupsList />
          </GroupsContext.Provider>
        </Router>,
      );

      const emptyState = container.querySelector(".empty-state");
      expect(emptyState).toBeTruthy();
      expect(emptyState?.textContent).toContain(
        "You don't have any groups yet.",
      );

      const createButton = container.querySelector("button.is-primary");
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
        addGroup: () => ["cs", 2, 1, "", Date.now(), []] as Group2,
        loadGroupDetails: () => Promise.resolve(null),
      };

      const { container } = render(
        <Router hook={mockLocationHook}>
          <GroupsContext.Provider value={mockContext}>
            <GroupsList />
          </GroupsContext.Provider>
        </Router>,
      );

      const createButton = container.querySelector(
        "button.is-primary",
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
        addGroup: () => ["cs", 2, 1, "", Date.now(), []] as Group2,
        loadGroupDetails: () => Promise.resolve(null),
      };

      const { container } = render(
        <Router hook={mockLocationHook}>
          <GroupsContext.Provider value={mockContext}>
            <GroupsList />
          </GroupsContext.Provider>
        </Router>,
      );

      const groupsList = container.querySelector(".groups-list");
      expect(groupsList).toBeTruthy();

      // Select only group cards within the columns section, not the title card
      const groupItems = container.querySelectorAll(".columns .card");
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
        addGroup: () => ["cs", 2, 1, "", Date.now(), []] as Group2,
        loadGroupDetails: () => Promise.resolve(null),
      };

      const { container } = render(
        <Router hook={mockLocationHook}>
          <GroupsContext.Provider value={mockContext}>
            <GroupsList />
          </GroupsContext.Provider>
        </Router>,
      );

      const deleteButtons = container.querySelectorAll(
        ".card-footer-item.has-text-danger",
      );
      expect(deleteButtons.length).toBe(2);
    });

    it("should hide actions when showActions is false", () => {
      const mockContext = {
        groups: mockGroups,
        selectedGroup: null,
        refreshGroups: () => {},
        removeGroup: () => {},
        isLoading: false,
        addGroup: () => ["cs", 2, 1, "", Date.now(), []] as Group2,
        loadGroupDetails: () => Promise.resolve(null),
      };

      const { container } = render(
        <Router hook={mockLocationHook}>
          <GroupsContext.Provider value={mockContext}>
            <GroupsList showActions={false} />
          </GroupsContext.Provider>
        </Router>,
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
        addGroup: () => ["cs", 2, 1, "", Date.now(), []] as Group2,
        loadGroupDetails: () => Promise.resolve(null),
      };

      const { container } = render(
        <Router hook={mockLocationHook}>
          <GroupsContext.Provider value={mockContext}>
            <GroupsList />
          </GroupsContext.Provider>
        </Router>,
      );

      const groupItem = container.querySelector(
        ".columns .card",
      ) as HTMLElement;
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
        addGroup: () => ["cs", 2, 1, "", Date.now(), []] as Group2,
        loadGroupDetails: () => Promise.resolve(null),
      };

      const { container } = render(
        <Router hook={mockLocationHook}>
          <GroupsContext.Provider value={mockContext}>
            <GroupsList />
          </GroupsContext.Provider>
        </Router>,
      );

      const deleteButton = container.querySelector(
        ".card-footer-item.has-text-danger",
      ) as HTMLElement;
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
        addGroup: () => ["cs", 2, 1, "", Date.now(), []] as Group2,
        loadGroupDetails: () => Promise.resolve(null),
      };

      const { container } = render(
        <Router hook={mockLocationHook}>
          <GroupsContext.Provider value={mockContext}>
            <GroupsList />
          </GroupsContext.Provider>
        </Router>,
      );

      const deleteButton = container.querySelector(
        ".card-footer-item.has-text-danger",
      ) as HTMLElement;
      deleteButton.click();

      expect(removedTimestamp).toBeNull();

      // Restore original confirm
      globalThis.confirm = originalConfirm;
    });
  });

  describe("participants display", () => {
    it("should display participants list in group cards", async () => {
      // Create test groups with participants and save them to storage
      const testGroup = createGroup("Trip to Paris", [
        "Alice",
        "Bob",
        "Charlie",
      ]);
      saveGroup(testGroup);

      const mockGroups = [
        {
          description: "Trip to Paris",
          timestamp: testGroup[4], // Use the actual timestamp from created group
          storageKey: `group_${testGroup[4]}`,
        },
      ];

      const mockContext = {
        groups: mockGroups,
        selectedGroup: null,
        refreshGroups: () => {},
        removeGroup: () => {},
        isLoading: false,
        addGroup: () => ["cs", 2, 1, "", Date.now(), []] as Group2,
        loadGroupDetails: () => Promise.resolve(null),
      };

      const { container } = render(
        <Router hook={mockLocationHook}>
          <GroupsContext.Provider value={mockContext}>
            <GroupsList />
          </GroupsContext.Provider>
        </Router>,
      );

      // Wait a bit for async loading to complete
      await new Promise((resolve) => setTimeout(resolve, 200));

      // Check that participants section exists and shows the actual participants
      const card = container.querySelector(".columns .card");
      expect(card?.textContent).toContain("Trip to Paris");
      expect(card?.textContent).toContain("Alice");
      expect(card?.textContent).toContain("Bob");
      expect(card?.textContent).toContain("Charlie");
    });

    it("should show participants loading state for groups", async () => {
      // Create test group with no participants
      const testGroup = createGroup("Empty Group", []);
      saveGroup(testGroup);

      const mockGroups = [
        {
          description: "Empty Group",
          timestamp: testGroup[4],
          storageKey: `group_${testGroup[4]}`,
        },
      ];

      const mockContext = {
        groups: mockGroups,
        selectedGroup: null,
        refreshGroups: () => {},
        removeGroup: () => {},
        isLoading: false,
        addGroup: () => ["cs", 2, 1, "", Date.now(), []] as Group2,
        loadGroupDetails: () => Promise.resolve(null),
      };

      const { container } = render(
        <Router hook={mockLocationHook}>
          <GroupsContext.Provider value={mockContext}>
            <GroupsList />
          </GroupsContext.Provider>
        </Router>,
      );

      // Wait a bit for async loading to complete
      await new Promise((resolve) => setTimeout(resolve, 200));

      const card = container.querySelector(".columns .card");
      expect(card?.textContent).toContain("Empty Group");
      expect(card?.textContent).toContain("No participants");
    });
  });
});
