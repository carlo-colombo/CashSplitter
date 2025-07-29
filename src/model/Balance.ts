import { movements, transactions } from "./Accessors.ts";
import { Group2 } from "./Group.ts";

/**
 * Calculate the net balance for each participant in a Group2.
 * Returns an array of [agentId, name, balanceInCents] tuples.
 *
 * Positive balance = participant owes money
 * Negative balance = participant is owed money
 * Zero balance = participant is even
 *
 * @param group - The Group2 to calculate balances for
 * @returns Array of [agentId, name, balanceInCents] tuples
 */
export function calculateBalances(group: Group2): [number, string, number][] {
  // Group2: ["cs", 2, revision, description, timestamp, operations[]]
  // Find all AddMember ops: [1, agentId, name]
  const ops = group[5];
  const members: [number, string][] = ops
    .filter((op) => Array.isArray(op) && op[0] === 1)
    .map((op) => [op[1] as number, op[2] as string]);

  // Initialize balances map with all participants
  const balances = new Map<number, number>();
  const agentNames = new Map<number, string>();
  members.forEach(([agentId, name]) => {
    balances.set(agentId, 0);
    agentNames.set(agentId, name);
  });

  // Find all AddTransaction ops: [3, description, timestamp, movements]

  transactions(group)
    .flatMap(movements)
    .reduce((acc, [agentId, amount]) => {
      acc.set(agentId, (acc.get(agentId) || 0) + amount);
      return acc;
    }, balances);

  // Convert to array format and return
  return members.map(([agentId, name]) => {
    const balance = balances.get(agentId) || 0;
    return [agentId, name, balance] as [number, string, number];
  });
}
