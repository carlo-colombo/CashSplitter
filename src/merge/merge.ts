import { Group } from "../model/Group.ts";
import { agents, groupId, revision, transactions } from "../model/Accessors.ts";

// Define a conflict error class with conflicts array
export class MergeConflictError extends Error {
  conflicts: Array<{
    type: string;
    [key: string]: unknown;
  }>;

  constructor(conflicts: Array<{ type: string; [key: string]: unknown }>) {
    super("Conflicts detected");
    this.conflicts = conflicts;
    this.name = "MergeConflictError";
  }
}

/**
 * Type definition for conflict objects
 */
type Conflict = {
  type: string;
  [key: string]: unknown;
};

/**
 * Find conflicts between two groups
 * Returns an array of conflicts (empty if no conflicts)
 */
function findConflicts(group1: Group, group2: Group): Array<Conflict> {
  const conflicts: Conflict[] = [];

  // Check for agent conflicts
  const agents1 = agents(group1);
  const agents2 = agents(group2);

  // Create map of agents by ID for faster lookup
  const agentMap1 = new Map(agents1.map((agent) => [agent[0], agent[1]]));
  const agentMap2 = new Map(agents2.map((agent) => [agent[0], agent[1]]));

  // Find agents with same ID but different name
  for (const [id, name1] of agentMap1) {
    if (agentMap2.has(id)) {
      const name2 = agentMap2.get(id);
      if (name1 !== name2) {
        conflicts.push({
          type: "agent",
          id,
          value1: name1,
          value2: name2,
        });
      }
    }
  }

  // Check for transaction conflicts
  const transactions1 = transactions(group1);
  const transactions2 = transactions(group2);

  // Create map for transactions by description and timestamp
  const transactionMap = new Map();

  // Add all transactions from group1
  for (const transaction of transactions1) {
    const key = `${transaction[0]}|${transaction[1]}`; // desc|timestamp
    transactionMap.set(key, { transaction });
  }

  // Check for conflicts with transactions from group2
  for (const transaction2 of transactions2) {
    const key = `${transaction2[0]}|${transaction2[1]}`;

    if (transactionMap.has(key)) {
      const { transaction: transaction1 } = transactionMap.get(key);

      // Check if the transactions have different values
      if (JSON.stringify(transaction1[2]) !== JSON.stringify(transaction2[2])) {
        conflicts.push({
          type: "transaction",
          description: transaction2[0],
          timestamp: transaction2[1],
          value1: transaction1[2],
          value2: transaction2[2],
        });
      }
    }
  }

  return conflicts;
}

/**
 * Merges two group objects, combining their transactions and incrementing the revision
 *
 * @throws Error if group descriptions or creation timestamps don't match
 * @throws MergeConflictError with a conflicts array if there are agent or transaction conflicts
 */
export function merge(group1: Group, group2: Group): Group {
  // Check that group identifiers match
  const [desc1, timestamp1] = groupId(group1);
  const [desc2, timestamp2] = groupId(group2);

  // Collect group ID conflicts
  const groupIdConflicts: Conflict[] = [];

  if (desc1 !== desc2) {
    groupIdConflicts.push({
      type: "groupId",
      field: "description",
      value1: desc1,
      value2: desc2,
    });
  }

  if (timestamp1 !== timestamp2) {
    groupIdConflicts.push({
      type: "groupId",
      field: "timestamp",
      value1: timestamp1,
      value2: timestamp2,
    });
  }

  // If we have group ID conflicts, throw a MergeConflictError
  if (groupIdConflicts.length > 0) {
    throw new MergeConflictError(groupIdConflicts);
  }

  // Check for conflicts
  const conflicts = findConflicts(group1, group2);
  if (conflicts.length > 0) {
    throw new MergeConflictError(conflicts);
  }

  // Increment the revision number
  const newRevision = Math.max(revision(group1), revision(group2)) + 1;

  // Get transactions from both groups
  const transactions1 = transactions(group1);
  const transactions2 = transactions(group2);

  // Deduplicate transactions by converting to string for comparison
  const uniqueTransactions = new Map();

  // Add all transactions from group1
  for (const transaction of transactions1) {
    uniqueTransactions.set(JSON.stringify(transaction), transaction);
  }

  // Add all transactions from group2 (duplicates will override)
  for (const transaction of transactions2) {
    uniqueTransactions.set(JSON.stringify(transaction), transaction);
  }

  // Get the final merged transaction list
  const mergedTransactions = Array.from(uniqueTransactions.values());

  return [
    "cs",
    1,
    newRevision,
    desc1,
    timestamp1,
    agents(group1),
    mergedTransactions,
  ];
}
