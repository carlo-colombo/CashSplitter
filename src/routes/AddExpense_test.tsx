// Tests for AddExpense component
import { afterEach, describe, it } from "@std/testing/bdd";
import { expect } from "@std/expect";
import {
  cleanup,
  fireEvent,
  render,
  waitFor,
} from "../test-utils/component-testing.ts";
import { AddExpense } from "./AddExpense.tsx";
import { Group2 } from "../model/Group.ts";

// Helper to create a fresh test group for each test
function createTestGroup(): Group2 {
  return [
    "cs",
    2,
    1,
    "Test Group",
    1640995200000, // 2022-01-01 00:00:00
    [
      [1, 1, "Alice"],
      [1, 2, "Bob"],
      [1, 3, "Charlie"],
    ],
  ];
}

// Mock functions
let mockOnSubmit: (
  data: {
    amount: number;
    description: string;
    payerId: number;
    selectedParticipants: number[];
  },
) => void = () => {};
let mockOnCancel: () => void = () => {};

import { beforeEach } from "@std/testing/bdd";

describe("AddExpense", () => {
  beforeEach(() => {
    mockOnSubmit = () => {};
    mockOnCancel = () => {};
  });
  it("should store amount in cents (multiplied by 100) when submitting the form", async () => {
    let submittedData: {
      amount: number;
      description: string;
      payerId: number;
      selectedParticipants: number[];
    } | null = null;
    mockOnSubmit = (data) => {
      submittedData = data;
    };
    const { container } = render(
      <AddExpense
        group={createTestGroup()}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />,
    );

    // Fill amount
    const amountInput = container.querySelector("#amount") as HTMLInputElement;
    amountInput.value = "12.34";
    fireEvent.input(amountInput, { target: { value: "12.34" } });

    // Fill description
    const descInput = container.querySelector(
      "#description",
    ) as HTMLInputElement;
    descInput.value = "Dinner";
    fireEvent.input(descInput, { target: { value: "Dinner" } });

    // Select payer (first participant, Alice, id=1)
    const payerSelect = container.querySelector("#payer") as HTMLSelectElement;
    payerSelect.value = "1";
    fireEvent.change(payerSelect);

    // Select all participants by label text
    ["Alice", "Bob", "Charlie"].forEach((name) => {
      const label = Array.from(container.querySelectorAll("label.checkbox"))
        .find((l) => (l as HTMLLabelElement).textContent?.includes(name)) as
          | HTMLLabelElement
          | undefined;
      if (label) {
        const cb = label.querySelector(
          'input[type="checkbox"]',
        ) as HTMLInputElement;
        if (cb && !cb.checked) {
          fireEvent.click(cb);
        }
      }
    });
    // Wait a tick for state updates
    await new Promise((resolve) => setTimeout(resolve, 0));

    // Submit form
    const form = container.querySelector("form")!;
    fireEvent.submit(form);

    // Wait for submit
    await waitFor(() => {
      expect(submittedData).not.toBeNull();
    });
    expect(submittedData!.amount).toBe(1234);
    expect(submittedData!.description).toBe("Dinner");
    expect(submittedData!.payerId).toBe(1);
    expect(submittedData!.selectedParticipants.length).toBe(3);
  });
  afterEach(() => {
    cleanup();
  });

  it("should render form with required fields", () => {
    const { container } = render(
      <AddExpense
        group={createTestGroup()}
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
        group={createTestGroup()}
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
        group={createTestGroup()}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />,
    );

    const select = container.querySelector("select");
    expect(select).toBeTruthy();
    expect(select!.children.length).toBeGreaterThan(3); // Default option + 3 participants
  });

  it("should have correct input attributes for decimal amounts", () => {
    const { container } = render(
      <AddExpense
        group={createTestGroup()}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />,
    );

    const amountInput = container.querySelector("#amount") as HTMLInputElement;

    expect(amountInput).toBeTruthy();
    expect(amountInput.type).toBe("number");
    expect(amountInput.step).toBe("0.01");
    expect(amountInput.min).toBe("0.01");
    expect(amountInput.placeholder).toBe("0.00");
    expect(amountInput.required).toBe(true);
  });
});
