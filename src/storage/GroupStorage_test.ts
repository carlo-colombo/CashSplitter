import { assertEquals, assertExists } from "https://deno.land/std@0.214.0/testing/asserts.ts";
import { createBaseGroup } from "../../test_fixtures.ts";
import { GroupStorage, Storage } from "./GroupStorage.ts";
import { Group } from "../model/Group.ts";

// Mock localStorage for testing
class MockStorage implements Storage {
  private storage = new Map<string, string>();
  
  getItem(key: string): string | null {
    console.log(`[MOCK] Getting item for key: ${key}`);
    console.log(`[MOCK] Has key: ${this.storage.has(key)}`);
    return this.storage.has(key) ? this.storage.get(key)! : null;
  }
  
  setItem(key: string, value: string): void {
    console.log(`[MOCK] Setting item for key: ${key}`);
    console.log(`[MOCK] Value: ${value.substring(0, 50)}...`);
    this.storage.set(key, value);
  }
  
  removeItem(key: string): void {
    console.log(`[MOCK] Removing item for key: ${key}`);
    this.storage.delete(key);
  }
  
  clear(): void {
    console.log("[MOCK] Clearing storage");
    this.storage.clear();
  }
  
  get length(): number {
    return this.storage.size;
  }
  
  key(index: number): string | null {
    const keys = Array.from(this.storage.keys());
    return index >= 0 && index < keys.length ? keys[index] : null;
  }
  
  getAllKeys(): string[] {
    return Array.from(this.storage.keys());
  }
}

const mockLocalStorage = new MockStorage();

// Create test groups
function createTestGroups(): Group[] {
  // Create base groups with only allowed properties
  const group1 = createBaseGroup({
    description: "Trip to Paris",
    timestamp: 1625097600000
  });
  
  // Modify the agents directly
  group1[5] = [
    [1, "Alice"],
    [2, "Bob"]
  ];
  
  const group2 = createBaseGroup({
    description: "Dinner Party",
    timestamp: 1625184000000
  });
  
  // Modify the agents directly
  group2[5] = [
    [1, "Charlie"],
    [2, "Dave"],
    [3, "Eve"]
  ];
  
  return [group1, group2];
}

Deno.test("GroupStorage - save and get a group", () => {
  // Setup
  mockLocalStorage.clear();
  
  const storage = new GroupStorage(mockLocalStorage);
  const group = createTestGroups()[0];
  
  // Debug the group to be saved
  console.log("Group to save:", {
    description: group[3],
    timestamp: group[4],
  });

  // Test save
  storage.saveGroup(group);
  
  // Get the key that should have been used
  const key = `cashsplitter_group_${group[3]}_${group[4]}`;
  console.log(`Key to look for: ${key}`);
  
  // List all keys in the mock storage
  console.log("All keys in mock storage:", mockLocalStorage.getAllKeys());
  
  // Verify localStorage was called with correct values
  const storedValue = mockLocalStorage.getItem(key);
  console.log("Stored value:", storedValue ? storedValue.substring(0, 50) + "..." : "null");
  assertExists(storedValue);
  assertEquals(storedValue, JSON.stringify(group));
  
  // Test get
  const retrievedGroup = storage.getGroup(group[3], group[4]);
  assertEquals(retrievedGroup, group);
});

Deno.test("GroupStorage - get all groups", () => {
  // Setup
  mockLocalStorage.clear();
  
  const storage = new GroupStorage(mockLocalStorage);
  const groups = createTestGroups();
  
  // Save multiple groups
  groups.forEach(group => storage.saveGroup(group));
  
  // Test getAllGroups
  const allGroups = storage.getAllGroups();
  assertEquals(allGroups.length, groups.length);
  
  // Verify the contents are as expected
  groups.forEach(originalGroup => {
    const foundGroup = allGroups.find((g: Group) => 
      g[3] === originalGroup[3] && g[4] === originalGroup[4]
    );
    assertExists(foundGroup);
    assertEquals(foundGroup, originalGroup);
  });
});

Deno.test("GroupStorage - delete a group", () => {
  // Setup
  mockLocalStorage.clear();
  
  const storage = new GroupStorage(mockLocalStorage);
  const group = createTestGroups()[0];
  
  // Save a group
  storage.saveGroup(group);
  
  // Test deleteGroup
  storage.deleteGroup(group[3], group[4]);
  
  // Verify the group was deleted
  const retrievedGroup = storage.getGroup(group[3], group[4]);
  assertEquals(retrievedGroup, null);
});
