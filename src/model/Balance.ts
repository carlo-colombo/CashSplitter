import { Group } from "./Group.ts";
import { agents, transactions } from "./Accessors.ts";

/**
 * Calculate the net balance for each participant in a group.
 * Returns an array of [agentId, name, balanceInCents] tuples.
 *
 * Positive balance = participant owes money
 * Negative balance = participant is owed money
 * Zero balance = participant is even
 *
 * @param group - The group to calculate balances for
 * @returns Array of [agentId, name, balanceInCents] tuples
 */
export function calculateBalances(group: Group): [number, string, number][] {
  const groupAgents = agents(group);
  const groupTransactions = transactions(group);

  // Initialize balances map with all participants
  const balances = new Map<number, number>();
  const agentNames = new Map<number, string>();

  groupAgents.forEach(([agentId, name]) => {
    balances.set(agentId, 0);
    agentNames.set(agentId, name);
  });

  // Process all transactions to calculate net balances
  groupTransactions.forEach(([_description, _timestamp, entries]) => {
    entries.forEach(([agentId, amount]) => {
      const currentBalance = balances.get(agentId) || 0;
      balances.set(agentId, currentBalance + amount);
    });
  });

  // Convert to array format and return
  return groupAgents.map(([agentId, name]) => {
    const balance = balances.get(agentId) || 0;
    return [agentId, name, balance] as [number, string, number];
  });
}
