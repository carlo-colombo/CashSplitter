// CreateGroup route component
import { FunctionComponent } from "preact";
import { useContext, useState } from "preact/hooks";
import { useLocation } from "wouter-preact";
import { NotificationContext } from "../components/Notification.tsx";
import { GroupsContext } from "../context/GroupsContext.tsx";

export const CreateGroup: FunctionComponent = () => {
  const [, navigate] = useLocation();
  const { showNotification } = useContext(NotificationContext);
  const { addGroup } = useContext(GroupsContext);
  const [description, setDescription] = useState<string>("");
  const [participants, setParticipants] = useState<string[]>([]);
  const [currentParticipant, setCurrentParticipant] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const addParticipant = () => {
    const name = currentParticipant.trim();
    if (name && !participants.includes(name)) {
      setParticipants([...participants, name]);
      setCurrentParticipant("");
    }
  };

  const removeParticipant = (index: number) => {
    setParticipants(participants.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: Event) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    // Validate input
    if (!description.trim()) {
      setError("Please enter a group description");
      setIsSubmitting(false);
      return;
    }

    try {
      // Create and save the group using our context with participants
      addGroup(description.trim(), participants);

      // Show success notification and navigate back to home
      showNotification(
        "success",
        `Group "${description}" created successfully!`,
      );
      navigate("/");
    } catch (err) {
      setError(
        `Failed to create group: ${
          err instanceof Error ? err.message : String(err)
        }`,
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="create-group-page">
      <h2>Create New Group</h2>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="group-description">Group Description:</label>
          <input
            id="group-description"
            type="text"
            value={description}
            onInput={(e) =>
              setDescription((e.target as HTMLInputElement).value)}
            placeholder="Trip to Paris, Dinner with friends, etc."
            disabled={isSubmitting}
            autoFocus
          />
          <p className="input-help">
            Give your group a meaningful name to help identify it later.
          </p>
        </div>

        <div className="form-group participants-section">
          <label htmlFor="participant-name">Participants:</label>
          <div className="participant-input">
            <input
              id="participant-name"
              type="text"
              value={currentParticipant}
              onInput={(e) =>
                setCurrentParticipant((e.target as HTMLInputElement).value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addParticipant();
                }
              }}
              placeholder="Enter participant name..."
              disabled={isSubmitting}
            />
            <button
              type="button"
              onClick={addParticipant}
              disabled={isSubmitting || !currentParticipant.trim()}
            >
              Add
            </button>
          </div>
          <p className="input-help">
            Add people who will be part of this group. You can add participants later too.
          </p>
          
          {participants.length > 0 && (
            <div className="participants-list">
              <h4>Participants ({participants.length}):</h4>
              <ul>
                {participants.map((participant, index) => (
                  <li key={index}>
                    <span>{participant}</span>
                    <button
                      type="button"
                      onClick={() => removeParticipant(index)}
                      disabled={isSubmitting}
                      data-testid="remove-participant"
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="actions">
          <button
            type="button"
            onClick={() => navigate("/")}
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Creating..." : "Create Group"}
          </button>
        </div>
      </form>
    </div>
  );
};
