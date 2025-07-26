// ParticipantsList component
// Shows the list of participants in a group with their outstanding balances
import { FunctionComponent } from "preact";
import { Group2 } from "../model/Group.ts";
import { calculateBalances } from "../model/Balance.ts";

interface ParticipantsListProps {
  group: Group2;
}

export const ParticipantsList: FunctionComponent<ParticipantsListProps> = ({
  group,
}) => {
  const balances = calculateBalances(group);

  // Format currency (amounts are stored in cents)
  const formatCurrency = (cents: number) =>
    `€${(Math.abs(cents) / 100).toFixed(2)}`;

  // Determine balance status
  const getBalanceStatus = (balanceInCents: number) => {
    if (balanceInCents > 0) {
      return {
        status: "owes",
        amount: formatCurrency(balanceInCents),
        class: "has-text-danger",
      };
    } else if (balanceInCents < 0) {
      return {
        status: "owed",
        amount: formatCurrency(balanceInCents),
        class: "has-text-success",
      };
    } else {
      return { status: "even", amount: "€0.00", class: "has-text-grey" };
    }
  };

  if (balances.length === 0) {
    return (
      <div className="participants-list">
        <div className="notification is-light">
          <p>No participants in this group</p>
        </div>
      </div>
    );
  }

  return (
    <div className="participants-list">
      {/* Desktop view - table */}
      <div className="is-hidden-mobile">
        <div className="card">
          <div className="card-content">
            <table className="table is-fullwidth is-hoverable">
              <thead>
                <tr>
                  <th>Participant</th>
                  <th>Balance</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {balances.map(([agentId, name, balanceInCents]) => {
                  const { status, amount, class: statusClass } =
                    getBalanceStatus(
                      balanceInCents,
                    );

                  return (
                    <tr key={agentId}>
                      <td>
                        <strong>{name}</strong>
                      </td>
                      <td>
                        <span className={statusClass}>
                          {amount}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`tag ${
                            status === "owes"
                              ? "is-danger"
                              : status === "owed"
                              ? "is-success"
                              : "is-light"
                          }`}
                        >
                          {status === "owes"
                            ? "Owes"
                            : status === "owed"
                            ? "Is owed"
                            : "Even"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Mobile view - cards */}
      <div className="is-hidden-tablet">
        {balances.map(([agentId, name, balanceInCents]) => {
          const { status, amount, class: _statusClass } = getBalanceStatus(
            balanceInCents,
          );

          return (
            <div key={agentId} className="card mb-3">
              <div className="card-content">
                <div className="content">
                  <div className="level is-mobile">
                    <div className="level-left">
                      <div className="level-item">
                        <div>
                          <p className="title is-6">{name}</p>
                        </div>
                      </div>
                    </div>
                    <div className="level-right">
                      <div className="level-item">
                        <span
                          className={`tag is-large ${
                            status === "owes"
                              ? "is-danger"
                              : status === "owed"
                              ? "is-success"
                              : "is-light"
                          }`}
                        >
                          {amount}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="field">
                    <span
                      className={`tag ${
                        status === "owes"
                          ? "is-danger"
                          : status === "owed"
                          ? "is-success"
                          : "is-light"
                      }`}
                    >
                      {status === "owes"
                        ? "Owes money"
                        : status === "owed"
                        ? "Is owed money"
                        : "Balanced"}
                    </span>
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
