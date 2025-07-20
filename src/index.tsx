// Entry point for the Cashsplitter SPA application
// Import buffer polyfill first to ensure Buffer is available globally
import "./utils/buffer-polyfill.ts";

import { render } from "preact";
import { App } from "./components/App.tsx";

// Render the application to the DOM
render(<App />, document.getElementById("app")!);
