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
