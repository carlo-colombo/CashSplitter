import { Group } from "./src/model/Group.ts";

/**
 * Base group fixture that can be cloned and modified in tests
 */
export const createBaseGroup = (overrides: Partial<{
  revision: number;
  description: string;
  timestamp: number;
  transactions: Transaction[];
}> = {}): Group => {
  return [
    "cs",
    1,
    overrides.revision ?? 1,
    overrides.description ?? "Trip expenses",
    overrides.timestamp ?? 1672400000000, // Timestamp (Dec 30, 2022)
    [
      [1, "Bob"],
      [2, "Charlie"],
    ],
    overrides.transactions ?? [
      ["Dinner", 1672444800000, [[1, 30], [2, -30]]]
    ]
  ];
};

/**
 * Helper function to create a deep copy of a group
 * This ensures modifications to the copy don't affect the original
 */
export const cloneGroup = (group: Group): Group => {
  return JSON.parse(JSON.stringify(group));
};

/**
 * Type definition for Transaction entries
 */
export type Transaction = [string, number, [number, number][]];

/**
 * Standard test transactions that can be used in groups
 */
export const testTransactions = {
  dinner: ["Dinner", 1672444800000, [[1, 30], [2, -30]]] as Transaction,
  lunch: ["Lunch", 1672531200000, [[1, 50], [2, -50]]] as Transaction,
  coffee: ["Coffee", 1672617600000, [[1, 10], [2, -10]]] as Transaction
};
