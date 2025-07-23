// AddExpense component for adding expenses to a group
import { FunctionComponent } from "preact";
import { useState } from "preact/hooks";
import { agents } from "../model/Accessors.ts";
import { Group } from "../model/Group.ts";

interface AddExpenseProps {
  group: Group;
  onSubmit: (data: {
    amount: number;
    description: string;
    payerId: number;
    selectedParticipants: number[];
  }) => void;
  onCancel: () => void;
}

export const AddExpense: FunctionComponent<AddExpenseProps> = ({
  group,
  onSubmit,
  onCancel,
}) => {
  const [amount, setAmount] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [payerId, setPayerId] = useState<string>("");
  const [selectedParticipants, setSelectedParticipants] = useState<number[]>(
    [],
  );

  const groupAgents = agents(group);

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

    const amountNum = parseFloat(amount);
    const payerIdNum = parseInt(payerId, 10);

    // Validation
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

  return (
    <div className="add-expense">
      <h2>Add Expense</h2>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="amount">Amount</label>
          <input
            id="amount"
            type="number"
            step="0.01"
            min="0.01"
            value={amount}
            onInput={(e) => setAmount((e.target as HTMLInputElement).value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <input
            id="description"
            type="text"
            value={description}
            onInput={(e) =>
              setDescription((e.target as HTMLInputElement).value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="payer">Paid by</label>
          <select
            id="payer"
            value={payerId}
            onChange={(e) => setPayerId((e.target as HTMLSelectElement).value)}
            required
          >
            <option value="">Select who paid</option>
            {groupAgents.map(([agentId, name]) => (
              <option key={agentId} value={agentId}>
                {name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <fieldset>
            <legend>Split between:</legend>
            {groupAgents.map(([agentId, name]) => (
              <div key={agentId} className="checkbox-group">
                <input
                  id={`participant-${agentId}`}
                  type="checkbox"
                  checked={selectedParticipants.includes(agentId)}
                  onChange={(e) =>
                    handleParticipantChange(
                      agentId,
                      (e.target as HTMLInputElement).checked,
                    )}
                />
                <label htmlFor={`participant-${agentId}`}>{name}</label>
              </div>
            ))}
          </fieldset>
        </div>

        <div className="form-actions">
          <button type="submit">Add Expense</button>
          <button type="button" onClick={onCancel}>Cancel</button>
        </div>
      </form>
    </div>
  );
};
