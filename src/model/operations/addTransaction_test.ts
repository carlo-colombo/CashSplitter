import { describe, it } from "@std/testing/bdd";
import { createGroup } from "../CreateGroup.ts";
import { transactions } from "../Accessors.ts";
import { expect } from "@std/expect/expect";
import { addTransaction, EqualSplitStrategy } from "./addTransaction.ts";

describe("addTransaction", () => {
  it("should add a transaction", () => {
    const g = createGroup("Trip to Paris", ["Alice", "Bob"]);

    const updatedGroup = addTransaction(
      g,
      "some trip",
      new Date("2023-10-01").getTime(),
      1000,
      new EqualSplitStrategy(1),
      new EqualSplitStrategy(1, 2),
    );

    const [[op, desc, date, movements]] = transactions(updatedGroup);

    expect(op).toBe(3);
    expect(desc).toBe("some trip");
    expect(date).toBe(new Date("2023-10-01").getTime());

    expect(movements).toHaveLength(3);
    expect(movements).toEqual(expect.arrayContaining([
      [2, -500],
      [1, -500],
      [1, 1000],
    ]));
  });

  it("rejects negative amounts", () => {
    const g = createGroup("Trip to Paris", ["Alice", "Bob"]);

    expect(() => {
      addTransaction(
        g,
        "some trip",
        new Date("2023-10-01").getTime(),
        -1000,
        new EqualSplitStrategy(1),
        new EqualSplitStrategy(1, 2),
      );
    }).toThrow("Invalid amount to split: -1000");
  });

  it("rejects zero amounts", () => {
    const g = createGroup("Trip to Paris", ["Alice", "Bob"]);

    expect(() => {
      addTransaction(
        g,
        "some trip",
        new Date("2023-10-01").getTime(),
        0,
        new EqualSplitStrategy(1),
        new EqualSplitStrategy(1, 2),
      );
    }).toThrow("Invalid amount to split: 0");
  });
});

describe("EqualSplitStrategy", () => {
  it("should split amount evenly among members", () => {
    const strategy = new EqualSplitStrategy(1, 2, 3);
    const movements = strategy.split(300);

    expect(movements).toHaveLength(3);
    expect(movements[0][1]).toBe(100);
    expect(movements[1][1]).toBe(100);
    expect(movements[2][1]).toBe(100);
  });

  it("should reject zero members", () => {
    expect(() => new EqualSplitStrategy()).toThrow(
      "Cannot split among zero members",
    );
  });

  it("should handle single member split", () => {
    const strategy = new EqualSplitStrategy(1);
    const movements = strategy.split(500);

    expect(movements).toHaveLength(1);
    expect(movements[0][1]).toBe(500);
  });

  it("handles negative amounts", () => {
    const strategy = new EqualSplitStrategy(1, 2);
    const movements = strategy.split(-200);

    expect(movements).toHaveLength(2);
    expect(movements[0][1]).toBe(-100);
    expect(movements[1][1]).toBe(-100);
  });

  it("handles non-integer splits", () => {
    const strategy = new EqualSplitStrategy(1, 2, 3);
    const movements = strategy.split(100);

    expect(movements.map(([_, share]) => share).sort()).toEqual([33, 33, 34]);
  });

  it("splits 1 among 3 members with correct rounding", () => {
    const strategy = new EqualSplitStrategy(1, 2, 3);
    const movements = strategy.split(1);
    // Should sum to 1, with two 0s and one 1
    expect(movements.map(([_, share]) => share).sort()).toEqual([0, 0, 1]);
    expect(movements.reduce((sum, [_, share]) => sum + share, 0)).toBe(1);
  });

  it("splits -1 among 3 members with correct rounding", () => {
    const strategy = new EqualSplitStrategy(1, 2, 3);
    const movements = strategy.split(-1);
    // Should sum to -1, with two 0s and one -1
    expect(movements.map(([_, share]) => share).sort()).toEqual([-1, 0, 0]);
    expect(movements.reduce((sum, [_, share]) => sum + share, 0)).toBe(-1);
  });

  it("splits a negative amount among more members (edge case)", () => {
    const strategy = new EqualSplitStrategy(1, 2, 3, 4);
    const movements = strategy.split(-7);
    // Should sum to -7, with three -2s and one -1
    expect(movements.map(([_, share]) => share).sort()).toEqual([
      -1,
      -2,
      -2,
      -2,
    ]);
    expect(movements.reduce((sum, [_, share]) => sum + share, 0)).toBe(-7);
  });

  it("rejects duplicate member IDs", () => {
    expect(() => new EqualSplitStrategy(1, 2, 2)).toThrow(
      "Duplicate member ID in EqualSplitStrategy: 2",
    );
    expect(() => new EqualSplitStrategy(3, 3, 3)).toThrow(
      "Duplicate member ID in EqualSplitStrategy: 3",
    );
  });
});
