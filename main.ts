export function add(a: number, b: number): number {
  return a + b;
}

// Learn more at https://docs.deno.com/runtime/manual/examples/module_metadata#concepts
if (import.meta.main) {
  console.log("Add 2 + 3 =", add(2, 3));
}

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

// Index constants for better readability
export const GROUP_HEADER = 0;
export const GROUP_VERSION = 1;
export const GROUP_REVISION = 2;
export const GROUP_DESCRIPTION = 3;
export const GROUP_CREATION_TIMESTAMP = 4;
export const GROUP_AGENTS = 5;
export const GROUP_TRANSACTIONS = 6;

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
export type Group = ["cs", 1, Revision, GroupDescription, Timestamp, Agent[], Transaction[]];

/**
 * Merges two group objects, combining their transactions and incrementing the revision
 * 
 * @throws Error if group descriptions or creation timestamps don't match
 */
export function merge(group1: Group, group2: Group): Group {
  // Check that group descriptions match
  if (group1[GROUP_DESCRIPTION] !== group2[GROUP_DESCRIPTION]) {
    throw new Error("Cannot merge groups with different descriptions");
  }

  // Check that creation timestamps match
  if (group1[GROUP_CREATION_TIMESTAMP] !== group2[GROUP_CREATION_TIMESTAMP]) {
    throw new Error("Cannot merge groups with different creation timestamps");
  }
  
  // Increment the revision number
  const newRevision = Math.max(group1[GROUP_REVISION], group2[GROUP_REVISION]) + 1;
  
  // Combine transactions from both groups
  const mergedTransactions = [
    ...group1[GROUP_TRANSACTIONS],
    ...group2[GROUP_TRANSACTIONS]
  ];
  
  return [
    "cs",
    1,
    newRevision,
    group1[GROUP_DESCRIPTION],
    group1[GROUP_CREATION_TIMESTAMP],
    group1[GROUP_AGENTS],
    mergedTransactions
  ];
}