import { FunctionComponent } from "preact";
import { Group } from "../model/Group.ts";
import { agents, transactions } from "../model/Accessors.ts";

interface ExpensesListProps {
  group: Group;
}

export const ExpensesList: FunctionComponent<ExpensesListProps> = (
  { group },
) => {
  const groupTransactions = transactions(group);
  const groupAgents = agents(group);

  // Create a map of agent IDs to names for quick lookup
  const agentMap = new Map(groupAgents.map(([id, name]) => [id, name]));

  if (groupTransactions.length === 0) {
    return <p className="empty">No expenses yet</p>;
  }

  return (
    <div className="expenses-list">
      <table>
        <thead>
          <tr>
            <th>Description</th>
            <th>Date</th>
            <th>Amount</th>
            <th>Paid by</th>
            <th>Split between</th>
          </tr>
        </thead>
        <tbody>
          {groupTransactions.map(([description, timestamp, entries], index) => {
            // Calculate total amount and find payers/participants
            const payers: { name: string; amount: number }[] = [];
            const participants: { name: string; amount: number }[] = [];
            let totalAmount = 0;

            entries.forEach(([agentId, amount]) => {
              const agentName = agentMap.get(agentId) || `Agent ${agentId}`;

              if (amount < 0) {
                // This is a payment (negative amount)
                payers.push({ name: agentName, amount: Math.abs(amount) });
                totalAmount += Math.abs(amount);
              } else if (amount > 0) {
                // This is a split (positive amount)
                participants.push({ name: agentName, amount });
              }
            });

            // Format currency (amounts are stored in cents)
            const formatCurrency = (cents: number) =>
              `€${(cents / 100).toFixed(2)}`;

            // Format date
            const formatDate = (timestamp: number) =>
              new Date(timestamp).toLocaleDateString();

            // Create display strings
            const payersDisplay = payers.map((p) => p.name).join(", ");
            const participantsDisplay = participants.map((p) => p.name).join(
              ", ",
            );

            return (
              <tr key={index}>
                <td>{description}</td>
                <td>{formatDate(timestamp)}</td>
                <td>{formatCurrency(totalAmount)}</td>
                <td>{payersDisplay}</td>
                <td>{participantsDisplay}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
