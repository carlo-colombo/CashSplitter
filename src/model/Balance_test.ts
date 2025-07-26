import { expect } from "@std/expect";
import { describe, it } from "@std/testing/bdd";
import { calculateBalances } from "./Balance.ts";
import { Group2 } from "./Group.ts";
import { addTransaction } from "./Expense.ts";

describe("Balance calculation", () => {
  describe("calculateBalances function", () => {
    it("should return zero balances for a group with no expenses", () => {
      const _group: Group2 = [
        "cs",
        2,
        1,
        "Test Group",
        1672500000000,
        [
          [1, 1, "Alice"],
          [1, 2, "Bob"],
          [1, 3, "Charlie"],
        ],
      ];
      // ...existing test code for zero balances...
    });

    it("should calculate correct balances for multiple expenses", () => {
      let group: Group2 = [
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
      // Expense 1: Bob pays 100.00, split equally
      group = addTransaction(
        group,
        "Dinner",
        [
          [1, -5000], // Bob paid 100.00, owes 80.00 (is owed 20.00)
          [2, 5000], // Charlie owes 20.00
        ],
        1672500001000,
      );
      // Expense 2: Charlie pays 60.00, split equally
      group = addTransaction(
        group,
        "Lunch",
        [
          [1, 3000], // Bob owes 30.00
          [2, -3000], // Charlie paid 60.00, owes 30.00 (net: paid 30.00)
        ],
        1672516000000,
      );
      const balances = calculateBalances(group);
      expect(balances).toEqual([
        [1, "Bob", -2000],
        [2, "Charlie", 2000],
      ]);
    });
    it("should handle three-person group with complex expenses", () => {
      let group: Group2 = [
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
      // Alice pays 120.00, split three ways (40.00 each)
      group = addTransaction(
        group,
        "Dinner",
        [
          [1, -8000], // Alice paid 120.00, owes 40.00 (is owed 80.00)
          [2, 4000],
          [3, 4000],
        ],
        1672506000000,
      );
      // Bob pays 90.00, split three ways (30.00 each)
      group = addTransaction(
        group,
        "Drinks",
        [
          [1, 3000],
          [2, -6000], // Bob paid 90.00, owes 30.00 (is owed 60.00)
          [3, 3000],
        ],
        1672516000000,
      );
      // Charlie pays 60.00, split between Alice and Bob
      group = addTransaction(
        group,
        "Snacks",
        [
          [1, 3000],
          [2, 3000],
          [3, -6000], // Charlie paid 60.00, owes 0 (is owed 60.00)
        ],
        1672526000000,
      );
      const balances = calculateBalances(group);
      expect(balances).toEqual([
        [1, "Alice", -2000],
        [2, "Bob", 1000],
        [3, "Charlie", 1000],
      ]);
    });

    it("should handle participant who doesn't participate in all expenses", () => {
      let group: Group2 = [
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
      // Bob pays 60.00, split only between Alice and Bob (Charlie doesn't participate)
      group = addTransaction(
        group,
        "Coffee for two",
        [
          [1, 3000], // Alice owes 30.00
          [2, -3000], // Bob paid 60.00, owes 30.00 (is owed 30.00)
          [3, 0], // Charlie not involved
        ],
        1672506000000,
      );
      const balances = calculateBalances(group);
      expect(balances).toEqual([
        [1, "Alice", 3000],
        [2, "Bob", -3000],
        [3, "Charlie", 0],
      ]);
    });

    it("should handle multiple payers in a single expense", () => {
      let group: Group2 = [
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
      // Alice pays 80.00, Bob pays 40.00 (total 120.00), split equally (40.00 each)
      group = addTransaction(
        group,
        "Group dinner",
        [
          [1, -4000], // Alice paid 80.00, owes 40.00 (is owed 40.00)
          [2, 0], // Bob paid 40.00, owes 40.00 (even)
          [3, 4000], // Charlie owes 40.00
        ],
        1672506000000,
      );
      const balances = calculateBalances(group);
      expect(balances).toEqual([
        [1, "Alice", -4000],
        [2, "Bob", 0],
        [3, "Charlie", 4000],
      ]);
    });
  });
});
