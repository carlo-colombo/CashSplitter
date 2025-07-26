// Test utilities for Preact component testing
import { JSDOM } from "jsdom";
import { ComponentChildren, FunctionComponent } from "preact";
import {
  act,
  fireEvent,
  render as rtlRender,
  renderHook,
  screen,
  waitFor,
} from "npm:@testing-library/preact";

// Set up JSDOM for DOM simulation
const dom = new JSDOM("<!DOCTYPE html><html><body></body></html>", {
  url: "http://localhost/",
  pretendToBeVisual: true,
  resources: "usable",
});

// @ts-ignore: Assign JSDOM globals to globalThis for Deno
globalThis.window = dom.window as unknown as Window & typeof globalThis;
globalThis.document = dom.window.document;
globalThis.navigator = dom.window.navigator;
globalThis.HTMLElement = dom.window.HTMLElement;
globalThis.Element = dom.window.Element;
globalThis.Node = dom.window.Node;
globalThis.location = dom.window.location;

// Export Testing Library's render result type for convenience
export type RenderResult = ReturnType<typeof rtlRender>;

// Custom render function that wraps with providers if needed
export function render(
  component: ComponentChildren,
  { wrapper }: { wrapper?: FunctionComponent } = {},
): RenderResult {
  return rtlRender(component, { wrapper });
}

// Utility to create a test wrapper with providers
export function createTestWrapper(providers: FunctionComponent[] = []) {
  return function TestWrapper({ children }: { children: ComponentChildren }) {
    return providers.reduceRight(
      (acc, Provider) => Provider({ children: acc }),
      children,
    );
  };
}

// Utility to clean up after tests
export function cleanup() {
  document.body.innerHTML = "";
  // Clear localStorage
  mockLocalStorage.clear();
  // Clear any pending timers to prevent leaks
  const highestTimeoutId = setTimeout(() => {}, 0);
  for (let i = 0; i <= highestTimeoutId; i++) {
    clearTimeout(i);
  }
}

// Mock localStorage for testing
export const mockLocalStorage = {
  getItem: (key: string): string | null => {
    return mockLocalStorage.store[key] || null;
  },
  setItem: (key: string, value: string): void => {
    mockLocalStorage.store[key] = value;
  },
  removeItem: (key: string): void => {
    delete mockLocalStorage.store[key];
  },
  clear: (): void => {
    mockLocalStorage.store = {};
  },
  get length(): number {
    return Object.keys(mockLocalStorage.store).length;
  },
  key: (index: number): string | null => {
    const keys = Object.keys(mockLocalStorage.store);
    return keys[index] || null;
  },
  store: {} as Record<string, string>,
};

// Set up mock localStorage globally
(globalThis as unknown as { localStorage: typeof mockLocalStorage })
  .localStorage = mockLocalStorage;

// Export Testing Library helpers for convenience
export { act, fireEvent, renderHook, screen, waitFor };
