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
