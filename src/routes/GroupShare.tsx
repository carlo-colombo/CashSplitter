// GroupShare component
// Handles shared group links, automatically adding the group to the user's list
import { FunctionComponent } from "preact";
import { useContext, useEffect } from "preact/hooks";
import { useLocation, useSearch } from "wouter-preact";
import { decode } from "../model/GroupSerialization.ts";
import { saveGroup } from "../storage/GroupStorage.ts";
import { groupId } from "../model/Accessors.ts";
import { NotificationContext } from "../components/Notification.tsx";

export const GroupShare: FunctionComponent = () => {
  const [, navigate] = useLocation();
  const search = useSearch();
  const { showNotification } = useContext(NotificationContext);

  useEffect(() => {
    if (search) {
      try {
        const decodedGroup = decode(search);
        const [, timestamp] = groupId(decodedGroup);

        saveGroup(decodedGroup);
        showNotification("success", "Group added to your list!");
        navigate(`/group/${timestamp}`);
      } catch (error) {
        console.error("Failed to decode or save group:", error);
        showNotification("error", "Invalid group link");
        navigate("/");
      }
    }
  }, [search]);

  return (
    <div className="notification is-info">
      <progress className="progress is-primary" max="100"></progress>
      Adding group to your list...
    </div>
  );
};
