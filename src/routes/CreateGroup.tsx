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
      <div className="level is-mobile">
        <div className="level-left">
          <div className="level-item">
            <h2 className="title is-4">Create New Group</h2>
          </div>
        </div>
      </div>

      {error && (
        <div className="notification is-danger">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="field">
          <label className="label" htmlFor="group-description">
            Group Description
          </label>
          <div className="control">
            <input
              id="group-description"
              className="input"
              type="text"
              value={description}
              onInput={(e) =>
                setDescription((e.target as HTMLInputElement).value)}
              placeholder="Trip to Paris, Dinner with friends, etc."
              disabled={isSubmitting}
              autoFocus
            />
          </div>
          <p className="help">
            Give your group a meaningful name to help identify it later.
          </p>
        </div>

        <div className="field participants-section">
          <label className="label" htmlFor="participant-name">
            Participants
          </label>
          <div className="field has-addons">
            <div className="control is-expanded">
              <input
                id="participant-name"
                className="input"
                type="text"
                value={currentParticipant}
                onInput={(e) =>
                  setCurrentParticipant((e.target as HTMLInputElement).value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addParticipant();
                  }
                }}
                placeholder="Enter participant name..."
                disabled={isSubmitting}
              />
            </div>
            <div className="control">
              <button
                type="button"
                className="button is-primary"
                onClick={addParticipant}
                disabled={isSubmitting || !currentParticipant.trim()}
              >
                Add
              </button>
            </div>
          </div>
          <p className="help">
            Add people who will be part of this group. You can add participants
            later too.
          </p>

          {participants.length > 0 && (
            <div className="participants-list mt-4">
              <p className="subtitle is-6">
                Participants ({participants.length}):
              </p>
              <div className="field is-grouped is-grouped-multiline">
                {participants.map((participant, index) => (
                  <div key={index} className="control">
                    <div className="tags has-addons">
                      <span className="tag is-primary">{participant}</span>
                      <button
                        type="button"
                        className="tag is-delete"
                        onClick={() =>
                          removeParticipant(index)}
                        disabled={isSubmitting}
                        data-testid="remove-participant"
                        aria-label={`Remove ${participant}`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="field is-grouped">
          <div className="control">
            <button
              type="submit"
              className={`button is-primary ${
                isSubmitting ? "is-loading" : ""
              }`}
              disabled={isSubmitting}
            >
              Create Group
            </button>
          </div>
          <div className="control">
            <button
              type="button"
              className="button"
              onClick={() => navigate("/")}
              disabled={isSubmitting}
            >
              Cancel
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
