import { AddTransaction, Group2, Movement } from "./Group.ts";

// Index constants for better readability - only used internally
const GROUP_REVISION = 2;
const GROUP_DESCRIPTION = 3;
const GROUP_CREATION_TIMESTAMP = 4;

/**
 * Get the revision number of a group (Group2 only)
 */
export function revision(group: Group2): number {
  return group[GROUP_REVISION];
}

/**
 * Get the transactions of a group (Group2 only)
 */
export function transactions(group: Group2): AddTransaction[] {
  const ops = group[5];
  return ops.filter((op): op is AddTransaction =>
    Array.isArray(op) && op[0] === 3
  );
}

/**

/**
 * Get the members of a group (Group2 only)
 */
export function members(group: Group2): [number, string][] {
  const ops = group[5];
  // AddMember: [1, id, name]
  return ops.filter((op): op is [1, number, string] =>
    Array.isArray(op) && op[0] === 1
  ).map((op) => [op[1], op[2]]);
}

/**
 * Get the group identifier as [description, timestamp] (Group2 only)
 */
export function groupId(group: Group2): [string, number] {
  return [group[GROUP_DESCRIPTION], group[GROUP_CREATION_TIMESTAMP]];
}

export function movements(tx: AddTransaction): Movement[] {
  return tx[3];
}
