// GroupsList component
// Displays a list of all saved groups
import { FunctionComponent } from "preact";
import { useContext, useEffect, useState } from "preact/hooks";
import { useLocation } from "wouter-preact";
import { GroupsContext } from "../context/GroupsContext.tsx";
import { agents } from "../model/Accessors.ts";
import { loadGroup } from "../storage/GroupStorage.ts";

interface GroupsListProps {
  showActions?: boolean;
}

// Hook to load participants for a group
function useGroupParticipants(timestamp: number) {
  const [participants, setParticipants] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadParticipants = () => {
      try {
        const group = loadGroup(timestamp);
        if (group) {
          const groupAgents = agents(group);
          const participantNames = groupAgents.map(([_, name]) => name);
          setParticipants(participantNames);
        } else {
          setParticipants([]);
        }
      } catch (error) {
        console.error("Error loading participants:", error);
        setParticipants([]);
      } finally {
        setLoading(false);
      }
    };

    // Use setTimeout to ensure this runs in the next tick
    setTimeout(loadParticipants, 0);
  }, [timestamp]);

  return { participants, loading };
}

// Component to display participants for a group
const GroupParticipants: FunctionComponent<{ timestamp: number }> = (
  { timestamp },
) => {
  const { participants, loading } = useGroupParticipants(timestamp);

  if (loading) {
    return (
      <p className="subtitle is-7 has-text-grey">Loading participants...</p>
    );
  }

  if (participants.length === 0) {
    return <p className="subtitle is-7 has-text-grey">No participants</p>;
  }

  return (
    <div>
      <p className="subtitle is-7 has-text-grey-dark">Participants:</p>
      <p className="subtitle is-7 has-text-grey">{participants.join(", ")}</p>
    </div>
  );
};

interface GroupsListProps {
  showActions?: boolean;
}

export const GroupsList: FunctionComponent<GroupsListProps> = (
  { showActions = true },
) => {
  const { groups, refreshGroups, removeGroup, isLoading } = useContext(
    GroupsContext,
  );
  const [, navigate] = useLocation();

  useEffect(() => {
    refreshGroups();
  }, []);

  const handleOpenGroup = (timestamp: number) => {
    navigate(`/group/${timestamp}`);
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
    return (
      <div className="notification is-info">
        <progress className="progress is-primary" max="100"></progress>
        Loading groups...
      </div>
    );
  }

  // Display empty state
  if (groups.length === 0) {
    return (
      <div className="empty-state has-text-centered">
        <div className="notification is-light">
          <p className="title is-5">You don't have any groups yet.</p>
          <button
            type="button"
            className="button is-primary"
            onClick={() => navigate("/create")}
          >
            Create Your First Group
          </button>
        </div>
      </div>
    );
  }

  // Display the list of groups
  return (
    <div className="groups-list">
      <div className="level">
        <div className="level-left">
          <div className="level-item">
            <h2 className="title is-4">Your Groups</h2>
          </div>
        </div>
        {showActions && (
          <div className="level-right">
            <div className="level-item">
              <button
                type="button"
                className="button is-primary"
                onClick={() => navigate("/create")}
              >
                <span>Create New Group</span>
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="columns is-multiline">
        {groups.map((group) => (
          <div
            key={group.timestamp}
            className="column is-12-mobile is-6-tablet is-4-desktop"
          >
            <div
              className="card is-clickable"
              onClick={() => handleOpenGroup(group.timestamp)}
            >
              <div className="card-content">
                <div className="content">
                  <p className="title is-5">{group.description}</p>
                  <p className="subtitle is-6 has-text-grey">
                    Created {new Date(group.timestamp).toLocaleDateString()}
                  </p>
                  <GroupParticipants timestamp={group.timestamp} />
                </div>
              </div>
              {showActions && (
                <footer className="card-footer">
                  <a
                    className="card-footer-item"
                    onClick={() => handleOpenGroup(group.timestamp)}
                  >
                    View
                  </a>
                  <a
                    className="card-footer-item has-text-danger"
                    onClick={(e) =>
                      handleDeleteGroup(e, group.timestamp, group.description)}
                  >
                    Delete
                  </a>
                </footer>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
