import { expect } from "jsr:@std/expect";
import { describe, it } from "jsr:@std/testing/bdd";
import { merge } from "./merge.ts";
import { createBaseGroup, cloneGroup, testTransactions, Transaction } from "../../test_fixtures.ts";

describe("merge function", () => {
  describe("when merging two group objects with same agents", () => {
    it("should combine transactions correctly", () => {
      // Create two groups with the same description and timestamp but different transactions
      const group1 = createBaseGroup();
      
      const group2 = createBaseGroup({
        transactions: [
          testTransactions.lunch,
          testTransactions.coffee,
        ]
      });
      
      // Test the merge function with our fixtures
      expect(merge(group1, group2)).toEqual([
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
  });

  describe("when merging groups with different identifiers", () => {
    it("should reject groups with different descriptions", () => {
      // Create the base group
      const group1 = createBaseGroup();
      
      // Create group with different description
      const groupDiffDesc = createBaseGroup({
        description: "Different trip expenses",
        transactions: [testTransactions.lunch]
      });
      
      // Test that merging groups with different descriptions throws an error
      expect(() => merge(group1, groupDiffDesc)).toThrow("Cannot merge groups with different descriptions");
    });

    it("should reject groups with different timestamps", () => {
      // Create the base group
      const group1 = createBaseGroup();
      
      // Create group with different timestamp
      const groupDiffTime = createBaseGroup({
        timestamp: 1673000000000, // Different timestamp (Jan 6, 2023)
        transactions: [testTransactions.lunch]
      });

      // Test that merging groups with different timestamps throws an error
      expect(() => merge(group1, groupDiffTime)).toThrow("Cannot merge groups with different creation timestamps");
    });
  });

  describe("when merging groups with overlapping transactions", () => {
    it("should handle duplicate transactions correctly", () => {
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
      
      // Test the merge function - lunch appears in the result
      // Note: In the future, we might want to improve the merge function to better detect and deduplicate transactions
      expect(result).toEqual([
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
  });

  interface MergeConflictError extends Error {
    conflicts: Array<{
      type: string;
      [key: string]: unknown;
    }>;
  }

  describe("when detecting conflicts", () => {
    describe("with agent conflicts", () => {
      it("should return detailed error information", () => {
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
          expect(mergeError.conflicts).toEqual([
            { type: "agent", id: 1, value1: "Bob", value2: "Robert" }
          ]);
        }
      });
    });

    describe("with transaction conflicts", () => {
      it("should return detailed error information", () => {
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
          expect(mergeError.conflicts).toEqual([
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
    });

    describe("with multiple conflicts", () => {
      it("should return all conflict details", () => {
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
          expect(mergeError.conflicts).toEqual([
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
    });
  });
});
