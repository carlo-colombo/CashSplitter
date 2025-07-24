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
    return (
      <div className="notification is-info is-light">
        <p>No expenses yet</p>
      </div>
    );
  }

  return (
    <div className="expenses-list">
      {/* Desktop view - table */}
      <div className="is-hidden-mobile">
        <div className="card">
          <div className="card-content">
            <table className="table is-fullwidth is-hoverable">
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
                {groupTransactions.map(
                  ([description, timestamp, entries], index) => {
                    // Calculate total amount and find payers/participants
                    const payers: { name: string; amount: number }[] = [];
                    const participants: { name: string; amount: number }[] = [];
                    let totalAmount = 0;

                    entries.forEach(([agentId, amount]) => {
                      const agentName = agentMap.get(agentId) ||
                        `Agent ${agentId}`;

                      if (amount < 0) {
                        // This is a payment (negative amount)
                        payers.push({
                          name: agentName,
                          amount: Math.abs(amount),
                        });
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
                    const participantsDisplay = participants.map((p) => p.name)
                      .join(
                        ", ",
                      );

                    return (
                      <tr key={index}>
                        <td>{description}</td>
                        <td>{formatDate(timestamp)}</td>
                        <td>
                          <strong>{formatCurrency(totalAmount)}</strong>
                        </td>
                        <td>{payersDisplay}</td>
                        <td>{participantsDisplay}</td>
                      </tr>
                    );
                  },
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Mobile view - cards */}
      <div className="is-hidden-tablet">
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
            <div key={index} className="card mb-4">
              <div className="card-content">
                <div className="content">
                  <div className="level is-mobile">
                    <div className="level-left">
                      <div className="level-item">
                        <div>
                          <p className="title is-6">{description}</p>
                          <p className="subtitle is-7">
                            {formatDate(timestamp)}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="level-right">
                      <div className="level-item">
                        <span className="tag is-primary is-large">
                          {formatCurrency(totalAmount)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="field">
                    <label className="label is-small">Paid by</label>
                    <p className="is-size-7">{payersDisplay}</p>
                  </div>
                  <div className="field">
                    <label className="label is-small">Split between</label>
                    <p className="is-size-7">{participantsDisplay}</p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
