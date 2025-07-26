import { describe, it } from "@std/testing/bdd";
import { expect } from "@std/expect";
import { AddTransaction, Group2 } from "./Group.ts";
import { groupId, members, revision, transactions } from "./Accessors.ts";

describe("Group2 Accessors", () => {
  // Group2: ["cs", 2, revision, description, timestamp, operations[]]
  const group2: Group2 = [
    "cs",
    2,
    7,
    "Group2 Test",
    1680000000000,
    [
      [1, 1, "Alice"],
      [1, 2, "Bob"],
      [3, "Lunch", 1680000001000, [[1, 10], [2, -10]]] as AddTransaction,
    ],
  ];

  it("should return the correct revision number for Group2", () => {
    expect(revision(group2)).toBe(7);
  });

  it("should return the correct members for Group2", () => {
    const mems = members(group2);
    expect(mems.length).toBe(2);
    expect(mems[0][0]).toBe(1);
    expect(mems[0][1]).toBe("Alice");
    expect(mems[1][0]).toBe(2);
    expect(mems[1][1]).toBe("Bob");
  });

  it("should return the correct transactions for Group2", () => {
    const txs = transactions(group2);
    expect(txs.length).toBe(1);
    expect(txs[0][1]).toBe("Lunch");
    // Defensive checks for nested arrays
    expect(Array.isArray(txs[0][3])).toBe(true);
    const movements = txs[0][3] as [number, number][];
    expect(movements.length).toBeGreaterThan(0);
    expect(movements[0][0]).toBe(1);
    expect(movements[0][1]).toBe(10);
  });

  it("should return the correct group identifier for Group2", () => {
    expect(groupId(group2)).toEqual(["Group2 Test", 1680000000000]);
  });
});
