import { expect } from "jsr:@std/expect";
import { describe, it } from "jsr:@std/testing/bdd";
import { merge, MergeConflictError } from "./merge.ts";
import {
  cloneGroup,
  createBaseGroup,
  testTransactions,
  Transaction,
} from "../../test_fixtures.ts";

// Helper function to test for MergeConflictError with expected conflicts
function expectMergeConflictError(
  fn: () => void,
  expectedConflicts: Array<Record<string, unknown>>,
) {
  let error: Error | null = null;
  try {
    fn();
  } catch (e) {
    if (e instanceof Error) {
      error = e;
    }
  }

  expect(error).not.toBeNull();
  expect(error!.name).toEqual("MergeConflictError");

  const mergeError = error as unknown as MergeConflictError;
  expect(mergeError.conflicts).toEqual(expectedConflicts);
}

describe("merge function", () => {
  describe("valid merge operations", () => {
    interface SuccessTestCase {
      name: string;
      group1: ReturnType<typeof createBaseGroup>;
      group2: ReturnType<typeof createBaseGroup>;
      expected: ReturnType<typeof createBaseGroup>;
    }

    const successTests: SuccessTestCase[] = [
      {
        name:
          "should combine transactions correctly when groups have the same agents",
        group1: createBaseGroup(),
        group2: createBaseGroup({
          transactions: [
            testTransactions.lunch,
            testTransactions.coffee,
          ],
        }),
        expected: [
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
          ],
        ],
      },
      {
        name: "should handle duplicate transactions correctly",
        group1: createBaseGroup({
          transactions: [
            testTransactions.dinner,
            ["Lunch", 1672531200000, [[1, 50], [2, -50]]] as Transaction,
          ],
        }),
        group2: createBaseGroup({
          transactions: [
            ["Lunch", 1672531200000, [[1, 50], [2, -50]]] as Transaction,
            testTransactions.coffee,
          ],
        }),
        expected: [
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
          ],
        ],
      },
    ];

    // Execute all success test cases using a loop
    for (const test of successTests) {
      it(test.name, () => {
        expect(merge(test.group1, test.group2)).toEqual(test.expected);
      });
    }
  });

  describe("merge conflicts", () => {
    interface ConflictTestCase {
      name: string;
      group1: ReturnType<typeof createBaseGroup>;
      group2: ReturnType<typeof createBaseGroup>;
      expectedConflicts: Array<Record<string, unknown>>;
    }

    // Test cases for group identifier conflicts
    const groupIdentifierTests: ConflictTestCase[] = [
      {
        name: "should reject groups with different descriptions",
        group1: createBaseGroup(),
        group2: createBaseGroup({
          description: "Different trip expenses",
          transactions: [testTransactions.lunch],
        }),
        expectedConflicts: [{
          type: "groupId",
          field: "description",
          value1: "Trip expenses",
          value2: "Different trip expenses",
        }],
      },
      {
        name: "should reject groups with different timestamps",
        group1: createBaseGroup(),
        group2: createBaseGroup({
          timestamp: 1673000000000, // Different timestamp (Jan 6, 2023)
          transactions: [testTransactions.lunch],
        }),
        expectedConflicts: [{
          type: "groupId",
          field: "timestamp",
          value1: 1672400000000,
          value2: 1673000000000,
        }],
      },
      {
        name: "should reject groups with different descriptions and timestamps",
        group1: createBaseGroup(),
        group2: createBaseGroup({
          description: "Different trip expenses",
          timestamp: 1673000000000,
          transactions: [testTransactions.lunch],
        }),
        expectedConflicts: [
          {
            type: "groupId",
            field: "description",
            value1: "Trip expenses",
            value2: "Different trip expenses",
          },
          {
            type: "groupId",
            field: "timestamp",
            value1: 1672400000000,
            value2: 1673000000000,
          },
        ],
      },
    ];

    // Test cases for agent conflicts
    const agentConflictTests: ConflictTestCase[] = [
      {
        name: "should return detailed agent conflict information",
        group1: createBaseGroup(),
        group2: (() => {
          const group = createBaseGroup();
          group[5][0][1] = "Robert"; // Change Bob to Robert but keep ID 1
          return group;
        })(),
        expectedConflicts: [
          { type: "agent", id: 1, value1: "Bob", value2: "Robert" },
        ],
      },
    ];

    // Test cases for transaction conflicts
    const transactionConflictTests: ConflictTestCase[] = [
      {
        name: "should return detailed transaction conflict information",
        group1: createBaseGroup({
          transactions: [
            testTransactions.dinner,
            ["Lunch", 1672531200000, [[1, 40], [2, -40]]] as Transaction,
          ],
        }),
        group2: createBaseGroup({
          transactions: [
            testTransactions.coffee,
            ["Lunch", 1672531200000, [[1, 50], [2, -50]]] as Transaction,
          ],
        }),
        expectedConflicts: [{
          type: "transaction",
          description: "Lunch",
          timestamp: 1672531200000,
          value1: [[1, 40], [2, -40]],
          value2: [[1, 50], [2, -50]],
        }],
      },
    ];

    // Test cases for multiple conflicts
    const multipleConflictTests: ConflictTestCase[] = [
      {
        name: "should return all conflict details",
        group1: createBaseGroup({
          transactions: [
            testTransactions.dinner,
            ["Lunch", 1672531200000, [[1, 40], [2, -40]]] as Transaction,
          ],
        }),
        group2: (() => {
          const group = cloneGroup(createBaseGroup({
            transactions: [
              testTransactions.dinner,
              ["Lunch", 1672531200000, [[1, 40], [2, -40]]] as Transaction,
            ],
          }));
          // Add agent conflict
          group[5][0][1] = "Robert";
          // Add transaction conflict
          group[6][1] = ["Lunch", 1672531200000, [[1, 50], [
            2,
            -50,
          ]]] as Transaction;
          return group;
        })(),
        expectedConflicts: [
          { type: "agent", id: 1, value1: "Bob", value2: "Robert" },
          {
            type: "transaction",
            description: "Lunch",
            timestamp: 1672531200000,
            value1: [[1, 40], [2, -40]],
            value2: [[1, 50], [2, -50]],
          },
        ],
      },
    ];

    // Execute all conflict test cases using a loop
    for (
      const category of [
        { name: "group identifier conflicts", tests: groupIdentifierTests },
        { name: "agent conflicts", tests: agentConflictTests },
        { name: "transaction conflicts", tests: transactionConflictTests },
        { name: "multiple conflicts", tests: multipleConflictTests },
      ]
    ) {
      describe(category.name, () => {
        for (const test of category.tests) {
          it(test.name, () => {
            expectMergeConflictError(
              () => merge(test.group1, test.group2),
              test.expectedConflicts,
            );
          });
        }
      });
    }
  });
});
