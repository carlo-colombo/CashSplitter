import { 
  Group, 
  GROUP_DESCRIPTION, 
  GROUP_CREATION_TIMESTAMP, 
  GROUP_REVISION, 
  GROUP_TRANSACTIONS,
  GROUP_AGENTS
} from "../model/Group.ts";

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
