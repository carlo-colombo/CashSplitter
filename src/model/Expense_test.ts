import { expect } from "@std/expect";
import { describe, it } from "@std/testing/bdd";
import { addExpense } from "./Expense.ts";
import { Group } from "./Group.ts";
import { revision, transactions } from "./Accessors.ts";
import { createBaseGroup } from "../../test_fixtures.ts";

describe("Group Expense", () => {
  describe("addExpense function", () => {
    it("should add an expense transaction with correct splits for 2 people", () => {
      const originalGroup = createBaseGroup({
        revision: 1,
        description: "Dinner Group",
        timestamp: 1672500000000,
      });

      // Add 100.00 euro dinner paid by Alice (agent ID 1)
      const updatedGroup = addExpense(
        originalGroup,
        [[1, 100.00]], // Alice pays 100.00
        "Dinner at restaurant",
        1672506000000, // timestamp
        [[1, 50.00], [2, 50.00]], // splits: Alice and Bob split equally
      );

      const newTransactions = transactions(updatedGroup);
      expect(newTransactions).toHaveLength(2); // Original + new transaction

      const expenseTransaction = newTransactions[1];
      expect(expenseTransaction[0]).toBe("Dinner at restaurant");
      expect(expenseTransaction[1]).toBe(1672506000000);

      // Check transaction entries: Alice pays -10000, Alice gets +5000, Bob gets +5000
      const entries = expenseTransaction[2];
      expect(entries).toHaveLength(3);

      // Find Alice's payment (negative amount)
      const alicePayment = entries.find(([id, amount]) =>
        id === 1 && amount < 0
      );
      expect(alicePayment).toEqual([1, -10000]); // Alice pays 100.00 (stored as -10000)

      // Find Alice's share (positive amount)
      const aliceShare = entries.find(([id, amount]) => id === 1 && amount > 0);
      expect(aliceShare).toEqual([1, 5000]); // Alice's share 50.00 (stored as 5000)

      // Find Bob's share
      const bobShare = entries.find(([id, _amount]) => id === 2);
      expect(bobShare).toEqual([2, 5000]); // Bob's share 50.00 (stored as 5000)
    });

    it("should handle 3-person expense split correctly", () => {
      const threePersonGroup: Group = [
        "cs",
        1,
        1,
        "Three Friends",
        1672500000000,
        [[1, "Alice"], [2, "Bob"], [3, "Charlie"]],
        [],
      ];

      // Add 30.00 euro expense paid by Bob
      const updatedGroup = addExpense(
        threePersonGroup,
        [[2, 30.00]], // Bob pays 30.00
        "Coffee",
        1672506000000,
        [[1, 10.00], [2, 10.00], [3, 10.00]], // splits: equal 10.00 each
      );

      const newTransactions = transactions(updatedGroup);
      const expenseTransaction = newTransactions[0];
      const entries = expenseTransaction[2];

      expect(entries).toHaveLength(4); // Bob payment + 3 shares

      // Bob pays 30.00
      const bobPayment = entries.find(([id, amount]) => id === 2 && amount < 0);
      expect(bobPayment).toEqual([2, -3000]);

      // Each person gets 10.00 share
      const aliceShare = entries.find(([id, _amount]) => id === 1);
      const bobShare = entries.find(([id, amount]) => id === 2 && amount > 0);
      const charlieShare = entries.find(([id, _amount]) => id === 3);

      expect(aliceShare).toEqual([1, 1000]);
      expect(bobShare).toEqual([2, 1000]);
      expect(charlieShare).toEqual([3, 1000]);
    });

    it("should increment revision number", () => {
      const originalGroup = createBaseGroup({ revision: 5 });
      const updatedGroup = addExpense(
        originalGroup,
        [[1, 10.00]], // Agent 1 pays 10.00
        "Test",
        Date.now(),
        [[1, 5.00], [2, 5.00]], // splits: equal 5.00 each
      );

      expect(revision(updatedGroup)).toBe(6);
    });

    it("should split expense among subset of participants", () => {
      const threePersonGroup: Group = [
        "cs",
        1,
        1,
        "Three Friends",
        1672500000000,
        [[1, "Alice"], [2, "Bob"], [3, "Charlie"]],
        [],
      ];

      // Bob pays 30.00 but only Alice and Bob share the expense (Charlie not included)
      const updatedGroup = addExpense(
        threePersonGroup,
        [[2, 30.00]], // Bob pays 30.00
        "Coffee for two",
        1672506000000,
        [[1, 15.00], [2, 15.00]], // splits: Alice and Bob split equally
      );

      const newTransactions = transactions(updatedGroup);
      const expenseTransaction = newTransactions[0];
      const entries = expenseTransaction[2];

      expect(entries).toHaveLength(3); // Bob payment + 2 shares (no Charlie)

      // Bob pays 30.00
      const bobPayment = entries.find(([id, amount]) => id === 2 && amount < 0);
      expect(bobPayment).toEqual([2, -3000]);

      // Only Alice and Bob get shares (15.00 each)
      const aliceShare = entries.find(([id, _amount]) => id === 1);
      const bobShare = entries.find(([id, amount]) => id === 2 && amount > 0);
      const charlieShare = entries.find(([id, _amount]) => id === 3);

      expect(aliceShare).toEqual([1, 1500]); // 15.00
      expect(bobShare).toEqual([2, 1500]); // 15.00
      expect(charlieShare).toBeUndefined(); // Charlie doesn't participate
    });

    it("should allow payee to not be included in participants", () => {
      const threePersonGroup: Group = [
        "cs",
        1,
        1,
        "Three Friends",
        1672500000000,
        [[1, "Alice"], [2, "Bob"], [3, "Charlie"]],
        [],
      ];

      // Bob pays but is not in participants list - this should work now
      const updatedGroup = addExpense(
        threePersonGroup,
        [[2, 30.00]], // Bob pays 30.00
        "Coffee",
        1672506000000,
        [[1, 15.00], [3, 15.00]], // splits: Only Alice and Charlie split
      );

      const newTransactions = transactions(updatedGroup);
      const expenseTransaction = newTransactions[0];
      const entries = expenseTransaction[2];

      expect(entries).toHaveLength(3); // Bob payment + 2 shares

      // Bob pays 30.00
      const bobPayment = entries.find(([id, amount]) => id === 2 && amount < 0);
      expect(bobPayment).toEqual([2, -3000]);

      // Only Alice and Charlie get shares (15.00 each)
      const aliceShare = entries.find(([id, _amount]) => id === 1);
      const charlieShare = entries.find(([id, _amount]) => id === 3);
      const bobShare = entries.find(([id, amount]) => id === 2 && amount > 0);

      expect(aliceShare).toEqual([1, 1500]); // 15.00
      expect(charlieShare).toEqual([3, 1500]); // 15.00
      expect(bobShare).toBeUndefined(); // Bob doesn't owe anything
    });

    it("should support custom expense splits", () => {
      const twoPersonGroup: Group = [
        "cs",
        1,
        1,
        "Bill and Alice",
        1672500000000,
        [[1, "Bill"], [2, "Alice"]],
        [],
      ];

      // Bill pays 100.00, Bill owes 70.00, Alice owes 30.00
      const updatedGroup = addExpense(
        twoPersonGroup,
        [[1, 100.00]], // Bill pays 100.00
        "Dinner",
        1672506000000,
        [[1, 70.00], [2, 30.00]], // splits: custom amounts
      );

      const newTransactions = transactions(updatedGroup);
      const expenseTransaction = newTransactions[0];
      const entries = expenseTransaction[2];

      expect(entries).toHaveLength(3); // Bill payment + 2 custom shares

      // Bill pays 100.00
      const billPayment = entries.find(([id, amount]) =>
        id === 1 && amount < 0
      );
      expect(billPayment).toEqual([1, -10000]);

      // Custom shares
      const billShare = entries.find(([id, amount]) => id === 1 && amount > 0);
      const aliceShare = entries.find(([id, _amount]) => id === 2);

      expect(billShare).toEqual([1, 7000]); // 70.00
      expect(aliceShare).toEqual([2, 3000]); // 30.00
    });

    it("should validate that custom splits sum equals expense amount", () => {
      const twoPersonGroup: Group = [
        "cs",
        1,
        1,
        "Bill and Alice",
        1672500000000,
        [[1, "Bill"], [2, "Alice"]],
        [],
      ];

      // Custom splits don't sum to expense amount (50 + 30 = 80, but payer pays 100)
      expect(() => {
        addExpense(
          twoPersonGroup,
          [[1, 100.00]], // Bill pays 100.00
          "Dinner",
          1672506000000,
          [[1, 50.00], [2, 30.00]], // splits only sum to 80.00
        );
      }).toThrow("Payer amounts must equal split amounts");
    });

    it("should allow payee to not be included in custom splits", () => {
      const threePersonGroup: Group = [
        "cs",
        1,
        1,
        "Three Friends",
        1672500000000,
        [[1, "Alice"], [2, "Bob"], [3, "Charlie"]],
        [],
      ];

      // Bob pays but is not in custom splits - this should work now
      const updatedGroup = addExpense(
        threePersonGroup,
        [[2, 100.00]], // Bob pays 100.00
        "Dinner",
        1672506000000,
        [[1, 50.00], [3, 50.00]], // splits: Only Alice and Charlie owe money
      );

      const newTransactions = transactions(updatedGroup);
      const expenseTransaction = newTransactions[0];
      const entries = expenseTransaction[2];

      expect(entries).toHaveLength(3); // Bob payment + 2 shares

      // Bob pays 100.00
      const bobPayment = entries.find(([id, amount]) => id === 2 && amount < 0);
      expect(bobPayment).toEqual([2, -10000]);

      // Only Alice and Charlie get shares
      const aliceShare = entries.find(([id, _amount]) => id === 1);
      const charlieShare = entries.find(([id, _amount]) => id === 3);
      const bobShare = entries.find(([id, amount]) => id === 2 && amount > 0);

      expect(aliceShare).toEqual([1, 5000]); // 50.00
      expect(charlieShare).toEqual([3, 5000]); // 50.00
      expect(bobShare).toBeUndefined(); // Bob doesn't owe anything
    });

    it("should handle custom splits with small rounding differences", () => {
      const twoPersonGroup: Group = [
        "cs",
        1,
        1,
        "Bill and Alice",
        1672500000000,
        [[1, "Bill"], [2, "Alice"]],
        [],
      ];

      // 33.33 + 33.34 = 66.67, payer pays 66.67 (rounding difference acceptable)
      const updatedGroup = addExpense(
        twoPersonGroup,
        [[1, 66.67]], // Agent 1 pays 66.67
        "Coffee",
        1672506000000,
        [[1, 33.33], [2, 33.34]], // splits with rounding
      );

      const newTransactions = transactions(updatedGroup);
      expect(newTransactions).toHaveLength(1); // Should succeed
    });

    it("should work with both participants filter and custom splits", () => {
      const threePersonGroup: Group = [
        "cs",
        1,
        1,
        "Three Friends",
        1672500000000,
        [[1, "Alice"], [2, "Bob"], [3, "Charlie"]],
        [],
      ];

      // Bob pays, only Alice and Bob participate with custom splits
      const updatedGroup = addExpense(
        threePersonGroup,
        [[2, 30.00]], // Bob pays 30.00
        "Coffee for two",
        1672506000000,
        [[1, 10.00], [2, 20.00]], // splits: custom amounts
      );

      const newTransactions = transactions(updatedGroup);
      const expenseTransaction = newTransactions[0];
      const entries = expenseTransaction[2];

      expect(entries).toHaveLength(3); // Bob payment + 2 shares

      // Bob pays 30.00
      const bobPayment = entries.find(([id, amount]) => id === 2 && amount < 0);
      expect(bobPayment).toEqual([2, -3000]);

      // Custom shares
      const aliceShare = entries.find(([id, _amount]) => id === 1);
      const bobShare = entries.find(([id, amount]) => id === 2 && amount > 0);
      const charlieShare = entries.find(([id, _amount]) => id === 3);

      expect(aliceShare).toEqual([1, 1000]); // 10.00
      expect(bobShare).toEqual([2, 2000]); // 20.00
      expect(charlieShare).toBeUndefined(); // Charlie not participating
    });

    it("should throw error when splits are empty", () => {
      const twoPersonGroup: Group = [
        "cs",
        1,
        1,
        "Bill and Alice",
        1672500000000,
        [[1, "Bill"], [2, "Alice"]],
        [],
      ];

      expect(() => {
        addExpense(
          twoPersonGroup,
          [[1, 100.00]], // Bill pays 100.00
          "Dinner",
          1672506000000,
          [], // Empty splits
        );
      }).toThrow("Payer amounts must equal split amounts");
    });

    it("should handle expenses paid by multiple people", () => {
      const originalGroup = createBaseGroup({
        revision: 1,
        description: "Multiple Payers Group",
        timestamp: 1672500000000,
      });

      // Add 120.00 euro expense paid by Alice (80.00) and Bob (40.00)
      // Split equally among Alice, Bob, and Charlie (40.00 each)
      const updatedGroup = addExpense(
        originalGroup,
        [
          [1, 80.00], // Alice pays 80.00
          [2, 40.00], // Bob pays 40.00
        ],
        "Group dinner",
        1672506000000,
        [[1, 40.00], [2, 40.00], [3, 40.00]], // splits: all three get 40.00 each
      );

      const newTransactions = transactions(updatedGroup);
      expect(newTransactions).toHaveLength(2);

      const expenseTransaction = newTransactions[1];
      expect(expenseTransaction[0]).toBe("Group dinner");
      expect(expenseTransaction[1]).toBe(1672506000000);

      // Check transaction entries
      const entries = expenseTransaction[2];
      expect(entries).toHaveLength(5); // Alice payment, Bob payment, Alice share, Bob share, Charlie share

      // Find payments (negative amounts)
      const alicePayment = entries.find(([id, amount]) =>
        id === 1 && amount < 0
      );
      const bobPayment = entries.find(([id, amount]) => id === 2 && amount < 0);

      expect(alicePayment).toEqual([1, -8000]); // Alice pays 80.00
      expect(bobPayment).toEqual([2, -4000]); // Bob pays 40.00

      // Find shares (positive amounts)
      const aliceShare = entries.find(([id, amount]) => id === 1 && amount > 0);
      const bobShare = entries.find(([id, amount]) => id === 2 && amount > 0);
      const charlieShare = entries.find(([id, amount]) =>
        id === 3 && amount > 0
      );

      expect(aliceShare).toEqual([1, 4000]); // Alice's share: 40.00
      expect(bobShare).toEqual([2, 4000]); // Bob's share: 40.00
      expect(charlieShare).toEqual([3, 4000]); // Charlie's share: 40.00

      // Verify net amounts: Alice: -8000 + 4000 = -4000 (40.00 net paid)
      // Bob: -4000 + 4000 = 0 (no net payment)
      // Charlie: +4000 (owes 40.00)
    });

    it("should validate that multiple payers' amounts sum to total expense", () => {
      const originalGroup = createBaseGroup({
        revision: 1,
        description: "Validation Group",
        timestamp: 1672500000000,
      });

      // Payers' amounts don't sum to splits amounts (80 + 30 = 110, but splits sum to 120)
      expect(() => {
        addExpense(
          originalGroup,
          [
            [1, 80.00], // Alice pays 80.00
            [2, 30.00], // Bob pays 30.00
          ],
          "Invalid expense",
          1672506000000,
          [[1, 40.00], [2, 40.00], [3, 40.00]], // splits sum to 120.00
        );
      }).toThrow("Payer amounts must equal split amounts");
    });

    describe("decimal amount handling", () => {
      it("should handle various decimal amounts correctly", () => {
        const group = createBaseGroup({
          revision: 1,
          description: "Decimal Test",
          timestamp: 1672500000000,
        });

        // Test 12.34 split equally between 2 people
        const updated1 = addExpense(
          group,
          [[1, 12.34]],
          "Coffee",
          Date.now(),
          [[1, 6.17], [2, 6.17]],
        );

        const transactions1 = transactions(updated1);
        const expense1 = transactions1[1];
        const entries1 = expense1[2];

        // Alice pays 12.34 (stored as -1234 cents)
        const alicePayment = entries1.find(([id, amount]) =>
          id === 1 && amount < 0
        );
        expect(alicePayment).toEqual([1, -1234]);

        // Both get 6.17 (stored as 617 cents)
        const aliceShare = entries1.find(([id, amount]) =>
          id === 1 && amount > 0
        );
        const bobShare = entries1.find(([id, amount]) =>
          id === 2 && amount > 0
        );
        expect(aliceShare).toEqual([1, 617]);
        expect(bobShare).toEqual([2, 617]);
      });

      it("should handle minimum amount of 0.01", () => {
        const group = createBaseGroup({
          revision: 1,
          description: "Minimal Test",
          timestamp: 1672500000000,
        });

        const updated = addExpense(
          group,
          [[1, 0.01]],
          "Penny",
          Date.now(),
          [[1, 0.01]],
        );

        const newTransactions = transactions(updated);
        const expense = newTransactions[1];
        const entries = expense[2];

        // Alice pays 0.01 (stored as -1 cent)
        const payment = entries.find(([id, amount]) => id === 1 && amount < 0);
        expect(payment).toEqual([1, -1]);

        // Alice gets 0.01 (stored as 1 cent)
        const share = entries.find(([id, amount]) => id === 1 && amount > 0);
        expect(share).toEqual([1, 1]);
      });

      it("should handle complex decimal amounts with 3-way split", () => {
        const threePersonGroup: Group = [
          "cs",
          1,
          1,
          "Three Friends",
          1672500000000,
          [[1, "Alice"], [2, "Bob"], [3, "Charlie"]],
          [],
        ];

        // 10.99 split 3 ways: 3.66, 3.67, 3.66 (sums to 10.99)
        const updated = addExpense(
          threePersonGroup,
          [[2, 10.99]],
          "Lunch",
          Date.now(),
          [[1, 3.66], [2, 3.67], [3, 3.66]],
        );

        const newTransactions = transactions(updated);
        const expense = newTransactions[0];
        const entries = expense[2];

        // Bob pays 10.99 (stored as -1099 cents)
        const bobPayment = entries.find(([id, amount]) =>
          id === 2 && amount < 0
        );
        expect(bobPayment).toEqual([2, -1099]);

        // Check shares
        const aliceShare = entries.find(([id, _amount]) => id === 1);
        const bobShare = entries.find(([id, amount]) => id === 2 && amount > 0);
        const charlieShare = entries.find(([id, _amount]) => id === 3);

        expect(aliceShare).toEqual([1, 366]); // 3.66
        expect(bobShare).toEqual([2, 367]); // 3.67
        expect(charlieShare).toEqual([3, 366]); // 3.66
      });
    });
  });
});
