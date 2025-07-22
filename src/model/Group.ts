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
 * Add an expense to a group, splitting it equally among specified participants or with custom splits.
 * The payee pays the full amount (negative), and specified participants receive positive shares.
 * The payee does not need to be included in the participants or custom splits.
 *
 * @param group - The group to add the expense to
 * @param payeeId - The ID of the agent who paid the expense
 * @param description - Description of the expense
 * @param amount - The expense amount as a float (e.g., 100.50)
 * @param timestamp - When the expense occurred
 * @param participants - Array of agent IDs who share the expense. Use null for custom splits mode.
 * @param customSplits - Array of [AgentId, amount] for custom expense splits. Use null for equal splitting mode.
 * @returns A new group with the expense transaction added and incremented revision
 */
export function addExpense(
  group: Group,
  payeeId: AgentId,
  description: Description,
  amount: number,
  timestamp: Timestamp,
  participants: AgentId[] | null,
  customSplits: [AgentId, number][] | null,
): Group {
  const _groupAgents = agents(group);
  const amountInCents = Math.round(amount * 100);

  let transactionEntries: [AgentId, Money][];

  if (customSplits !== null) {
    // Custom splits mode
    const customSplitsInCents = customSplits.map(([id, amt]) =>
      [id, Math.round(amt * 100)] as [AgentId, Money]
    );

    // Validate that custom splits sum to expense amount (allow small rounding differences)
    const totalSplitsInCents = customSplitsInCents.reduce(
      (sum, [_id, amt]) => sum + amt,
      0,
    );
    const difference = Math.abs(totalSplitsInCents - amountInCents);
    if (difference > 1) { // Allow 1 cent difference for rounding
      throw new Error("Custom splits must sum to the expense amount");
    }

    // Create transaction entries: payee pays full amount, custom splits for shares
    transactionEntries = [
      [payeeId, -amountInCents], // Payee pays full amount
      ...customSplitsInCents, // Custom splits
    ];
  } else if (participants !== null) {
    // Equal splits mode
    const sharePerPerson = Math.round(amountInCents / participants.length);

    // Create transaction entries: payee pays full amount, participants get equal shares
    transactionEntries = [
      [payeeId, -amountInCents], // Payee pays full amount
    ];

    // Add equal shares for participants only
    for (const participantId of participants) {
      transactionEntries.push([participantId, sharePerPerson]);
    }
  } else {
    throw new Error("Either participants or customSplits must be provided");
  }

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
