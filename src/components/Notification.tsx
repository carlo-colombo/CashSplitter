// Notification component for showing temporary success/error messages
import { ComponentChildren, FunctionComponent } from "preact";
import { useEffect, useState } from "preact/hooks";

interface NotificationProps {
  type: "success" | "error" | "info";
  message: string;
  duration?: number; // Duration in ms
  onClose?: () => void;
}

export const Notification: FunctionComponent<NotificationProps> = ({
  type,
  message,
  duration = 5000, // Default 5 seconds
  onClose,
}) => {
  const [visible, setVisible] = useState<boolean>(true);

  useEffect(() => {
    // Auto-dismiss the notification after duration
    const timer = setTimeout(() => {
      setVisible(false);
      if (onClose) onClose();
    }, duration);

    // Clean up timer
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const handleClose = () => {
    setVisible(false);
    if (onClose) onClose();
  };

  if (!visible) return null;

  const getBulmaType = (type: string) => {
    switch (type) {
      case "success":
        return "is-success";
      case "error":
        return "is-danger";
      case "info":
        return "is-info";
      default:
        return "is-info";
    }
  };

  return (
    <div className={`notification ${getBulmaType(type)}`}>
      <button
        type="button"
        className="delete"
        onClick={handleClose}
        aria-label="Close"
      />
      {message}
    </div>
  );
};

// Notification context to manage global notifications
import { createContext } from "preact";

interface NotificationContextType {
  showNotification: (
    type: "success" | "error" | "info",
    message: string,
    duration?: number,
  ) => void;
  notifications: Array<{
    id: string;
    type: "success" | "error" | "info";
    message: string;
    duration?: number;
  }>;
  removeNotification: (id: string) => void;
}

export const NotificationContext = createContext<NotificationContextType>({
  showNotification: () => {},
  notifications: [],
  removeNotification: () => {},
});

// NotificationProvider component to manage notifications at app level
export const NotificationProvider: FunctionComponent<
  { children: ComponentChildren }
> = ({ children }) => {
  const [notifications, setNotifications] = useState<
    Array<{
      id: string;
      type: "success" | "error" | "info";
      message: string;
      duration?: number;
    }>
  >([]);

  const showNotification = (
    type: "success" | "error" | "info",
    message: string,
    duration?: number,
  ) => {
    const id = Date.now().toString();
    setNotifications((prev) => [...prev, { id, type, message, duration }]);
  };

  const removeNotification = (id: string) => {
    setNotifications((prev) =>
      prev.filter((notification) => notification.id !== id)
    );
  };

  return (
    <NotificationContext.Provider
      value={{ showNotification, notifications, removeNotification }}
    >
      {children}
      <div
        className="notifications-container"
        style="position: fixed; top: 1rem; right: 1rem; z-index: 1000; min-width: 300px;"
      >
        {notifications.map((notification) => (
          <Notification
            key={notification.id}
            type={notification.type}
            message={notification.message}
            duration={notification.duration}
            onClose={() => removeNotification(notification.id)}
          />
        ))}
      </div>
    </NotificationContext.Provider>
  );
};
