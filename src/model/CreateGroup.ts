import { Group } from "./Group.ts";

/**
 * Creates a new group with the given description and optional participants
 * @param description The description for the group (e.g., "Trip to Paris")
 * @param participants Optional array of participant names to add to the group
 * @returns A new Group instance
 */
export function createGroup(
  description: string,
  participants?: string[],
): Group {
  const timestamp = Date.now(); // Current timestamp

  // Create agents array from participants if provided
  const agents = participants
    ? participants.map((name, index) => [index + 1, name] as [number, string])
    : [];

  return [
    "cs", // Header identifier
    1, // Version number
    1, // Initial revision
    description,
    timestamp,
    agents, // Agents array with participants
    [], // Empty transactions array
  ];
}
