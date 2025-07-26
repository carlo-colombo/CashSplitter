import { Group2, GroupOperation } from "./Group.ts";

/**
 * Creates a new group with the given description and optional members
 * @param description The description for the group (e.g., "Trip to Paris")
 * @param members Optional array of member names to add to the group
 * @returns A new Group2 instance
 */
export function createGroup(
  description: string,
  members?: string[],
): Group2 {
  const timestamp = Date.now(); // Current timestamp

  // Create AddMember operations from members if provided
  const operations: GroupOperation[] = members
    ? members.map((name, index) => [1, index + 1, name] as [1, number, string])
    : [];

  return [
    "cs", // Header identifier
    2, // Version number (2 for Group2)
    1, // Initial revision
    description,
    timestamp,
    operations, // Operations array with AddMember operations for members
  ];
}
