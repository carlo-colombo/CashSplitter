import { assertEquals, assertThrows } from "@std/assert";
import { merge } from "./merge.ts";
import { createBaseGroup, cloneGroup, testTransactions, Transaction } from "../../test_fixtures.ts";

Deno.test("merge two group objects with same agents, one with transactions", () => {
  // Create two groups with the same description and timestamp but different transactions
  const group1 = createBaseGroup();
  
  const group2 = createBaseGroup({
    transactions: [
      testTransactions.lunch,
      testTransactions.coffee,
    ]
  });
  
  // Test the merge function with our fixtures
  assertEquals(merge(group1, group2), [
    "cs",
    1,
    2,
    "Trip expenses", // GroupDescription
    1672400000000, // Timestamp
    [
      [1, "Bob"],
      [2, "Charlie"],
    ],
    [
      ["Dinner", 1672444800000, [[1, 30], [2, -30]]],
      ["Lunch", 1672531200000, [[1, 50], [2, -50]]],
      ["Coffee", 1672617600000, [[1, 10], [2, -10]]],
    ]
  ]);
});

Deno.test("merge rejects groups with different descriptions or timestamps", () => {
  // Create the base group
  const group1 = createBaseGroup();
  
  // Create group with different description
  const groupDiffDesc = createBaseGroup({
    description: "Different trip expenses",
    transactions: [testTransactions.lunch]
  });
  
  // Create group with different timestamp
  const groupDiffTime = createBaseGroup({
    timestamp: 1673000000000, // Different timestamp (Jan 6, 2023)
    transactions: [testTransactions.lunch]
  });

  // Test that merging groups with different descriptions throws an error
  assertThrows(
    () => merge(group1, groupDiffDesc),
    Error,
    "Cannot merge groups with different descriptions"
  );

  // Test that merging groups with different timestamps throws an error
  assertThrows(
    () => merge(group1, groupDiffTime),
    Error,
    "Cannot merge groups with different creation timestamps"
  );
});

Deno.test("merge groups with overlapping transactions", () => {
  // Create identical lunch transactions (but different objects)
  const lunch1 = ["Lunch", 1672531200000, [[1, 50], [2, -50]]] as Transaction;
  const lunch2 = ["Lunch", 1672531200000, [[1, 50], [2, -50]]] as Transaction;
  
  // Create first group with dinner and lunch transactions
  const group1 = createBaseGroup({
    transactions: [
      testTransactions.dinner,
      lunch1
    ]
  });
  
  // Create second group with lunch and coffee transactions (lunch is overlapping)
  const group2 = createBaseGroup({
    transactions: [
      lunch2,
      testTransactions.coffee
    ]
  });
  
  // Get the merge result
  const result = merge(group1, group2);
  
  // Test the merge function - lunch appears twice in the result
  // This is the current behavior: duplicate transactions are not detected
  // ISSUE: In the future, we might want to improve the merge function to detect and deduplicate transactions
  assertEquals(result, [
    "cs",
    1,
    2,
    "Trip expenses", // GroupDescription
    1672400000000, // Timestamp
    [
      [1, "Bob"],
      [2, "Charlie"],
    ],
    [
      ["Dinner", 1672444800000, [[1, 30], [2, -30]]],
      ["Lunch", 1672531200000, [[1, 50], [2, -50]]],
      ["Coffee", 1672617600000, [[1, 10], [2, -10]]],
    ]
  ]);
});

interface MergeConflictError extends Error {
  conflicts: Array<{
    type: string;
    [key: string]: unknown;
  }>;
}

Deno.test("merge detects agent conflicts and returns detailed error", () => {
  // Create base group with standard agents
  const group1 = createBaseGroup();
  
  // Create a group with a conflicting agent (same ID but different name)
  const group2 = createBaseGroup();
  group2[5][0][1] = "Robert"; // Change Bob to Robert but keep ID 1

  // Test that merging throws with detailed conflict information
  try {
    merge(group1, group2);
    throw new Error("Merge should have thrown an error");
  } catch (error) {
    if (!(error instanceof Error)) throw error;
    const mergeError = error as MergeConflictError;
    assertEquals(mergeError.conflicts, [
      { type: "agent", id: 1, value1: "Bob", value2: "Robert" }
    ]);
  }
});

Deno.test("merge detects transaction conflicts and returns detailed error", () => {
  // Create two groups with conflicting transactions (same desc and timestamp but different amounts)
  const conflictingLunch1 = ["Lunch", 1672531200000, [[1, 40], [2, -40]]] as Transaction;
  const conflictingLunch2 = ["Lunch", 1672531200000, [[1, 50], [2, -50]]] as Transaction;
  
  const group1 = createBaseGroup({
    transactions: [testTransactions.dinner, conflictingLunch1]
  });
  
  const group2 = createBaseGroup({
    transactions: [testTransactions.coffee, conflictingLunch2]
  });
  
  // Test that merging throws with detailed conflict information
  try {
    merge(group1, group2);
    throw new Error("Merge should have thrown an error");
  } catch (error) {
    if (!(error instanceof Error)) throw error;
    const mergeError = error as MergeConflictError;
    assertEquals(mergeError.conflicts, [
      { 
        type: "transaction", 
        description: "Lunch", 
        timestamp: 1672531200000,
        value1: [[1, 40], [2, -40]],
        value2: [[1, 50], [2, -50]] 
      }
    ]);
  }
});

Deno.test("merge detects multiple conflicts and returns all details", () => {
  // Create groups with both agent and transaction conflicts
  const group1 = createBaseGroup({
    transactions: [
      testTransactions.dinner, 
      ["Lunch", 1672531200000, [[1, 40], [2, -40]]] as Transaction
    ]
  });
  
  const group2 = cloneGroup(group1);
  // Add agent conflict
  group2[5][0][1] = "Robert";
  // Add transaction conflict  
  group2[6][1] = ["Lunch", 1672531200000, [[1, 50], [2, -50]]] as Transaction;
  
  // Test that merging throws with multiple detailed conflict information
  try {
    merge(group1, group2);
    throw new Error("Merge should have thrown an error");
  } catch (error) {
    if (!(error instanceof Error)) throw error;
    const mergeError = error as MergeConflictError;
    assertEquals(mergeError.conflicts, [
      { type: "agent", id: 1, value1: "Bob", value2: "Robert" },
      { 
        type: "transaction", 
        description: "Lunch", 
        timestamp: 1672531200000,
        value1: [[1, 40], [2, -40]],
        value2: [[1, 50], [2, -50]] 
      }
    ]);
  }
});
