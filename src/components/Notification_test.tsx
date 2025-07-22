// Tests for Notification component
import { afterEach, describe, it } from "@std/testing/bdd";
import { expect } from "@std/expect";
import { cleanup, render } from "../test-utils/component-testing.ts";
import { Notification } from "./Notification.tsx";

describe("Notification Component", () => {
  // Clean up DOM after each test
  afterEach(() => {
    cleanup();
  });

  describe("rendering", () => {
    it("should render a success notification with message", () => {
      // Test: Notification should display success message
      const { container } = render(
        <Notification type="success" message="Operation successful" />,
      );

      const notification = container.querySelector(".notification");
      expect(notification).toBeTruthy();
      expect(notification?.classList.contains("success")).toBe(true);
      expect(notification?.textContent).toContain("Operation successful");
    });

    it("should render an error notification with message", () => {
      // Test: Notification should display error message
      const { container } = render(
        <Notification type="error" message="Something went wrong" />,
      );

      const notification = container.querySelector(".notification");
      expect(notification).toBeTruthy();
      expect(notification?.classList.contains("error")).toBe(true);
      expect(notification?.textContent).toContain("Something went wrong");
    });

    it("should render an info notification with message", () => {
      // Test: Notification should display info message
      const { container } = render(
        <Notification type="info" message="Here's some information" />,
      );

      const notification = container.querySelector(".notification");
      expect(notification).toBeTruthy();
      expect(notification?.classList.contains("info")).toBe(true);
      expect(notification?.textContent).toContain("Here's some information");
    });

    it("should include a close button", () => {
      // Test: Notification should have a close button
      const { container } = render(
        <Notification type="success" message="Test message" />,
      );

      const closeButton = container.querySelector(".notification-close");
      expect(closeButton).toBeTruthy();
      expect(closeButton?.getAttribute("aria-label")).toBe("Close");
    });
  });

  describe("interaction", () => {
    it("should call onClose when close button is clicked", () => {
      // Test: Close button should trigger onClose callback
      let closeCalled = false;
      const handleClose = () => {
        closeCalled = true;
      };

      const { container } = render(
        <Notification
          type="success"
          message="Test message"
          onClose={handleClose}
        />,
      );

      const closeButton = container.querySelector(
        ".notification-close",
      ) as HTMLButtonElement;
      closeButton.click();

      expect(closeCalled).toBe(true);
    });

    it("should hide notification when close button is clicked", async () => {
      // Test: Notification should disappear when close button is clicked
      const { container } = render(
        <Notification type="success" message="Test message" />,
      );

      const closeButton = container.querySelector(
        ".notification-close",
      ) as HTMLButtonElement;
      closeButton.click();

      // Give time for the component to re-render
      await new Promise((resolve) => setTimeout(resolve, 10));

      // After clicking close, notification should not be visible
      const notification = container.querySelector(".notification");
      expect(notification).toBeNull();
    });
  });

  // TODO: Add auto-dismiss tests when timer testing in JSDOM is resolved
  // The auto-dismiss functionality works in the actual app but has timing issues in test environment
});
