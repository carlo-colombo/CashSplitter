import { encode } from "./src/model/GroupSerialization.ts";
import { Group } from "./src/model/Group.ts";
import { createBaseGroup, testTransactions } from "./test_fixtures.ts";

/**
 * Demo function that creates a sample group, adds transactions, and displays the encoded version
 */
function runCashsplitterDemo() {
  // Create a new group
  const group: Group = createBaseGroup({
    description: "Trip to Paris",
    timestamp: Date.now(),
  });
  
  console.log("🏎️ Created new group:");
  console.log(JSON.stringify(group, null, 2));
  
  // Add some transactions
  const transactions = group[6];
  transactions.push(testTransactions.lunch);
  transactions.push(testTransactions.coffee);
  transactions.push(["Hotel", Date.now(), [[1, 150], [2, -150]]]);
  
  console.log("\n🏎️ Group after adding transactions:");
  console.log(JSON.stringify(group, null, 2));
  
  // Encode the group to a shareable string
  const encoded = encode(group);
  
  console.log("\n🏎️ Encoded group (can be shared and merged later):");
  console.log(encoded);
  
  // Display summary of expenses
  console.log("\n🏎️ Summary of expenses:");
  const summary = calculateSummary(group);
  for (const [_id, name, balance] of summary) {
    console.log(`${name}: ${balance > 0 ? "+" : ""}${balance}`);
  }
}

/**
 * Calculate a summary of balances for each person in the group
 */
function calculateSummary(group: Group): [number, string, number][] {
  const agents = group[5];
  const transactions = group[6];
  
  // Initialize balances for each agent
  const balances = new Map<number, number>();
  for (const [id] of agents) {
    balances.set(id, 0);
  }
  
  // Calculate balances from transactions
  for (const [, , entries] of transactions) {
    for (const [id, amount] of entries) {
      balances.set(id, (balances.get(id) || 0) + amount);
    }
  }
  
  // Create summary array with [id, name, balance]
  return agents.map(([id, name]) => [id, name, balances.get(id) || 0]);
}

if (import.meta.main) {
  runCashsplitterDemo();
}