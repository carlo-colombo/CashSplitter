import { expect } from "@std/expect";
import { describe, it } from "@std/testing/bdd";
import { calculateBalances } from "./Balance.ts";
import { Group } from "./Group.ts";
import { addExpense } from "./Expense.ts";
import { createBaseGroup } from "../../test_fixtures.ts";

describe("Balance calculation", () => {
  describe("calculateBalances function", () => {
    it("should return zero balances for a group with no expenses", () => {
      const group: Group = [
        "cs",
        1,
        1,
        "Test Group",
        1672500000000,
        [[1, "Alice"], [2, "Bob"], [3, "Charlie"]],
        [],
      ];

      const balances = calculateBalances(group);

      expect(balances).toEqual([
        [1, "Alice", 0],
        [2, "Bob", 0],
        [3, "Charlie", 0],
      ]);
    });

    it("should calculate correct balances for a simple expense", () => {
      let group = createBaseGroup({
        revision: 1,
        description: "Test Group",
        timestamp: 1672500000000,
        transactions: [], // Start with no transactions
      });

      // Bob pays 100.00, split equally between Bob and Charlie
      group = addExpense(
        group,
        [[1, 100.00]], // Bob pays 100.00
        "Dinner",
        1672506000000,
        [[1, 50.00], [2, 50.00]], // Split equally
      );

      const balances = calculateBalances(group);

      // Bob: paid 100.00, owes 50.00 → net: -50.00 (is owed 50.00)
      // Charlie: paid 0.00, owes 50.00 → net: +50.00 (owes 50.00)
      expect(balances).toEqual([
        [1, "Bob", -5000], // -50.00 in cents
        [2, "Charlie", 5000], // +50.00 in cents
      ]);
    });

    it("should calculate correct balances for multiple expenses", () => {
      let group = createBaseGroup({
        revision: 1,
        description: "Trip Group",
        timestamp: 1672500000000,
        transactions: [], // Start with no transactions
      });

      // Expense 1: Bob pays 100.00, split equally
      group = addExpense(
        group,
        [[1, 100.00]],
        "Dinner",
        1672506000000,
        [[1, 50.00], [2, 50.00]],
      );

      // Expense 2: Charlie pays 60.00, split equally
      group = addExpense(
        group,
        [[2, 60.00]],
        "Lunch",
        1672516000000,
        [[1, 30.00], [2, 30.00]],
      );

      const balances = calculateBalances(group);

      // Bob: paid 100.00, owes 80.00 → net: -20.00 (is owed 20.00)
      // Charlie: paid 60.00, owes 80.00 → net: +20.00 (owes 20.00)
      expect(balances).toEqual([
        [1, "Bob", -2000], // -20.00 in cents
        [2, "Charlie", 2000], // +20.00 in cents
      ]);
    });

    it("should handle three-person group with complex expenses", () => {
      const group: Group = [
        "cs",
        1,
        1,
        "Three Friends",
        1672500000000,
        [[1, "Alice"], [2, "Bob"], [3, "Charlie"]],
        [],
      ];

      // Alice pays 120.00, split three ways (40.00 each)
      let updatedGroup = addExpense(
        group,
        [[1, 120.00]],
        "Dinner",
        1672506000000,
        [[1, 40.00], [2, 40.00], [3, 40.00]],
      );

      // Bob pays 90.00, split three ways (30.00 each)
      updatedGroup = addExpense(
        updatedGroup,
        [[2, 90.00]],
        "Drinks",
        1672516000000,
        [[1, 30.00], [2, 30.00], [3, 30.00]],
      );

      const balances = calculateBalances(updatedGroup);

      // Alice: paid 120.00, owes 70.00 → net: -50.00 (is owed 50.00)
      // Bob: paid 90.00, owes 70.00 → net: -20.00 (is owed 20.00)
      // Charlie: paid 0.00, owes 70.00 → net: +70.00 (owes 70.00)
      expect(balances).toEqual([
        [1, "Alice", -5000], // -50.00 in cents
        [2, "Bob", -2000], // -20.00 in cents
        [3, "Charlie", 7000], // +70.00 in cents
      ]);
    });

    it("should handle participant who doesn't participate in all expenses", () => {
      const group: Group = [
        "cs",
        1,
        1,
        "Three Friends",
        1672500000000,
        [[1, "Alice"], [2, "Bob"], [3, "Charlie"]],
        [],
      ];

      // Bob pays 60.00, split only between Alice and Bob (Charlie doesn't participate)
      const updatedGroup = addExpense(
        group,
        [[2, 60.00]],
        "Coffee for two",
        1672506000000,
        [[1, 30.00], [2, 30.00]], // Only Alice and Bob
      );

      const balances = calculateBalances(updatedGroup);

      // Alice: paid 0.00, owes 30.00 → net: +30.00 (owes 30.00)
      // Bob: paid 60.00, owes 30.00 → net: -30.00 (is owed 30.00)
      // Charlie: paid 0.00, owes 0.00 → net: 0.00 (even)
      expect(balances).toEqual([
        [1, "Alice", 3000], // +30.00 in cents
        [2, "Bob", -3000], // -30.00 in cents
        [3, "Charlie", 0], // 0.00 in cents
      ]);
    });

    it("should handle multiple payers in a single expense", () => {
      const group: Group = [
        "cs",
        1,
        1,
        "Three Friends",
        1672500000000,
        [[1, "Alice"], [2, "Bob"], [3, "Charlie"]],
        [],
      ];

      // Alice pays 80.00, Bob pays 40.00 (total 120.00), split equally (40.00 each)
      const updatedGroup = addExpense(
        group,
        [[1, 80.00], [2, 40.00]],
        "Group dinner",
        1672506000000,
        [[1, 40.00], [2, 40.00], [3, 40.00]],
      );

      const balances = calculateBalances(updatedGroup);

      // Alice: paid 80.00, owes 40.00 → net: -40.00 (is owed 40.00)
      // Bob: paid 40.00, owes 40.00 → net: 0.00 (even)
      // Charlie: paid 0.00, owes 40.00 → net: +40.00 (owes 40.00)
      expect(balances).toEqual([
        [1, "Alice", -4000], // -40.00 in cents
        [2, "Bob", 0], // 0.00 in cents
        [3, "Charlie", 4000], // +40.00 in cents
      ]);
    });
  });
});
