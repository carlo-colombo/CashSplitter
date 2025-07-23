// Group Storage Service
// Handles persisting groups to local storage and retrieving them
import { Group } from "../model/Group.ts";
import { groupId } from "../model/Accessors.ts";
import { decode, encode } from "../model/GroupSerialization.ts";

// Prefix for all keys in localStorage to avoid conflicts
const STORAGE_PREFIX = "cashsplitter:group:";
const GROUP_LIST_KEY = "cashsplitter:groups";

/**
 * Save a group to localStorage
 * @param group The group to save
 * @returns The storage key used to save the group
 */
export function saveGroup(group: Group): string {
  const [description, timestamp] = groupId(group);
  const storageKey = `${STORAGE_PREFIX}${timestamp}`;

  try {
    // Serialize and save the group
    const serialized = encode(group);
    localStorage.setItem(storageKey, serialized);

    // Update the group list
    updateGroupList(storageKey, description, timestamp);

    return storageKey;
  } catch (error) {
    console.error("Failed to save group:", error);
    throw new Error(
      `Failed to save group: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }
}

/**
 * Load a group from localStorage
 * @param timestamp The timestamp identifier of the group to load
 * @returns The deserialized Group or null if not found
 */
export function loadGroup(timestamp: number): Group | null {
  const storageKey = `${STORAGE_PREFIX}${timestamp}`;

  try {
    const serialized = localStorage.getItem(storageKey);
    if (!serialized) return null;

    return decode(serialized);
  } catch (error) {
    console.error(`Failed to load group from ${storageKey}:`, error);
    throw new Error(
      `Failed to load group: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }
}

/**
 * Delete a group from localStorage
 * @param timestamp The timestamp identifier of the group to delete
 * @returns true if deleted, false if not found
 */
export function deleteGroup(timestamp: number): boolean {
  const storageKey = `${STORAGE_PREFIX}${timestamp}`;

  try {
    // Check if group exists
    if (!localStorage.getItem(storageKey)) return false;

    // Remove from localStorage
    localStorage.removeItem(storageKey);

    // Remove from group list
    removeFromGroupList(timestamp);

    return true;
  } catch (error) {
    console.error(`Failed to delete group ${storageKey}:`, error);
    return false;
  }
}

/**
 * Get a list of all saved groups with basic metadata
 * @returns Array of group metadata objects
 */
export function getGroupList(): Array<
  { description: string; timestamp: number; storageKey: string }
> {
  try {
    const listJson = localStorage.getItem(GROUP_LIST_KEY);
    if (!listJson) return [];

    return JSON.parse(listJson);
  } catch (error) {
    console.error("Failed to retrieve group list:", error);
    return [];
  }
}

// Helper function to update the group list in localStorage
function updateGroupList(
  storageKey: string,
  description: string,
  timestamp: number,
): void {
  try {
    // Get existing list or initialize empty array
    const groupList = getGroupList();

    // Check if this group is already in the list
    const existingIndex = groupList.findIndex((item) =>
      item.timestamp === timestamp
    );

    if (existingIndex >= 0) {
      // Update existing entry
      groupList[existingIndex] = { description, timestamp, storageKey };
    } else {
      // Add new entry
      groupList.push({ description, timestamp, storageKey });
    }

    // Save updated list
    localStorage.setItem(GROUP_LIST_KEY, JSON.stringify(groupList));
  } catch (error) {
    console.error("Failed to update group list:", error);
  }
}

// Helper function to remove a group from the group list
function removeFromGroupList(timestamp: number): void {
  try {
    // Get existing list
    const groupList = getGroupList();

    // Filter out the group to remove
    const updatedList = groupList.filter((item) =>
      item.timestamp !== timestamp
    );

    // Save updated list
    localStorage.setItem(GROUP_LIST_KEY, JSON.stringify(updatedList));
  } catch (error) {
    console.error("Failed to remove group from list:", error);
  }
}
