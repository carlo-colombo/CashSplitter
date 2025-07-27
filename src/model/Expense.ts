import { makeAddTransaction } from "./constructors.ts";
import { AddTransaction, Group2 } from "./Group.ts";

/**
 * Appends an AddTransaction operation to a Group2.
 * @param group Group2 to add the transaction to
 * @param description Description of the transaction
 * @param movements Array of [memberId, amount] movements (cents)
 * @param timestamp Timestamp for the transaction
 * @returns New Group2 with the AddTransaction operation appended
 */
export function addTransaction(
  group: Group2,
  description: string,
  movements: [number, number][],
  timestamp: number,
): Group2 {
  // Validate that the sum of movements is zero (allow small rounding difference)
  const sum = movements.reduce((acc, [, amount]) => acc + amount, 0);
  if (Math.abs(sum) > 1) {
    throw new Error(
      `Movements must sum to zero (±1 cent allowed). Got: ${sum}`,
    );
  }

  const op: AddTransaction = makeAddTransaction(
    description,
    movements,
    timestamp,
  );

  return [
    group[0], // "cs"
    group[1], // version
    group[2] + 1, // increment revision
    group[3], // description
    group[4], // creation timestamp
    [...group[5], op], // append operation
  ];
}
