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
  coffee: ["Coffee", 1672617600000, [[1, 10], [2, -10]]] as Transaction,
};
