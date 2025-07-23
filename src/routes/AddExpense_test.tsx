// Tests for AddExpense component
import { afterEach, describe, it } from "@std/testing/bdd";
import { expect } from "@std/expect";
import { cleanup, render } from "../test-utils/component-testing.ts";
import { AddExpense } from "./AddExpense.tsx";
import { Group } from "../model/Group.ts";

// Test data
const testGroup: Group = [
  "cs",
  1,
  1,
  "Test Group",
  1640995200000, // 2022-01-01 00:00:00
  [
    [1, "Alice"],
    [2, "Bob"],
    [3, "Charlie"],
  ],
  [],
];

// Mock functions
let mockOnSubmit: (
  data: {
    amount: number;
    description: string;
    payerId: number;
    selectedParticipants: number[];
  },
) => void;
let mockOnCancel: () => void;

describe("AddExpense", () => {
  afterEach(() => {
    cleanup();
    mockOnSubmit = () => {};
    mockOnCancel = () => {};
  });

  it("should render form with required fields", () => {
    const { container } = render(
      <AddExpense
        group={testGroup}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />,
    );

    // Check for form elements
    expect(container.querySelector('input[type="number"]')).toBeTruthy();
    expect(container.querySelector('input[type="text"]')).toBeTruthy();
    expect(container.querySelector("select")).toBeTruthy();
    expect(container.querySelector('button[type="submit"]')).toBeTruthy();
    expect(container.querySelector('button[type="button"]')).toBeTruthy();
  });

  it("should display all group participants as checkboxes", () => {
    const { container } = render(
      <AddExpense
        group={testGroup}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />,
    );

    const checkboxes = container.querySelectorAll('input[type="checkbox"]');
    expect(checkboxes.length).toBe(3); // Alice, Bob, Charlie
  });

  it("should display all participants in payer dropdown", () => {
    const { container } = render(
      <AddExpense
        group={testGroup}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />,
    );

    const select = container.querySelector("select");
    expect(select).toBeTruthy();
    expect(select!.children.length).toBeGreaterThan(3); // Default option + 3 participants
  });
});
