import { expect } from "@std/expect";
import { describe, it } from "@std/testing/bdd";
import { render } from "../test-utils/component-testing.ts";
import { ExpensesList } from "./ExpensesList.tsx";
import { createBaseGroup } from "../../test_fixtures.ts";
import { addExpense } from "../model/Expense.ts";
import { Group } from "../model/Group.ts";

describe("ExpensesList", () => {
  it("should display 'No expenses yet' when group has no transactions", () => {
    // Create a group with no transactions
    const group: Group = [
      "cs",
      1,
      1,
      "Test Group",
      1672500000000,
      [[1, "Alice"], [2, "Bob"]], // agents
      [], // empty transactions
    ];

    const { container } = render(<ExpensesList group={group} />);

    expect(container.textContent).toContain("No expenses yet");
  });

  it("should display expenses in a table format", () => {
    let group = createBaseGroup({
      revision: 1,
      description: "Trip Group",
      timestamp: 1672500000000,
    });

    // Add an expense: Bob pays 100€ for dinner, split between Bob and Charlie
    group = addExpense(
      group,
      [[1, 100.00]], // Bob (ID 1) pays 100€
      "Dinner at restaurant",
      1672506000000,
      [[1, 50.00], [2, 50.00]], // Split equally between Bob and Charlie
    );

    const { container } = render(<ExpensesList group={group} />);

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
    const group: Group = [
      "cs",
      1,
      1,
      "Test Group",
      1672500000000,
      [[1, "Alice"]],
      [], // no initial transactions
    ];

    const groupWithExpense = addExpense(
      group,
      [[1, 50.00]],
      "Test expense",
      1672531200000, // January 1, 2023, 00:00:00 GMT
      [[1, 50.00]],
    );

    const { container } = render(<ExpensesList group={groupWithExpense} />);

    // Should display formatted date (format depends on locale, but should contain year 2023)
    expect(container.textContent).toContain("2023");
  });

  it("should handle multiple payers correctly", () => {
    // Create a group with two agents and no initial transactions
    const group: Group = [
      "cs",
      1,
      1,
      "Test Group",
      1672500000000,
      [[1, "Alice"], [2, "Bob"]], // agents
      [], // no initial transactions
    ];

    // Alice and Bob both pay for a 120€ expense
    const groupWithExpense = addExpense(
      group,
      [[1, 80.00], [2, 40.00]], // Alice pays 80€, Bob pays 40€
      "Shared payment",
      1672506000000,
      [[1, 60.00], [2, 60.00]], // Split equally
    );

    const { container } = render(<ExpensesList group={groupWithExpense} />);

    expect(container.textContent).toContain("Alice, Bob");
    expect(container.textContent).toContain("€120.00");
  });
});
