import { 
  Group,
  revision, 
  transactions,
  agents,
  groupId
} from "../model/Group.ts";

/**
 * Merges two group objects, combining their transactions and incrementing the revision
 * 
 * @throws Error if group descriptions or creation timestamps don't match
 */
export function merge(group1: Group, group2: Group): Group {
  // Check that group identifiers match
  const [desc1, timestamp1] = groupId(group1);
  const [desc2, timestamp2] = groupId(group2);
  
  if (desc1 !== desc2) {
    throw new Error("Cannot merge groups with different descriptions");
  }

  if (timestamp1 !== timestamp2) {
    throw new Error("Cannot merge groups with different creation timestamps");
  }
  
  // Increment the revision number
  const newRevision = Math.max(revision(group1), revision(group2)) + 1;
  
  // Combine transactions from both groups
  const mergedTransactions = [
    ...transactions(group1),
    ...transactions(group2)
  ];
  
  return [
    "cs",
    1,
    newRevision,
    desc1,
    timestamp1,
    agents(group1),
    mergedTransactions
  ];
}
