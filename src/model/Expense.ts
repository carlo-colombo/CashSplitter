import { Group } from "./Group.ts";

// Index constants for better readability - only used internally
const GROUP_REVISION = 2;
const GROUP_DESCRIPTION = 3;
const GROUP_CREATION_TIMESTAMP = 4;
const GROUP_AGENTS = 5;
const GROUP_TRANSACTIONS = 6;

/**
 * Add an expense to a group with simplified API.
 * Supports both single and multiple payers with custom splits.
 *
 * @param group - The group to add the expense to
 * @param payers - Array of [payerId, amountPaid] for payers (single payer should be passed as single-item array)
 * @param description - Description of the expense
 * @param timestamp - When the expense occurred
 * @param splits - Array of [AgentId, amount] for expense splits
 * @returns A new group with the expense transaction added and incremented revision
 */
export function addExpense(
  group: Group,
  payers: [number, number][],
  description: string,
  timestamp: number,
  splits: [number, number][],
): Group {
  // Convert payers to cents
  const payersInCents = payers.map(([id, payAmount]) =>
    [id, Math.round(payAmount * 100)] as [number, number]
  );

  // Convert splits to cents
  const splitsInCents = splits.map(([id, splitAmount]) =>
    [id, Math.round(splitAmount * 100)] as [number, number]
  );

  // Calculate totals
  const totalPayersInCents = payersInCents.reduce(
    (sum, [_id, payAmount]) => sum + payAmount,
    0,
  );

  const totalSplitsInCents = splitsInCents.reduce(
    (sum, [_id, splitAmount]) => sum + splitAmount,
    0,
  );

  // Validate that payers' amounts equal splits' amounts
  const difference = Math.abs(totalPayersInCents - totalSplitsInCents);
  if (difference > 1) { // Allow 1 cent difference for rounding
    throw new Error("Payer amounts must equal split amounts");
  }

  // Create transaction entries: payer payments (negative) + splits (positive)
  const payerEntries: [number, number][] = payersInCents.map((
    [id, payAmount],
  ) => [id, -payAmount]);

  const transactionEntries: [number, number][] = [
    ...payerEntries,
    ...splitsInCents,
  ];

  const newTransaction: [string, number, [number, number][]] = [
    description,
    timestamp,
    transactionEntries,
  ];

  // Create new group with added transaction and incremented revision
  const newGroup: Group = [
    group[0], // header "cs"
    group[1], // version 1
    group[GROUP_REVISION] + 1, // increment revision
    group[GROUP_DESCRIPTION],
    group[GROUP_CREATION_TIMESTAMP],
    group[GROUP_AGENTS],
    [...group[GROUP_TRANSACTIONS], newTransaction], // add new transaction
  ];

  return newGroup;
}
