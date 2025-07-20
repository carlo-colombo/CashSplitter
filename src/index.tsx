// Entry point for the Cashsplitter SPA application
import { render } from "preact";
import { App } from "./components/App.tsx";

// Render the application to the DOM
render(<App />, document.getElementById("app")!);
