/** @jsx h */
import { h, render } from "preact";
import { App } from "./src/App.tsx";
// CSS will be loaded by the HTML

// Render the app
const container = document.getElementById("app");
if (container) {
  render(<App />, container);
}
