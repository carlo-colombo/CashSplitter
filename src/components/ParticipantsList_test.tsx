// Tests for ParticipantsList component
import { afterEach, describe, it } from "@std/testing/bdd";
import { expect } from "@std/expect";
import { cleanup, render } from "../test-utils/component-testing.ts";
import { ParticipantsList } from "./ParticipantsList.tsx";
import { Group2 } from "../model/Group.ts";
import { addTransaction } from "../model/Expense.ts";

// Test data
const testGroupNoExpenses: Group2 = [
  "cs",
  2,
  1,
  "Test Group",
  1672500000000,
  [
    [1, 1, "Alice"],
    [1, 2, "Bob"],
    [1, 3, "Charlie"],
  ], // AddMember ops
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
    group = addTransaction(
      group,
      "Dinner",
      [
        [1, 10000 - 3333], // Alice paid 100.00, owes 33.33
        [2, -3333],
        [3, -3334],
      ],
      1672506000000,
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
    group = addTransaction(
      group,
      "Lunch",
      [
        [1, 6000 - 3000],
        [2, -3000],
      ],
      1672506000000,
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
    let group: Group2 = [
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
    // Both pay 50, both owe 50, net 0
    group = addTransaction(
      group,
      "Shared payment",
      [
        [1, 0],
        [2, 0],
      ],
      1672506000000,
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
    let group: Group2 = [
      "cs",
      2,
      1,
      "Trip Group",
      1672500000000,
      [
        [1, 1, "Alice"],
        [1, 2, "Bob"],
        [1, 3, "Charlie"],
      ],
    ];
    // Alice pays 120, split 40 each
    group = addTransaction(
      group,
      "Dinner",
      [
        [1, 12000 - 4000],
        [2, -4000],
        [3, -4000],
      ],
      1672506000000,
    );
    // Bob pays 90, split 30 each
    group = addTransaction(
      group,
      "Drinks",
      [
        [1, -3000],
        [2, 9000 - 3000],
        [3, -3000],
      ],
      1672516000000,
    );
    // Charlie pays 30, split 10 each
    group = addTransaction(
      group,
      "Snacks",
      [
        [1, -1000],
        [2, -1000],
        [3, 2000],
      ],
      1672526000000,
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
