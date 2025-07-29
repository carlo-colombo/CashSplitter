// AddExpenseRoute component - handles routing and data operations for adding expenses
import { FunctionComponent } from "preact";
import { useContext, useEffect, useState } from "preact/hooks";
import { useLocation, useParams } from "wouter-preact";
import { GroupsContext } from "../context/GroupsContext.tsx";
import { NotificationContext } from "../components/Notification.tsx";
import {
  addTransaction,
  EqualSplitStrategy,
} from "../model/operations/addTransaction.ts";
import { Group2 } from "../model/Group.ts";
import { saveGroup } from "../storage/GroupStorage.ts";
import { AddExpense } from "./AddExpense.tsx";

export const AddExpenseRoute: FunctionComponent = () => {
  const [, navigate] = useLocation();
  const params = useParams();
  const timestamp = params.timestamp;
  const { loadGroupDetails, isLoading } = useContext(GroupsContext);
  const { showNotification } = useContext(NotificationContext);
  const [group, setGroup] = useState<Group2 | null>(null);

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
      // Use EqualSplitStrategy for payer and payees
      const payerStrategy = new EqualSplitStrategy(data.payerId);
      const payeesStrategy = new EqualSplitStrategy(
        ...data.selectedParticipants,
      );

      const updatedGroup = addTransaction(
        group,
        data.description,
        Date.now(),
        data.amount,
        payerStrategy,
        payeesStrategy,
      );

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
