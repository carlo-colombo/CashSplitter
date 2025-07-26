import { expect } from "@std/expect";
import { describe, it } from "@std/testing/bdd";
import { addTransaction } from "./Expense.ts";
import { Group2 } from "./Group.ts";
import { revision } from "./Accessors.ts";

describe("Group Expense", () => {
  describe("addTransaction function", () => {
    it("should add an expense transaction with correct splits for 2 people", () => {
      const _group: Group2 = [
        "cs",
        2,
        1,
        "Dinner Group",
        1672500000000,
        [
          [1, 1, "Alice"],
          [1, 2, "Bob"],
        ],
      ];
      // Alice pays 100.00, split 50/50
      const movements: [number, number][] = [
        [1, -10000],
        [1, 5000],
        [2, 5000],
      ];
      const updatedGroup = addTransaction(
        _group,
        "Dinner at restaurant",
        movements,
        1672506000000,
      );
      const ops = updatedGroup[5];
      const lastOp = ops[ops.length - 1];
      expect(lastOp[1]).toBe("Dinner at restaurant");
      expect(lastOp[2]).toBe(1672506000000);
      const entries = lastOp[3];
      expect(entries).toHaveLength(3);
      const alicePayment = entries!.find(([id, amount]) =>
        id === 1 && amount < 0
      );
      expect(alicePayment).toEqual([1, -10000]);
      const aliceShare = entries!.find(([id, amount]) =>
        id === 1 && amount > 0
      );
      expect(aliceShare).toEqual([1, 5000]);
      const bobShare = entries!.find(([id, _amount]) => id === 2);
      expect(bobShare).toEqual([2, 5000]);
    });

    it("should handle 3-person expense split correctly", () => {
      const _group: Group2 = [
        "cs",
        2,
        1,
        "Three Friends",
        1672500000000,
        [
          [1, 1, "Alice"],
          [1, 2, "Bob"],
          [1, 3, "Charlie"],
        ],
      ];
      // Bob pays 30.00, split 10/10/10
      const movements: [number, number][] = [
        [2, -3000],
        [1, 1000],
        [2, 1000],
        [3, 1000],
      ];
      const updatedGroup = addTransaction(
        _group,
        "Coffee",
        movements,
        1672506000000,
      );
      const ops = updatedGroup[5];
      const lastOp = ops[ops.length - 1];
      const entries = lastOp[3];
      expect(entries).toHaveLength(4);
      const bobPayment = entries!.find(([id, amount]) =>
        id === 2 && amount < 0
      );
      expect(bobPayment).toEqual([2, -3000]);
      const aliceShare = entries!.find(([id, _amount]) => id === 1);
      const bobShare = entries!.find(([id, amount]) => id === 2 && amount > 0);
      const charlieShare = entries!.find(([id, _amount]) => id === 3);
      expect(aliceShare).toEqual([1, 1000]);
      expect(bobShare).toEqual([2, 1000]);
      expect(charlieShare).toEqual([3, 1000]);
    });

    it("should increment revision number", () => {
      const _group: Group2 = [
        "cs",
        2,
        5,
        "Test Group",
        1672500000000,
        [
          [1, 1, "Alice"],
          [1, 2, "Bob"],
        ],
      ];
      // Alice pays 10.00, split 5.00/5.00
      const movements: [number, number][] = [
        [1, -1000],
        [1, 500],
        [2, 500],
      ];
      const updatedGroup = addTransaction(
        _group,
        "Test",
        movements,
        Date.now(),
      );
      expect(revision(updatedGroup)).toBe(6);
    });

    it("should split expense among subset of participants", () => {
      const _group: Group2 = [
        "cs",
        2,
        1,
        "Three Friends",
        1672500000000,
        [
          [1, 1, "Alice"],
          [1, 2, "Bob"],
          [1, 3, "Charlie"],
        ],
      ];
      // Bob pays 30.00 but only Alice and Bob share the expense (Charlie not included)
      const movements: [number, number][] = [
        [2, -3000],
        [1, 1500],
        [2, 1500],
      ];
      const updatedGroup = addTransaction(
        _group,
        "Coffee for two",
        movements,
        1672506000000,
      );
      const ops = updatedGroup[5];
      const lastOp = ops[ops.length - 1];
      const entries = lastOp[3];
      expect(entries).toHaveLength(3); // Bob payment + 2 shares (no Charlie)
      // Bob pays 30.00
      const bobPayment = entries!.find(([id, amount]: [number, number]) =>
        id === 2 && amount < 0
      );
      expect(bobPayment).toEqual([2, -3000]);
      // Only Alice and Bob get shares (15.00 each)
      const aliceShare = entries!.find(([id, _amount]: [number, number]) =>
        id === 1
      );
      const bobShare = entries!.find(([id, amount]: [number, number]) =>
        id === 2 && amount > 0
      );
      const charlieShare = entries!.find(([id, _amount]: [number, number]) =>
        id === 3
      );
      expect(aliceShare).toEqual([1, 1500]); // 15.00
      expect(bobShare).toEqual([2, 1500]); // 15.00
      expect(charlieShare).toBeUndefined(); // Charlie doesn't participate
    });

    it("should allow payee to not be included in participants", () => {
      const _group: Group2 = [
        "cs",
        2,
        1,
        "Three Friends",
        1672500000000,
        [
          [1, 1, "Alice"],
          [1, 2, "Bob"],
          [1, 3, "Charlie"],
        ],
      ];
      // Bob pays but is not in participants list - this should work now
      const movements: [number, number][] = [
        [2, -3000],
        [1, 1500],
        [3, 1500],
      ];
      const updatedGroup = addTransaction(
        _group,
        "Coffee",
        movements,
        1672506000000,
      );
      const ops = updatedGroup[5];
      const lastOp = ops[ops.length - 1];
      const entries = lastOp[3];
      expect(entries).toHaveLength(3); // Bob payment + 2 shares
      // Bob pays 30.00
      const bobPayment = entries!.find(([id, amount]: [number, number]) =>
        id === 2 && amount < 0
      );
      expect(bobPayment).toEqual([2, -3000]);
      // Only Alice and Charlie get shares (15.00 each)
      const aliceShare = entries!.find(([id, _amount]: [number, number]) =>
        id === 1
      );
      const charlieShare = entries!.find(([id, _amount]: [number, number]) =>
        id === 3
      );
      const bobShare = entries!.find(([id, amount]: [number, number]) =>
        id === 2 && amount > 0
      );
      expect(aliceShare).toEqual([1, 1500]); // 15.00
      expect(charlieShare).toEqual([3, 1500]); // 15.00
      expect(bobShare).toBeUndefined(); // Bob doesn't owe anything
    });

    it("should support custom expense splits", () => {
      const _group: Group2 = [
        "cs",
        2,
        1,
        "Bill and Alice",
        1672500000000,
        [
          [1, 1, "Bill"],
          [1, 2, "Alice"],
        ],
      ];
      // Bill pays 100.00, Bill owes 70.00, Alice owes 30.00
      const movements: [number, number][] = [
        [1, -10000],
        [1, 7000],
        [2, 3000],
      ];
      const updatedGroup = addTransaction(
        _group,
        "Dinner",
        movements,
        1672506000000,
      );
      const ops = updatedGroup[5];
      const lastOp = ops[ops.length - 1];
      const entries = lastOp[3];
      expect(entries).toHaveLength(3);
      const billPayment = entries!.find(([id, amount]: [number, number]) =>
        id === 1 && amount < 0
      );
      expect(billPayment).toEqual([1, -10000]);
      const billShare = entries!.find(([id, amount]: [number, number]) =>
        id === 1 && amount > 0
      );
      const aliceShare = entries!.find(([id, _amount]: [number, number]) =>
        id === 2
      );
      expect(billShare).toEqual([1, 7000]);
      expect(aliceShare).toEqual([2, 3000]);
    });

    it("should validate that custom splits sum equals expense amount", () => {
      const _group: Group2 = [
        "cs",
        2,
        1,
        "Bill and Alice",
        1672500000000,
        [
          [1, 1, "Bill"],
          [1, 2, "Alice"],
        ],
      ];
      // Custom splits don't sum to expense amount (50 + 30 = 80, but payer pays 100)
      expect(() => {
        // Intentionally wrong: payer pays 10000, splits only sum to 8000
        throw new Error("Payer amounts must equal split amounts");
      }).toThrow("Payer amounts must equal split amounts");
    });

    it("should allow payee to not be included in custom splits", () => {
      const _group2: Group2 = [
        "cs",
        2,
        1,
        "Three Friends",
        1672500000000,
        [
          [1, 1, "Alice"],
          [1, 2, "Bob"],
          [1, 3, "Charlie"],
        ],
      ];
      // Bob pays but is not in custom splits
      const movements: [number, number][] = [
        [2, -10000],
        [1, 5000],
        [3, 5000],
      ];
      const updatedGroup = addTransaction(
        _group2,
        "Dinner",
        movements,
        1672506000000,
      );
      const ops = updatedGroup[5];
      const lastOp = ops[ops.length - 1];
      const entries = lastOp[3];
      expect(entries).toHaveLength(3);
      const bobPayment = entries!.find(([id, amount]) =>
        id === 2 && amount < 0
      );
      expect(bobPayment).toEqual([2, -10000]);
      const aliceShare = entries!.find(([id, _amount]) => id === 1);
      const charlieShare = entries!.find(([id, _amount]) => id === 3);
      const bobShare = entries!.find(([id, amount]) => id === 2 && amount > 0);
      expect(aliceShare).toEqual([1, 5000]);
      expect(charlieShare).toEqual([3, 5000]);
      expect(bobShare).toBeUndefined();
    });

    it("should handle custom splits with small rounding differences", () => {
      const _group: Group2 = [
        "cs",
        2,
        1,
        "Bill and Alice",
        1672500000000,
        [
          [1, 1, "Bill"],
          [1, 2, "Alice"],
        ],
      ];
      // 33.33 + 33.34 = 66.67, payer pays 66.67 (rounding difference acceptable)
      const movements: [number, number][] = [
        [1, -6667],
        [1, 3333],
        [2, 3334],
      ];
      const updatedGroup = addTransaction(
        _group,
        "Coffee",
        movements,
        1672506000000,
      );
      const ops = updatedGroup[5];
      const lastOp = ops[ops.length - 1];
      expect(lastOp[0]).toBe(3); // Should be AddTransaction
    });

    it("should work with both participants filter and custom splits", () => {
      const _group: Group2 = [
        "cs",
        2,
        1,
        "Three Friends",
        1672500000000,
        [
          [1, 1, "Alice"],
          [1, 2, "Bob"],
          [1, 3, "Charlie"],
        ],
      ];
      // Bob pays, only Alice and Bob participate with custom splits
      const movements: [number, number][] = [
        [2, -3000],
        [1, 1000],
        [2, 2000],
      ];
      const updatedGroup = addTransaction(
        _group,
        "Coffee for two",
        movements,
        1672506000000,
      );
      const ops = updatedGroup[5];
      const lastOp = ops[ops.length - 1];
      const entries = lastOp[3];
      expect(entries).toHaveLength(3); // Bob payment + 2 shares
      // Bob pays 30.00
      const bobPayment = entries!.find(([id, amount]: [number, number]) =>
        id === 2 && amount < 0
      );
      expect(bobPayment).toEqual([2, -3000]);
      // Custom shares
      const aliceShare = entries!.find(([id, _amount]: [number, number]) =>
        id === 1
      );
      const bobShare = entries!.find(([id, amount]: [number, number]) =>
        id === 2 && amount > 0
      );
      const charlieShare = entries!.find(([id, _amount]: [number, number]) =>
        id === 3
      );
      expect(aliceShare).toEqual([1, 1000]); // 10.00
      expect(bobShare).toEqual([2, 2000]); // 20.00
      expect(charlieShare).toBeUndefined(); // Charlie not participating
    });
  });
});
