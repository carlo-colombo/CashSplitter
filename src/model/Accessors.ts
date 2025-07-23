import { Group } from "./Group.ts";

// Index constants for better readability - only used internally
const GROUP_REVISION = 2;
const GROUP_DESCRIPTION = 3;
const GROUP_CREATION_TIMESTAMP = 4;
const GROUP_AGENTS = 5;
const GROUP_TRANSACTIONS = 6;

/**
 * Get the revision number of a group
 */
export function revision(group: Group): number {
  return group[GROUP_REVISION];
}

/**
 * Get the transactions of a group
 */
export function transactions(
  group: Group,
): [string, number, [number, number][]][] {
  return group[GROUP_TRANSACTIONS];
}

/**
 * Get the agents of a group
 */
export function agents(group: Group): [number, string][] {
  return group[GROUP_AGENTS];
}

/**
 * Get the group identifier as [description, timestamp]
 */
export function groupId(group: Group): [string, number] {
  return [group[GROUP_DESCRIPTION], group[GROUP_CREATION_TIMESTAMP]];
}
