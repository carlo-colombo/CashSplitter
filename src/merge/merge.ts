import { Group2 } from "../model/Group.ts";
import {
  groupId,
  members,
  revision,
  transactions,
} from "../model/Accessors.ts";

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
 * Find conflicts between two groups2
 * Returns an array of conflicts (empty if no conflicts)
 */
function findConflicts(group1: Group2, group2: Group2): Array<Conflict> {
  const conflicts: Conflict[] = [];
  // Check for member conflicts
  const members1 = members(group1);
  const members2 = members(group2);
  const memberMap1 = new Map(members1.map(([id, name]) => [id, name]));
  const memberMap2 = new Map(members2.map(([id, name]) => [id, name]));
  for (const [id, name1] of memberMap1) {
    if (memberMap2.has(id)) {
      const name2 = memberMap2.get(id);
      if (name1 !== name2) {
        conflicts.push({
          type: "member",
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
  // ...existing code...
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
export function merge(group1: Group2, group2: Group2): Group2 {
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
  // const mergedTransactions = Array.from(uniqueTransactions.values());

  // Merge operations: combine all operations from both groups, deduplicated
  const ops1 = group1[5];
  const ops2 = group2[5];
  // Use stringified op for deduplication
  const uniqueOps = new Map<string, unknown>();
  for (const op of ops1) uniqueOps.set(JSON.stringify(op), op);
  for (const op of ops2) uniqueOps.set(JSON.stringify(op), op);
  const mergedOps = Array.from(uniqueOps.values());

  return [
    "cs",
    2,
    newRevision,
    desc1,
    timestamp1,
    mergedOps as import("../model/Group.ts").GroupOperation[],
  ];
}
