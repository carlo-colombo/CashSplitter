export interface SplitStrategy {
  calculateShares(
    amount: number,
    participants: number[],
  ): Map<number, number>;
}

export class EqualSplitStrategy implements SplitStrategy {
  calculateShares(
    amount: number,
    participants: number[],
  ): Map<number, number> {
    const shares = new Map<number, number>();
    if (participants.length === 0) {
      return shares;
    }

    const shareAmount = Math.floor(amount / participants.length);
    let remainder = amount % participants.length;

    for (const participantId of participants) {
      let individualShare = shareAmount;
      if (remainder > 0) {
        individualShare++;
        remainder--;
      }
      shares.set(participantId, individualShare);
    }

    return shares;
  }
}
