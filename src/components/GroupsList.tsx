// GroupsList component
// Displays a list of all saved groups
import { FunctionComponent } from "preact";
import { useContext, useEffect } from "preact/hooks";
import { route } from "preact-router";
import { GroupsContext } from "../context/GroupsContext.tsx";

interface GroupsListProps {
  showActions?: boolean;
}

export const GroupsList: FunctionComponent<GroupsListProps> = (
  { showActions = true },
) => {
  const { groups, refreshGroups, removeGroup, isLoading } = useContext(
    GroupsContext,
  );

  useEffect(() => {
    refreshGroups();
  }, []);

  const handleOpenGroup = (timestamp: number) => {
    route(`/group/${timestamp}`);
  };

  const handleDeleteGroup = (
    e: Event,
    timestamp: number,
    description: string,
  ) => {
    e.stopPropagation(); // Prevent opening the group when clicking delete

    if (
      confirm(`Are you sure you want to delete the group "${description}"?`)
    ) {
      removeGroup(timestamp);
    }
  };

  // Display loading state
  if (isLoading) {
    return <div className="loading">Loading groups...</div>;
  }

  // Display empty state
  if (groups.length === 0) {
    return (
      <div className="empty-state">
        <p>You don't have any groups yet.</p>
        <button
          type="button"
          className="primary"
          onClick={() => route("/create")}
        >
          Create Your First Group
        </button>
      </div>
    );
  }

  // Display the list of groups
  return (
    <div className="groups-list">
      <h2>Your Groups</h2>

      <ul>
        {groups.map((group) => (
          <li
            key={group.timestamp}
            onClick={() => handleOpenGroup(group.timestamp)}
          >
            <div className="group-info">
              <h3>{group.description}</h3>
              <span className="group-date">
                {new Date(group.timestamp).toLocaleDateString()}
              </span>
            </div>

            {showActions && (
              <div className="group-actions">
                <button
                  type="button"
                  className="danger small"
                  onClick={(e) =>
                    handleDeleteGroup(e, group.timestamp, group.description)}
                  aria-label={`Delete ${group.description}`}
                >
                  Delete
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>

      {showActions && (
        <div className="actions">
          <button
            type="button"
            className="primary"
            onClick={() => route("/create")}
          >
            Create New Group
          </button>
        </div>
      )}
    </div>
  );
};
