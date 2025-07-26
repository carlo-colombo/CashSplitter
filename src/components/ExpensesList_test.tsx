import { expect } from "@std/expect";
import { describe, it } from "@std/testing/bdd";
import { render } from "../test-utils/component-testing.ts";
import { ExpensesList } from "./ExpensesList.tsx";

import { addTransaction } from "../model/Expense.ts";
import { Group2 } from "../model/Group.ts";

describe("ExpensesList", () => {
  it("should display 'No expenses yet' when group has no transactions", () => {
    // Create a group with no transactions
    const group: Group2 = [
      "cs",
      2,
      1,
      "Test Group",
      1672500000000,
      [
        [1, 1, "Alice"],
        [1, 2, "Bob"],
      ], // AddMember operations
    ];

    const { container } = render(<ExpensesList group={group} />);

    expect(container.textContent).toContain("No expenses yet");
  });

  it("should display expenses in a table format", () => {
    const group: Group2 = [
      "cs",
      2,
      1,
      "Trip Group",
      1672500000000,
      [
        [1, 1, "Bob"],
        [1, 2, "Charlie"],
      ],
    ];
    // Add an expense: Bob pays 100€ for dinner, split between Bob and Charlie
    // Bob pays 10000 cents, split 50/50
    const movements: [number, number][] = [
      [1, -10000], // Bob pays
      [1, 5000], // Bob's share
      [2, 5000], // Charlie's share
    ];
    const groupWithExpense = addTransaction(
      group,
      "Dinner at restaurant",
      movements,
      1672506000000,
    );
    const { container } = render(<ExpensesList group={groupWithExpense} />);

    // Check for table presence
    const table = container.querySelector("table");
    expect(table).toBeTruthy();

    // Check for table headers
    expect(container.textContent).toContain("Description");
    expect(container.textContent).toContain("Date");
    expect(container.textContent).toContain("Amount");
    expect(container.textContent).toContain("Paid by");
    expect(container.textContent).toContain("Split between");

    // Check for expense data
    expect(container.textContent).toContain("Dinner at restaurant");
    expect(container.textContent).toContain("€100.00");
    expect(container.textContent).toContain("Bob");
  });

  it("should format dates correctly", () => {
    // Create a group with no initial transactions
    const group: Group2 = [
      "cs",
      2,
      1,
      "Test Group",
      1672500000000,
      [
        [1, 1, "Alice"],
      ],
    ];
    // Alice pays 5000 cents, gets 5000 cents
    const movements: [number, number][] = [
      [1, -5000],
      [1, 5000],
    ];
    const groupWithExpense = addTransaction(
      group,
      "Test expense",
      movements,
      1672531200000,
    );
    const { container } = render(<ExpensesList group={groupWithExpense} />);

    // Should display formatted date (format depends on locale, but should contain year 2023)
    expect(container.textContent).toContain("2023");
  });

  it("should handle multiple payers correctly", () => {
    // Create a group with two agents and no initial transactions
    const group: Group2 = [
      "cs",
      2,
      1,
      "Test Group",
      1672500000000,
      [
        [1, 1, "Alice"],
        [1, 2, "Bob"],
      ],
    ];
    // Alice and Bob both pay for a 120€ expense
    // Alice pays 8000, Bob pays 4000, split 60/60
    const movements: [number, number][] = [
      [1, -8000],
      [2, -4000],
      [1, 6000],
      [2, 6000],
    ];
    const groupWithExpense = addTransaction(
      group,
      "Shared payment",
      movements,
      1672506000000,
    );
    const { container } = render(<ExpensesList group={groupWithExpense} />);

    expect(container.textContent).toContain("Alice, Bob");
    expect(container.textContent).toContain("€120.00");
  });
});
