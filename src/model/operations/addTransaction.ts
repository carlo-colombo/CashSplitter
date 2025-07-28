import { Group2, Movement } from "../Group.ts";

export interface SplitStrategy {
  split(amount: number): Movement[];
}

export class EqualSplitStrategy implements SplitStrategy {
  members: number[];

  constructor(...members: number[]) {
    if (members.length === 0) {
      throw new Error("Cannot split among zero members");
    }
    const seen = new Set<number>();
    for (const m of members) {
      if (seen.has(m)) {
        throw new Error(`Duplicate member ID in EqualSplitStrategy: ${m}`);
      }
      seen.add(m);
    }
    this.members = members;
  }

  /**
   * Splits the given amount among the members equally. It rounds up the share to ensure that are all amounts are integers.
   * @param amount The total amount to split.
   * @returns An array of movements representing the split.
   */
  split(amount: number): Movement[] {
    const n = this.members.length;
    const baseShare = Math.trunc(amount / n);
    const remainder = amount - baseShare * n;

    // Distribute the remainder (+1 or -1) to the first |remainder| members
    return this.members.map((member, idx) => [
      member,
      baseShare + (idx < Math.abs(remainder) ? Math.sign(remainder) : 0),
    ]);
  }
}

export function addTransaction(
  group: Group2,
  description: string,
  date: number,
  amount: number,
  payer: SplitStrategy,
  payees: SplitStrategy,
): Group2 {
  if (amount <= 0) {
    throw new Error("Invalid amount to split: " + amount);
  }
  const movements = [...payer.split(amount), ...payees.split(-amount)];
  return [
    "cs",
    group[1],
    group[2],
    group[3],
    group[4],
    [...group[5], [3, description, date, movements]],
  ];
}
