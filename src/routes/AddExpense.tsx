// AddExpense component for adding expenses to a group
import { FunctionComponent } from "preact";
import { useState } from "preact/hooks";
import { members } from "../model/Accessors.ts";
import { Group2 } from "../model/Group.ts";
import { EqualSplitStrategy } from "../model/SplitStrategy.ts";

interface AddExpenseProps {
  group: Group2;
  onSubmit: (data: {
    amount: number;
    description: string;
    payerId: number;
    selectedParticipants: number[];
  }) => void;
  onCancel: () => void;
}

export const AddExpense: FunctionComponent<AddExpenseProps> = (props) => {
  const { group, onSubmit, onCancel } = props;
  const [amount, setAmount] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [payerId, setPayerId] = useState<string>("");
  const [selectedParticipants, setSelectedParticipants] = useState<number[]>(
    [],
  );
  const groupMembers = members(group);

  const handleParticipantChange = (agentId: number, checked: boolean) => {
    setSelectedParticipants((prev) => {
      if (checked) {
        return [...prev, agentId];
      } else {
        return prev.filter((id) => id !== agentId);
      }
    });
  };

  const handleSubmit = (e: Event) => {
    e.preventDefault();

    const amountNum = parseFloat(amount) * 100;
    const payerIdNum = parseInt(payerId, 10);

    if (!amountNum || amountNum <= 0) {
      return;
    }

    if (!payerIdNum) {
      return;
    }

    if (!description.trim()) {
      return;
    }

    if (selectedParticipants.length === 0) {
      return;
    }

    onSubmit({
      amount: amountNum,
      description: description.trim(),
      payerId: payerIdNum,
      selectedParticipants,
    });
  };

  const splitStrategy = new EqualSplitStrategy();
  const shares = splitStrategy.calculateShares(
    parseFloat(amount) * 100,
    selectedParticipants,
  );

  return (
    <div className="add-expense">
      <div className="level is-mobile">
        <div className="level-left">
          <div className="level-item">
            <h2 className="title is-4">Add Expense</h2>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="field">
          <label className="label" htmlFor="amount">Amount</label>
          <div className="control has-icons-left">
            <input
              id="amount"
              className="input"
              type="number"
              step="0.01"
              min="0.01"
              value={amount}
              onInput={(e) => setAmount((e.target as HTMLInputElement).value)}
              placeholder="0.00"
              required
            />
            <span className="icon is-small is-left">
              <span>€</span>
            </span>
          </div>
        </div>

        <div className="field">
          <label className="label" htmlFor="description">Description</label>
          <div className="control">
            <input
              id="description"
              className="input"
              type="text"
              value={description}
              onInput={(e) =>
                setDescription((e.target as HTMLInputElement).value)}
              placeholder="What was this expense for?"
              required
            />
          </div>
        </div>

        <div className="field">
          <label className="label" htmlFor="payer">Paid by</label>
          <div className="control">
            <div className="select is-fullwidth">
              <select
                id="payer"
                value={payerId}
                onChange={(e) =>
                  setPayerId((e.target as HTMLSelectElement).value)}
                required
              >
                <option value="">Select who paid</option>
                {groupMembers.map((actor) => {
                  const [agentId, name] = actor;
                  return (
                    <option key={agentId} value={agentId}>
                      {name}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>
        </div>

        <div className="field">
          <label className="label">Split between</label>
          <div className="control">
            {groupMembers.map((actor) => {
              const [agentId, name] = actor;
              const isChecked = selectedParticipants.includes(Number(agentId));
              const share = isChecked ? shares.get(Number(agentId)) : 0;

              return (
                <div className="field participant-row" key={agentId}>
                  <div className="columns is-mobile is-vcentered">
                    <div className="column is-narrow">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) =>
                          handleParticipantChange(
                            Number(agentId),
                            (e.target as HTMLInputElement).checked,
                          )}
                      />
                    </div>
                    <div className="column">
                      <label className="checkbox">{name}</label>
                    </div>
                    <div className="column is-narrow">
                      <span className="share">
                        {isChecked && share !== undefined
                          ? `€${(share / 100).toFixed(2)}`
                          : "-"}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="field is-grouped">
          <div className="control">
            <button type="submit" className="button is-primary">
              Add Expense
            </button>
          </div>
          <div className="control">
            <button type="button" className="button" onClick={onCancel}>
              Cancel
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
