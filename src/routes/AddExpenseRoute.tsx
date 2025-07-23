// AddExpenseRoute component - handles routing and data operations for adding expenses
import { FunctionComponent } from "preact";
import { useContext, useEffect, useState } from "preact/hooks";
import { useLocation, useParams } from "wouter-preact";
import { GroupsContext } from "../context/GroupsContext.tsx";
import { NotificationContext } from "../components/Notification.tsx";
import { addExpense } from "../model/Expense.ts";
import { Group } from "../model/Group.ts";
import { saveGroup } from "../storage/GroupStorage.ts";
import { AddExpense } from "./AddExpense.tsx";

export const AddExpenseRoute: FunctionComponent = () => {
  const [, navigate] = useLocation();
  const params = useParams();
  const timestamp = params.timestamp;
  const { loadGroupDetails, isLoading } = useContext(GroupsContext);
  const { showNotification } = useContext(NotificationContext);
  const [group, setGroup] = useState<Group | null>(null);

  useEffect(() => {
    if (timestamp) {
      const numericTimestamp = parseInt(timestamp, 10);

      if (isNaN(numericTimestamp)) {
        showNotification("error", "Invalid group identifier");
        navigate("/");
        return;
      }

      loadGroupDetails(numericTimestamp)
        .then((loadedGroup) => {
          if (loadedGroup) {
            setGroup(loadedGroup);
          } else {
            showNotification("error", "Group not found");
            navigate("/");
          }
        });
    }
  }, [timestamp]);

  const handleSubmit = (data: {
    amount: number;
    description: string;
    payerId: number;
    selectedParticipants: number[];
  }) => {
    if (!group) return;

    try {
      // Calculate equal splits for selected participants
      const splitAmount = data.amount / data.selectedParticipants.length;
      const splits = data.selectedParticipants.map((participantId) =>
        [participantId, splitAmount] as [number, number]
      );

      // Create payers array (single payer for now)
      const payers = [[data.payerId, data.amount]] as [number, number][];

      // Add the expense to the group
      const updatedGroup = addExpense(
        group,
        payers,
        data.description,
        Date.now(),
        splits,
      );

      // Save the updated group
      saveGroup(updatedGroup);

      showNotification("success", "Expense added successfully");
      navigate(`/group/${timestamp}`);
    } catch (error) {
      const errorMessage = error instanceof Error
        ? error.message
        : String(error);
      showNotification("error", `Failed to add expense: ${errorMessage}`);
    }
  };

  const handleCancel = () => {
    navigate(`/group/${timestamp}`);
  };

  if (isLoading) {
    return <div className="loading">Loading group details...</div>;
  }

  if (!group) {
    return null; // Will redirect in the useEffect
  }

  return (
    <AddExpense
      group={group}
      onSubmit={handleSubmit}
      onCancel={handleCancel}
    />
  );
};
