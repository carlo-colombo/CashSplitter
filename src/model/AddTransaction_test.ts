import { createGroup } from "./CreateGroup.ts";
import { addTransaction } from "./Expense.ts";
import { assertEquals } from "https://deno.land/std@0.203.0/assert/mod.ts";

Deno.test("addTransaction appends an AddTransaction operation to Group2", () => {
  // Arrange: create a Group2 with two members
  const group = createGroup("Test Group", ["Alice", "Bob"]);
  const description = "Lunch";
  const timestamp = 1721900000000;
  // Movements: Alice pays 1000, Bob owes 1000
  const movements: [number, number][] = [
    [1, -1000], // Alice paid 1000
    [2, 1000], // Bob owes 1000
  ];

  // Act: add a transaction
  const updated = addTransaction(group, description, movements, timestamp);

  // Assert: last operation is the AddTransaction
  const lastOp = updated[5][updated[5].length - 1];
  assertEquals(lastOp, [3, description, timestamp, movements]);
});
