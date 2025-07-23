// GroupDetail component
// Shows the details of a specific group
import { FunctionComponent } from "preact";
import { useContext, useEffect, useState } from "preact/hooks";
import { useLocation, useParams } from "wouter-preact";
import { GroupsContext } from "../context/GroupsContext.tsx";
import { NotificationContext } from "../components/Notification.tsx";
import { Group } from "../model/Group.ts";
import { groupId } from "../model/Accessors.ts";

export const GroupDetail: FunctionComponent = () => {
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
            route("/");
          }
        });
    }
  }, [timestamp]);

  if (isLoading) {
    return <div className="loading">Loading group details...</div>;
  }

  if (!group) {
    return null; // Will redirect in the useEffect
  }

  const [description, createdAt] = groupId(group);

  return (
    <div className="group-detail-page">
      <header>
        <h2>{description}</h2>
        <div className="group-meta">
          <span>Created: {new Date(createdAt).toLocaleDateString()}</span>
        </div>
      </header>

      <div className="section participants">
        <h3>Participants</h3>
        {/* This will be populated in a future task */}
        <p className="empty">No participants added yet</p>
      </div>

      <div className="section transactions">
        <h3>Transactions</h3>
        {/* This will be populated in a future task */}
        <p className="empty">No transactions recorded yet</p>
      </div>

      <div className="actions">
        <button
          type="button"
          onClick={() => navigate(`/group/${timestamp}/addExpense`)}
        >
          Add Expense
        </button>
        <button
          type="button"
          onClick={() => navigate("/")}
        >
          Back to Groups
        </button>
      </div>
    </div>
  );
};
