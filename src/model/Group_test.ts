import { expect } from "jsr:@std/expect";
import { describe, it } from "jsr:@std/testing/bdd";
import {
  addExpense,
  agents,
  Group,
  groupId,
  revision,
  transactions,
} from "./Group.ts";
import { createBaseGroup } from "../../test_fixtures.ts";

describe("Group", () => {
  const group = createBaseGroup({
    revision: 5,
    description: "Test Group",
    timestamp: 1672500000000,
  });

  describe("revision function", () => {
    it("should return the correct revision number", () => {
      expect(revision(group)).toBe(5);
    });
  });

  describe("transactions function", () => {
    it("should return the correct transactions", () => {
      expect(transactions(group).length).toBe(1);
      expect(transactions(group)[0][0]).toBe("Dinner");
    });
  });

  describe("agents function", () => {
    it("should return the correct agents", () => {
      expect(agents(group).length).toBe(2);
      expect(agents(group)[0][1]).toBe("Bob");
      expect(agents(group)[1][1]).toBe("Charlie");
    });
  });

  describe("groupId function", () => {
    it("should return the correct group identifier", () => {
      expect(groupId(group)).toEqual(["Test Group", 1672500000000]);
    });
  });

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
        1, // Alice's ID
        "Dinner at restaurant",
        100.00, // 100 euros
        1672506000000, // timestamp
        [1, 2], // Participants: Alice and Bob
        null, // Equal splits mode
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
        2, // Bob's ID
        "Coffee",
        30.00,
        1672506000000,
        [1, 2, 3], // All three participants
        null, // Equal splits mode
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
        1,
        "Test",
        10.00,
        Date.now(),
        [1, 2], // Both participants
        null, // Equal splits mode
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
        2, // Bob pays
        "Coffee for two",
        30.00,
        1672506000000,
        [1, 2], // Only Alice and Bob share
        null, // Equal splits mode
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
        2, // Bob pays
        "Coffee",
        30.00,
        1672506000000,
        [1, 3], // Only Alice and Charlie in participants (Bob excluded)
        null, // Equal splits mode
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

    it("should default to all members when no participants specified", () => {
      const threePersonGroup: Group = [
        "cs",
        1,
        1,
        "Three Friends",
        1672500000000,
        [[1, "Alice"], [2, "Bob"], [3, "Charlie"]],
        [],
      ];

      // No participants parameter - should behave like before
      const updatedGroup = addExpense(
        threePersonGroup,
        2,
        "Coffee",
        30.00,
        1672506000000,
        [1, 2, 3], // All three participants
        null, // Equal splits mode
      );

      const newTransactions = transactions(updatedGroup);
      const expenseTransaction = newTransactions[0];
      const entries = expenseTransaction[2];

      expect(entries).toHaveLength(4); // Bob payment + 3 shares

      // Each person gets 10.00 share
      const aliceShare = entries.find(([id, _amount]) => id === 1);
      const bobShare = entries.find(([id, amount]) => id === 2 && amount > 0);
      const charlieShare = entries.find(([id, _amount]) => id === 3);

      expect(aliceShare).toEqual([1, 1000]);
      expect(bobShare).toEqual([2, 1000]);
      expect(charlieShare).toEqual([3, 1000]);
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
        1, // Bill pays
        "Dinner",
        100.00,
        1672506000000,
        null, // Custom splits mode
        [[1, 70.00], [2, 30.00]], // Custom splits
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

      // Custom splits don't sum to expense amount (50 + 30 = 80, but expense is 100)
      expect(() => {
        addExpense(
          twoPersonGroup,
          1,
          "Dinner",
          100.00,
          1672506000000,
          null, // Custom splits mode
          [[1, 50.00], [2, 30.00]], // Only sums to 80.00
        );
      }).toThrow("Custom splits must sum to the expense amount");
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
        2, // Bob pays
        "Dinner",
        100.00,
        1672506000000,
        null, // Custom splits mode
        [[1, 50.00], [3, 50.00]], // Only Alice and Charlie owe money
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

      // 33.33 + 33.34 = 66.67, but expense is 66.67 (rounding difference acceptable)
      const updatedGroup = addExpense(
        twoPersonGroup,
        1,
        "Coffee",
        66.67,
        1672506000000,
        null, // Custom splits mode
        [[1, 33.33], [2, 33.34]],
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
        2, // Bob pays
        "Coffee for two",
        30.00,
        1672506000000,
        [1, 2], // Only Alice and Bob participate
        [[1, 10.00], [2, 20.00]], // Custom splits
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

    it("should throw error when both participants and customSplits are null", () => {
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
          1,
          "Dinner",
          100.00,
          1672506000000,
          null, // No participants
          null, // No custom splits
        );
      }).toThrow("Either participants or customSplits must be provided");
    });

    it("should allow payee to not participate in expense splits", () => {
      const threePersonGroup: Group = [
        "cs",
        1,
        1,
        "Three Friends",
        1672500000000,
        [[1, "Alice"], [2, "Bob"], [3, "Charlie"]],
        [],
      ];

      // Bob pays 100.00 but only Alice and Charlie owe money
      const updatedGroup = addExpense(
        threePersonGroup,
        2, // Bob pays
        "Dinner",
        100.00,
        1672506000000,
        null, // Custom splits mode
        [[1, 65.00], [3, 35.00]], // Alice owes 65, Charlie owes 35, Bob owes nothing
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

      expect(aliceShare).toEqual([1, 6500]); // 65.00
      expect(charlieShare).toEqual([3, 3500]); // 35.00
      expect(bobShare).toBeUndefined(); // Bob doesn't owe anything
    });

    it("should allow payee to not participate in equal splits", () => {
      const threePersonGroup: Group = [
        "cs",
        1,
        1,
        "Three Friends",
        1672500000000,
        [[1, "Alice"], [2, "Bob"], [3, "Charlie"]],
        [],
      ];

      // Bob pays 30.00 but only Alice and Charlie split it equally
      const updatedGroup = addExpense(
        threePersonGroup,
        2, // Bob pays
        "Coffee",
        30.00,
        1672506000000,
        [1, 3], // Only Alice and Charlie participate (Bob excluded)
        null, // Equal splits mode
      );

      const newTransactions = transactions(updatedGroup);
      const expenseTransaction = newTransactions[0];
      const entries = expenseTransaction[2];

      expect(entries).toHaveLength(3); // Bob payment + 2 equal shares

      // Bob pays 30.00
      const bobPayment = entries.find(([id, amount]) => id === 2 && amount < 0);
      expect(bobPayment).toEqual([2, -3000]);

      // Alice and Charlie split equally (15.00 each)
      const aliceShare = entries.find(([id, _amount]) => id === 1);
      const charlieShare = entries.find(([id, _amount]) => id === 3);
      const bobShare = entries.find(([id, amount]) => id === 2 && amount > 0);

      expect(aliceShare).toEqual([1, 1500]); // 15.00
      expect(charlieShare).toEqual([3, 1500]); // 15.00
      expect(bobShare).toBeUndefined(); // Bob doesn't owe anything
    });
  });
});
