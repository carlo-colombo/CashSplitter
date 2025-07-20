// CreateGroup route component
import { FunctionComponent } from "preact";
import { useState, useContext } from "preact/hooks";
import { route } from "preact-router";
import { NotificationContext } from "../components/Notification.tsx";
import { GroupsContext } from "../context/GroupsContext.tsx";

interface CreateGroupProps {
  path: string;
}

export const CreateGroup: FunctionComponent<CreateGroupProps> = () => {
  const { showNotification } = useContext(NotificationContext);
  const { addGroup } = useContext(GroupsContext);
  const [description, setDescription] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
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
      // Create and save the group using our context
      addGroup(description.trim());
      
      // Show success notification and navigate back to home
      showNotification("success", `Group "${description}" created successfully!`);
      route("/", true);
    } catch (err) {
      setError(`Failed to create group: ${err instanceof Error ? err.message : String(err)}`);
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
            onInput={(e) => setDescription((e.target as HTMLInputElement).value)}
            placeholder="Trip to Paris, Dinner with friends, etc."
            disabled={isSubmitting}
            autoFocus
          />
          <p className="input-help">
            Give your group a meaningful name to help identify it later.
          </p>
        </div>
        
        <div className="actions">
          <button 
            type="button" 
            onClick={() => route("/")} 
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
