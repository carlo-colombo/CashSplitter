import { describe, it } from "@std/testing/bdd";
import { expect } from "@std/expect";
import { EqualSplitStrategy } from "./SplitStrategy.ts";

describe("EqualSplitStrategy", () => {
  it("should split the amount equally among participants", () => {
    const strategy = new EqualSplitStrategy();
    const shares = strategy.calculateShares(100, [1, 2, 3]);
    expect(shares.get(1)).toBe(34);
    expect(shares.get(2)).toBe(33);
    expect(shares.get(3)).toBe(33);
  });

  it("should handle remainders correctly", () => {
    const strategy = new EqualSplitStrategy();
    const shares = strategy.calculateShares(101, [1, 2, 3]);
    expect(shares.get(1)).toBe(34);
    expect(shares.get(2)).toBe(34);
    expect(shares.get(3)).toBe(33);
  });

  it("should return an empty map if there are no participants", () => {
    const strategy = new EqualSplitStrategy();
    const shares = strategy.calculateShares(100, []);
    expect(shares.size).toBe(0);
  });
});
