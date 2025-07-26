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

/**
 * ActorId is a unique numeric identifier for an actor within a group.
 * Each actor gets assigned a unique ID when added to the group.
 */
export type ActorId = number;

/**
 * Name is a string representing the display name of an actor.
 * This is the human-readable identifier shown in the UI.
 */
export type Name = string;

export type Actor = [ActorId, Name];
/**
 * AddActor represents an actor addition operation in the group.
 * It includes:
 * - Operation type (1 for add)
 * - Actor ID (e.g., 123)
 * - Actor name (e.g., "John Doe")
 */
export type AddActor = [1, ...Actor];

/**
 * RemoveActor represents an actor removal operation in the group.
 * It includes:
 * - Operation type (2 for remove)
 * - Actor ID of the actor to be removed (e.g., 123)
 */
export type RemoveActor = [2, ActorId];

/**
 * Description is a string that describes a transaction or group.
 * For transactions, this could be "Dinner at restaurant" or "Gas for trip".
 * For groups, this could be "Weekend trip to Paris" or "Office lunch expenses".
 */
export type Description = string;

/**
 * Timestamp is a number representing the time when the transaction or group was created.
 * It is typically a Unix timestamp.
 */
export type Timestamp = number;

/**
 * Amount is a number representing the monetary value in a transaction.
 * This represents the actual currency amount (e.g., 25.50 for $25.50).
 * Positive values typically represent money spent, negative values represent refunds.
 */
export type Amount = number;

/**
 * Movement is a tuple representing an actor ID and the amount they are involved in.
 * It is used to track how much each actor owes or is owed in a transaction.
 * The first element is the ActorId, the second is the Amount.
 * Example: [123, 25.50] means actor 123 is involved with $25.50
 */
export type Movement = [ActorId, Amount];

export type Transaction = [Description, Timestamp, Movement[]];

/**
 * AddTransaction represents a transaction addition operation in the group.
 * It includes:
 * - Operation type (3 for add transaction)
 * - Description of the transaction (e.g., "Dinner at restaurant")
 * - Timestamp of the transaction
 * - Movement details, which is an array of actor ID and amount pairs
 */
export type AddTransaction = [3, ...Transaction];

/**
 * RemoveTransaction represents a transaction removal operation in the group.
 * It includes:
 * - Operation type (4 for remove transaction)
 * - Description of the transaction to be removed
 * - Timestamp of the transaction to be removed
 * Note: Transactions are identified by description and timestamp combination.
 */
export type RemoveTransaction = [4, Description, Timestamp];

/**
 * GroupOperation represents a single operation that can be performed on a group.
 * It can be one of the following:
 * - AddActor
 * - RemoveActor
 * - AddTransaction
 * - RemoveTransaction
 */
export type GroupOperation =
  | AddActor
  | RemoveActor
  | AddTransaction
  | RemoveTransaction;

/**
 * GroupDescription is a string that describes the group.
 * It can be used to provide context or details about the group.
 */
export type GroupDescription = string;

/**
 * GroupTimestamp is a number representing the creation timestamp of the group.
 * It is typically a Unix timestamp.
 */
export type GroupTimestamp = number;

/**
 * Revision is a number that tracks the version of the group.
 * It is used for merge tracking and conflict resolution.
 */
export type Revision = number;

/**
 * Group2 represents the next version of the cashsplitter group format.
 * Unlike Group (v1), this uses an operation-based approach where all changes
 * are stored as a sequence of operations for better merge conflict resolution.
 * Structure:
 * - Header identifier ("cs")
 * - Version number (2)
 * - Revision number for merge tracking
 * - Group description
 * - Creation timestamp
 * - Array of operations performed on the group
 */
export type Group2 = [
  "cs",
  2,
  Revision,
  GroupDescription,
  GroupTimestamp,
  GroupOperation[],
];
