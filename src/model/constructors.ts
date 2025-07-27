// 🏎️ Utility functions for constructing transactions for CashSplitter
// These are helpers for tests and internal logic, not for direct use in production code

import { AddTransaction } from "./Group.ts";

/**
 * Creates an AddTransaction operation.
 * @param description Description of the transaction
 * @param movements Array of [memberId, amount] movements (cents)
 * @param timestamp Timestamp for the transaction
 * @returns AddTransaction tuple
 */
export function makeAddTransaction(
  description: string,
  movements: [number, number][],
  timestamp: number,
): AddTransaction {
  return [3, description, timestamp, movements];
}
