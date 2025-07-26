// GroupsContext.tsx
// Provides global access to the groups and their state
import { ComponentChildren, createContext, FunctionComponent } from "preact";
import { useContext, useEffect, useState } from "preact/hooks";
import { Group2 } from "../model/Group.ts";
import { groupId } from "../model/Accessors.ts";
import { createGroup } from "../model/CreateGroup.ts";
import {
  deleteGroup,
  getGroupList,
  loadGroup,
  saveGroup,
} from "../storage/GroupStorage.ts";
import { NotificationContext } from "../components/Notification.tsx";

// Define the type for our context
interface GroupsContextType {
  groups: Array<{
    description: string;
    timestamp: number;
    storageKey: string;
  }>;
  selectedGroup: Group2 | null;
  addGroup: (description: string, members?: string[]) => Group2;
  loadGroupDetails: (timestamp: number) => Promise<Group2 | null>;
  removeGroup: (timestamp: number) => void;
  refreshGroups: () => void;
  isLoading: boolean;
}

// Create the context
export const GroupsContext = createContext<GroupsContextType>({
  groups: [],
  selectedGroup: null,
  addGroup: () => {
    throw new Error("GroupsContext not initialized");
  },
  loadGroupDetails: () => Promise.resolve(null),
  removeGroup: () => {},
  refreshGroups: () => {},
  isLoading: false,
});

// Create the provider component
export const GroupsProvider: FunctionComponent<
  { children: ComponentChildren }
> = ({ children }) => {
  const { showNotification } = useContext(NotificationContext);
  const [groups, setGroups] = useState<
    Array<{
      description: string;
      timestamp: number;
      storageKey: string;
    }>
  >([]);
  const [selectedGroup, setSelectedGroup] = useState<Group2 | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Load the list of groups from storage on component mount
  useEffect(() => {
    refreshGroups();
  }, []);

  // Function to refresh the groups list from storage
  const refreshGroups = () => {
    setIsLoading(true);
    try {
      const groupList = getGroupList();
      setGroups(groupList);
    } catch (error) {
      console.error("Error loading group list:", error);
      showNotification("error", "Failed to load saved groups");
    } finally {
      setIsLoading(false);
    }
  };

  // Function to create and save a new group
  const addGroup = (description: string, members?: string[]): Group2 => {
    try {
      const newGroup = createGroup(description, members);
      saveGroup(newGroup);
      refreshGroups();
      return newGroup;
    } catch (error) {
      console.error("Error creating group:", error);
      showNotification(
        "error",
        `Failed to create group: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
      throw error;
    }
  };

  // Function to load a group's full details
  const loadGroupDetails = (timestamp: number): Promise<Group2 | null> => {
    setIsLoading(true);
    try {
      const group = loadGroup(timestamp);
      setSelectedGroup(group);
      return Promise.resolve(group);
    } catch (error) {
      console.error("Error loading group details:", error);
      showNotification(
        "error",
        `Failed to load group: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
      return Promise.resolve(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to remove a group
  const removeGroup = (timestamp: number) => {
    try {
      const deleted = deleteGroup(timestamp);
      if (deleted) {
        refreshGroups();
        showNotification("success", "Group deleted successfully");

        // Clear selected group if it was the one deleted
        if (selectedGroup && groupId(selectedGroup)[1] === timestamp) {
          setSelectedGroup(null);
        }
      }
    } catch (error) {
      console.error("Error removing group:", error);
      showNotification(
        "error",
        `Failed to delete group: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  };

  return (
    <GroupsContext.Provider
      value={{
        groups,
        selectedGroup,
        addGroup,
        loadGroupDetails,
        removeGroup,
        refreshGroups,
        isLoading,
      }}
    >
      {children}
    </GroupsContext.Provider>
  );
};
