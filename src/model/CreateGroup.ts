import { Group } from "./Group.ts";

/**
 * Creates a new empty group with the given description
 * @param description The description for the group (e.g., "Trip to Paris")
 * @returns A new Group instance
 */
export function createGroup(description: string): Group {
  const timestamp = Date.now(); // Current timestamp

  return [
    "cs", // Header identifier
    1, // Version number
    1, // Initial revision
    description,
    timestamp,
    [], // Empty agents array
    [], // Empty transactions array
  ];
}
