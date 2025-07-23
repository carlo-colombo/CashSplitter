// Tests for ParticipantsList component
import { afterEach, describe, it } from "@std/testing/bdd";
import { expect } from "@std/expect";
import { cleanup, render } from "../test-utils/component-testing.ts";
import { ParticipantsList } from "./ParticipantsList.tsx";
import { Group } from "../model/Group.ts";
import { addExpense } from "../model/Expense.ts";

// Test data
const testGroupNoExpenses: Group = [
  "cs",
  1,
  1,
  "Test Group",
  1672500000000,
  [
    [1, "Alice"],
    [2, "Bob"],
    [3, "Charlie"],
  ],
  [], // No expenses
];

describe("ParticipantsList", () => {
  afterEach(() => {
    cleanup();
  });

  it("should render participants with zero balances when no expenses", () => {
    const { container } = render(
      <ParticipantsList group={testGroupNoExpenses} />,
    );

    // Check for participants section
    expect(container.textContent).toContain("Alice");
    expect(container.textContent).toContain("Bob");
    expect(container.textContent).toContain("Charlie");

    // Should show balanced/even status for all
    expect(container.textContent).toContain("€0.00");
  });

  it("should render participants with correct debt and owed amounts", () => {
    let group = testGroupNoExpenses;

    // Alice pays 100.00, split equally among all three
    group = addExpense(
      group,
      [[1, 100.00]], // Alice pays 100.00
      "Dinner",
      1672506000000,
      [[1, 33.33], [2, 33.33], [3, 33.34]], // Split with rounding
    );

    const { container } = render(
      <ParticipantsList group={group} />,
    );

    // Check for participants
    expect(container.textContent).toContain("Alice");
    expect(container.textContent).toContain("Bob");
    expect(container.textContent).toContain("Charlie");

    // Alice should be owed money (paid more than share)
    expect(container.textContent).toContain("owed");

    // Bob and Charlie should owe money
    expect(container.textContent).toContain("Owes");
  });

  it("should display currency amounts correctly", () => {
    let group = testGroupNoExpenses;

    // Simple case: Alice pays 60.00, split equally between Alice and Bob
    group = addExpense(
      group,
      [[1, 60.00]], // Alice pays 60.00
      "Lunch",
      1672506000000,
      [[1, 30.00], [2, 30.00]], // Split equally
    );

    const { container } = render(
      <ParticipantsList group={group} />,
    );

    // Alice should be owed 30.00 (paid 60, owes 30)
    expect(container.textContent).toContain("€30.00");

    // Check for correct currency formatting
    expect(container.textContent).toMatch(/€\d+\.\d{2}/);
  });

  it("should handle participants with zero balance", () => {
    let group: Group = [
      "cs",
      1,
      1,
      "Test Group",
      1672500000000,
      [
        [1, "Alice"],
        [2, "Bob"],
      ],
      [],
    ];

    // Alice pays 100.00, split equally - both have 0 net balance
    group = addExpense(
      group,
      [[1, 50.00], [2, 50.00]], // Both pay 50.00
      "Shared payment",
      1672506000000,
      [[1, 50.00], [2, 50.00]], // Both owe 50.00
    );

    const { container } = render(
      <ParticipantsList group={group} />,
    );

    // Both should show as balanced/even
    expect(container.textContent).toContain("€0.00");
  });

  it("should use proper styling classes", () => {
    const { container } = render(
      <ParticipantsList group={testGroupNoExpenses} />,
    );

    // Check for proper CSS classes (depends on implementation)
    expect(container.querySelector(".participants-list")).toBeTruthy();
  });

  it("should handle complex multi-expense scenarios", () => {
    let group: Group = [
      "cs",
      1,
      1,
      "Trip Group",
      1672500000000,
      [
        [1, "Alice"],
        [2, "Bob"],
        [3, "Charlie"],
      ],
      [],
    ];

    // Multiple expenses that should balance out Alice
    group = addExpense(
      group,
      [[1, 120.00]], // Alice pays 120.00
      "Dinner",
      1672506000000,
      [[1, 40.00], [2, 40.00], [3, 40.00]], // Split three ways
    );

    group = addExpense(
      group,
      [[2, 90.00]], // Bob pays 90.00
      "Drinks",
      1672516000000,
      [[1, 30.00], [2, 30.00], [3, 30.00]], // Split three ways
    );

    group = addExpense(
      group,
      [[3, 30.00]], // Charlie pays 30.00
      "Snacks",
      1672526000000,
      [[1, 10.00], [2, 10.00], [3, 10.00]], // Split three ways
    );

    const { container } = render(
      <ParticipantsList group={group} />,
    );

    // All participants should appear
    expect(container.textContent).toContain("Alice");
    expect(container.textContent).toContain("Bob");
    expect(container.textContent).toContain("Charlie");

    // Should show various owed/owes amounts
    expect(container.textContent).toMatch(/€\d+\.\d{2}/);
  });
});
