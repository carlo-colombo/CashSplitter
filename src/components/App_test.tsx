// Tests for the App component styling
import { afterEach, describe, it } from "@std/testing/bdd";
import { expect } from "@std/expect";
import { cleanup, render } from "../test-utils/component-testing.ts";
import { App } from "./App.tsx";

describe("App Component", () => {
  afterEach(() => {
    cleanup();
  });

  it("should have the main app container with background lines class", () => {
    const { container } = render(<App />);
    const appElement = container.querySelector(".cashsplitter-app");

    expect(appElement).toBeTruthy();
    expect(appElement?.classList.contains("cashsplitter-app")).toBe(true);
  });
});
