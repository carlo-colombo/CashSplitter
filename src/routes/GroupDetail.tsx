// GroupDetail component
// Shows the details of a specific group
import { FunctionComponent } from "preact";
import { useContext, useEffect, useState } from "preact/hooks";
import { useLocation, useParams } from "wouter-preact";
import { GroupsContext } from "../context/GroupsContext.tsx";
import { NotificationContext } from "../components/Notification.tsx";
import { ExpensesList } from "../components/ExpensesList.tsx";
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
            navigate("/");
          }
        });
    }
  }, [timestamp]);

  if (isLoading) {
    return (
      <div className="notification is-info">
        <progress className="progress is-primary" max="100"></progress>
        Loading group details...
      </div>
    );
  }

  if (!group) {
    return null; // Will redirect in the useEffect
  }

  const [description, createdAt] = groupId(group);

  return (
    <div className="group-detail-page">
      <div className="level is-mobile mb-5">
        <div className="level-left">
          <div className="level-item">
            <div>
              <h2 className="title is-3">{description}</h2>
              <p className="subtitle is-6">
                Created {new Date(createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
        <div className="level-right">
          <div className="level-item">
            <div className="buttons">
              <button
                type="button"
                className="button is-primary"
                onClick={() => navigate(`/group/${timestamp}/addExpense`)}
              >
                Add Expense
              </button>
              <button
                type="button"
                className="button"
                onClick={() => navigate("/")}
              >
                Back
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="section-participants mb-5">
        <h3 className="title is-5">Participants</h3>
        <div className="notification is-light">
          <p>No participants added yet</p>
        </div>
      </div>

      <div className="section-transactions">
        <h3 className="title is-5">Expenses</h3>
        <ExpensesList group={group} />
      </div>
    </div>
  );
};
