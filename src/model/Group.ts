// Type definitions
type Description = string;
type GroupDescription = string;
type AgentId = number;
type Name = string;
type Money = number;
type Timestamp = number;
type Revision = number;
type Agent = [AgentId, Name];
type Transaction = [Description, Timestamp, [AgentId, Money][]];

// Index constants for better readability - only used internally
// Prefix with underscore for unused constants
const _GROUP_HEADER = 0;
const _GROUP_VERSION = 1;
const GROUP_REVISION = 2;
const GROUP_DESCRIPTION = 3;
const GROUP_CREATION_TIMESTAMP = 4;
const GROUP_AGENTS = 5;
const GROUP_TRANSACTIONS = 6;

/**
 * Group represents a cashsplitter group with:
 * - A header identifier ("cs")
 * - Version number (1)
 * - Revision number for merge tracking
 * - Group description (e.g., "Trip to Paris")
 * - Creation timestamp
 * - List of agents/people in the group
 * - List of transactions between agents
 */
export type Group = [
  "cs",
  1,
  Revision,
  GroupDescription,
  Timestamp,
  Agent[],
  Transaction[],
];

/**
 * Get the revision number of a group
 */
export function revision(group: Group): Revision {
  return group[GROUP_REVISION];
}

/**
 * Get the transactions of a group
 */
export function transactions(group: Group): Transaction[] {
  return group[GROUP_TRANSACTIONS];
}

/**
 * Get the agents of a group
 */
export function agents(group: Group): Agent[] {
  return group[GROUP_AGENTS];
}

/**
 * Get the group identifier as [description, timestamp]
 */
export function groupId(group: Group): [GroupDescription, Timestamp] {
  return [group[GROUP_DESCRIPTION], group[GROUP_CREATION_TIMESTAMP]];
}

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
  payers: [AgentId, number][],
  description: Description,
  timestamp: Timestamp,
  splits: [AgentId, number][],
): Group {
  // Convert payers to cents
  const payersInCents = payers.map(([id, payAmount]) =>
    [id, Math.round(payAmount * 100)] as [AgentId, Money]
  );

  // Convert splits to cents
  const splitsInCents = splits.map(([id, splitAmount]) =>
    [id, Math.round(splitAmount * 100)] as [AgentId, Money]
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
  const payerEntries: [AgentId, Money][] = payersInCents.map((
    [id, payAmount],
  ) => [id, -payAmount]);

  const transactionEntries: [AgentId, Money][] = [
    ...payerEntries,
    ...splitsInCents,
  ];

  const newTransaction: Transaction = [
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
